import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

// CalendarPage は内部で cropPhotoToDataURL を呼ぶので、副作用なしの即時解決でモックする
vi.mock('@/lib/imageProcessing', () => ({
  cropPhotoToDataURL: vi.fn(async () => 'data:image/jpeg;base64,mocked'),
}));

import { CalendarPage, LAYOUT_SPECS } from './CalendarPage';
import { useCalendarStore } from '@/lib/store';

const initialSnapshot = useCalendarStore.getState();

beforeEach(() => {
  useCalendarStore.setState({ ...initialSnapshot, digitImages: {} }, true);
});

afterEach(() => {
  cleanup();
  useCalendarStore.setState({ ...initialSnapshot, digitImages: {} }, true);
});

describe('LAYOUT_SPECS', () => {
  it('卓上横と壁掛けの 2 種類のみ (desk-vertical は廃止済み)', () => {
    const keys = Object.keys(LAYOUT_SPECS).sort();
    expect(keys).toEqual(['desk-horizontal', 'wall']);
  });

  it('LAYOUT_SPECS には "desk-vertical" キーが存在しない', () => {
    expect(
      (LAYOUT_SPECS as Record<string, unknown>)['desk-vertical'],
    ).toBeUndefined();
  });

  it('卓上横の物理サイズは 144x86 mm', () => {
    expect(LAYOUT_SPECS['desk-horizontal'].widthMm).toBe(144);
    expect(LAYOUT_SPECS['desk-horizontal'].heightMm).toBe(86);
  });

  it('壁掛けの物理サイズは 127x254 mm', () => {
    expect(LAYOUT_SPECS.wall.widthMm).toBe(127);
    expect(LAYOUT_SPECS.wall.heightMm).toBe(254);
  });
});

describe('CalendarPage 写真未設定プレースホルダ', () => {
  it('photo が undefined のとき (壁掛け) は "写真未設定" が表示される', () => {
    render(<CalendarPage year={2026} month={1} layout="wall" photo={undefined} />);
    expect(screen.getByText('写真未設定')).toBeInTheDocument();
  });

  it('photo が undefined のとき (卓上横) も "写真未設定" が表示される', () => {
    render(
      <CalendarPage year={2026} month={1} layout="desk-horizontal" photo={undefined} />,
    );
    expect(screen.getByText('写真未設定')).toBeInTheDocument();
  });
});

describe('CalendarPage 写真エリアの縦横比', () => {
  // PHOTO_ASPECT=1 (1:1) を使うラッパが両レイアウトに存在することを確認する。
  // padding-top: 100% が AspectBox の指標 (CSS の aspect-ratio はビルドで失敗するため使っていない)。
  it('壁掛け: paddingTop: 100% の AspectBox が描画される', () => {
    const { container } = render(
      <CalendarPage year={2026} month={1} layout="wall" photo={undefined} />,
    );
    const aspectBox = container.querySelector('div[style*="padding-top: 100%"]');
    expect(aspectBox).not.toBeNull();
  });

  it('卓上横: paddingTop: 100% の AspectBox が描画される', () => {
    const { container } = render(
      <CalendarPage year={2026} month={1} layout="desk-horizontal" photo={undefined} />,
    );
    const aspectBox = container.querySelector('div[style*="padding-top: 100%"]');
    expect(aspectBox).not.toBeNull();
  });
});

describe('CalendarPage 月・年の描画', () => {
  it('壁掛けレイアウトに年が表示される', () => {
    render(<CalendarPage year={2026} month={3} layout="wall" photo={undefined} />);
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('卓上横レイアウトに年が表示される', () => {
    render(
      <CalendarPage year={2026} month={3} layout="desk-horizontal" photo={undefined} />,
    );
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('曜日ヘッダ SUN..SAT がレンダリングされる', () => {
    render(<CalendarPage year={2026} month={1} layout="wall" photo={undefined} />);
    for (const w of ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']) {
      expect(screen.getByText(w)).toBeInTheDocument();
    }
  });
});
