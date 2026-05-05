'use client';

import Image from 'next/image';

import { CalendarPreview } from '@/components/CalendarPreview';
import { ClearAllButton } from '@/components/ClearAllButton';
import { DigitUploader } from '@/components/DigitUploader';
import { ExportButtons } from '@/components/ExportButtons';
import { ExportRenderArea } from '@/components/ExportRenderArea';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LayoutSelector } from '@/components/LayoutSelector';
import { MonthPhotoUploader } from '@/components/MonthPhotoUploader';
import { PaperSizeSelector } from '@/components/PaperSizeSelector';
import { ReloadWarning } from '@/components/ReloadWarning';
import { StartMonthSelector } from '@/components/StartMonthSelector';
import { useTranslations } from '@/lib/i18n';

export function HomeContent() {
  const t = useTranslations();

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6">
      <ReloadWarning />
      <header className="space-y-6">
        <div className="space-y-1">
          <p className="text-xs text-gray-500">{t.header.sampleCaption}</p>
          <Image
            src="/sample.jpg"
            alt={t.header.sampleCaption}
            width={3024}
            height={3572}
            className="w-40 rounded-lg shadow-md sm:w-48"
          />
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.site.title}
          </h1>
          <LanguageSwitcher />
        </div>
        <p className="text-sm text-gray-600">{t.site.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <p className="text-xs text-gray-500">{t.header.autosave}</p>
          <ClearAllButton />
        </div>
      </header>

      <Section step="1" title={t.steps.step1.title} description={t.steps.step1.description}>
        <StartMonthSelector />
      </Section>

      <Section step="2" title={t.steps.step2.title} description={t.steps.step2.description}>
        <MonthPhotoUploader />
      </Section>

      <Section step="3" title={t.steps.step3.title} description={t.steps.step3.description}>
        <DigitUploader />
      </Section>

      <Section step="4" title={t.steps.step4.title}>
        <LayoutSelector />
      </Section>

      <Section step="5" title={t.steps.step5.title}>
        <CalendarPreview />
      </Section>

      <Section step="6" title={t.steps.step6.title}>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-600">{t.steps.step6.paperLabel}</p>
            <PaperSizeSelector />
          </div>
          <ExportButtons />
        </div>
        <p className="mt-2 text-xs text-gray-500">{t.steps.step6.pdfNote}</p>
      </Section>

      <ExportRenderArea />

      <footer className="pb-4 text-center text-xs text-gray-400">
        {t.footer.madeBy}{' '}
        <a
          href="https://x.com/t3qyo"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 hover:underline"
        >
          @t3qyo
        </a>
      </footer>
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
