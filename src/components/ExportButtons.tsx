'use client';

import { useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import { useCalendarStore } from '@/lib/store';
import { getTwelveMonthsFrom } from '@/lib/calendar';
import { cropPhotoCached } from '@/lib/imageProcessing';
import { DEFAULT_PHOTO_TRANSFORM, PHOTO_ASPECT } from '@/lib/types';
import { LAYOUT_SPECS, getTotalHeightMm } from './CalendarPage';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
// 「PDF を初めて出力したユーザかどうか」を一度だけ記録するためのフラグ。
// Vercel Analytics の Events は count 表示でユニーク visitor 集計が無いため、
// この flag が立っていない時だけ別イベントを発火することで「初回出力ユーザ数」を近似する。
const PDF_FIRST_EXPORT_KEY = 'kids-calendar-pdf-exported-once';
const CROP_MARK_LENGTH_MM = 4;
const CROP_MARK_GAP_MM = 1;
const CROP_MARK_LINE_WIDTH_MM = 0.1;
// 卓上横を A4 1 枚に 2 ヶ月分縦並びで載せる時のカード間ギャップ。
// ハサミで切り分ける余白として確保する。
const TWO_UP_GAP_MM = 8;

export function ExportButtons() {
  const startYear = useCalendarStore((s) => s.startYear);
  const startMonth = useCalendarStore((s) => s.startMonth);
  const layout = useCalendarStore((s) => s.layout);
  const paperSize = useCalendarStore((s) => s.paperSize);
  const monthPhotos = useCalendarStore((s) => s.monthPhotos);
  const photoTransforms = useCalendarStore((s) => s.photoTransforms);
  const digitImages = useCalendarStore((s) => s.digitImages);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const months = getTwelveMonthsFrom(startYear, startMonth);
  const fileBase = `kids-calendar-${startYear}-${String(startMonth).padStart(2, '0')}`;

  // 出力前に全月分のクロップを完了させる。useCroppedPhoto と同じキャッシュを共有しているので、
  // ここで await した時点で ExportRenderArea 側の PhotoBox も同じ結果を読める状態になる。
  // クロップ失敗は出力結果が空欄/古いまま素通りしないよう、握り潰さず呼び出し側に伝える。
  const warmCropCache = async () => {
    await Promise.all(
      months.map(({ month }) => {
        const photo = monthPhotos[month];
        if (!photo) return Promise.resolve();
        const transform = photoTransforms[month] ?? DEFAULT_PHOTO_TRANSFORM;
        return cropPhotoCached(photo, transform, PHOTO_ASPECT);
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
    setError(null);
    try {
      await warmCropCache();
      const { jsPDF } = await import('jspdf');
      const spec = LAYOUT_SPECS[layout];

      // 留め具余白を含めた本体高さ。レンダリング DOM・PDF 用紙サイズ・トンボ位置はすべてこの値で揃える。
      const cardH = getTotalHeightMm(spec);
      // 用紙サイズ。a4 はレイアウトを A4 中央に配置 + トンボ。exact はレイアウト実寸そのまま。
      const useA4 = paperSize === 'a4';
      const pageW = useA4 ? A4_WIDTH_MM : spec.widthMm;
      const pageH = useA4 ? A4_HEIGHT_MM : cardH;
      const orientation = pageW >= pageH ? 'landscape' : 'portrait';

      // 卓上横 (本体 144x86mm + 留め具 20mm) は A4 縦に縦並びで 2 ヶ月分載せられるので 2-up にする。
      // それ以外(壁掛け / exact 用紙)は従来通り 1 ヶ月 / ページ。
      const cardsPerPage = layout === 'desk-horizontal' && useA4 ? 2 : 1;
      const cardPositions = computeCardPositions(cardsPerPage, pageW, pageH, spec.widthMm, cardH);

      const pdf = new jsPDF({ unit: 'mm', format: [pageW, pageH], orientation });

      const totalPages = Math.ceil(months.length / cardsPerPage);
      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        if (pageIdx > 0) pdf.addPage([pageW, pageH], orientation);
        for (let slot = 0; slot < cardsPerPage; slot++) {
          const monthIdx = pageIdx * cardsPerPage + slot;
          if (monthIdx >= months.length) break;
          const { year, month } = months[monthIdx];
          setProgress({ current: monthIdx + 1, total: months.length });
          let canvas = await renderPage(`${year}-${month}`);
          // 両面前提のレイアウトでは、裏面 (偶数 index = 2,4,6...) を 180° 回転して
          // 配置する。上端綴じで下からめくると正しい向きで次の月が現れるようにするため。
          if (spec.doubleSided && monthIdx % 2 === 1) {
            canvas = rotateCanvas180(canvas);
          }
          const imgData = canvas.toDataURL('image/jpeg', 0.92);
          const { x, y } = cardPositions[slot];
          pdf.addImage(imgData, 'JPEG', x, y, spec.widthMm, cardH, undefined, 'FAST');
          if (useA4) drawCropMarks(pdf, x, y, spec.widthMm, cardH);
        }
      }
      pdf.save(`${fileBase}.pdf`);
      const photoCount = months.filter(({ month }) => Boolean(monthPhotos[month])).length;
      const digitCount = Object.values(digitImages).filter(Boolean).length;
      sendGAEvent('event', 'export_pdf', {
        layout,
        paper_size: paperSize,
        start_year: startYear,
        start_month: startMonth,
        photo_count: photoCount,
        digit_count: digitCount,
      });
      trackPdfFirstExportOnce();
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
      sendGAEvent('event', 'export_png', { layout, paper_size: paperSize });
    } catch (err) {
      console.error(err);
      setError('PNGの書き出しに失敗しました。再度お試しください。');
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  const spec = LAYOUT_SPECS[layout];

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
      <PrintHint
        paperSize={paperSize}
        doubleSided={spec.doubleSided ?? false}
        twoUp={layout === 'desk-horizontal' && paperSize === 'a4'}
        clipMarginMm={spec.clipMarginMm ?? 0}
        clipSide={spec.clipSide}
      />

      <p role="alert" aria-live="polite" className="text-sm text-red-600 empty:hidden">
        {error}
      </p>
    </div>
  );
}

/**
 * 同一ブラウザで初めて PDF を出力した時のみ `export_pdf_first_time` を発火する。
 * localStorage にフラグを残すことでブラウザ単位のユニークユーザ数を近似する
 * (= プライベートブラウズや別端末からの出力は別ユーザとして再カウントされる)。
 */
function trackPdfFirstExportOnce() {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem(PDF_FIRST_EXPORT_KEY)) return;
    window.localStorage.setItem(PDF_FIRST_EXPORT_KEY, '1');
    sendGAEvent('event', 'export_pdf_first_time');
  } catch {
    // localStorage がブロックされている環境では握り潰す
  }
}

/**
 * 指定 node 配下の <img> がすべて load 完了するのを待つ。
 * data URL でも実 IMG 要素はデコードに 1 フレーム必要なケースがあるため、
 * html2canvas に渡す前に確実にロード済みにする。
 *
 * 既に load/error が確定している(`complete === true`)ケースを最初に
 * 判定しておくことで、リスナー登録前に確定した IMG で永久に待ち続ける
 * race を避ける。`naturalWidth === 0` の complete はロード失敗扱いで reject。
 */
async function waitForImagesLoaded(node: HTMLElement): Promise<void> {
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve, reject) => {
          if (img.complete) {
            if (img.naturalWidth > 0) resolve();
            else reject(new Error(`Image failed to load: ${truncate(img.src)}`));
            return;
          }
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener(
            'error',
            () => reject(new Error(`Image failed to load: ${truncate(img.src)}`)),
            { once: true },
          );
        }),
    ),
  );
}

