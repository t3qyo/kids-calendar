'use client';

import { useState } from 'react';
import { useCalendarStore } from '@/lib/store';
import { MONTHS } from '@/lib/calendar';
import { LAYOUT_SPECS } from './CalendarPage';

export function ExportButtons() {
  const year = useCalendarStore((s) => s.year);
  const layout = useCalendarStore((s) => s.layout);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const renderPage = async (month: number): Promise<HTMLCanvasElement> => {
    const html2canvas = (await import('html2canvas-pro')).default;
    const node = document.querySelector<HTMLElement>(`[data-export-page="${month}"]`);
    if (!node) throw new Error(`page ${month} not found`);
    return html2canvas(node, {
      scale: 3,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const spec = LAYOUT_SPECS[layout];
      const orientation = spec.widthMm >= spec.heightMm ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        unit: 'mm',
        format: [spec.widthMm, spec.heightMm],
        orientation,
      });
      for (let i = 0; i < MONTHS.length; i++) {
        const m = MONTHS[i];
        setProgress({ current: i + 1, total: MONTHS.length });
        const canvas = await renderPage(m);
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        if (i > 0) pdf.addPage([spec.widthMm, spec.heightMm], orientation);
        pdf.addImage(imgData, 'JPEG', 0, 0, spec.widthMm, spec.heightMm, undefined, 'FAST');
      }
      pdf.save(`kids-calendar-${year}.pdf`);
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  const exportPng = async () => {
    setExporting(true);
    try {
      for (let i = 0; i < MONTHS.length; i++) {
        const m = MONTHS[i];
        setProgress({ current: i + 1, total: MONTHS.length });
        const canvas = await renderPage(m);
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `kids-calendar-${year}-${String(m).padStart(2, '0')}.png`;
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
