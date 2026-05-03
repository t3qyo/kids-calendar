'use client';

import { useCalendarStore } from '@/lib/store';
import { MONTHS } from '@/lib/calendar';
import { CalendarPage } from './CalendarPage';

export function ExportRenderArea() {
  const year = useCalendarStore((s) => s.year);
  const layout = useCalendarStore((s) => s.layout);
  const monthPhotos = useCalendarStore((s) => s.monthPhotos);

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
      {MONTHS.map((m) => (
        <div key={m} data-export-page={m}>
          <CalendarPage year={year} month={m} layout={layout} photo={monthPhotos[m]} />
        </div>
      ))}
    </div>
  );
}
