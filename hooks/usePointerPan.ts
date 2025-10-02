"use client";

import { useEffect, useRef } from "react";

export function usePointerPan() {
  const panRef = useRef<HTMLDivElement | null>(null);
  const isPanning = useRef(false);
  const panStartX = useRef(0);
  const panScrollStart = useRef(0);

  useEffect(() => {
    const el = panRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, input, textarea, [role='button']")) return;
      isPanning.current = true;
      panStartX.current = e.clientX;
      panScrollStart.current = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanning.current) return;
      const delta = e.clientX - panStartX.current;
      el.scrollLeft = panScrollStart.current - delta;
    };

    const endPan = (e: PointerEvent) => {
      if (!isPanning.current) return;
      isPanning.current = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
      el.style.cursor = "";
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endPan);
    el.addEventListener("pointercancel", endPan);
    el.addEventListener("pointerleave", endPan);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endPan);
      el.removeEventListener("pointercancel", endPan);
      el.removeEventListener("pointerleave", endPan);
    };
  }, []);

  const stopAll = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    // @ts-ignore
    e.nativeEvent?.stopImmediatePropagation?.();
  };

  return { panRef, stopAll };
}
