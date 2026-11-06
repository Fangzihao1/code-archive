"use client";

import { useEffect } from "react";

export default function HomeSectionWheelSnap() {
  useEffect(() => {
    const sections = [
      document.querySelector<HTMLElement>(".home-hero"),
      document.querySelector<HTMLElement>(".home-featured"),
      document.querySelector<HTMLElement>(".category-section"),
    ].filter((section): section is HTMLElement => Boolean(section));

    if (sections.length < 2) return;

    let accumulated = 0;
    let lastDirection = 0;
    let locked = false;
    let resetTimer = 0;
    let unlockTimer = 0;

    const goTo = (target: HTMLElement) => {
      const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - 76);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
      locked = true;
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        locked = false;
      }, 900);
      accumulated = 0;
      lastDirection = 0;
    };

    const onWheel = (event: WheelEvent) => {
      if (
        Math.abs(event.deltaY) < Math.abs(event.deltaX) ||
        event.deltaY === 0 ||
        locked
      ) return;

      const direction = Math.sign(event.deltaY);
      if (direction !== lastDirection) accumulated = 0;
      lastDirection = direction;
      accumulated += event.deltaY;

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        accumulated = 0;
        lastDirection = 0;
      }, 140);

      // A light wheel movement is enough to turn one section.
      if (Math.abs(accumulated) < 6) return;

      const anchor = window.innerHeight * 0.42;
      let currentIndex = sections.findIndex((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= anchor && rect.bottom > anchor;
      });

      if (currentIndex === -1) {
        currentIndex = sections.reduce((closest, section, index) => {
          const distance = Math.abs(section.getBoundingClientRect().top - 76);
          const closestDistance = Math.abs(
            sections[closest].getBoundingClientRect().top - 76
          );
          return distance < closestDistance ? index : closest;
        }, 0);
      }

      const nextIndex = currentIndex + (direction > 0 ? 1 : -1);
      if (nextIndex < 0 || nextIndex >= sections.length) return;

      event.preventDefault();
      goTo(sections[nextIndex]);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.clearTimeout(resetTimer);
      window.clearTimeout(unlockTimer);
    };
  }, []);

  return null;
}
