'use client';

import { useRef } from 'react';
import { useCalendarStore } from '@/lib/store';
import { fileToDataURL } from '@/lib/imageProcessing';
import { getTwelveMonthsFrom } from '@/lib/calendar';

export function MonthPhotoUploader() {
  const startYear = useCalendarStore((s) => s.startYear);
  const startMonth = useCalendarStore((s) => s.startMonth);
  const monthPhotos = useCalendarStore((s) => s.monthPhotos);
  const setMonthPhoto = useCalendarStore((s) => s.setMonthPhoto);
  const months = getTwelveMonthsFrom(startYear, startMonth);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {months.map(({ year, month }) => (
        <MonthSlot
          key={`${year}-${month}`}
          year={year}
          month={month}
          photo={monthPhotos[month]}
          onPick={(url) => setMonthPhoto(month, url)}
          onClear={() => setMonthPhoto(month, undefined)}
        />
      ))}
    </div>
  );
}

function MonthSlot({
  year,
  month,
  photo,
  onPick,
  onClear,
}: {
  year: number;
  month: number;
  photo: string | undefined;
  onPick: (dataUrl: string) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const url = await fileToDataURL(file);
    onPick(url);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-medium text-gray-600">
        {year}年{month}月
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className="relative aspect-square w-full overflow-hidden rounded border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 transition hover:border-gray-400 hover:bg-gray-100"
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={`${year}年${month}月`} className="h-full w-full object-cover" />
        ) : (
          <span>写真を選択</span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </button>
      {photo && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-gray-500 underline hover:text-gray-700"
        >
          クリア
        </button>
      )}
    </div>
  );
}
