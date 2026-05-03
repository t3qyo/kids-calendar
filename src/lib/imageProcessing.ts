'use client';

export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === 'image/heic' || type === 'image/heif') return true;
  // iOS の Files アプリや一部ブラウザでは MIME が空 / octet-stream になる
  if (type === '' || type === 'application/octet-stream') {
    return /\.(heic|heif)$/i.test(file.name);
  }
  return false;
}

export async function normalizeImageFile(file: File): Promise<File> {
  if (!isHeicFile(file)) return file;

  const { default: heic2any } = await import('heic2any');
  const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const baseName = file.name.replace(/\.(heic|heif)$/i, '') || 'image';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
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
  /** インク/背景境界のアンチエイリアスバンド幅(輝度値, 0-255)。狭いほど境界が硬く濃くなる。 */
  edgeBand?: number;
  /** トリム後に画像周囲に追加する余白の比率(0-1)。フォントの数字と高さを揃えやすくするため少し大きめ。 */
  paddingRatio?: number;
  /** ストロークを太らせる比率(数字の高さに対する割合)。かすれた手書きを補強する。 */
  dilationRatio?: number;
  /** トリムするか */
  trim?: boolean;
};

export async function removeWhiteBackground(
  src: string,
  options: RemoveWhiteBackgroundOptions = {},
): Promise<string> {
  const { edgeBand = 12, paddingRatio = 0.12, dilationRatio = 0.015, trim = true } = options;
  const img = await loadImage(src);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;
  const pixelCount = width * height;

  // 1. 輝度マップを作成しつつヒストグラムを集計
  const luma = new Uint8ClampedArray(pixelCount);
  const histogram = new Array<number>(256).fill(0);
  let lumaMin = 255;
  let lumaMax = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const l = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    luma[p] = l;
    histogram[l]++;
    if (l < lumaMin) lumaMin = l;
    if (l > lumaMax) lumaMax = l;
  }

  // 2. コントラストストレッチ用の上下端輝度(両端0.5%カットして外れ値を無視)
  const lowCut = pixelCount * 0.005;
  const highCut = pixelCount * 0.995;
  let stretchLow = lumaMin;
  let stretchHigh = lumaMax;
  let cumulative = 0;
  for (let v = 0; v < 256; v++) {
    cumulative += histogram[v];
    if (cumulative >= lowCut) {
      stretchLow = v;
      break;
    }
  }
  cumulative = 0;
  for (let v = 255; v >= 0; v--) {
    cumulative += histogram[v];
    if (cumulative >= pixelCount - highCut) {
      stretchHigh = v;
      break;
    }
  }
  const stretchRange = Math.max(1, stretchHigh - stretchLow);

  // 3. ストレッチ後の輝度ヒストグラムから Otsu 法でしきい値を決定
  const stretchedHist = new Array<number>(256).fill(0);
  const stretched = new Uint8ClampedArray(pixelCount);
  for (let p = 0; p < pixelCount; p++) {
    const v = Math.round(((luma[p] - stretchLow) / stretchRange) * 255);
    const clamped = v < 0 ? 0 : v > 255 ? 255 : v;
    stretched[p] = clamped;
    stretchedHist[clamped]++;
  }
  const otsu = otsuThreshold(stretchedHist, pixelCount);

  // 4. 各ピクセルのインク濃度(=alpha)を計算する
  const upperBand = otsu + edgeBand;
  const lowerBand = Math.max(0, otsu - edgeBand);
  const bandRange = Math.max(1, upperBand - lowerBand);

  const alphaBuffer = new Uint8ClampedArray(pixelCount);
  let preMinX = width;
  let preMinY = height;
  let preMaxX = 0;
  let preMaxY = 0;
  let hasOpaque = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const v = stretched[p];

      let alpha: number;
      if (v >= upperBand) {
        alpha = 0;
      } else if (v <= lowerBand) {
        alpha = 255;
      } else {
        const t = (upperBand - v) / bandRange;
        alpha = Math.round(255 * t);
      }
      alphaBuffer[p] = alpha;

      if (alpha >= 200) {
        hasOpaque = true;
        if (x < preMinX) preMinX = x;
        if (y < preMinY) preMinY = y;
        if (x > preMaxX) preMaxX = x;
        if (y > preMaxY) preMaxY = y;
      }
    }
  }

  if (!hasOpaque) {
    // 透過対象が見つからない場合はそのまま返す
    for (let p = 0; p < pixelCount; p++) data[p * 4 + 3] = alphaBuffer[p];
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  // 5. かすれを埋めるため数字の高さに応じてストロークを膨張させる(separable max filter)
  const inkHeight = preMaxY - preMinY + 1;
  const dilateRadius = Math.min(
    30,
    Math.max(1, Math.round(inkHeight * dilationRatio)),
  );
  const dilatedAlpha = dilateAlpha(alphaBuffer, width, height, dilateRadius);

  // 6. 結果をピクセルに書き戻し、トリム用の最終 bbox を求める
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const i = p * 4;
      const alpha = dilatedAlpha[p];
      if (alpha === 0) {
        data[i + 3] = 0;
      } else {
        data[i] = 20;
        data[i + 1] = 20;
        data[i + 2] = 20;
        data[i + 3] = alpha;
        if (alpha >= 200) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  if (!trim) {
    return canvas.toDataURL('image/png');
  }

  // フォントの数字に近い余白を確保するため、トリム後に均等にパディングを足す
  const inkW = maxX - minX + 1;
  const inkH = maxY - minY + 1;
  const padX = Math.round(inkW * paddingRatio);
  const padY = Math.round(inkH * paddingRatio);
  const cropX = Math.max(0, minX - padX);
  const cropY = Math.max(0, minY - padY);
  const cropW = Math.min(width - cropX, inkW + padX * 2);
  const cropH = Math.min(height - cropY, inkH + padY * 2);

  const cropped = document.createElement('canvas');
  cropped.width = cropW;
  cropped.height = cropH;
  const cctx = cropped.getContext('2d');
  if (!cctx) throw new Error('Canvas context not available');
  cctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return cropped.toDataURL('image/png');
}

/**
 * 各ピクセルのアルファ値を半径 radius のチェビシェフ距離で max フィルタにかける(=膨張)。
 * 二回の 1 次元 max フィルタとして実装し O(W*H*radius) で済ませる。
 */
function dilateAlpha(
  source: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
): Uint8ClampedArray {
  if (radius <= 0) return source;
  const horizontal = new Uint8ClampedArray(source.length);
  for (let y = 0; y < height; y++) {
    const rowStart = y * width;
    for (let x = 0; x < width; x++) {
      const x0 = x - radius < 0 ? 0 : x - radius;
      const x1 = x + radius >= width ? width - 1 : x + radius;
      let m = 0;
      for (let xi = x0; xi <= x1; xi++) {
        const a = source[rowStart + xi];
        if (a > m) m = a;
      }
      horizontal[rowStart + x] = m;
    }
  }
  const out = new Uint8ClampedArray(source.length);
  for (let y = 0; y < height; y++) {
    const y0 = y - radius < 0 ? 0 : y - radius;
    const y1 = y + radius >= height ? height - 1 : y + radius;
    for (let x = 0; x < width; x++) {
      let m = 0;
      for (let yi = y0; yi <= y1; yi++) {
        const a = horizontal[yi * width + x];
        if (a > m) m = a;
      }
      out[y * width + x] = m;
    }
  }
  return out;
}

/**
 * Otsu の二値化しきい値: クラス間分散最大となる輝度を返す。
 * 撮影環境(暗さ・紙の色味)に依らず最適な背景/インク境界を自動決定するため。
 */
function otsuThreshold(histogram: number[], total: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumB = 0;
  let wB = 0;
  let varMax = 0;
  let threshold = 127;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > varMax) {
      varMax = between;
      threshold = t;
    }
  }

  return threshold;
}
