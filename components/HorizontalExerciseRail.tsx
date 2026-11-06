"use client";

import { useRef, useState } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import type { Exercise } from "@/lib/types";

export default function HorizontalExerciseRail({ items }: { items: Exercise[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  function move(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(300, rail.clientWidth * 0.78), behavior: "smooth" });
  }

  function updateProgress() {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setProgress(max <= 0 ? 0 : rail.scrollLeft / max);
  }

  return (
    <div className="horizontal-rail">
      <div className="horizontal-rail-top">
        <span>{items.length} 个精选条目</span>
        <div className="rail-controls">
          <div className="rail-progress" aria-label="浏览进度">
            <i style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
          </div>
          <button type="button" onClick={() => move(-1)} aria-label="向左浏览">←</button>
          <button type="button" onClick={() => move(1)} aria-label="向右浏览">→</button>
        </div>
      </div>
      <div className="horizontal-rail-track" ref={railRef} onScroll={updateProgress}>
        {items.map((item) => (
          <div className="horizontal-rail-item" key={item.id}>
            <ExerciseCard item={item} />
          </div>
        ))}
      </div>
      <p className="rail-hint">可横向滚动浏览 · 使用触控板、鼠标滚轮或两侧箭头继续探索</p>
    </div>
  );
}
