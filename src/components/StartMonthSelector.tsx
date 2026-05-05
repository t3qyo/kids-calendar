'use client';

import { useCalendarStore } from '@/lib/store';
import { getTwelveMonthsFrom } from '@/lib/calendar';
import { useTranslations } from '@/lib/i18n';

const YEAR_RANGE = 5;

export function StartMonthSelector() {
  const startYear = useCalendarStore((s) => s.startYear);
  const startMonth = useCalendarStore((s) => s.startMonth);
  const setStartYear = useCalendarStore((s) => s.setStartYear);
  const setStartMonth = useCalendarStore((s) => s.setStartMonth);
  const t = useTranslations();

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
          <span className="text-gray-600">{t.startMonth.startYearLabel}</span>
          <select
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {t.startMonth.yearOption(y)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">{t.startMonth.startMonthLabel}</span>
          <select
            value={startMonth}
            onChange={(e) => setStartMonth(Number(e.target.value))}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {t.startMonth.monthOption(m)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs text-gray-500">
        {t.startMonth.rangeInfo(startYear, startMonth, last.year, last.month)}
      </p>
    </div>
  );
}
