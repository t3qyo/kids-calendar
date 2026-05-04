'use client';

import { sendGAEvent } from '@next/third-parties/google';
import { useCalendarStore } from '@/lib/store';
import type { PaperSize } from '@/lib/types';
import { LAYOUT_SPECS, getTotalHeightMm } from './CalendarPage';

const OPTIONS: { value: PaperSize; label: string; description: string }[] = [
  {
    value: 'a4',
    label: 'A4 にそのまま印刷 (推奨)',
    description: '家庭プリンタ・コンビニ複合機で印刷。トンボ (切り取り線) に沿って後から切り抜きます。',
  },
  {
    value: 'exact',
    label: '実寸の用紙に印刷',
    description: 'カレンダーと同じサイズの用紙を用意して印刷します。業者印刷向け。',
  },
];

export function PaperSizeSelector() {
  const layout = useCalendarStore((s) => s.layout);
  const paperSize = useCalendarStore((s) => s.paperSize);
  const setPaperSize = useCalendarStore((s) => s.setPaperSize);
  const spec = LAYOUT_SPECS[layout];

  return (
    <div className="space-y-2">
      {OPTIONS.map((opt) => {
        const active = paperSize === opt.value;
        const exactLabel =
          opt.value === 'exact'
            ? `${opt.label} (${spec.widthMm}×${getTotalHeightMm(spec)}mm)`
            : opt.label;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setPaperSize(opt.value);
              sendGAEvent('event', 'paper_size_changed', { size: opt.value });
            }}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
              active
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white hover:bg-gray-100'
            }`}
          >
            <div className="font-medium">{exactLabel}</div>
            <div className={`mt-0.5 text-xs ${active ? 'text-gray-300' : 'text-gray-500'}`}>
              {opt.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
