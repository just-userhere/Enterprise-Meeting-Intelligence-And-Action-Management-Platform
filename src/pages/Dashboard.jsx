import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api.js';
import { fmtDay } from '../utils/format.js';
import { Badge, Card, CardHeader, EmptyState, ErrorBanner, Spinner } from '../components/UI.jsx';

function Stat({ label, value, accent }) {
  return (
    <Card className="px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent || 'text-slate-900'}`}>{value}</p>
    </Card>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then((r) => setData(r.data))
      .catch((e) => setError(errMsg(e, 'Could not load the dashboard.')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return null;

  const maxWeek = Math.max(1, ...data.meetings_per_week.map((w) => w.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Team dashboard</h1>
        <p className="text-sm text-slate-500">Meetings, tasks and upcoming deadlines at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label="Meetings" value={data.meetings.total} />
        <Stat label="This week" value={data.meetings.this_week} />
        <Stat label="This month" value={data.meetings.this_month} />
        <Stat label="Pending tasks" value={data.tasks.pending} accent="text-amber-600" />
        <Stat label="Completed" value={data.tasks.completed} accent="text-emerald-600" />
        <Stat label="Overdue" value={data.tasks.overdue} accent="text-red-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Upcoming deadlines" subtitle="Nearest open action items" action={<Link to="/tasks" className="text-xs font-semibold text-slate-700 underline">All tasks</Link>} />
          <ul className="divide-y divide-slate-100 px-5 py-2">
            {data.upcoming_deadlines.length === 0 && (
              <li className="py-4"><EmptyState title="No pending tasks." hint="Action items from analyzed meetings will appear here." /></li>
            )}
            {data.upcoming_deadlines.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.deadline ? fmtDay(t.deadline) : 'No deadline'}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Badge value={t.priority} />
                  <Badge value={t.status} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Recent meetings" subtitle="Latest by meeting date" action={<Link to="/meetings" className="text-xs font-semibold text-slate-700 underline">All meetings</Link>} />
          <ul className="divide-y divide-slate-100 px-5 py-2">
            {data.recent_meetings.length === 0 && (
              <li className="py-4"><EmptyState title="No meetings found." hint="Create your first meeting to get started." /></li>
            )}
            {data.recent_meetings.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <Link to={`/meetings/${m.id}`} className="truncate text-sm font-medium text-slate-900 hover:underline">
                    {m.title}
                  </Link>
                  <p className="text-xs text-slate-500">{fmtDay(m.date)}</p>
                </div>
                <Badge value={m.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Meeting activity" subtitle="Meetings per week, last 8 weeks" />
        <div className="flex items-end gap-2 px-5 py-5">
          {data.meetings_per_week.map((w) => (
            <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-slate-800"
                style={{ height: `${Math.max(4, (w.count / maxWeek) * 96)}px` }}
                title={`${w.count} meetings`}
              />
              <span className="text-[10px] text-slate-500">{w.week}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
