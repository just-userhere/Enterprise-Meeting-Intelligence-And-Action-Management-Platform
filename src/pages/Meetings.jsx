import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api.js';
import { fmtDay } from '../utils/format.js';
import { Badge, Card, EmptyState, ErrorBanner, Field, GhostButton, PrimaryButton, Spinner, inputCls } from '../components/UI.jsx';

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', duration_minutes: 30 });
  const [creating, setCreating] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);
      params.set('sort', sort);
      const r = await api.get(`/meetings?${params.toString()}`);
      setMeetings(r.data);
    } catch (e) {
      setError(errMsg(e, 'Could not load meetings.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/meetings', form);
      setShowNew(false);
      setForm({ title: '', description: '', duration_minutes: 30 });
      fetchAll();
    } catch (err) {
      setError(errMsg(err, 'Could not create the meeting.'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meetings</h1>
          <p className="text-sm text-slate-500">Search, filter and open meeting intelligence.</p>
        </div>
        <PrimaryButton onClick={() => setShowNew((v) => !v)}>+ New meeting</PrimaryButton>
      </div>

      <ErrorBanner message={error} />

      {showNew && (
        <Card className="px-5 py-4">
          <form onSubmit={create} className="grid gap-3 md:grid-cols-2">
            <Field label="Title">
              <input className={inputCls} required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Q3 roadmap review" />
            </Field>
            <Field label="Duration (minutes)">
              <input className={inputCls} type="number" min={5} max={1440} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this meeting about?" />
              </Field>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <PrimaryButton type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create meeting'}</PrimaryButton>
              <GhostButton type="button" onClick={() => setShowNew(false)}>Cancel</GhostButton>
            </div>
          </form>
        </Card>
      )}

      <Card className="flex flex-wrap gap-2 px-4 py-3">
        <input className={`${inputCls} max-w-xs`} placeholder="Search title or description…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchAll()} />
        <select className={`${inputCls} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="NOT_PROCESSED">Not processed</option>
          <option value="PROCESSING">Processing</option>
          <option value="PROCESSED">Processed</option>
          <option value="FAILED">Failed</option>
        </select>
        <select className={`${inputCls} w-auto`} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
        </select>
        <PrimaryButton onClick={fetchAll}>Search</PrimaryButton>
      </Card>

      {loading ? (
        <Spinner label="Loading meetings…" />
      ) : meetings.length === 0 ? (
        <EmptyState title="No meetings found." hint="Try a different search, or create a new meeting." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {meetings.map((m) => (
            <Link key={m.id} to={`/meetings/${m.id}`}>
              <Card className="px-5 py-4 transition hover:border-slate-400">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">{m.title}</p>
                  <Badge value={m.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {fmtDay(m.date)} · {m.organizer_name} · {m.completed_tasks}/{m.task_count} tasks done
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
