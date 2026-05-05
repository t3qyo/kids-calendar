import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useCalendarStore } from '@/lib/store';
import { PhotoTransformEditor } from './PhotoTransformEditor';

const initialSnapshot = useCalendarStore.getState();

beforeEach(() => {
  useCalendarStore.setState(
    { ...initialSnapshot, monthPhotos: { 1: 'test://800x600' } },
    true,
  );
});

afterEach(() => {
  cleanup();
  useCalendarStore.setState({ ...initialSnapshot }, true);
});

describe('PhotoTransformEditor', () => {
  it('open=false なら何も描画しない', () => {
    const { container } = render(
      <PhotoTransformEditor month={1} open={false} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('open=true で写真が無い月は何も描画しない', () => {
    useCalendarStore.setState({ ...initialSnapshot, monthPhotos: {} }, true);
    const { container } = render(
      <PhotoTransformEditor month={1} open={true} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('open=true で写真があればダイアログが表示される', () => {
    render(<PhotoTransformEditor month={1} open={true} onClose={() => {}} />);
    expect(screen.getByText(/写真の表示範囲を調整/)).toBeInTheDocument();
  });

  it('保存ボタンを押すと setPhotoTransform が呼ばれて onClose が走る', () => {
    const onClose = vi.fn();
    render(<PhotoTransformEditor month={1} open={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(useCalendarStore.getState().photoTransforms[1]).toBeDefined();
  });

  // === リグレッション (PR #5 由来) ===
  it('リグレッション: pointermove → pointerup → pointermove の順で null 参照しない', () => {
    // 以前は pointerup で dragRef.current=null になった後、
    // 連発で来る pointermove でも setDraft の updater 内で startFocus を読みに行き
    // null 参照例外が出ていた。修正後は drag のローカル変数を確認するため発生しない。
    render(<PhotoTransformEditor month={1} open={true} onClose={() => {}} />);
    // touch-none が当たっているドラッグ可能な div を取得 (frameRef)
    const frame = document.querySelector('div.touch-none') as HTMLDivElement;
    expect(frame).not.toBeNull();

    // pointer capture API は jsdom で未実装なため握りつぶす
    frame.setPointerCapture = vi.fn();
    frame.releasePointerCapture = vi.fn();

    expect(() => {
      fireEvent.pointerDown(frame, { pointerId: 1, clientX: 100, clientY: 100 });
      fireEvent.pointerMove(frame, { pointerId: 1, clientX: 110, clientY: 110 });
      fireEvent.pointerUp(frame, { pointerId: 1, clientX: 110, clientY: 110 });
      // pointerup 後の連発 pointermove (バブリングで遅延して届くケース)
      fireEvent.pointerMove(frame, { pointerId: 1, clientX: 120, clientY: 120 });
      fireEvent.pointerMove(frame, { pointerId: 1, clientX: 130, clientY: 130 });
    }).not.toThrow();
  });

  it('リセットボタンで draft が DEFAULT に戻る (zoom 表示で確認)', () => {
    useCalendarStore.setState(
      {
        ...initialSnapshot,
        monthPhotos: { 1: 'test://800x600' },
        photoTransforms: { 1: { focusX: 10, focusY: 20, zoom: 2.5 } },
      },
      true,
    );
    render(<PhotoTransformEditor month={1} open={true} onClose={() => {}} />);

    // 初期表示は stored の zoom=2.50
    expect(screen.getByText('2.50×')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'リセット' }));
    expect(screen.getByText('1.00×')).toBeInTheDocument();
  });
});
