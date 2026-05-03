import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cropPhotoToDataURL, normalizeImageFile, removeWhiteBackground } from './imageProcessing';

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * cropPhotoToDataURL の drawImage 引数を取り出すヘルパ。
 * (image, sx, sy, sw, sh, dx, dy, dw, dh) のシグネチャを期待する。
 */
type DrawImageCall = [
  HTMLImageElement,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

function spyDrawImage() {
  const spy = vi.spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
  return spy as unknown as { mock: { calls: DrawImageCall[] } } & typeof spy;
}

describe('cropPhotoToDataURL', () => {
  describe('cover crop の基本挙動', () => {
    it('source が target より横長なら高さ全部を使い横をクロップする', async () => {
      // 4000x1000 (aspect=4) を 1:1 でクロップ → 1000x1000 を中央から切り出す
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://4000x1000',
        { focusX: 50, focusY: 50, zoom: 1 },
        1,
      );
      expect(spy).toHaveBeenCalledTimes(1);
      const [, sx, sy, sw, sh] = spy.mock.calls[0];
      expect(sw).toBeCloseTo(1000); // baseCropW = 1000 * 1 = 1000
      expect(sh).toBe(1000); // 高さ全部
      expect(sy).toBe(0);
      expect(sx).toBeCloseTo((4000 - 1000) * 0.5); // 中央寄せ
    });

    it('source が target より縦長なら横全部を使い縦をクロップする', async () => {
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://1000x4000',
        { focusX: 50, focusY: 50, zoom: 1 },
        1,
      );
      const [, sx, sy, sw, sh] = spy.mock.calls[0];
      expect(sw).toBe(1000); // 横全部
      expect(sh).toBeCloseTo(1000); // baseCropH = 1000 / 1
      expect(sx).toBe(0);
      expect(sy).toBeCloseTo((4000 - 1000) * 0.5);
    });

    it('source と target のアスペクトが一致するときはクロップなし', async () => {
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://1000x1000',
        { focusX: 50, focusY: 50, zoom: 1 },
        1,
      );
      const [, sx, sy, sw, sh] = spy.mock.calls[0];
      expect(sx).toBe(0);
      expect(sy).toBe(0);
      expect(sw).toBe(1000);
      expect(sh).toBe(1000);
    });
  });

  describe('focus point', () => {
    it('focusX=0, focusY=0 なら左上寄せ (sx=sy=0)', async () => {
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://4000x1000',
        { focusX: 0, focusY: 0, zoom: 1 },
        1,
      );
      const [, sx, sy] = spy.mock.calls[0];
      expect(sx).toBe(0);
      expect(sy).toBe(0);
    });

    it('focusX=100, focusY=100 なら右下寄せ', async () => {
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://4000x1000',
        { focusX: 100, focusY: 100, zoom: 1 },
        1,
      );
      const [, sx, sy, sw] = spy.mock.calls[0];
      expect(sx).toBeCloseTo(4000 - sw);
      expect(sy).toBe(0); // sh=1000=natH なので余白なし
    });

    it('focusX=50, focusY=50 なら中央寄せ', async () => {
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://4000x1000',
        { focusX: 50, focusY: 50, zoom: 1 },
        1,
      );
      const [, sx] = spy.mock.calls[0];
      expect(sx).toBeCloseTo((4000 - 1000) * 0.5);
    });
  });

  describe('zoom', () => {
    it('zoom=1 のときは base crop と一致する', async () => {
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://2000x1000',
        { focusX: 50, focusY: 50, zoom: 1 },
        1,
      );
      const [, , , sw, sh] = spy.mock.calls[0];
      expect(sw).toBe(1000);
      expect(sh).toBe(1000);
    });

    it('zoom=2 のときはクロップ領域が 1/2 に縮む(より拡大表示)', async () => {
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://2000x1000',
        { focusX: 50, focusY: 50, zoom: 2 },
        1,
      );
      const [, , , sw, sh] = spy.mock.calls[0];
      expect(sw).toBe(500);
      expect(sh).toBe(500);
    });

    it('zoom < 1 が来ても下限 1 にクランプされる', async () => {
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://2000x1000',
        { focusX: 50, focusY: 50, zoom: 0.5 },
        1,
      );
      const [, , , sw, sh] = spy.mock.calls[0];
      expect(sw).toBe(1000);
      expect(sh).toBe(1000);
    });
  });

  describe('出力サイズ上限', () => {
    it('4032x3024 の正方形クロップは 2048x2048 に縮小される', async () => {
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://4032x3024',
        { focusX: 50, focusY: 50, zoom: 1 },
        1, // 1:1 → 3024x3024 を切り出し → maxDim=2048 に縮小
      );
      const [, , , , , dx, dy, dw, dh] = spy.mock.calls[0];
      expect(dx).toBe(0);
      expect(dy).toBe(0);
      expect(dw).toBe(2048);
      expect(dh).toBe(2048);
    });

    it('小さい元画像は等倍のままで出力される', async () => {
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://400x400',
        { focusX: 50, focusY: 50, zoom: 1 },
        1,
      );
      const [, , , , , , , dw, dh] = spy.mock.calls[0];
      expect(dw).toBe(400);
      expect(dh).toBe(400);
    });
  });

  describe('出力フォーマット', () => {
    it('戻り値は data:image/jpeg;base64,... 形式', async () => {
      const result = await cropPhotoToDataURL(
        'test://400x400',
        { focusX: 50, focusY: 50, zoom: 1 },
        1,
      );
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
    });
  });

  describe('異常系', () => {
    it('画像のロードに失敗した場合はエラーが伝播する', async () => {
      await expect(
        cropPhotoToDataURL(
          'error://broken',
          { focusX: 50, focusY: 50, zoom: 1 },
          1,
        ),
      ).rejects.toThrow();
    });
  });

  // === リグレッション (PR #5 / PR #6 由来) ===
  describe('リグレッション: 縦方向のクロップずれ防止', () => {
    it('focusY=50 / zoom=1 で sy が (naturalHeight - cropH) * 0.5 になる', async () => {
      // PDF 出力時に下方向にずれていた問題のリグレッション。
      // 1000x4000 を 1:1 でクロップすると cropH=1000、最大オフセット=3000、
      // focusY=50 のとき sy=1500 でなければならない。
      const spy = spyDrawImage();
      await cropPhotoToDataURL(
        'test://1000x4000',
        { focusX: 50, focusY: 50, zoom: 1 },
        1,
      );
      const [, , sy, , sh] = spy.mock.calls[0];
      expect(sh).toBe(1000);
      expect(sy).toBeCloseTo((4000 - 1000) * 0.5);
      expect(sy).toBe(1500);
    });
  });
});

