"use client";

import { useEffect } from "react";

export default function HomeSectionWheelSnap() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".home-hero");
    const featured = document.querySelector<HTMLElement>(".home-featured");
    if (!hero || !featured) return;

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
      }, 950);
      accumulated = 0;
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX) || event.deltaY === 0 || locked) return;

      const direction = Math.sign(event.deltaY);
      if (direction !== lastDirection) accumulated = 0;
      lastDirection = direction;
      accumulated += event.deltaY;

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        accumulated = 0;
        lastDirection = 0;
      }, 180);

      if (Math.abs(accumulated) < 32) return;

      const heroRect = hero.getBoundingClientRect();
      const featuredRect = featured.getBoundingClientRect();
      const viewport = window.innerHeight;
      const heroIsCurrent = heroRect.top < viewport * 0.35 && heroRect.bottom > viewport * 0.35;
      const featuredIsCurrent = featuredRect.top < viewport * 0.55 && featuredRect.bottom > viewport * 0.35;

      if (direction > 0 && heroIsCurrent) {
        event.preventDefault();
        goTo(featured);
      } else if (direction < 0 && featuredIsCurrent) {
        event.preventDefault();
        goTo(hero);
      }
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
