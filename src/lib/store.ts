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
  processingCount: number;
};

type Actions = {
  setStartYear: (year: number) => void;
  setStartMonth: (month: number) => void;
  setLayout: (layout: LayoutType) => void;
  setPaperSize: (paperSize: PaperSize) => void;
  setMonthPhoto: (month: number, dataUrl: string | undefined) => void;
  setPhotoTransform: (month: number, transform: PhotoTransform | undefined) => void;
  setDigitImage: (digit: number, dataUrl: string | undefined) => void;
  beginProcessing: () => void;
  endProcessing: () => void;
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
  processingCount: 0,
};

/**
 * IndexedDB を zustand persist 用の StateStorage として使う薄いラッパー。
 * 写真 12 枚 × 数 MB が localStorage の容量制限(5-10MB)を超えるため、
 * 値はすべて IndexedDB に保存する。
 */
const indexedDbStorage: StateStorage = {
  getItem: async (name) => {
    const value = await idbGet(name);
    return typeof value === 'string' ? value : null;
  },
  setItem: async (name, value) => {
    await idbSet(name, value);
  },
  removeItem: async (name) => {
    await idbDel(name);
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
      beginProcessing: () => set((state) => ({ processingCount: state.processingCount + 1 })),
      endProcessing: () =>
        set((state) => ({ processingCount: Math.max(0, state.processingCount - 1) })),
      reset: () => set(initialState),
    }),
    {
      name: 'kids-calendar-store',
      version: 1,
      storage: createJSONStorage(() => indexedDbStorage),
      // processingCount は一時的なフラグなので永続化しない
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
