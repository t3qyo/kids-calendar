import type { Metadata } from "next";
import { Geist, Caveat, Klee_One } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-XW06EDZ229";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const kleeOne = Klee_One({
  variable: "--font-klee",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const SITE_TITLE = "てがき数字カレンダーメーカー";
const SITE_DESCRIPTION =
  "子供の写真とお子さんの手書き数字で、世界に一つだけのオリジナルカレンダーをブラウザだけで作れます。";

// 本番 URL は Vercel が VERCEL_PROJECT_PRODUCTION_URL に注入してくれる。
// 開発環境では localhost にフォールバック。og:image の絶対 URL 解決にも使われる。
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3010';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'ja_JP',
    url: siteUrl,
    siteName: SITE_TITLE,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${caveat.variable} ${kleeOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
        <Analytics />
      </body>
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </html>
  );
}
