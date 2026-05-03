'use client';

import { useRef, useState } from 'react';
import { useCalendarStore } from '@/lib/store';
import { fileToDataURL, removeWhiteBackground } from '@/lib/imageProcessing';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function DigitUploader() {
  const digitImages = useCalendarStore((s) => s.digitImages);
  const setDigitImage = useCalendarStore((s) => s.setDigitImage);
  const useHandwritten = useCalendarStore((s) => s.useHandwrittenDigits);
  const setUseHandwritten = useCalendarStore((s) => s.setUseHandwrittenDigits);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={useHandwritten}
          onChange={(e) => setUseHandwritten(e.target.checked)}
        />
        手書き数字を使う
      </label>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {DIGITS.map((d) => (
          <DigitSlot
            key={d}
            digit={d}
            image={digitImages[d]}
            onPick={(url) => setDigitImage(d, url)}
            onClear={() => setDigitImage(d, undefined)}
            disabled={!useHandwritten}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        白い紙にマジックなどで書いた0〜9の数字を撮影してアップロードしてください。白背景は自動で透過処理されます。
      </p>
    </div>
  );
}

function DigitSlot({
  digit,
  image,
  onPick,
  onClear,
  disabled,
}: {
  digit: number;
  image: string | undefined;
  onPick: (dataUrl: string) => void;
  onClear: () => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (file: File) => {
    setProcessing(true);
    try {
      const raw = await fileToDataURL(file);
      const processed = await removeWhiteBackground(raw, { trim: true });
      onPick(processed);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="text-center text-xs text-gray-600">{digit}</div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="relative aspect-square w-full overflow-hidden rounded border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 transition hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={`${digit}`} className="h-full w-full object-contain p-1" />
        ) : processing ? (
          <span>処理中...</span>
        ) : (
          <span>写真</span>
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
      {image && !disabled && (
        <button
          type="button"
          onClick={onClear}
          className="text-center text-xs text-gray-500 underline hover:text-gray-700"
        >
          消す
        </button>
      )}
    </div>
  );
}
