'use client';

import { useRef, useState } from 'react';
import { useCalendarStore } from '@/lib/store';
import { fileToDataURL } from '@/lib/imageProcessing';
import { getTwelveMonthsFrom } from '@/lib/calendar';
import { DEFAULT_PHOTO_TRANSFORM } from '@/lib/types';
import { PhotoTransformEditor } from './PhotoTransformEditor';

export function MonthPhotoUploader() {
  const startYear = useCalendarStore((s) => s.startYear);
  const startMonth = useCalendarStore((s) => s.startMonth);
  const monthPhotos = useCalendarStore((s) => s.monthPhotos);
  const photoTransforms = useCalendarStore((s) => s.photoTransforms);
  const setMonthPhoto = useCalendarStore((s) => s.setMonthPhoto);
  const months = getTwelveMonthsFrom(startYear, startMonth);

  const [editorMonth, setEditorMonth] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {months.map(({ year, month }) => (
          <MonthSlot
            key={`${year}-${month}`}
            year={year}
            month={month}
            photo={monthPhotos[month]}
            transform={photoTransforms[month] ?? DEFAULT_PHOTO_TRANSFORM}
            onPick={(url) => setMonthPhoto(month, url)}
            onClear={() => setMonthPhoto(month, undefined)}
            onEdit={() => setEditorMonth(month)}
          />
        ))}
      </div>
      {editorMonth !== null && (
        <PhotoTransformEditor
          month={editorMonth}
          open={editorMonth !== null}
          onClose={() => setEditorMonth(null)}
        />
      )}
    </div>
  );
}

type SlotProps = {
  year: number;
  month: number;
  photo: string | undefined;
  transform: { focusX: number; focusY: number; zoom: number };
  onPick: (dataUrl: string) => void;
  onClear: () => void;
  onEdit: () => void;
};

function MonthSlot({ year, month, photo, transform, onPick, onClear, onEdit }: SlotProps) {
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
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className="relative aspect-square w-full overflow-hidden rounded border-2 border-dashed border-gray-300 bg-gray-50"
      >
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={`${year}年${month}月`}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: `${transform.focusX}% ${transform.focusY}%`,
                transform: `scale(${transform.zoom})`,
                transformOrigin: `${transform.focusX}% ${transform.focusY}%`,
              }}
            />
            <button
              type="button"
              onClick={onEdit}
              className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-[11px] text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/70"
            >
              範囲を調整
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 hover:bg-gray-100"
          >
            写真を選択
          </button>
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
      </div>
      {photo ? (
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onEdit}
            className="text-gray-700 underline hover:text-gray-900"
          >
            範囲調整
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-gray-500 underline hover:text-gray-700"
            >
              差替
            </button>
            <button
              type="button"
              onClick={onClear}
              className="text-gray-500 underline hover:text-gray-700"
            >
              クリア
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
