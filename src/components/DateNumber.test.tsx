import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useCalendarStore } from '@/lib/store';
import { DateNumber } from './DateNumber';

const initialSnapshot = useCalendarStore.getState();

beforeEach(() => {
  useCalendarStore.setState({ ...initialSnapshot, digitImages: {} }, true);
});

afterEach(() => {
  cleanup();
  useCalendarStore.setState({ ...initialSnapshot, digitImages: {} }, true);
});

describe('DateNumber', () => {
  it('digit 画像が一つも無いときはフォントフォールバック (テキスト表示)', () => {
    render(<DateNumber value={15} fontSize={32} />);
    // テキストノードとして '15' が表示される
    expect(screen.getByText('15')).toBeInTheDocument();
    // <img> は存在しない
    expect(document.querySelectorAll('img')).toHaveLength(0);
  });

  it('日付の全桁分の手書き画像が揃っていれば <img> を桁数分レンダー', () => {
    useCalendarStore.setState((s) => ({
      digitImages: { ...s.digitImages, 1: 'data:1', 5: 'data:5' },
    }));
    render(<DateNumber value={15} fontSize={32} />);
    const imgs = document.querySelectorAll('img');
    expect(imgs).toHaveLength(2);
    expect((imgs[0] as HTMLImageElement).src).toContain('data:1');
    expect((imgs[1] as HTMLImageElement).src).toContain('data:5');
  });

  it('片方の桁だけ手書き画像が無い場合はフォントフォールバック', () => {
    useCalendarStore.setState((s) => ({
      digitImages: { ...s.digitImages, 1: 'data:1' },
    }));
    render(<DateNumber value={15} fontSize={32} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(document.querySelectorAll('img')).toHaveLength(0);
  });

  it('一桁の数字でも 0 の手書き画像があればその画像を使う', () => {
    useCalendarStore.setState((s) => ({
      digitImages: { ...s.digitImages, 0: 'data:0' },
    }));
    render(<DateNumber value={0} fontSize={32} />);
    const imgs = document.querySelectorAll('img');
    expect(imgs).toHaveLength(1);
    expect((imgs[0] as HTMLImageElement).src).toContain('data:0');
  });

  it('fontSize に応じた高さ指定が <img> に反映される', () => {
    useCalendarStore.setState((s) => ({
      digitImages: { ...s.digitImages, 7: 'data:7' },
    }));
    render(<DateNumber value={7} fontSize={48} />);
    const img = document.querySelector('img') as HTMLImageElement;
    expect(img.style.height).toBe('48px');
  });
});
