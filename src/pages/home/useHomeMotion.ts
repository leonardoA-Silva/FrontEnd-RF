import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useHomeMotion(paused: boolean) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (paused || !root.current) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.from(".home-hero-copy > *", { y: 22, opacity: 0, duration: 0.85, stagger: 0.1, ease: "power3.out", clearProps: "transform,opacity" });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach(element => {
          gsap.from(element, { y: 32, opacity: 0, duration: 0.8, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: { trigger: element, start: "top 93%", once: true } });
        });
        gsap.to(".home-hero-art img", { yPercent: 7, rotate: 2, ease: "none", scrollTrigger: { trigger: ".home-hero", start: "top top", end: "bottom top", scrub: 1 } });
        gsap.fromTo(".home-story-art img", { yPercent: 5 }, { yPercent: -3, ease: "none", scrollTrigger: { trigger: ".home-story", start: "top bottom", end: "bottom top", scrub: 1 } });
        gsap.fromTo(".home-closing-art", { yPercent: 7, rotate: -4 }, { yPercent: -4, rotate: 2, ease: "none", scrollTrigger: { trigger: ".home-closing", start: "top bottom", end: "bottom top", scrub: 1 } });
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, [paused]);
  return root;
}
