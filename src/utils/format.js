export const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
};

export const fmtDay = (iso) => {
  if (!iso) return 'No date';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(iso);
  }
};

export const isOverdue = (t) =>
  t.deadline && t.status !== 'COMPLETED' && new Date(t.deadline) < new Date();
