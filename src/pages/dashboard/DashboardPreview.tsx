import { Link } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import DashboardEmpresa from "./DashboardEmpresa";
import DashboardUsuario from "./DashboardUsuario";

export default function DashboardPreview({ kind }: { kind: "company" | "user" }) {
  const styles = {
    bar: "flex flex-wrap items-center justify-between gap-4 border-b border-[#D9D5C8] bg-[#F1F0E9] px-5 py-4 text-[#0F3D2E] sm:px-8",
    title: "flex items-center gap-2 text-sm font-bold",
    note: "mt-1 max-w-2xl text-xs leading-relaxed text-[#596356]",
    nav: "flex flex-wrap items-center gap-2 text-xs",
    tab: "rounded-full border border-[#C9D0BD] px-4 py-2 font-semibold",
    active: "bg-[#0F3D2E] text-white",
    exit: "ml-2 inline-flex items-center gap-1 py-2 underline underline-offset-4",
  };
  return <>
    <div className={styles.bar}>
      <div><p className={styles.title}><Eye size={17} aria-hidden="true" />Prévia local · Sem API</p><p className={styles.note}>{kind === "company" ? "Prévia interativa com alterações temporárias. Nada é enviado à API; recarregar restaura os exemplos." : "Somente visualização, com dados fictícios. Esta prévia não usa sua conta nem envia ações para a API."}</p></div>
      <nav aria-label="Escolher painel de demonstração" className={styles.nav}>
        <Link to="/previa/dashboard/empresa" aria-current={kind === "company" ? "page" : undefined} className={`${styles.tab} ${kind === "company" ? styles.active : ""}`}>Empresa</Link>
        <Link to="/previa/dashboard/usuario" aria-current={kind === "user" ? "page" : undefined} className={`${styles.tab} ${kind === "user" ? styles.active : ""}`}>Usuário</Link>
        <Link to="/login" className={styles.exit}><ArrowLeft size={13} />Sair da prévia</Link>
      </nav>
    </div>
    {kind === "company" ? <DashboardEmpresa preview /> : <DashboardUsuario preview />}
  </>;
}
