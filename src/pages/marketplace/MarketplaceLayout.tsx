import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { styles } from "./marketplaceStyles";

export default function MarketplaceLayout() {
  const { pathname } = useLocation();
  const conteudo = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    conteudo.current?.focus({ preventScroll: true });
  }, [pathname]);
  return <div className={styles.pagina}>
    <a href="#conteudo-marketplace" className="sr-only z-50 bg-white p-3 text-emerald-900 focus:not-sr-only focus:absolute">Pular para o conteúdo</a>
    <Header variant="marketplace" />
    <div id="conteudo-marketplace" ref={conteudo} tabIndex={-1} className="flex flex-1 flex-col outline-none">
      <Outlet />
    </div>
    <Footer variant="marketplace" />
  </div>;
}
