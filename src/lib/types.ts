export type LayoutType = 'desk-vertical' | 'desk-horizontal' | 'wall';

export type DigitImageMap = Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, string>>;

export type MonthPhotoMap = Partial<Record<number, string>>;

export type CalendarConfig = {
  year: number;
  layout: LayoutType;
  monthPhotos: MonthPhotoMap;
  digitImages: DigitImageMap;
  useHandwrittenDigits: boolean;
};
