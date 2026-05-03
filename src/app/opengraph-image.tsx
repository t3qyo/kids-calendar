import { ImageResponse } from 'next/og';
import { SocialImageBody } from './_socialImage';

// Open Graph 用の自動生成画像。Facebook/LINE/Slack などの 1.91:1 標準を満たす 1200x630。
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'てがき数字カレンダーメーカー';

export default function OpengraphImage() {
  return new ImageResponse(<SocialImageBody />, size);
}
