export type CalendarCell = {
  day: number | null;
  date: Date | null;
};

export function buildMonthGrid(year: number, month: number): CalendarCell[][] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: null, date: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, date: new Date(year, month - 1, d) });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, date: null });
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type YearMonth = { year: number; month: number };

export function getTwelveMonthsFrom(startYear: number, startMonth: number): YearMonth[] {
  const result: YearMonth[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(startYear, startMonth - 1 + i, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return result;
}
