'use client';

import { useEffect, useRef, useState } from 'react';
import { useCalendarStore } from '@/lib/store';
import { getTwelveMonthsFrom } from '@/lib/calendar';
import { CalendarPage, LAYOUT_SPECS } from './CalendarPage';

export function CalendarPreview() {
  const startYear = useCalendarStore((s) => s.startYear);
  const startMonth = useCalendarStore((s) => s.startMonth);
  const layout = useCalendarStore((s) => s.layout);
  const monthPhotos = useCalendarStore((s) => s.monthPhotos);
  const photoTransforms = useCalendarStore((s) => s.photoTransforms);
  const months = getTwelveMonthsFrom(startYear, startMonth);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {months.map(({ year, month }) => (
        <PreviewCard key={`${year}-${month}`}>
          <CalendarPage
            year={year}
            month={month}
            layout={layout}
            photo={monthPhotos[month]}
            transform={photoTransforms[month]}
          />
        </PreviewCard>
      ))}
    </div>
  );
}

function PreviewCard({ children }: { children: React.ReactNode }) {
  const layout = useCalendarStore((s) => s.layout);
  const spec = LAYOUT_SPECS[layout];
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const targetMm = spec.widthMm;
      const mmToPx = w / (targetMm * 3.7795275591);
      setScale(mmToPx);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [spec.widthMm]);

  const heightPx = spec.heightMm * 3.7795275591 * scale;

  return (
    <div ref={ref} className="w-full">
      <div
        className="relative overflow-hidden rounded-md border border-gray-200 bg-white"
        style={{ height: heightPx }}
      >
        <div
          className="origin-top-left"
          style={{ transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
