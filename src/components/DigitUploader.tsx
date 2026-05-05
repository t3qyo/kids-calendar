'use client';

import { useRef, useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { useCalendarStore } from '@/lib/store';
import { useProcessingStore } from '@/lib/processingStore';
import { fileToDataURL, normalizeImageFile, removeWhiteBackground } from '@/lib/imageProcessing';
import { useTranslations } from '@/lib/i18n';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function DigitUploader() {
  const digitImages = useCalendarStore((s) => s.digitImages);
  const setDigitImage = useCalendarStore((s) => s.setDigitImage);
  const t = useTranslations();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {DIGITS.map((d) => (
          <DigitSlot
            key={d}
            digit={d}
            image={digitImages[d]}
            onPick={(url) => setDigitImage(d, url)}
            onClear={() => setDigitImage(d, undefined)}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">{t.digitUploader.hint}</p>
    </div>
  );
}

function DigitSlot({
  digit,
  image,
  onPick,
  onClear,
}: {
  digit: number;
  image: string | undefined;
  onPick: (dataUrl: string) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const beginProcessing = useProcessingStore((s) => s.begin);
  const endProcessing = useProcessingStore((s) => s.end);
  const t = useTranslations();

  const handleFile = async (file: File) => {
    setProcessing(true);
    setError(null);
    beginProcessing();
    // HEIC のデコード(heic2any)はメインスレッドをブロックするため、
    // 「処理中...」のペイントが先に走るよう一旦ブラウザに yield する
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      const normalized = await normalizeImageFile(file);
      const raw = await fileToDataURL(normalized);
      const processed = await removeWhiteBackground(raw, { trim: true });
      onPick(processed);
      sendGAEvent('event', 'digit_set', { digit });
    } catch (err) {
      console.error(err);
      setError(t.digitUploader.errorLoad);
    } finally {
      setProcessing(false);
      endProcessing();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="text-center text-xs text-gray-600">{digit}</div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative aspect-square w-full overflow-hidden rounded border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 transition hover:border-gray-400 hover:bg-gray-100"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={`${digit}`} className="h-full w-full object-contain p-1" />
        ) : processing ? (
          <span>{t.digitUploader.processing}</span>
        ) : (
          <span>{t.digitUploader.photo}</span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </button>
      {image && (
        <button
          type="button"
          onClick={onClear}
          className="text-center text-xs text-gray-500 underline hover:text-gray-700"
        >
          {t.digitUploader.clear}
        </button>
      )}
      <p role="alert" aria-live="polite" className="text-center text-[10px] text-red-600 empty:hidden">
        {error}
      </p>
    </div>
  );
}
