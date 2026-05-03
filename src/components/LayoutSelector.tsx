'use client';

import { useCalendarStore } from '@/lib/store';
import { LAYOUT_SPECS } from './CalendarPage';
import type { LayoutType } from '@/lib/types';

const LAYOUTS: LayoutType[] = ['wall-a4', 'desk-horizontal', 'wall'];

export function LayoutSelector() {
  const layout = useCalendarStore((s) => s.layout);
  const setLayout = useCalendarStore((s) => s.setLayout);

  return (
    <div className="flex flex-wrap gap-2">
      {LAYOUTS.map((l) => {
        const spec = LAYOUT_SPECS[l];
        const active = layout === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLayout(l)}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              active
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white hover:bg-gray-100'
            }`}
          >
            {spec.label}
          </button>
        );
      })}
    </div>
  );
}
