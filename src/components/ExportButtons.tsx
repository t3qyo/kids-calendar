'use client';

import { useState } from 'react';
import { useCalendarStore } from '@/lib/store';
import { getTwelveMonthsFrom } from '@/lib/calendar';
import { LAYOUT_SPECS } from './CalendarPage';

export function ExportButtons() {
  const startYear = useCalendarStore((s) => s.startYear);
  const startMonth = useCalendarStore((s) => s.startMonth);
  const layout = useCalendarStore((s) => s.layout);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const renderPage = async (key: string): Promise<HTMLCanvasElement> => {
    const html2canvas = (await import('html2canvas-pro')).default;
    const node = document.querySelector<HTMLElement>(`[data-export-page="${key}"]`);
    if (!node) throw new Error(`page ${key} not found`);
    return html2canvas(node, {
      scale: 3,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
  };

  const months = getTwelveMonthsFrom(startYear, startMonth);
  const fileBase = `kids-calendar-${startYear}-${String(startMonth).padStart(2, '0')}`;

  const exportPdf = async () => {
    setExporting(true);
    setError(null);
    try {
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
    } catch (err) {
      console.error(err);
      setError('PDFの書き出しに失敗しました。再度お試しください。');
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  const exportPng = async () => {
    setExporting(true);
    setError(null);
    try {
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
    } catch (err) {
      console.error(err);
      setError('PNGの書き出しに失敗しました。再度お試しください。');
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-2">
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
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
