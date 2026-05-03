'use client';

import { useCalendarStore } from '@/lib/store';

export function DateNumber({ value, fontSize }: { value: number; fontSize: number }) {
  const digitImages = useCalendarStore((s) => s.digitImages);

  const digits = String(value).split('').map((d) => Number(d));
  const allAvailable = digits.every((d) => digitImages[d as 0]);

  if (allAvailable) {
    return (
      <span
        className="inline-flex items-end"
        style={{ height: fontSize * 1.1, lineHeight: 0, gap: fontSize * 0.15 }}
      >
        {digits.map((d, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={digitImages[d as 0]}
            alt={String(d)}
            style={{ height: fontSize, width: 'auto' }}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      style={{
        fontSize,
        fontFamily: "'Caveat', 'Klee One', 'Yomogi', cursive",
        lineHeight: 1,
      }}
    >
      {value}
    </span>
  );
}
