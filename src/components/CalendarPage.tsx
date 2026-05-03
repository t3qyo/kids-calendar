'use client';

import { forwardRef } from 'react';
import { buildMonthGrid, WEEKDAYS } from '@/lib/calendar';
import type { LayoutType, PhotoTransform } from '@/lib/types';
import { DEFAULT_PHOTO_TRANSFORM, PHOTO_ASPECT } from '@/lib/types';
import { DateNumber } from './DateNumber';

export type LayoutSpec = {
  id: LayoutType;
  label: string;
  widthMm: number;
  heightMm: number;
};

export const LAYOUT_SPECS: Record<LayoutType, LayoutSpec> = {
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
  transform?: PhotoTransform;
};

export const CalendarPage = forwardRef<HTMLDivElement, Props>(function CalendarPage(
  { year, month, layout, photo, transform },
  ref,
) {
  const spec = LAYOUT_SPECS[layout];
  const weeks = buildMonthGrid(year, month);
  const t = transform ?? DEFAULT_PHOTO_TRANSFORM;

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
      {layout === 'desk-horizontal' && (
        <DeskHorizontalLayout year={year} month={month} photo={photo} weeks={weeks} transform={t} />
      )}
      {layout === 'wall' && (
        <WallLayout year={year} month={month} photo={photo} weeks={weeks} transform={t} />
      )}
    </div>
  );
});

type LayoutProps = {
  year: number;
  month: number;
  photo: string | undefined;
  weeks: ReturnType<typeof buildMonthGrid>;
  transform: PhotoTransform;
};

function PhotoBox({
  photo,
  transform,
  className,
}: {
  photo: string | undefined;
  transform: PhotoTransform;
  className?: string;
}) {
  if (photo) {
    return (
      <div className={`relative overflow-hidden ${className ?? ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: `${transform.focusX}% ${transform.focusY}%`,
            transform: `scale(${transform.zoom})`,
            transformOrigin: `${transform.focusX}% ${transform.focusY}%`,
          }}
        />
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center bg-gray-100 text-xs text-gray-400 ${className ?? ''}`}>
      写真未設定
    </div>
  );
}

/**
 * 写真エリアに固定の縦横比を持たせるラッパー。
 * CSS の `aspect-ratio` プロパティだと html2canvas-pro が正しく解釈せず
 * PDF 出力時にレイアウトが崩れるため、互換性の高い padding-top トリックを使う。
 */
function AspectBox({ aspect, children }: { aspect: number; children: React.ReactNode }) {
  return (
    <div className="relative w-full" style={{ paddingTop: `${100 / aspect}%` }}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

function DeskHorizontalLayout({ year, month, photo, weeks, transform }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-row p-[6mm]">
      <div className="flex h-full w-[35%] items-center justify-center">
        <AspectBox aspect={PHOTO_ASPECT}>
          <PhotoBox photo={photo} transform={transform} className="h-full w-full" />
        </AspectBox>
      </div>
      <div className="flex h-full flex-1 flex-col pl-[5mm]">
        <div className="flex items-baseline justify-between">
          <div className="text-[3mm] text-gray-500">{year}</div>
          <div style={{ fontSize: '12mm', lineHeight: 1 }}>
            <DateNumber value={month} fontSize={32} />
          </div>
        </div>
        <div className="mt-[2mm] flex-1">
          <CalendarGrid weeks={weeks} cellFont={6} headerFont={4} compact />
        </div>
      </div>
    </div>
  );
}

function WallLayout({ year, month, photo, weeks, transform }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col p-[8mm]">
      <AspectBox aspect={PHOTO_ASPECT}>
        <PhotoBox photo={photo} transform={transform} className="h-full w-full" />
      </AspectBox>
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
