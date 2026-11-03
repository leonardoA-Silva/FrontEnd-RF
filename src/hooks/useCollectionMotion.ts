import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

interface Position { left: number; top: number }

// Keep existing cards in place visually while React updates their order.
export function useCollectionMotion<T extends HTMLElement>(root: RefObject<T | null>, signature: string) {
  const positions = useRef(new Map<string, Position>());
  const animations = useRef(new Map<HTMLElement, Animation>());
  const width = useRef(0);

  useEffect(() => {
    const running = animations.current;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => { running.forEach(animation => animation.cancel()); running.clear(); };
    const onPreference = () => { if (media.matches) stop(); };
    const onVisibility = () => { if (document.hidden) stop(); };
    media.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      positions.current.clear();
      width.current = 0;
      media.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useLayoutEffect(() => {
    const container = root.current;
    if (!container) { positions.current.clear(); return; }
    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-motion-key]"));
    const offsets = new Map<HTMLElement, Position>();
    animations.current.forEach((animation, node) => {
      const transform = new DOMMatrixReadOnly(getComputedStyle(node).transform);
      offsets.set(node, { left: transform.m41, top: transform.m42 });
      animation.cancel();
    });
    animations.current.clear();
    const nextWidth = container.clientWidth;
    const containerRect = container.getBoundingClientRect();
    const enabled = !matchMedia("(prefers-reduced-motion: reduce)").matches && !document.hidden &&
      !document.activeElement?.matches(":focus-visible") && (!width.current || width.current === nextWidth);
    const next = new Map<string, Position>();
    cards.forEach((node, index) => {
      const key = node.dataset.motionKey;
      if (!key) return;
      const rect = node.getBoundingClientRect();
      const position = { left: rect.left - containerRect.left, top: rect.top - containerRect.top };
      next.set(key, position);
      if (!enabled || typeof node.animate !== "function") return;
      const previous = positions.current.get(key);
      const offset = offsets.get(node);
      const x = previous ? previous.left + (offset?.left ?? 0) - position.left : 0;
      const y = previous ? previous.top + (offset?.top ?? 0) - position.top : 7;
      if (previous && Math.abs(x) < 1 && Math.abs(y) < 1) return;
      const animation = node.animate([
        { transform: `translate(${x}px, ${y}px)`, opacity: previous ? 1 : 0.65 },
        { transform: "translate(0, 0)", opacity: 1 },
      ], { duration: previous ? 190 : 230, delay: previous ? 0 : Math.min(index * 22, 88), easing: "cubic-bezier(.23, 1, .32, 1)" });
      animations.current.set(node, animation);
      animation.onfinish = () => { if (animations.current.get(node) === animation) animations.current.delete(node); };
    });
    positions.current = next;
    width.current = nextWidth;
  }, [root, signature]);
}
