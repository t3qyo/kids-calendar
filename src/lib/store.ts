'use client';

import { create } from 'zustand';
import type {
  DigitImageMap,
  LayoutType,
  MonthPhotoMap,
  PhotoTransform,
  PhotoTransformMap,
} from './types';

type State = {
  startYear: number;
  startMonth: number;
  layout: LayoutType;
  monthPhotos: MonthPhotoMap;
  photoTransforms: PhotoTransformMap;
  digitImages: DigitImageMap;
};

type Actions = {
  setStartYear: (year: number) => void;
  setStartMonth: (month: number) => void;
  setLayout: (layout: LayoutType) => void;
  setMonthPhoto: (month: number, dataUrl: string | undefined) => void;
  setPhotoTransform: (month: number, transform: PhotoTransform | undefined) => void;
  setDigitImage: (digit: number, dataUrl: string | undefined) => void;
  reset: () => void;
};

const initialState: State = {
  startYear: 2026,
  startMonth: 1,
  layout: 'desk-vertical',
  monthPhotos: {},
  photoTransforms: {},
  digitImages: {},
};

export const useCalendarStore = create<State & Actions>((set) => ({
  ...initialState,
  setStartYear: (startYear) => set({ startYear }),
  setStartMonth: (startMonth) => set({ startMonth }),
  setLayout: (layout) => set({ layout }),
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
}));
