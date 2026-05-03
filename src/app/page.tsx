import { CalendarPreview } from '@/components/CalendarPreview';
import { DigitUploader } from '@/components/DigitUploader';
import { ExportButtons } from '@/components/ExportButtons';
import { ExportRenderArea } from '@/components/ExportRenderArea';
import { LayoutSelector } from '@/components/LayoutSelector';
import { MonthPhotoUploader } from '@/components/MonthPhotoUploader';

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Kids Calendar Maker
        </h1>
        <p className="text-sm text-gray-600">
          子供の写真と手書きの数字で、世界に一つだけの2026年カレンダーをつくれます。
        </p>
      </header>

      <Section
        step="1"
        title="月ごとの写真をアップロード"
        description="1月〜12月の写真を選択してください。各月の四角をクリックまたはドラッグ&ドロップで写真を設定できます。"
      >
        <MonthPhotoUploader />
      </Section>

      <Section
        step="2"
        title="手書き数字を使う（任意）"
        description="お子さんが書いた0〜9の数字写真を取り込むと、日付がオリジナルの手書きになります。10種類すべて揃っていない場合は通常のフォントが使われます。"
      >
        <DigitUploader />
      </Section>

      <Section step="3" title="レイアウトを選ぶ">
        <LayoutSelector />
      </Section>

      <Section step="4" title="プレビュー（2026年 1〜12月）">
        <CalendarPreview />
      </Section>

      <Section step="5" title="出力">
        <ExportButtons />
        <p className="mt-2 text-xs text-gray-500">
          ※ PDFは12ヶ月分が1ファイルに収まります。印刷時はサイズに合わせた用紙設定でどうぞ。
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
