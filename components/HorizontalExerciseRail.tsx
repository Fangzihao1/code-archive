"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import type { Exercise } from "@/lib/types";

export default function HorizontalExerciseRail({ items }: { items: Exercise[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pause = useCallback(() => { paused.current = true; setIsPaused(true); }, []);
  const resume = useCallback(() => { paused.current = false; setIsPaused(false); }, []);
  const updateProgress = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const half = rail.scrollWidth / 2;
    setProgress(half <= rail.clientWidth ? 0 : (rail.scrollLeft % half) / (half - rail.clientWidth));
  }, []);
  const move = useCallback((dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    pause();
    const card = rail.querySelector<HTMLElement>(".horizontal-rail-item");
    const step = card ? card.getBoundingClientRect().width + 22 : rail.clientWidth * .8;
    const half = rail.scrollWidth / 2;
    const current = rail.scrollLeft % half;
    rail.scrollTo({ left: (current + dir * step + half) % half, behavior: "smooth" });
    window.setTimeout(() => { if (railRef.current && !rail.matches(":hover")) resume(); }, 1600);
  }, [pause, resume]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || items.length < 2) return;
    let frame = 0, last = 0;
    const tick = (now: number) => {
      if (!last) last = now;
      const elapsed = Math.min(now - last, 40);
      last = now;
      if (!paused.current) {
        const half = rail.scrollWidth / 2;
        if (half > rail.clientWidth) {
          rail.scrollLeft += 30 * elapsed / 1000;
          if (rail.scrollLeft >= half) rail.scrollLeft -= half;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const observer = new ResizeObserver(updateProgress);
    observer.observe(rail);
    updateProgress();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [items.length, updateProgress]);

  const repeated = items.length > 1 ? [...items, ...items] : items;
  return (
    <section className={`horizontal-rail ${isPaused ? "is-paused" : "is-auto"}`}
      onMouseEnter={pause} onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resume(); }}
      onTouchStart={pause} onTouchEnd={() => window.setTimeout(resume, 1600)}>
      <div className="horizontal-rail-top">
        <span>{items.length} 个精选条目</span>
        <div className="rail-controls">
          <span className="rail-autoplay-status">{isPaused ? "已暂停" : "自动浏览中"}</span>
          <div className="rail-progress" aria-label="浏览进度"><i style={{ transform: `scaleX(${Math.max(.04, progress)})` }} /></div>
          <button type="button" onClick={() => move(-1)} aria-label="向左浏览">←</button>
          <button type="button" onClick={() => move(1)} aria-label="向右浏览">→</button>
        </div>
      </div>
      <div className="horizontal-rail-track" ref={railRef} onScroll={updateProgress}>
        {repeated.map((item, index) => (
          <div className="horizontal-rail-item" key={`${item.id}-${index}`} aria-hidden={index >= items.length}>
            <ExerciseCard item={item} />
          </div>
        ))}
      </div>
      <p className="rail-hint">自动流畅浏览 · 鼠标悬停即可暂停并放大练习</p>
    </section>
  );
}