function truncate(value: string, max = 80): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function PrintHint({
  paperSize,
  doubleSided,
  twoUp,
  clipMarginMm,
  clipSide,
}: {
  paperSize: 'a4' | 'exact';
  doubleSided: boolean;
  twoUp: boolean;
  clipMarginMm: number;
  clipSide?: 'top' | 'bottom';
}) {
  const items: string[] = [];
  if (paperSize === 'a4') {
    items.push('用紙: A4 / 倍率: 100% (実際のサイズ・原寸大)');
    if (twoUp) {
      items.push('A4 1 枚に 2 ヶ月分が縦並びで配置されます (計 6 枚)');
    }
    items.push('印刷後、各カードの四隅のトンボ (切り取り線) に沿って切り抜く');
  } else {
    items.push('用紙: PDF と同じサイズ / 倍率: 100% (実際のサイズ・原寸大)');
  }
  if (clipMarginMm > 0) {
    const where = clipSide === 'top' ? '上' : '下';
    items.push(`カード${where}側に約 ${clipMarginMm}mm の余白あり (留め具・スタンド取付用)`);
  }
  if (doubleSided) {
    items.push('両面印刷: 長辺とじ');
    items.push('印刷後、用紙の上端を綴じる (パンチ穴 + 紐 / クリップなど)');
    items.push('下端からめくると、裏面に翌月が正しい向きで現れます');
  }
  return (
    <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
      <p className="font-medium">印刷設定</p>
      <ul className="mt-1 list-disc pl-4 space-y-0.5">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * ページ内に配置する各カードの左上座標を計算する。
 * cardsPerPage=1: 中央 1 枚。
 * cardsPerPage=2: 縦並び 2 枚で、ハサミで切り分けられるよう間に TWO_UP_GAP_MM のギャップ。
 */
function computeCardPositions(
  cardsPerPage: number,
  pageW: number,
  pageH: number,
  cardW: number,
  cardH: number,
): { x: number; y: number }[] {
  const x = (pageW - cardW) / 2;
  if (cardsPerPage === 1) {
    return [{ x, y: (pageH - cardH) / 2 }];
  }
  // 2-up: 縦並び
  const totalH = cardH * cardsPerPage + TWO_UP_GAP_MM * (cardsPerPage - 1);
  const topMargin = (pageH - totalH) / 2;
  return Array.from({ length: cardsPerPage }, (_, i) => ({
    x,
    y: topMargin + i * (cardH + TWO_UP_GAP_MM),
  }));
}

function rotateCanvas180(source: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  ctx.translate(source.width, source.height);
  ctx.rotate(Math.PI);
  ctx.drawImage(source, 0, 0);
  return out;
}

/**
 * A4 用紙にレイアウトを中央配置したときの 4 隅に、切り取り位置を示すトンボ
 * (corner crop marks) を描く。線がレイアウト本体に被らないよう、辺から
 * CROP_MARK_GAP_MM だけ外側に L 字を引く。
 */
function drawCropMarks(
  // jsPDF の型を直接 import すると非同期 import の意味が薄れるので緩めの型で受ける
  pdf: { setLineWidth: (w: number) => void; setDrawColor: (g: number) => void; line: (x1: number, y1: number, x2: number, y2: number) => void },
  x: number,
  y: number,
  w: number,
  h: number,
) {
  pdf.setLineWidth(CROP_MARK_LINE_WIDTH_MM);
  pdf.setDrawColor(150);
  const len = CROP_MARK_LENGTH_MM;
  const gap = CROP_MARK_GAP_MM;
  // top-left
  pdf.line(x - gap - len, y, x - gap, y);
  pdf.line(x, y - gap - len, x, y - gap);
  // top-right
  pdf.line(x + w + gap, y, x + w + gap + len, y);
  pdf.line(x + w, y - gap - len, x + w, y - gap);
  // bottom-left
  pdf.line(x - gap - len, y + h, x - gap, y + h);
  pdf.line(x, y + h + gap, x, y + h + gap + len);
  // bottom-right
  pdf.line(x + w + gap, y + h, x + w + gap + len, y + h);
  pdf.line(x + w, y + h + gap, x + w, y + h + gap + len);
}
