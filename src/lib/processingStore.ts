'use client';

import { create } from 'zustand';

/**
 * 取り込み処理(写真の HEIC 変換、リサイズ、白抜き等)の進行中件数を持つ ephemeral store。
 *
 * メインの useCalendarStore に同居させていたが、persist middleware が更新のたびに
 * 永続化対象の partialize 結果(写真込みで数十MB)をシリアライズしようとして
 * IndexedDB に書き込みが走り、取り込み処理のたびに大きな I/O が発生していた。
 * 永続化が不要な一時カウンタなので、persist しない別 store に切り出す。
 */
type State = {
  count: number;
};

type Actions = {
  begin: () => void;
  end: () => void;
};

export const useProcessingStore = create<State & Actions>((set) => ({
  count: 0,
  begin: () => set((s) => ({ count: s.count + 1 })),
  end: () => set((s) => ({ count: Math.max(0, s.count - 1) })),
}));
