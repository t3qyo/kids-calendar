'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import type {
  DigitImageMap,
  LayoutType,
  MonthPhotoMap,
  PaperSize,
  PhotoTransform,
  PhotoTransformMap,
} from './types';

type State = {
  startYear: number;
  startMonth: number;
  layout: LayoutType;
  paperSize: PaperSize;
  monthPhotos: MonthPhotoMap;
  photoTransforms: PhotoTransformMap;
  digitImages: DigitImageMap;
};

type Actions = {
  setStartYear: (year: number) => void;
  setStartMonth: (month: number) => void;
  setLayout: (layout: LayoutType) => void;
  setPaperSize: (paperSize: PaperSize) => void;
  setMonthPhoto: (month: number, dataUrl: string | undefined) => void;
  setPhotoTransform: (month: number, transform: PhotoTransform | undefined) => void;
  setDigitImage: (digit: number, dataUrl: string | undefined) => void;
  reset: () => void;
};

const initialState: State = {
  startYear: 2026,
  startMonth: 1,
  layout: 'wall',
  paperSize: 'a4',
  monthPhotos: {},
  photoTransforms: {},
  digitImages: {},
};

/**
 * IndexedDB を zustand persist 用の StateStorage として使う薄いラッパー。
 * 写真 12 枚 × 数 MB が localStorage の容量制限(5-10MB)を超えるため、
 * 値はすべて IndexedDB に保存する。
 *
 * プライベートブラウズ・容量超過・ポリシーで IndexedDB が使えない環境では
 * 例外を投げると rehydrate が失敗してアプリ起動自体が壊れるため、
 * すべての操作を try/catch で包み graceful degradation する
 * (= メモリ上の state だけで動く一時セッションになる)。
 */
const indexedDbStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const value = await idbGet(name);
      return typeof value === 'string' ? value : null;
    } catch (err) {
      console.warn('[kids-calendar] IndexedDB getItem failed', err);
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      await idbSet(name, value);
    } catch (err) {
      console.warn('[kids-calendar] IndexedDB setItem failed', err);
    }
  },
  removeItem: async (name) => {
    try {
      await idbDel(name);
    } catch (err) {
      console.warn('[kids-calendar] IndexedDB removeItem failed', err);
    }
  },
};

export const useCalendarStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initialState,
      setStartYear: (startYear) => set({ startYear }),
      setStartMonth: (startMonth) => set({ startMonth }),
      setLayout: (layout) => set({ layout }),
      setPaperSize: (paperSize) => set({ paperSize }),
      setMonthPhoto: (month, dataUrl) =>
        set((state) => {
          const next = { ...state.monthPhotos };
          const nextTransforms = { ...state.photoTransforms };
          if (dataUrl) {
            next[month] = dataUrl;
          } else {
            delete next[month];
            delete nextTransforms[month];
          }
          return { monthPhotos: next, photoTransforms: nextTransforms };
        }),
      setPhotoTransform: (month, transform) =>
        set((state) => {
          const next = { ...state.photoTransforms };
          if (transform) {
            next[month] = transform;
          } else {
            delete next[month];
          }
          return { photoTransforms: next };
        }),
      setDigitImage: (digit, dataUrl) =>
        set((state) => {
          const next = { ...state.digitImages };
          if (dataUrl) {
            next[digit as 0] = dataUrl;
          } else {
            delete next[digit as 0];
          }
          return { digitImages: next };
        }),
      reset: () => set(initialState),
    }),
    {
      name: 'kids-calendar-store',
      version: 1,
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: (state) => ({
        startYear: state.startYear,
        startMonth: state.startMonth,
        layout: state.layout,
        paperSize: state.paperSize,
        monthPhotos: state.monthPhotos,
        photoTransforms: state.photoTransforms,
        digitImages: state.digitImages,
      }),
    },
  ),
);
