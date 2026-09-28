'use client';
import { ScrollTrigger } from '@/lib/gsap';
export function observeLayout(element: Element) {
  let frame = 0;
  let active = true;
  const schedule = () => {
    if (!active) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { if (active) ScrollTrigger.refresh(); });
  };
  const observer = new ResizeObserver(schedule);
  observer.observe(element);
  void document.fonts.ready.then(schedule);
  schedule();
  return () => { active = false; observer.disconnect(); cancelAnimationFrame(frame); };
}
