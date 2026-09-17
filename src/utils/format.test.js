import { describe, expect, it } from 'vitest';
import { fmtDate, fmtDay, isOverdue } from './format.js';

describe('format utils (critical path: deadlines & dates)', () => {
  it('formats a date string for display', () => {
    expect(fmtDate('2026-03-10T10:00:00')).toContain('2026');
    expect(fmtDate(null)).toBe('—');
  });

  it('formats a day string for display', () => {
    expect(fmtDay('2026-03-10T10:00:00')).toContain('2026');
    expect(fmtDay(null)).toBe('No date');
  });

  it('flags overdue open tasks and not completed ones', () => {
    expect(isOverdue({ deadline: '2020-01-01T00:00:00', status: 'TODO' })).toBe(true);
    expect(isOverdue({ deadline: '2020-01-01T00:00:00', status: 'COMPLETED' })).toBe(false);
    expect(isOverdue({ deadline: null, status: 'TODO' })).toBeFalsy();
  });
});
