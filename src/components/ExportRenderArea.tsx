'use client';

import { useCalendarStore } from '@/lib/store';
import { getTwelveMonthsFrom } from '@/lib/calendar';
import { CalendarPage } from './CalendarPage';

export function ExportRenderArea() {
  const startYear = useCalendarStore((s) => s.startYear);
  const startMonth = useCalendarStore((s) => s.startMonth);
  const layout = useCalendarStore((s) => s.layout);
  const monthPhotos = useCalendarStore((s) => s.monthPhotos);
  const photoTransforms = useCalendarStore((s) => s.photoTransforms);
  const months = getTwelveMonthsFrom(startYear, startMonth);

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        left: '-99999px',
        top: 0,
        pointerEvents: 'none',
      }}
    >
      {months.map(({ year, month }) => {
        const key = `${year}-${month}`;
        return (
          <div key={key} data-export-page={key}>
            <CalendarPage
              year={year}
              month={month}
              layout={layout}
              photo={monthPhotos[month]}
              transform={photoTransforms[month]}
            />
          </div>
        );
      })}
    </div>
  );
}
