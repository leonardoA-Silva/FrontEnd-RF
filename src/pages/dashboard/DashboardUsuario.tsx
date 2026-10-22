import { Link, useSearchParams } from "react-router-dom";
import { History, Search, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import ProductCatalog from "../marketplace/ProductCatalog";
import BuyerProfile from "./comprador/BuyerProfile";
import BuyerSecurity from "./comprador/BuyerSecurity";
import { buyerStyles as s } from "./comprador/buyerStyles";

const tabs = [
  { id: "explorar", label: "Explorar Materiais", Icon: Search },
  { id: "reservas", label: "Minhas Reservas", Icon: ShoppingBag },
  { id: "historico", label: "Histórico", Icon: History },
  { id: "perfil", label: "Perfil", Icon: UserRound },
  { id: "seguranca", label: "Segurança", Icon: ShieldCheck },
];

export default function DashboardUsuario() {
  const { user, displayName } = useLoggedUser();
  const [params, setParams] = useSearchParams();
  const tab = params.get("aba") ?? "explorar";
  const links = tabs.map(({ id, label, Icon }) => <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => setParams({ aba: id })} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${tab === id ? "bg-[#D7EFE6] font-semibold text-[#0F3D2E]" : "text-[#4B5A55] hover:bg-[#F3F1EA]"}`}><Icon size={20} aria-hidden="true" />{label}</button>);
  return <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-[#1B4B3A]">
    <Header variant="marketplace" /><div className="flex flex-1 flex-col md:flex-row"><aside className="shrink-0 border-r border-[#E7E4DA] bg-white p-4 md:w-60"><nav aria-label="Área do comprador" className="flex flex-wrap gap-2 md:flex-col">{links}</nav></aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-10">
        {tab === "explorar" ? <div className="space-y-6"><header><h1 className={s.title}>Olá, {displayName || "Comprador"}</h1><p className={`${s.copy} mt-2`}>Encontre materiais publicados e gerencie sua conta de comprador.</p></header><div className="overflow-hidden rounded-2xl border border-[#E7E4DA]"><ProductCatalog /></div></div> : tab === "perfil" && user ? <BuyerProfile key={user.id} userId={user.id} /> : tab === "seguranca" && user ? <BuyerSecurity userId={user.id} /> : <section className={`${s.panel} space-y-5`}><h1 className={s.title}>{tab === "reservas" ? "Minhas Reservas" : "Histórico"}</h1><p className={s.copy}>{tab === "reservas" ? "O serviço de reservas ainda não está disponível. Nenhuma reserva real é criada pelo protótipo." : "O histórico de compras e negociações ainda não está disponível."}</p><p className={s.notice}>Você pode explorar o catálogo real ou conhecer o único exemplo de reserva, identificado como demonstração.</p><div className="flex flex-wrap gap-3"><Link to="/marketplace" className={s.button}>Explorar catálogo</Link><Link to="/marketplace?origem=exemplo" className={s.secondary}>Ver exemplo</Link></div></section>}
      </main>
    </div><Footer />
  </div>;
}
