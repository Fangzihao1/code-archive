"use client";

import { useEffect } from "react";

// Use the browser's native, non-blocking proximity snapping on the homepage.
// No wheel interception or preventDefault: mouse wheels, trackpads and touch
// retain their normal scrolling behavior.
export default function HomeSectionWheelSnap() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("home-snap-active");
    return () => root.classList.remove("home-snap-active");
  }, []);

  return null;
}
