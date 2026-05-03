import { ImageResponse } from 'next/og';
import { SocialImageBody } from './_socialImage';

// Twitter (X) の summary_large_image カードは 2:1 比率推奨のため 1200x600 で別出力する。
// 1200x630 のままだと上下が軽くトリミングされ、文字が切れて見えるリスクがある。
export const size = { width: 1200, height: 600 };
export const contentType = 'image/png';
export const alt = 'てがき数字カレンダーメーカー';

export default function TwitterImage() {
  return new ImageResponse(<SocialImageBody />, size);
}
