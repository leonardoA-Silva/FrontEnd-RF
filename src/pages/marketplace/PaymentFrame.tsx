import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, History, Search, ShoppingBag, UserRound } from "lucide-react";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { DemoNotice } from "./FlowNotice";
import { styles } from "./marketplaceStyles";

export default function PaymentFrame({ children, materialId, estreito = false }: { children: ReactNode; materialId: string; estreito?: boolean }) {
  const { role } = useLoggedUser();
  const conta = role === "company" ? "/dashboardEmpresa" : "/dashboardUsuario";
  return <div className="flex flex-1 bg-[#f8f9fa]">
    <aside className="hidden w-[260px] shrink-0 border-r border-[#bbcac0] bg-white px-4 py-10 lg:block"><nav aria-label="Navegação da conta" className="space-y-2 text-sm">{[{ nome: "Explorar Materiais", to: "/marketplace", Icon: Search }, { nome: "Minhas Reservas", to: "/marketplace/minhas-reservas", Icon: ShoppingBag }, { nome: "Histórico", to: conta, Icon: History }, { nome: "Perfil", to: conta, Icon: UserRound }].map(({ nome, to, Icon }, i) => <Link key={nome} to={to} className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${i === 0 ? "bg-[#d9e6dd] text-[var(--mkt-payment)]" : "text-[var(--mkt-muted)] hover:bg-[#f3f4f5]"}`}><Icon size={18} aria-hidden="true" />{nome}</Link>)}</nav></aside>
    <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:py-12"><div className={`mx-auto w-full ${estreito ? "max-w-[512px]" : "max-w-[880px]"}`}><Link to={`/marketplace/finalizar/${materialId}`} className={styles.voltar}><ArrowLeft size={16} />Voltar para Finalizar Reserva</Link><DemoNotice />{children}</div></main>
  </div>;
}
