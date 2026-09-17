import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../services/api.js';
import { fmtDate } from '../utils/format.js';
import { AiTag, Badge, Card, CardHeader, EmptyState, ErrorBanner, Field, GhostButton, PrimaryButton, Spinner, inputCls } from '../components/UI.jsx';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [m, setM] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.get(`/meetings/${id}`);
      setM(r.data);
      setTranscript(r.data.transcript || '');
      setSummary(r.data.summary || '');
      setEditForm({ title: r.data.title, description: r.data.description || '' });
    } catch (e) {
      setError(errMsg(e, 'Could not load this meeting.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn, okMsg) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
      await load();
      if (okMsg) setNotice(okMsg);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading meeting…" />;
  if (error && !m) return <ErrorBanner message={error} />;
  if (!m) return null;

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/meetings')} className="text-sm font-medium text-slate-600 hover:underline">
        ← Back to meetings
      </button>
      <ErrorBanner message={error} />
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{notice}</div>}

      <Card className="px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{m.title}</h1>
              <Badge value={m.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {fmtDate(m.date)} · {m.duration_minutes} min · Organizer: {m.organizer_name}
            </p>
            {m.description && <p className="mt-2 text-sm text-slate-700">{m.description}</p>}
            {m.participants.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Participants: {m.participants.map((p) => p.name).join(', ')}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <GhostButton disabled={busy} onClick={() => setEditing((v) => !v)}>Edit info</GhostButton>
            <GhostButton disabled={busy} onClick={() => act(async () => { await api.get(`/meetings/${id}/export.json`).then((r) => download(`meeting-${id}.json`, JSON.stringify(r.data, null, 2))); }, 'JSON report downloaded.')}>Export JSON</GhostButton>
            <GhostButton disabled={busy} onClick={() => window.open(`/api/meetings/${id}/report`, '_blank')}>Printable report</GhostButton>
            <GhostButton disabled={busy} onClick={() => { if (window.confirm('Delete this meeting and all its tasks?')) act(async () => { await api.delete(`/meetings/${id}`); navigate('/meetings'); }); }} className="!border-red-300 !text-red-700">Delete</GhostButton>
          </div>
        </div>
        {editing && (
          <form
            className="mt-4 grid gap-3 border-t border-slate-100 pt-4"
            onSubmit={(e) => { e.preventDefault(); act(() => api.put(`/meetings/${id}`, editForm), 'Meeting updated.').then(() => setEditing(false)); }}
          >
            <Field label="Title"><input className={inputCls} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></Field>
            <Field label="Description"><textarea className={inputCls} rows={2} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></Field>
            <div><PrimaryButton type="submit" disabled={busy}>Save changes</PrimaryButton></div>
          </form>
        )}
      </Card>

      <Card>
        <CardHeader title="Transcript / notes" subtitle="Paste notes or upload a .txt / .md file. Audio transcription is a planned future feature." />
        <div className="space-y-3 px-5 py-4">
          <textarea className={inputCls} rows={7} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste the meeting transcript or notes here…" />
          <div className="flex flex-wrap gap-2">
            <PrimaryButton disabled={busy} onClick={() => act(() => api.put(`/meetings/${id}/transcript`, { transcript }), 'Transcript saved.')}>Save transcript</PrimaryButton>
            <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Upload file
              <input
                type="file" accept=".txt,.md" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const fd = new FormData();
                  fd.append('file', f);
                  act(() => api.post(`/meetings/${id}/upload`, fd), 'Transcript uploaded.');
                  e.target.value = '';
                }}
              />
            </label>
            <GhostButton disabled={busy || transcript.trim().length < 10} onClick={() => act(() => api.post(`/meetings/${id}/analyze`), 'AI analysis complete. Review the suggestions below.')}>
              {busy ? 'Analyzing…' : 'Analyze with AI'}
            </GhostButton>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Summary" subtitle="Review AI suggestions — edit and save before treating them as final." action={<AiTag />} />
        <div className="space-y-3 px-5 py-4">
          <textarea className={inputCls} rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={m.status === 'PROCESSED' ? 'Summary…' : 'Run AI analysis to generate a summary.'} />
          <div><PrimaryButton disabled={busy} onClick={() => act(() => api.put(`/meetings/${id}`, { summary }), 'Summary saved.')}>Save summary</PrimaryButton></div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={`Key decisions (${m.decisions.length})`} action={<AiTag />} />
          <ul className="space-y-2 px-5 py-4">
            {m.decisions.length === 0 && <li><EmptyState title="No decisions yet." /></li>}
            {m.decisions.map((d) => <li key={d.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-800">{d.description}</li>)}
          </ul>
        </Card>
        <Card>
          <CardHeader title={`Topics (${m.topics.length})`} action={<AiTag />} />
          <div className="flex flex-wrap gap-2 px-5 py-4">
            {m.topics.length === 0 && <EmptyState title="No topics yet." />}
            {m.topics.map((t) => <span key={t.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{t.name}</span>)}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title={`Action items (${m.action_items.length})`} subtitle="AI suggestions are editable — assign owners and deadlines." action={<AiTag />} />
        <ul className="divide-y divide-slate-100 px-5 py-2">
          {m.action_items.length === 0 && <li className="py-4"><EmptyState title="No action items." hint="Run AI analysis or add tasks manually from the Tasks page." /></li>}
          {m.action_items.map((a) => (
            <TaskRow key={a.id} task={a} onChanged={load} />
          ))}
        </ul>
      </Card>

      {m.transcript && (
        <Card>
          <CardHeader title="Original transcript" />
          <p className="whitespace-pre-wrap px-5 py-4 text-sm text-slate-700">{m.transcript}</p>
        </Card>
      )}
    </div>
  );
}

function TaskRow({ task, onChanged }) {
  const [busy, setBusy] = useState(false);
  const cycle = async () => {
    const next = task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'COMPLETED' : 'TODO';
    setBusy(true);
    try {
      await api.put(`/tasks/${task.id}`, { status: next });
      onChanged();
    } finally {
      setBusy(false);
    }
  };
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
        <p className="text-xs text-slate-500">
          {task.assignee_name || 'Unassigned'}
          {task.deadline ? ` · due ${new Date(task.deadline).toLocaleDateString()}` : ''}
          {task.ai_generated ? ' · AI suggestion' : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Badge value={task.priority} />
        <Badge value={task.status} />
        <button disabled={busy} onClick={cycle} className="ml-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          {task.status === 'COMPLETED' ? 'Reopen' : 'Advance'}
        </button>
      </div>
    </li>
  );
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
