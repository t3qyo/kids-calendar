'use client';

import { useState } from 'react';
import { useCalendarStore } from '@/lib/store';
import { getTwelveMonthsFrom } from '@/lib/calendar';
import { cropPhotoCached } from '@/lib/imageProcessing';
import { DEFAULT_PHOTO_TRANSFORM, PHOTO_ASPECT } from '@/lib/types';
import { LAYOUT_SPECS } from './CalendarPage';

export function ExportButtons() {
  const startYear = useCalendarStore((s) => s.startYear);
  const startMonth = useCalendarStore((s) => s.startMonth);
  const layout = useCalendarStore((s) => s.layout);
  const monthPhotos = useCalendarStore((s) => s.monthPhotos);
  const photoTransforms = useCalendarStore((s) => s.photoTransforms);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const months = getTwelveMonthsFrom(startYear, startMonth);
  const fileBase = `kids-calendar-${startYear}-${String(startMonth).padStart(2, '0')}`;

  // 出力前に全月分のクロップを完了させる。useCroppedPhoto と同じキャッシュを共有しているので、
  // ここで await した時点で ExportRenderArea 側の PhotoBox も同じ結果を読める状態になる。
  const warmCropCache = async () => {
    await Promise.all(
      months.map(({ month }) => {
        const photo = monthPhotos[month];
        if (!photo) return Promise.resolve();
        const transform = photoTransforms[month] ?? DEFAULT_PHOTO_TRANSFORM;
        return cropPhotoCached(photo, transform, PHOTO_ASPECT).catch(() => undefined);
      }),
    );
    // 直後に React が PhotoBox の state を流し、IMG が DOM に乗るまで 2 フレーム待つ
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  };

  const renderPage = async (key: string): Promise<HTMLCanvasElement> => {
    const html2canvas = (await import('html2canvas-pro')).default;
    const node = document.querySelector<HTMLElement>(`[data-export-page="${key}"]`);
    if (!node) throw new Error(`page ${key} not found`);
    await waitForImagesLoaded(node);
    return html2canvas(node, {
      scale: 3,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      await warmCropCache();
      const { jsPDF } = await import('jspdf');
      const spec = LAYOUT_SPECS[layout];
      const orientation = spec.widthMm >= spec.heightMm ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        unit: 'mm',
        format: [spec.widthMm, spec.heightMm],
        orientation,
      });
      for (let i = 0; i < months.length; i++) {
        const { year, month } = months[i];
        setProgress({ current: i + 1, total: months.length });
        const canvas = await renderPage(`${year}-${month}`);
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        if (i > 0) pdf.addPage([spec.widthMm, spec.heightMm], orientation);
        pdf.addImage(imgData, 'JPEG', 0, 0, spec.widthMm, spec.heightMm, undefined, 'FAST');
      }
      pdf.save(`${fileBase}.pdf`);
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  const exportPng = async () => {
    setExporting(true);
    try {
      await warmCropCache();
      for (let i = 0; i < months.length; i++) {
        const { year, month } = months[i];
        setProgress({ current: i + 1, total: months.length });
        const canvas = await renderPage(`${year}-${month}`);
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileBase}-${String(i + 1).padStart(2, '0')}-${year}${String(month).padStart(2, '0')}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={exportPdf}
        disabled={exporting}
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white shadow hover:bg-gray-800 disabled:opacity-50"
      >
        PDFで出力（12ヶ月）
      </button>
      <button
        type="button"
        onClick={exportPng}
        disabled={exporting}
        className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
      >
        PNGで個別ダウンロード
      </button>
      {progress && (
        <span className="text-sm text-gray-600">
          書き出し中 {progress.current} / {progress.total}
        </span>
      )}
    </div>
  );
}

/**
 * 指定 node 配下の <img> がすべて load 完了するのを待つ。
 * data URL でも実 IMG 要素はデコードに 1 フレーム必要なケースがあるため、
 * html2canvas に渡す前に確実にロード済みにする。
 */
async function waitForImagesLoaded(node: HTMLElement): Promise<void> {
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    }),
  );
}
