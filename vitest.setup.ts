import 'vitest-canvas-mock';
import '@testing-library/jest-dom/vitest';

// jsdom の HTMLImageElement は実際のリソースをロードしないため、
// プロトタイプの `src` setter を上書きして onload / onerror を即座に発火させる。
// `instanceof HTMLImageElement` は維持されるため、vitest-canvas-mock の drawImage
// 型チェックを通過できる。
//
// テスト用フォーマット:
//   - `test://WIDTHxHEIGHT` → naturalWidth/Height を埋め込み、onload を発火
//   - `error:...`           → onerror を発火
const dimsBySrc = new WeakMap<HTMLImageElement, { w: number; h: number }>();

const naturalWidthDescriptor: PropertyDescriptor = {
  get(this: HTMLImageElement) {
    return dimsBySrc.get(this)?.w ?? 0;
  },
  configurable: true,
};
const naturalHeightDescriptor: PropertyDescriptor = {
  get(this: HTMLImageElement) {
    return dimsBySrc.get(this)?.h ?? 0;
  },
  configurable: true,
};

Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', naturalWidthDescriptor);
Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', naturalHeightDescriptor);

const originalSrcDescriptor =
  Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src') ??
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(HTMLImageElement.prototype), 'src');

Object.defineProperty(HTMLImageElement.prototype, 'src', {
  configurable: true,
  get(this: HTMLImageElement) {
    return originalSrcDescriptor?.get?.call(this) ?? '';
  },
  set(this: HTMLImageElement, value: string) {
    originalSrcDescriptor?.set?.call(this, value);
    if (typeof value === 'string' && value.startsWith('error:')) {
      queueMicrotask(() => {
        this.onerror?.call(this, new Event('error'));
      });
      return;
    }
    if (typeof value === 'string') {
      const m = value.match(/(\d+)x(\d+)/);
      if (m) {
        dimsBySrc.set(this, { w: Number(m[1]), h: Number(m[2]) });
      } else {
        dimsBySrc.set(this, { w: 1000, h: 1000 });
      }
    }
    queueMicrotask(() => {
      this.onload?.call(this, new Event('load'));
    });
  },
});
