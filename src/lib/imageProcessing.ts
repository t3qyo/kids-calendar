export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

type RemoveWhiteBackgroundOptions = {
  /** 背景として扱う輝度の比率(0-1)。背景輝度に対しこの比率以上のピクセルは完全透明。 */
  whiteRatio?: number;
  /** インクとして扱う輝度の比率(0-1)。背景輝度に対しこの比率以下のピクセルは完全不透明。 */
  inkRatio?: number;
  /** 余白をトリムするか */
  trim?: boolean;
};

export async function removeWhiteBackground(
  src: string,
  options: RemoveWhiteBackgroundOptions = {},
): Promise<string> {
  const { whiteRatio = 0.88, inkRatio = 0.55, trim = true } = options;
  const img = await loadImage(src);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const backgroundLuma = estimateBackgroundLuma(data, canvas.width, canvas.height);
  // 背景が暗すぎる撮影でも一定のレンジを確保
  const safeBackground = Math.max(backgroundLuma, 80);
  const whiteCutoff = safeBackground * whiteRatio;
  const inkCutoff = safeBackground * inkRatio;
  const range = Math.max(1, whiteCutoff - inkCutoff);

  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;
  let hasOpaque = false;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      let alpha: number;
      if (luma >= whiteCutoff) {
        alpha = 0;
      } else if (luma <= inkCutoff) {
        alpha = 255;
      } else {
        // インクと背景の中間: リニア補間で滑らかな縁にする
        const t = (whiteCutoff - luma) / range;
        alpha = Math.round(255 * t);
      }

      if (alpha === 0) {
        data[i + 3] = 0;
      } else {
        // インク色は黒に寄せる(撮影時の色味を消す)
        data[i] = 20;
        data[i + 1] = 20;
        data[i + 2] = 20;
        data[i + 3] = alpha;

        if (alpha > 40) {
          hasOpaque = true;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  if (!trim || !hasOpaque) {
    return canvas.toDataURL('image/png');
  }

  const padding = Math.round(Math.max(canvas.width, canvas.height) * 0.05);
  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropW = Math.min(canvas.width - cropX, maxX - minX + padding * 2);
  const cropH = Math.min(canvas.height - cropY, maxY - minY + padding * 2);

  const cropped = document.createElement('canvas');
  cropped.width = cropW;
  cropped.height = cropH;
  const cctx = cropped.getContext('2d');
  if (!cctx) throw new Error('Canvas context not available');
  cctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return cropped.toDataURL('image/png');
}

/**
 * 画像四隅のサンプルから背景の輝度を推定する。
 * 紙の色味や露光に応じて透過しきい値を適応させるために使う。
 */
function estimateBackgroundLuma(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): number {
  const sampleSize = Math.max(8, Math.round(Math.min(width, height) * 0.1));
  const samples: number[] = [];

  const pushSample = (sx: number, sy: number) => {
    const ex = Math.min(width, sx + sampleSize);
    const ey = Math.min(height, sy + sampleSize);
    for (let y = sy; y < ey; y++) {
      for (let x = sx; x < ex; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        samples.push(0.299 * r + 0.587 * g + 0.114 * b);
      }
    }
  };

  pushSample(0, 0);
  pushSample(width - sampleSize, 0);
  pushSample(0, height - sampleSize);
  pushSample(width - sampleSize, height - sampleSize);

  if (samples.length === 0) return 255;

  // 影が混ざる可能性を考えて中央値より明るい側(75 パーセンタイル)を採用
  samples.sort((a, b) => a - b);
  const idx = Math.floor(samples.length * 0.75);
  return samples[idx];
}
