import { CalendarPreview } from '@/components/CalendarPreview';
import { DigitUploader } from '@/components/DigitUploader';
import { ExportButtons } from '@/components/ExportButtons';
import { ExportRenderArea } from '@/components/ExportRenderArea';
import { LayoutSelector } from '@/components/LayoutSelector';
import { MonthPhotoUploader } from '@/components/MonthPhotoUploader';
import { PaperSizeSelector } from '@/components/PaperSizeSelector';
import { ReloadWarning } from '@/components/ReloadWarning';
import { StartMonthSelector } from '@/components/StartMonthSelector';

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6">
      <ReloadWarning />
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Kids Calendar Maker
        </h1>
        <p className="text-sm text-gray-600">
          子供の写真と手書きの数字で、世界に一つだけのオリジナルカレンダーをつくれます。
        </p>
        <p className="text-xs text-amber-700">
          ※ アップロードした写真や数字はブラウザを閉じる/リロードすると消えます。
        </p>
      </header>

      <Section step="1" title="開始月を選ぶ" description="開始月から12ヶ月分のカレンダーを作成します。">
        <StartMonthSelector />
      </Section>

      <Section
        step="2"
        title="月ごとの写真をアップロード"
        description="各月の四角をクリックまたはドラッグ&ドロップで写真を設定できます。"
      >
        <MonthPhotoUploader />
      </Section>

      <Section
        step="3"
        title="手書き数字を使う（任意）"
        description="お子さんが書いた0〜9の数字写真を取り込むと、その数字で表せる日付が手書きに切り替わります（例: 「1」と「5」をアップすると 1・5・11・15… が手書きに）。足りない数字を含む日付は通常のフォントで表示されます。"
      >
        <DigitUploader />
      </Section>

      <Section step="4" title="レイアウトを選ぶ">
        <LayoutSelector />
      </Section>

      <Section step="5" title="プレビュー">
        <CalendarPreview />
      </Section>

      <Section step="6" title="出力">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-600">印刷用紙</p>
            <PaperSizeSelector />
          </div>
          <ExportButtons />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          ※ PDFは12ヶ月分が1ファイルに収まります。
        </p>
      </Section>

      <ExportRenderArea />
    </main>
  );
}

function Section({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline gap-3">
        <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
          STEP {step}
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      <div>{children}</div>
    </section>
  );
}
