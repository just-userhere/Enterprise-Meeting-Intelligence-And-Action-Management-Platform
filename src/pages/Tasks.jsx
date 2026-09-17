import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api.js';
import { fmtDay, isOverdue } from '../utils/format.js';
import { Badge, Card, EmptyState, ErrorBanner, Field, GhostButton, PrimaryButton, Spinner, inputCls } from '../components/UI.jsx';

const VIEWS = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'My Tasks' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'overdue', label: 'Overdue' },
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('all');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [editing, setEditing] = useState(null);

  const fetchAll = async (v = view) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ view: v });
      if (status) params.set('status', status);
      if (priority) params.set('priority', priority);
      const r = await api.get(`/tasks?${params.toString()}`);
      setTasks(r.data);
    } catch (e) {
      setError(errMsg(e, 'Could not load tasks.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = async (id, patch) => {
    try {
      await api.put(`/tasks/${id}`, patch);
      setEditing(null);
      fetchAll();
    } catch (e) {
      setError(errMsg(e, 'Could not update the task.'));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Action items</h1>
      <p className="text-sm text-slate-500">Track every commitment from every meeting.</p>
      <ErrorBanner message={error} />

      <Card className="flex flex-wrap items-center gap-2 px-4 py-3">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => { setView(v.id); fetchAll(v.id); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${view === v.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {v.label}
          </button>
        ))}
        <select className={`${inputCls} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select className={`${inputCls} w-auto`} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">Any priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <PrimaryButton onClick={() => fetchAll()}>Apply</PrimaryButton>
      </Card>

      {loading ? (
        <Spinner label="Loading tasks…" />
      ) : tasks.length === 0 ? (
        <EmptyState title="No pending tasks." hint="Try a different view or filter." />
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <Card key={t.id} className="px-5 py-3.5">
              {editing === t.id ? (
                <EditForm task={t} onSave={(patch) => update(t.id, patch)} onCancel={() => setEditing(null)} />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{t.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {t.meeting_title} · {t.assignee_name || 'Unassigned'} · {t.deadline ? `due ${fmtDay(t.deadline)}` : 'no deadline'}
                      {isOverdue(t) && <span className="ml-1 font-bold text-red-600">OVERDUE</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge value={t.priority} />
                    <Badge value={t.status} />
                    <select
                      className="ml-1 rounded-lg border border-slate-300 px-2 py-1 text-xs"
                      value={t.status}
                      onChange={(e) => update(t.id, { status: e.target.value })}
                    >
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    <GhostButton onClick={() => setEditing(t.id)}>Edit</GhostButton>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EditForm({ task, onSave, onCancel }) {
  const [f, setF] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    deadline: task.deadline ? task.deadline.slice(0, 16) : '',
  });
  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...f, deadline: f.deadline ? new Date(f.deadline).toISOString() : null });
      }}
    >
      <div className="md:col-span-2">
        <Field label="Title"><input className={inputCls} required minLength={3} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Description"><textarea className={inputCls} rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      </div>
      <Field label="Status">
        <select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </Field>
      <Field label="Priority">
        <select className={inputCls} value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </Field>
      <Field label="Deadline">
        <input className={inputCls} type="datetime-local" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} />
      </Field>
      <div className="flex items-end gap-2">
        <PrimaryButton type="submit">Save</PrimaryButton>
        <GhostButton type="button" onClick={onCancel}>Cancel</GhostButton>
      </div>
    </form>
  );
}
