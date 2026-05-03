export type LayoutType = 'desk-vertical' | 'desk-horizontal' | 'wall';

export type DigitImageMap = Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, string>>;

export type MonthPhotoMap = Partial<Record<number, string>>;

export type PhotoTransform = {
  focusX: number;
  focusY: number;
  zoom: number;
};

export type PhotoTransformMap = Partial<Record<number, PhotoTransform>>;

export const DEFAULT_PHOTO_TRANSFORM: PhotoTransform = { focusX: 50, focusY: 50, zoom: 1 };

export type CalendarConfig = {
  year: number;
  layout: LayoutType;
  monthPhotos: MonthPhotoMap;
  digitImages: DigitImageMap;
};
