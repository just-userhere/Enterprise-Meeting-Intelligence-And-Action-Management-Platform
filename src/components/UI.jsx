export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const badgeStyles = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-red-100 text-red-800',
  PROCESSED: 'bg-emerald-100 text-emerald-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  NOT_PROCESSED: 'bg-slate-100 text-slate-600',
  FAILED: 'bg-red-100 text-red-800',
};

export function Badge({ value }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        badgeStyles[value] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {String(value || '').replace(/_/g, ' ')}
    </span>
  );
}

export function AiTag() {
  return (
    <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-800">
      AI-generated
    </span>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
      {message}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500';

export function PrimaryButton({ children, ...rest }) {
  return (
    <button
      {...rest}
      className={`rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 ${rest.className || ''}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, ...rest }) {
  return (
    <button
      {...rest}
      className={`rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 ${rest.className || ''}`}
    >
      {children}
    </button>
  );
}
