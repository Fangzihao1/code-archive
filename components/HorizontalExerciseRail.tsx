"use client";

import { useEffect, useRef, useState } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import type { Exercise } from "@/lib/types";

export default function HorizontalExerciseRail({ items }: { items: Exercise[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(items.length > 1);

  function updateProgress() {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setProgress(max <= 0 ? 0 : rail.scrollLeft / max);
    setCanGoBack(rail.scrollLeft > 4);
    setCanGoForward(rail.scrollLeft < max - 4);
  }

  function move(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    const firstCard = rail.querySelector<HTMLElement>(".horizontal-rail-item");
    const step = firstCard ? firstCard.getBoundingClientRect().width + 22 : rail.clientWidth * 0.82;
    rail.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && rail.scrollWidth > rail.clientWidth) {
        event.preventDefault();
        rail.scrollBy({ left: event.deltaY * 1.35, behavior: "auto" });
      }
    };
    rail.addEventListener("wheel", onWheel, { passive: false });
    updateProgress();
    const observer = new ResizeObserver(updateProgress);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("wheel", onWheel);
      observer.disconnect();
    };
  }, [items.length]);

  return (
    <div className="horizontal-rail">
      <div className="horizontal-rail-top">
        <span>{items.length} 个精选条目</span>
        <div className="rail-controls">
          <div className="rail-progress" aria-label="浏览进度">
            <i style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
          </div>
          <button type="button" onClick={() => move(-1)} disabled={!canGoBack} aria-label="向左浏览">←</button>
          <button type="button" onClick={() => move(1)} disabled={!canGoForward} aria-label="向右浏览">→</button>
        </div>
      </div>
      <div className="horizontal-rail-track" ref={railRef} onScroll={updateProgress}>
        {items.map((item) => (
          <div className="horizontal-rail-item" key={item.id}>
            <ExerciseCard item={item} />
          </div>
        ))}
      </div>
      <p className="rail-hint">滚动鼠标滚轮即可横向浏览，也可使用触控板或左右箭头</p>
    </div>
  );
}
