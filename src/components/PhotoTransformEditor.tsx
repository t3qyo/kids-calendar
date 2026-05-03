'use client';

import { useEffect, useRef, useState } from 'react';
import { useCalendarStore } from '@/lib/store';
import { DEFAULT_PHOTO_TRANSFORM, type PhotoTransform } from '@/lib/types';
import { LAYOUT_SPECS } from './CalendarPage';

const PHOTO_AREA_ASPECT: Record<string, number> = {
  'desk-vertical': 1,
  'desk-horizontal': 0.85,
  wall: 1.25,
};

type Props = {
  month: number;
  open: boolean;
  onClose: () => void;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function PhotoTransformEditor({ month, open, onClose }: Props) {
  const photo = useCalendarStore((s) => s.monthPhotos[month]);
  const stored = useCalendarStore((s) => s.photoTransforms[month]);
  const layout = useCalendarStore((s) => s.layout);
  const setPhotoTransform = useCalendarStore((s) => s.setPhotoTransform);

  const [draft, setDraft] = useState<PhotoTransform>(stored ?? DEFAULT_PHOTO_TRANSFORM);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startFocus: { x: number; y: number } } | null>(null);

  useEffect(() => {
    if (open) setDraft(stored ?? DEFAULT_PHOTO_TRANSFORM);
  }, [open, stored]);

  if (!open || !photo) return null;

  const computeFocusDelta = (dx: number, dy: number) => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return { dx: 0, dy: 0 };
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return { dx: 0, dy: 0 };
    const coverScale = Math.max(fw / nw, fh / nh) * draft.zoom;
    const scaledW = nw * coverScale;
    const scaledH = nh * coverScale;
    const extraW = Math.max(scaledW - fw, 1);
    const extraH = Math.max(scaledH - fh, 1);
    return {
      dx: -(dx / extraW) * 100,
      dy: -(dy / extraH) * 100,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startFocus: { x: draft.focusX, y: draft.focusY },
    };
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const delta = computeFocusDelta(dx, dy);
    setDraft((prev) => ({
      ...prev,
      focusX: clamp(dragRef.current!.startFocus.x + delta.dx, 0, 100),
      focusY: clamp(dragRef.current!.startFocus.y + delta.dy, 0, 100),
    }));
  };
  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const setZoom = (z: number) => setDraft((prev) => ({ ...prev, zoom: clamp(z, 1, 4) }));

  const handleSave = () => {
    setPhotoTransform(month, draft);
    onClose();
  };
  const handleReset = () => setDraft(DEFAULT_PHOTO_TRANSFORM);

  const aspect = PHOTO_AREA_ASPECT[layout] ?? 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">写真の表示範囲を調整 ({LAYOUT_SPECS[layout].label})</h3>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800">
            ×
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            ドラッグで位置を調整、スライダーで拡大率を調整できます。
          </p>
          <div
            ref={frameRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full cursor-grab touch-none overflow-hidden rounded border border-gray-300 bg-gray-100 active:cursor-grabbing"
            style={{ aspectRatio: aspect }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={photo}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover"
              style={{
                objectPosition: `${draft.focusX}% ${draft.focusY}%`,
                transform: `scale(${draft.zoom})`,
                transformOrigin: `${draft.focusX}% ${draft.focusY}%`,
              }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">拡大率</label>
            <span className="text-sm tabular-nums text-gray-500">{draft.zoom.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            step={0.05}
            value={draft.zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            リセット
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-800"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
