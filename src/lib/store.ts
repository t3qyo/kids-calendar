'use client';

import { create } from 'zustand';
import type { DigitImageMap, LayoutType, MonthPhotoMap } from './types';

type State = {
  year: number;
  layout: LayoutType;
  monthPhotos: MonthPhotoMap;
  digitImages: DigitImageMap;
  useHandwrittenDigits: boolean;
};

type Actions = {
  setYear: (year: number) => void;
  setLayout: (layout: LayoutType) => void;
  setMonthPhoto: (month: number, dataUrl: string | undefined) => void;
  setDigitImage: (digit: number, dataUrl: string | undefined) => void;
  setUseHandwrittenDigits: (value: boolean) => void;
  reset: () => void;
};

const initialState: State = {
  year: 2026,
  layout: 'desk-vertical',
  monthPhotos: {},
  digitImages: {},
  useHandwrittenDigits: false,
};

export const useCalendarStore = create<State & Actions>((set) => ({
  ...initialState,
  setYear: (year) => set({ year }),
  setLayout: (layout) => set({ layout }),
  setMonthPhoto: (month, dataUrl) =>
    set((state) => {
      const next = { ...state.monthPhotos };
      if (dataUrl) {
        next[month] = dataUrl;
      } else {
        delete next[month];
      }
      return { monthPhotos: next };
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
  setUseHandwrittenDigits: (value) => set({ useHandwrittenDigits: value }),
  reset: () => set(initialState),
}));
