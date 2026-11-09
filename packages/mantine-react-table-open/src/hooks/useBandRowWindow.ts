import { useLayoutEffect, useState } from 'react';

import { type MRT_RowData, type MRT_TableInstance } from '../types';

const INITIAL_RECORD_HEIGHT = 160;
const OVERSCAN = 4;

type BandWindow = {
  bottom: number;
  end: number;
  start: number;
  top: number;
};

export const useBandRowWindow = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  rowCount: number,
  enabled: boolean,
): BandWindow => {
  'use no memo';
  const [bounds, setBounds] = useState<BandWindow>({
    bottom: 0,
    end: Math.min(rowCount, 16),
    start: 0,
    top: 0,
  });

  useLayoutEffect(() => {
    if (!enabled) return;
    const container = table.refs.tableContainerRef.current;
    if (!container) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const sample = container.querySelector('tbody tr[data-index]');
      let height = INITIAL_RECORD_HEIGHT;
      if (sample) {
        const index = sample.getAttribute('data-index');
        const group = container.querySelectorAll(
          `tbody tr[data-index="${index}"]`,
        );
        let measured = 0;
        group.forEach((node) => {
          measured += (node as HTMLElement).offsetHeight;
        });
        if (measured > 1) height = Math.round(measured);
      }

      const view = container.clientHeight || height * 6;
      const start = Math.max(
        0,
        Math.floor(container.scrollTop / height) - OVERSCAN,
      );
      const end = Math.min(
        rowCount,
        start + Math.ceil(view / height) + OVERSCAN * 2,
      );
      const top = start * height;
      const bottom = Math.max(0, (rowCount - end) * height);
      setBounds((prev) =>
        prev.start === start &&
        prev.end === end &&
        prev.top === top &&
        prev.bottom === bottom
          ? prev
          : { bottom, end, start, top },
      );
    };

    update();
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(onScroll);
    observer?.observe(container);
    return () => {
      container.removeEventListener('scroll', onScroll);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, rowCount, table]);

  if (!enabled) {
    return { bottom: 0, end: rowCount, start: 0, top: 0 };
  }

  return bounds;
};