// =============================================================================
// removeWhiteBackground
// =============================================================================

/**
 * テスト用に getImageData が返す ImageData を差し替えるヘルパ。
 * vitest-canvas-mock のデフォルトは全 0 (= 透明) のため、
 * 期待した輝度を持つ画像を擬似的に与える。
 */
function mockGetImageData(
  width: number,
  height: number,
  fill: (x: number, y: number) => [number, number, number, number],
) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = fill(x, y);
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }
  const imageData = new ImageData(data, width, height);
  vi.spyOn(CanvasRenderingContext2D.prototype, 'getImageData').mockReturnValue(imageData);
  return imageData;
}

describe('removeWhiteBackground', () => {
  it('真っ白な背景は alpha=0 に、真っ黒なインクは alpha=255 になる', async () => {
    const w = 10;
    const h = 10;
    mockGetImageData(w, h, (x, y) => {
      const inside = x >= 3 && x <= 6 && y >= 3 && y <= 6;
      return inside ? [0, 0, 0, 255] : [255, 255, 255, 255];
    });

    const putSpy = vi
      .spyOn(CanvasRenderingContext2D.prototype, 'putImageData')
      .mockImplementation(() => {});

    await removeWhiteBackground(`test://${w}x${h}`, { trim: false });

    expect(putSpy).toHaveBeenCalled();
    const written = putSpy.mock.calls[0][0] as ImageData;
    // 中央のピクセルは alpha=255 で残っているべき
    const centerIdx = (5 * w + 5) * 4;
    expect(written.data[centerIdx + 3]).toBe(255);
    // 真っ白の角は alpha=0
    const cornerIdx = 0;
    expect(written.data[cornerIdx + 3]).toBe(0);
  });

  it('リグレッション: 低コントラストの灰色背景でもストロークは alpha=255 で残る', async () => {
    // PR #1 由来。撮影が暗い写真で背景が灰色になっていてもインクが薄れないこと。
    const w = 12;
    const h = 12;
    mockGetImageData(w, h, (x, y) => {
      const inside = x >= 4 && x <= 7 && y >= 4 && y <= 7;
      const v = inside ? 60 : 200;
      return [v, v, v, 255];
    });

    const putSpy = vi
      .spyOn(CanvasRenderingContext2D.prototype, 'putImageData')
      .mockImplementation(() => {});

    await removeWhiteBackground(`test://${w}x${h}`, { trim: false });

    const written = putSpy.mock.calls[0][0] as ImageData;
    const centerIdx = (6 * w + 6) * 4;
    expect(written.data[centerIdx + 3]).toBe(255);
    const cornerIdx = 0;
    expect(written.data[cornerIdx + 3]).toBe(0);
  });

  it('trim=true のとき返り値は data:image/png;base64,... 形式', async () => {
    const w = 8;
    const h = 8;
    mockGetImageData(w, h, (x, y) => {
      const inside = x >= 2 && x <= 5 && y >= 2 && y <= 5;
      return inside ? [0, 0, 0, 255] : [255, 255, 255, 255];
    });
    vi.spyOn(CanvasRenderingContext2D.prototype, 'putImageData').mockImplementation(() => {});

    const result = await removeWhiteBackground(`test://${w}x${h}`, { trim: true });
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it('trim=false のときも data:image/png;base64,... 形式', async () => {
    const w = 6;
    const h = 6;
    mockGetImageData(w, h, () => [255, 255, 255, 255]);
    vi.spyOn(CanvasRenderingContext2D.prototype, 'putImageData').mockImplementation(() => {});

    const result = await removeWhiteBackground(`test://${w}x${h}`, { trim: false });
    expect(result).toMatch(/^data:image\/png;base64,/);
  });
});

// =============================================================================
// normalizeImageFile
// =============================================================================

vi.mock('heic2any', () => ({
  default: vi.fn(async () => new Blob(['converted'], { type: 'image/jpeg' })),
}));

describe('normalizeImageFile', () => {
  it('HEIC ファイルなら JPEG ファイルに変換される', async () => {
    const heic = new File(['raw'], 'photo.HEIC', { type: 'image/heic' });
    const out = await normalizeImageFile(heic);
    expect(out.type).toBe('image/jpeg');
    expect(out.name).toBe('photo.jpg');
  });

  it('MIME が空でも .heic 拡張子なら変換対象', async () => {
    const heic = new File(['raw'], 'photo.heic', { type: '' });
    const out = await normalizeImageFile(heic);
    expect(out.type).toBe('image/jpeg');
  });

  it('HEIC でないファイルはそのまま返される (参照同一性)', async () => {
    const jpg = new File(['raw'], 'photo.jpg', { type: 'image/jpeg' });
    const out = await normalizeImageFile(jpg);
    expect(out).toBe(jpg);
  });

  it('PNG など他の形式もそのまま返される', async () => {
    const png = new File(['raw'], 'photo.png', { type: 'image/png' });
    const out = await normalizeImageFile(png);
    expect(out).toBe(png);
  });
});
