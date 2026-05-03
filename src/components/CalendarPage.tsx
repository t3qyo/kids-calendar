'use client';

import { forwardRef } from 'react';
import { buildMonthGrid, WEEKDAYS } from '@/lib/calendar';
import type { LayoutType } from '@/lib/types';
import { DateNumber } from './DateNumber';

export type LayoutSpec = {
  id: LayoutType;
  label: string;
  widthMm: number;
  heightMm: number;
};

export const LAYOUT_SPECS: Record<LayoutType, LayoutSpec> = {
  'desk-vertical': {
    id: 'desk-vertical',
    label: '卓上 縦 (12.7×21.5cm)',
    widthMm: 127,
    heightMm: 215,
  },
  'desk-horizontal': {
    id: 'desk-horizontal',
    label: '卓上 横 (14.4×8.6cm)',
    widthMm: 144,
    heightMm: 86,
  },
  wall: {
    id: 'wall',
    label: '壁かけ (12.7×25.4cm)',
    widthMm: 127,
    heightMm: 254,
  },
};

type Props = {
  year: number;
  month: number;
  layout: LayoutType;
  photo: string | undefined;
};

export const CalendarPage = forwardRef<HTMLDivElement, Props>(function CalendarPage(
  { year, month, layout, photo },
  ref,
) {
  const spec = LAYOUT_SPECS[layout];
  const weeks = buildMonthGrid(year, month);

  return (
    <div
      ref={ref}
      data-page
      className="relative bg-white text-black shadow-sm"
      style={{
        width: `${spec.widthMm}mm`,
        height: `${spec.heightMm}mm`,
      }}
    >
      {layout === 'desk-vertical' && (
        <DeskVerticalLayout year={year} month={month} photo={photo} weeks={weeks} />
      )}
      {layout === 'desk-horizontal' && (
        <DeskHorizontalLayout year={year} month={month} photo={photo} weeks={weeks} />
      )}
      {layout === 'wall' && (
        <WallLayout year={year} month={month} photo={photo} weeks={weeks} />
      )}
    </div>
  );
});

type LayoutProps = {
  year: number;
  month: number;
  photo: string | undefined;
  weeks: ReturnType<typeof buildMonthGrid>;
};

function PhotoBox({ photo, className }: { photo: string | undefined; className?: string }) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt="" className={`object-cover ${className ?? ''}`} />
    );
  }
  return (
    <div className={`flex items-center justify-center bg-gray-100 text-xs text-gray-400 ${className ?? ''}`}>
      写真未設定
    </div>
  );
}

function DeskVerticalLayout({ year, month, photo, weeks }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col p-[8mm]">
      <div className="flex h-[42%] w-full items-center justify-center">
        <div className="h-full w-full overflow-hidden">
          <PhotoBox photo={photo} className="h-full w-full" />
        </div>
      </div>
      <div className="mt-[6mm] flex items-end gap-2">
        <div style={{ fontSize: '20mm', lineHeight: 1 }}>
          <DateNumber value={month} fontSize={56} />
        </div>
        <div className="pb-[3mm] text-[5mm] text-gray-500">{year}</div>
      </div>
      <CalendarGrid weeks={weeks} cellFont={11} headerFont={6} />
    </div>
  );
}

function DeskHorizontalLayout({ year, month, photo, weeks }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-row p-[5mm]">
      <div className="h-full w-[40%]">
        <PhotoBox photo={photo} className="h-full w-full" />
      </div>
      <div className="flex h-full flex-1 flex-col pl-[5mm]">
        <div className="flex items-baseline justify-between">
          <div className="text-[3mm] text-gray-500">{year}</div>
          <div style={{ fontSize: '12mm', lineHeight: 1 }}>
            <DateNumber value={month} fontSize={32} />
          </div>
        </div>
        <div className="mt-[2mm] flex-1">
          <CalendarGrid weeks={weeks} cellFont={7} headerFont={4} compact />
        </div>
      </div>
    </div>
  );
}

function WallLayout({ year, month, photo, weeks }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col p-[8mm]">
      <div className="h-[40%] w-full overflow-hidden">
        <PhotoBox photo={photo} className="h-full w-full" />
      </div>
      <div className="mt-[8mm] flex items-end justify-center gap-3">
        <div style={{ fontSize: '24mm', lineHeight: 1 }}>
          <DateNumber value={month} fontSize={68} />
        </div>
        <div className="pb-[4mm] text-[5mm] text-gray-500">{year}</div>
      </div>
      <div className="mt-[4mm] flex-1">
        <CalendarGrid weeks={weeks} cellFont={12} headerFont={6} />
      </div>
    </div>
  );
}

function CalendarGrid({
  weeks,
  cellFont,
  headerFont,
  compact = false,
}: {
  weeks: ReturnType<typeof buildMonthGrid>;
  cellFont: number;
  headerFont: number;
  compact?: boolean;
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="grid grid-cols-7 border-b border-gray-200 pb-[1mm]">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-center tracking-wide text-gray-500"
            style={{ fontSize: `${headerFont}pt` }}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="mt-[1mm] grid flex-1 grid-cols-7 grid-rows-[repeat(var(--rows),minmax(0,1fr))] gap-y-[1mm]" style={{ ['--rows' as string]: weeks.length }}>
        {weeks.flat().map((cell, i) => (
          <div
            key={i}
            className={`flex items-center justify-center ${compact ? '' : 'pt-[2mm]'}`}
          >
            {cell.day !== null && <DateNumber value={cell.day} fontSize={cellFont * 1.6} />}
          </div>
        ))}
      </div>
    </div>
  );
}
