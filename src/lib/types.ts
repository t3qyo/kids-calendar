export type LayoutType = 'desk-horizontal' | 'wall';

/**
 * 全レイアウト共通の写真エリア縦横比(横/縦)。
 * 1:1 の正方形にすることで、卓上横と壁掛けで同じクロップを使い回せる。
 */
export const PHOTO_ASPECT = 1;

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
