import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useCalendarStore } from './store';

const initialSnapshot = useCalendarStore.getState();

beforeEach(() => {
  useCalendarStore.setState({ ...initialSnapshot }, true);
});

afterEach(() => {
  useCalendarStore.setState({ ...initialSnapshot }, true);
});

describe('useCalendarStore - 初期状態', () => {
  it('startYear=2026, startMonth=1, layout=wall', () => {
    const s = useCalendarStore.getState();
    expect(s.startYear).toBe(2026);
    expect(s.startMonth).toBe(1);
    expect(s.layout).toBe('wall');
    expect(s.monthPhotos).toEqual({});
    expect(s.photoTransforms).toEqual({});
    expect(s.digitImages).toEqual({});
  });
});

describe('setMonthPhoto', () => {
  it('dataUrl を渡すと monthPhotos[m] に保存される', () => {
    useCalendarStore.getState().setMonthPhoto(3, 'data:image/jpeg;base64,abc');
    expect(useCalendarStore.getState().monthPhotos[3]).toBe('data:image/jpeg;base64,abc');
  });

  it('上書きできる', () => {
    useCalendarStore.getState().setMonthPhoto(3, 'data:1');
    useCalendarStore.getState().setMonthPhoto(3, 'data:2');
    expect(useCalendarStore.getState().monthPhotos[3]).toBe('data:2');
  });

  it('undefined を渡すと該当月の写真が削除される', () => {
    useCalendarStore.getState().setMonthPhoto(3, 'data:1');
    useCalendarStore.getState().setMonthPhoto(3, undefined);
    expect(useCalendarStore.getState().monthPhotos[3]).toBeUndefined();
  });

  it('undefined を渡すと photoTransforms[m] も一緒に削除される', () => {
    // 既知の挙動: 写真を消したら transform も意味を失うので一緒に消える
    useCalendarStore.getState().setMonthPhoto(3, 'data:1');
    useCalendarStore.getState().setPhotoTransform(3, { focusX: 10, focusY: 20, zoom: 2 });
    expect(useCalendarStore.getState().photoTransforms[3]).toBeDefined();

    useCalendarStore.getState().setMonthPhoto(3, undefined);
    expect(useCalendarStore.getState().photoTransforms[3]).toBeUndefined();
  });

  it('別の月の transform は影響を受けない', () => {
    useCalendarStore.getState().setMonthPhoto(3, 'data:1');
    useCalendarStore.getState().setPhotoTransform(3, { focusX: 10, focusY: 20, zoom: 2 });
    useCalendarStore.getState().setMonthPhoto(5, 'data:5');
    useCalendarStore.getState().setPhotoTransform(5, { focusX: 30, focusY: 40, zoom: 1.5 });

    useCalendarStore.getState().setMonthPhoto(3, undefined);
    expect(useCalendarStore.getState().photoTransforms[5]).toEqual({
      focusX: 30,
      focusY: 40,
      zoom: 1.5,
    });
  });
});

describe('setPhotoTransform', () => {
  it('PhotoTransform を渡すと photoTransforms[m] に保存される', () => {
    useCalendarStore.getState().setPhotoTransform(1, { focusX: 0, focusY: 50, zoom: 1.5 });
    expect(useCalendarStore.getState().photoTransforms[1]).toEqual({
      focusX: 0,
      focusY: 50,
      zoom: 1.5,
    });
  });

  it('undefined を渡すと該当月の transform が削除される', () => {
    useCalendarStore.getState().setPhotoTransform(1, { focusX: 0, focusY: 50, zoom: 1.5 });
    useCalendarStore.getState().setPhotoTransform(1, undefined);
    expect(useCalendarStore.getState().photoTransforms[1]).toBeUndefined();
  });
});

describe('setDigitImage', () => {
  it('dataUrl を渡すと digitImages[d] に保存される', () => {
    useCalendarStore.getState().setDigitImage(7, 'data:image/png;base64,xxx');
    expect(useCalendarStore.getState().digitImages[7]).toBe('data:image/png;base64,xxx');
  });

  it('undefined を渡すと該当桁の画像が削除される', () => {
    useCalendarStore.getState().setDigitImage(7, 'data:1');
    useCalendarStore.getState().setDigitImage(7, undefined);
    expect(useCalendarStore.getState().digitImages[7]).toBeUndefined();
  });

  it('複数桁を独立に保持できる', () => {
    useCalendarStore.getState().setDigitImage(0, 'data:0');
    useCalendarStore.getState().setDigitImage(9, 'data:9');
    const { digitImages } = useCalendarStore.getState();
    expect(digitImages[0]).toBe('data:0');
    expect(digitImages[9]).toBe('data:9');
  });
});

describe('setStartYear / setStartMonth / setLayout', () => {
  it('それぞれ更新できる', () => {
    useCalendarStore.getState().setStartYear(2030);
    useCalendarStore.getState().setStartMonth(7);
    useCalendarStore.getState().setLayout('desk-horizontal');
    const s = useCalendarStore.getState();
    expect(s.startYear).toBe(2030);
    expect(s.startMonth).toBe(7);
    expect(s.layout).toBe('desk-horizontal');
  });
});

describe('reset', () => {
  it('変更後に reset すると initial state に戻る', () => {
    useCalendarStore.getState().setMonthPhoto(1, 'data:1');
    useCalendarStore.getState().setDigitImage(0, 'data:0');
    useCalendarStore.getState().setLayout('desk-horizontal');
    useCalendarStore.getState().setStartYear(3000);

    useCalendarStore.getState().reset();
    const s = useCalendarStore.getState();
    expect(s.startYear).toBe(2026);
    expect(s.startMonth).toBe(1);
    expect(s.layout).toBe('wall');
    expect(s.monthPhotos).toEqual({});
    expect(s.photoTransforms).toEqual({});
    expect(s.digitImages).toEqual({});
  });
});
