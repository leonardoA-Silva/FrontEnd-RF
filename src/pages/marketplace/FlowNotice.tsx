import { Link } from "react-router-dom";
import { styles } from "./marketplaceStyles";

export function FlowUnavailable() {
  return <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16 text-center"><h1 className={styles.titulo}>Página não encontrada</h1><p className={`${styles.texto} my-5`}>Este fluxo não está disponível. Volte ao catálogo para consultar os materiais publicados.</p><Link to="/marketplace" className={styles.botao}>Voltar ao marketplace</Link></main>;
}
