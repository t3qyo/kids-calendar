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

export async function removeWhiteBackground(
  src: string,
  options: { threshold?: number; trim?: boolean } = {},
): Promise<string> {
  const { threshold = 220, trim = true } = options;
  const img = await loadImage(src);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

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

      const brightness = (r + g + b) / 3;
      if (brightness > threshold) {
        data[i + 3] = 0;
      } else {
        const darkness = 1 - brightness / 255;
        const inkAlpha = Math.min(255, Math.round(255 * Math.min(1, darkness * 1.6)));
        data[i] = 20;
        data[i + 1] = 20;
        data[i + 2] = 20;
        data[i + 3] = inkAlpha;

        if (inkAlpha > 30) {
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
