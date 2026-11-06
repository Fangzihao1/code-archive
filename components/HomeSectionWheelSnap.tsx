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

    let locked = false;
    let unlockTimer = 0;

    const goTo = (target: HTMLElement) => {
      const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - 76);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
      locked = true;
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        locked = false;
      }, 1000);
    };

    const onWheel = (event: WheelEvent) => {
      // Respond to the very first non-zero vertical wheel event.
      if (event.deltaY === 0 || Math.abs(event.deltaY) < Math.abs(event.deltaX) || locked) return;

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

      const nextIndex = currentIndex + (event.deltaY > 0 ? 1 : -1);
      if (nextIndex < 0 || nextIndex >= sections.length) return;

      event.preventDefault();
      goTo(sections[nextIndex]);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.clearTimeout(unlockTimer);
    };
  }, []);

  return null;
}
