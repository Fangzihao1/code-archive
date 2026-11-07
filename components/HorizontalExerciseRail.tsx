"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import type { Exercise } from "@/lib/types";

export default function HorizontalExerciseRail({ items }: { items: Exercise[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingShift = useRef(0);
  const [orderedItems, setOrderedItems] = useState(items);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setOrderedItems(items);
    if (railRef.current) railRef.current.scrollLeft = 0;
  }, [items]);

  const pause = useCallback(() => {
    paused.current = true;
    setIsPaused(true);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
  }, []);
  const resume = useCallback(() => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    paused.current = false;
    setIsPaused(false);
  }, []);
  const resumeSoon = useCallback((delay = 1400) => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => {
      if (!railRef.current?.querySelector(".horizontal-rail-item:hover")) resume();
    }, delay);
  }, [resume]);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (rail && pendingShift.current > 0) {
      rail.scrollLeft = Math.max(0, rail.scrollLeft - pendingShift.current);
      pendingShift.current = 0;
    }
  }, [orderedItems]);

  const updateProgress = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const first = rail.querySelector<HTMLElement>(".horizontal-rail-item");
    if (!first) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap || "22") || 22;
    const cycleWidth = first.offsetWidth + gap;
    setProgress(cycleWidth > 0 ? Math.min(1, rail.scrollLeft / cycleWidth) : 0);
  }, []);

  const move = useCallback((direction: -1 | 1) => {
    const rail = railRef.current;
    const first = rail?.querySelector<HTMLElement>(".horizontal-rail-item");
    if (!rail || !first) return;
    pause();
    const gap = parseFloat(getComputedStyle(rail).columnGap || "22") || 22;
    rail.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: "smooth" });
    resumeSoon(1500);
  }, [pause, resumeSoon]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || orderedItems.length < 2) return;
    let frame = 0;
    let last = 0;
    let progressFrame = 0;
    const tick = (now: number) => {
      if (!last) last = now;
      const elapsed = Math.min(now - last, 50);
      last = now;
      if (!paused.current) {
        const first = rail.querySelector<HTMLElement>(".horizontal-rail-item");
        if (first) {
          const gap = parseFloat(getComputedStyle(rail).columnGap || "22") || 22;
          const shift = first.offsetWidth + gap;
          rail.scrollLeft += 36 * elapsed / 1000;
          if (rail.scrollLeft >= shift && pendingShift.current === 0) {
            pendingShift.current = shift;
            setOrderedItems(current => {
              if (current.length < 2) return current;
              return [...current.slice(1), current[0]];
            });
          }
          if (now - progressFrame > 120) {
            progressFrame = now;
            updateProgress();
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [orderedItems.length, updateProgress]);

  return (
    <section className={`horizontal-rail ${isPaused ? "is-paused" : "is-auto"}`}>
      <div className="horizontal-rail-top">
        <span>{items.length} 个精选条目</span>
        <div className="rail-controls">
          <span className="rail-autoplay-status">{isPaused ? "悬停暂停" : "自动向左滚动"}</span>
          <div className="rail-progress" aria-label="浏览进度"><i style={{ transform: `scaleX(${Math.max(.04, progress)})` }} /></div>
          <button type="button" onClick={() => move(-1)} aria-label="向左浏览">←</button>
          <button type="button" onClick={() => move(1)} aria-label="向右浏览">→</button>
        </div>
      </div>
      <div className="horizontal-rail-track" ref={railRef} onScroll={updateProgress}
        onWheel={() => { pause(); resumeSoon(); }}>
        {orderedItems.map(item => (
          <div className="horizontal-rail-item" key={item.id}
            onMouseEnter={pause} onMouseLeave={resume}
            onFocusCapture={pause} onBlurCapture={resume}>
            <ExerciseCard item={item} />
          </div>
        ))}
      </div>
      <p className="rail-hint">练习持续向左流动 · 当前练习完全离开后自动接到队尾 · 悬停暂停并放大</p>
    </section>
  );
}
