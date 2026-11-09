"use client";

import { useEffect } from "react";

export default function HomeSectionWheelSnap() {
  useEffect(() => {
    const getAnchors = () => {
      const header = document.querySelector<HTMLElement>(".site-header");
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const featured = document.querySelector<HTMLElement>(".home-featured");
      const topics = document.querySelector<HTMLElement>(".category-section");

      if (!featured || !topics) return [0];

      return [
        0,
        Math.max(0, featured.getBoundingClientRect().top + window.scrollY - headerHeight),
        Math.max(0, topics.getBoundingClientRect().top + window.scrollY - headerHeight),
      ];
    };

    let locked = false;
    let unlockTimer: ReturnType<typeof setTimeout> | undefined;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < 18) return;

      const anchors = getAnchors();
      if (anchors.length < 3) return;

      const currentY = window.scrollY;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      anchors.forEach((anchor, index) => {
        const distance = Math.abs(currentY - anchor);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      // Snap only when the user is already at a section entrance.
      // Everywhere else, leave the browser's natural scrolling untouched.
      if (nearestDistance > 105) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const targetIndex = nearestIndex + direction;
      if (targetIndex < 0 || targetIndex >= anchors.length || locked) return;

      event.preventDefault();
      locked = true;
      window.scrollTo({
        top: anchors[targetIndex],
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });

      if (unlockTimer) clearTimeout(unlockTimer);
      unlockTimer = setTimeout(() => {
        locked = false;
      }, 760);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (unlockTimer) clearTimeout(unlockTimer);
    };
  }, []);

  return null;
}
