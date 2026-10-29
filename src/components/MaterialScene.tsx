import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { ArrowUpRight, Pause, Play, Repeat2 } from "lucide-react";

export default function MaterialScene() {
  const scene = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  function reset() {
    scene.current?.style.setProperty("--rotate-y", "0deg");
    scene.current?.style.setProperty("--rotate-x", "0deg");
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (paused || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    scene.current?.style.setProperty("--rotate-y", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 14}deg`);
    scene.current?.style.setProperty("--rotate-x", `${((event.clientY - bounds.top) / bounds.height - 0.5) * -10}deg`);
  }
  return <div className={`rf-scene ${paused ? "rf-paused" : ""}`} onPointerMove={move} onPointerLeave={reset}>
    <div aria-hidden="true" className="rf-scene-grid" />
    <p className="absolute left-6 top-6 z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4B5A55]">Reaproveitar é dar continuidade</p>
    <div ref={scene} className="rf-scene-perspective" aria-hidden="true">
      <div className="rf-scene-orbit" />
      <div className="rf-sample rf-sample-back"><span>03 — NOVAS FORMAS</span></div>
      <div className="rf-sample rf-sample-middle"><span>02 — OUTRA POSSIBILIDADE</span></div>
      <div className="rf-sample rf-sample-front"><img src="/retalho-couro-nobre.png" alt="" /><div className="rf-sample-label"><span>01 / COURO<strong>Pronto para<br />uma nova história.</strong></span><ArrowUpRight size={30} /></div></div>
      <div className="rf-scene-seal"><Repeat2 size={36} strokeWidth={1.5} /><span>A VIDA<br />CONTINUA</span></div>
    </div>
    <p className="absolute bottom-6 left-6 text-xs leading-relaxed text-[#4B5A55]">Uma composição de materiais.<br />Infinitas possibilidades de criação.</p>
    <button type="button" className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#D9D5C8] bg-white text-[#1B4B3A]" aria-label={paused ? "Retomar animação" : "Pausar animação"} aria-pressed={paused} onClick={() => { reset(); setPaused(value => !value); }}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
  </div>;
}
