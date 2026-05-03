'use client';

import { useCalendarStore } from '@/lib/store';
import { getTwelveMonthsFrom } from '@/lib/calendar';

const YEAR_RANGE = 5;

export function StartMonthSelector() {
  const startYear = useCalendarStore((s) => s.startYear);
  const startMonth = useCalendarStore((s) => s.startMonth);
  const setStartYear = useCalendarStore((s) => s.setStartYear);
  const setStartMonth = useCalendarStore((s) => s.setStartMonth);

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear - 1; y <= currentYear + YEAR_RANGE; y++) years.push(y);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const range = getTwelveMonthsFrom(startYear, startMonth);
  const last = range[range.length - 1];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">開始年</span>
          <select
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">開始月</span>
          <select
            value={startMonth}
            onChange={(e) => setStartMonth(Number(e.target.value))}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs text-gray-500">
        {startYear}年{startMonth}月 から {last.year}年{last.month}月 までの12ヶ月分のカレンダーを作ります。
      </p>
    </div>
  );
}
