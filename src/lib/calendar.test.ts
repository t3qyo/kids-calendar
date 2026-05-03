import { describe, it, expect } from 'vitest';
import { buildMonthGrid, getTwelveMonthsFrom, MONTHS, WEEKDAYS } from './calendar';

describe('buildMonthGrid', () => {
  it('週は日曜始まりの 7 列で構成される', () => {
    const weeks = buildMonthGrid(2026, 1);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });

  it('2026年1月は木曜始まりなので最初の週の sun-wed は null', () => {
    const weeks = buildMonthGrid(2026, 1);
    const firstWeek = weeks[0];
    expect(firstWeek[0].day).toBeNull(); // SUN
    expect(firstWeek[1].day).toBeNull(); // MON
    expect(firstWeek[2].day).toBeNull(); // TUE
    expect(firstWeek[3].day).toBeNull(); // WED
    expect(firstWeek[4].day).toBe(1); // THU
    expect(firstWeek[5].day).toBe(2); // FRI
    expect(firstWeek[6].day).toBe(3); // SAT
  });

  it('うるう年(2024年2月)は29日まで含む', () => {
    const weeks = buildMonthGrid(2024, 2);
    const days = weeks.flat().map((c) => c.day);
    expect(days).toContain(29);
    expect(days).not.toContain(30);
  });

  it('うるう年でない年(2025年2月)は28日まで', () => {
    const weeks = buildMonthGrid(2025, 2);
    const days = weeks.flat().map((c) => c.day);
    expect(days).toContain(28);
    expect(days).not.toContain(29);
  });

  it('2026年1月は最終週 SAT に 31 が入る', () => {
    const weeks = buildMonthGrid(2026, 1);
    const lastWeek = weeks[weeks.length - 1];
    expect(lastWeek[6].day).toBe(31);
  });

  it('月の途中で終わる場合は末尾の余りセルが null で埋められる', () => {
    // 2026年4月は30日(木曜終わり) → 末週の FRI/SAT は null
    const aprilWeeks = buildMonthGrid(2026, 4);
    const lastAprilWeek = aprilWeeks[aprilWeeks.length - 1];
    expect(lastAprilWeek[5].day).toBeNull(); // FRI
    expect(lastAprilWeek[6].day).toBeNull(); // SAT
  });

  it('日付セルは Date オブジェクトを持つ', () => {
    const weeks = buildMonthGrid(2026, 1);
    const firstDay = weeks.flat().find((c) => c.day === 1);
    expect(firstDay?.date).toBeInstanceOf(Date);
    expect(firstDay?.date?.getFullYear()).toBe(2026);
    expect(firstDay?.date?.getMonth()).toBe(0);
    expect(firstDay?.date?.getDate()).toBe(1);
  });
});

describe('getTwelveMonthsFrom', () => {
  it('連続する 12 ヶ月を返す', () => {
    const months = getTwelveMonthsFrom(2026, 1);
    expect(months).toHaveLength(12);
  });

  it('年をまたぐ場合に正しく繰り上げる', () => {
    const months = getTwelveMonthsFrom(2026, 11);
    expect(months[0]).toEqual({ year: 2026, month: 11 });
    expect(months[1]).toEqual({ year: 2026, month: 12 });
    expect(months[2]).toEqual({ year: 2027, month: 1 });
    expect(months[11]).toEqual({ year: 2027, month: 10 });
  });

  it('年内に収まる場合は同じ年が並ぶ', () => {
    const months = getTwelveMonthsFrom(2026, 1);
    expect(months[0]).toEqual({ year: 2026, month: 1 });
    expect(months[11]).toEqual({ year: 2026, month: 12 });
  });
});

describe('WEEKDAYS / MONTHS 定数', () => {
  it('WEEKDAYS は SUN..SAT の順', () => {
    expect(WEEKDAYS).toEqual(['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']);
  });

  it('MONTHS は 1..12', () => {
    expect(MONTHS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});
