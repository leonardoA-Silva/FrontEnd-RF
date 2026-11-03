import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";

export function useImpactMotion(root: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const element = root.current;
    if (!element || !enabled) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (document.hidden || document.activeElement?.matches(":focus-visible")) return;
      const context = gsap.context(() => {
        // Reveal the original series through a mask; the plotted values never change.
        gsap.set("[data-impact-clip]", { scaleX: 0, svgOrigin: "32 0" });
        gsap.set("[data-impact-segment]", { opacity: 0.35 });
      }, element);
      const finish = () => context.revert();
      const reveal = (chart: Element) => context.add(() => {
        const mask = chart.querySelector("[data-impact-clip]");
        if (mask) gsap.to(mask, { scaleX: 1, duration: 0.5, ease: "power2.out" });
        const segments = chart.querySelectorAll("[data-impact-segment]");
        if (segments.length) gsap.to(segments, { opacity: 1, duration: 0.24, stagger: 0.035, ease: "power2.out" });
      });
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      element.querySelectorAll("[data-impact-chart]").forEach(chart => observer.observe(chart));
      const onVisibility = () => { if (document.hidden) { observer.disconnect(); finish(); } };
      document.addEventListener("visibilitychange", onVisibility);
      return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); finish(); };
    });
    return () => media.revert();
  }, [root, enabled]);
}
