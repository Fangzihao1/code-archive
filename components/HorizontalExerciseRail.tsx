"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import type { Exercise } from "@/lib/types";

export default function HorizontalExerciseRail({ items }: { items: Exercise[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const pause = useCallback(() => {
    paused.current = true;
    setIsPaused(true);
  }, []);
  const resume = useCallback(() => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    paused.current = false;
    setIsPaused(false);
  }, []);
  const resumeSoon = useCallback((delay = 1200) => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => {
      if (railRef.current && !railRef.current.matches(":hover") &&
          !railRef.current.parentElement?.matches(":hover")) resume();
    }, delay);
  }, [resume]);

  const getLoopWidth = useCallback((rail: HTMLDivElement) => {
    const duplicateStart = rail.children[items.length] as HTMLElement | undefined;
    if (!duplicateStart) return 0;
    return duplicateStart.getBoundingClientRect().left -
      rail.getBoundingClientRect().left + rail.scrollLeft;
  }, [items.length]);

  const updateProgress = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const loopWidth = getLoopWidth(rail);
    const max = loopWidth - rail.clientWidth;
    setProgress(max <= 1 ? 0 : Math.min(1, (rail.scrollLeft % loopWidth) / max));
  }, [getLoopWidth]);

  const move = useCallback((dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    pause();
    const card = rail.querySelector<HTMLElement>(".horizontal-rail-item");
    const step = card ? card.getBoundingClientRect().width + 22 : rail.clientWidth * .8;
    const loopWidth = getLoopWidth(rail);
    if (loopWidth > 0) {
      const current = rail.scrollLeft % loopWidth;
      let next = current + dir * step;
      if (next < 0) next += loopWidth;
      if (next >= loopWidth) next -= loopWidth;
      rail.scrollTo({ left: next, behavior: "smooth" });
    }
    resumeSoon(1600);
  }, [getLoopWidth, pause, resumeSoon]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || items.length < 2) return;
    let frame = 0;
    let last = 0;
    let hovered = false;
    const tick = (now: number) => {
      if (!last) last = now;
      const elapsed = Math.min(now - last, 50);
      last = now;
      const loopWidth = getLoopWidth(rail);
      if (!paused.current && !hovered && loopWidth > rail.clientWidth + 8) {
        rail.scrollLeft += 34 * elapsed / 1000;
        if (rail.scrollLeft >= loopWidth) rail.scrollLeft -= loopWidth;
      }
      frame = requestAnimationFrame(tick);
    };
    const enter = () => { hovered = true; pause(); };
    const leave = () => { hovered = false; resume(); };
    rail.parentElement?.addEventListener("pointerenter", enter);
    rail.parentElement?.addEventListener("pointerleave", leave);
    rail.addEventListener("focusin", enter);
    rail.addEventListener("focusout", leave);
    frame = requestAnimationFrame(tick);
    const observer = new ResizeObserver(() => updateProgress());
    observer.observe(rail);
    updateProgress();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      rail.parentElement?.removeEventListener("pointerenter", enter);
      rail.parentElement?.removeEventListener("pointerleave", leave);
      rail.removeEventListener("focusin", enter);
      rail.removeEventListener("focusout", leave);
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    };
  }, [items.length, getLoopWidth, pause, resume, updateProgress]);

  const repeated = items.length > 1 ? [...items, ...items] : items;
  return (
    <section className={`horizontal-rail ${isPaused ? "is-paused" : "is-auto"}`}>
      <div className="horizontal-rail-top">
        <span>{items.length} 个精选条目</span>
        <div className="rail-controls">
          <span className="rail-autoplay-status">{isPaused ? "悬停暂停" : "自动浏览中"}</span>
          <div className="rail-progress" aria-label="浏览进度"><i style={{ transform: `scaleX(${Math.max(.04, progress)})` }} /></div>
          <button type="button" onClick={() => move(-1)} aria-label="向左浏览">←</button>
          <button type="button" onClick={() => move(1)} aria-label="向右浏览">→</button>
        </div>
      </div>
      <div className="horizontal-rail-track" ref={railRef} onScroll={updateProgress}
        onPointerDown={pause} onPointerUp={() => resumeSoon(1400)}
        onWheel={() => { pause(); resumeSoon(1400); }}>
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
