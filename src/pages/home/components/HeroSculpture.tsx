import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Box, RotateCcw, X } from "lucide-react";

const SculptureCanvas = lazy(() => import("./SculptureCanvas"));

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function HeroSculpture({ paused }: { paused: boolean }) {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [version, setVersion] = useState(0);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    if (host.current) observer.observe(host.current);
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => { query.removeEventListener("change", sync); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  return (
    <div ref={host} className="home-hero-art">
      <img src="/images/home/hero.webp" alt="Escultura ilustrativa de faixas de couro, tecido e EVA entrelaçadas em um novo ciclo" width="1600" height="1067" fetchPriority="high" />
      {active && <div className="home-canvas-layer"><SceneBoundary key={version} fallback={<div className="home-scene-status" role="status"><p>Não foi possível abrir a cena interativa. A composição ilustrada continua disponível.</p><button type="button" onClick={() => setVersion(value => value + 1)}>Tentar novamente</button></div>}><Suspense fallback={<div className="home-scene-status" role="status">Preparando os materiais…</div>}><SculptureCanvas running={!paused && !reduced && visible && pageVisible} /></Suspense></SceneBoundary></div>}
      <span className="home-art-label home-art-label-one" aria-hidden="true">01 <span>COURO</span></span>
      <span className="home-art-label home-art-label-two" aria-hidden="true">02 <span>TECIDO</span></span>
      <span className="home-art-label home-art-label-three" aria-hidden="true">03 <span>EVA</span></span>
      <div className="home-scene-controls">
        <button type="button" onClick={() => setActive(value => !value)} aria-pressed={active} className="home-scene-button">{active ? <X size={15} /> : <Box size={15} />}{active ? "Voltar à composição" : "Explorar em 3D"}</button>
        {active && <button type="button" aria-label="Reiniciar posição da escultura" className="home-scene-button" onClick={() => setVersion(value => value + 1)}><RotateCcw size={15} /></button>}
      </div>
      {active && <p className="home-scene-hint" role="status">Arraste para girar a escultura. Use as setas no teclado para explorar.</p>}
    </div>
  );
}
