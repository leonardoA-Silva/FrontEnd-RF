import { useSearchParams } from "react-router-dom";
import { Bell, CreditCard, History, MapPin, MessagesSquare, Search, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { useBuyerSocket } from "../../hooks/useBuyerSocket";
import ProductCatalog from "../marketplace/ProductCatalog";
import BuyerProfile from "./comprador/BuyerProfile";
import BuyerSecurity from "./comprador/BuyerSecurity";
import BuyerReservations from "./comprador/BuyerReservations";
import BuyerNotifications from "./comprador/BuyerNotifications";
import BuyerAddresses from "./comprador/BuyerAddresses";
import BuyerCards from "./comprador/BuyerCards";
import BuyerConversations from "./comprador/BuyerConversations";
import { buyerStyles as s } from "./comprador/buyerStyles";

const tabs = [
  { id: "explorar", label: "Explorar Materiais", Icon: Search },
  { id: "reservas", label: "Minhas Reservas", Icon: ShoppingBag },
  { id: "historico", label: "Histórico", Icon: History },
  { id: "notificacoes", label: "Notificações", Icon: Bell },
  { id: "mensagens", label: "Mensagens", Icon: MessagesSquare },
  { id: "enderecos", label: "Endereços", Icon: MapPin },
  { id: "cartoes", label: "Cartões", Icon: CreditCard },
  { id: "perfil", label: "Perfil", Icon: UserRound },
  { id: "seguranca", label: "Segurança", Icon: ShieldCheck },
];

export default function DashboardUsuario() {
  const { user, token, displayName } = useLoggedUser();
  const realtime = useBuyerSocket(token);
  const [params, setParams] = useSearchParams();
  const tab = tabs.some(item => item.id === params.get("aba")) ? params.get("aba") : "explorar";
  if (!user) return null;
  return <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-[#1B4B3A]">
    <Header variant="marketplace" />
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="shrink-0 border-r border-[#E7E4DA] bg-white p-4 md:w-60"><nav aria-label="Área do comprador" className="flex flex-wrap gap-2 md:flex-col">{tabs.map(({ id, label, Icon }) => <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => setParams({ aba: id })} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${tab === id ? "bg-[#D7EFE6] font-semibold text-[#0F3D2E]" : "text-[#4B5A55] hover:bg-[#F3F1EA]"}`}><Icon size={20} aria-hidden="true" />{label}</button>)}</nav></aside>
      <main className="min-w-0 flex-1 space-y-6 px-4 py-6 sm:px-8 lg:px-10">
        {(tab === "mensagens" || tab === "notificacoes") && <div className={`${s.notice} flex flex-wrap items-center justify-between gap-3`}><p role="status">{realtime.connected ? "Conectado às atualizações em tempo real." : realtime.error || "Conectando às atualizações em tempo real..."}</p>{!realtime.connected && <button onClick={realtime.reconnect} className={s.secondary}>Reconectar</button>}</div>}
        {tab === "explorar" && <div className="space-y-6"><header><h1 className={s.title}>Olá, {displayName || "Comprador"}</h1><p className={`${s.copy} mt-2`}>Encontre materiais publicados e gerencie sua conta de comprador.</p></header><div className="overflow-hidden rounded-2xl border border-[#E7E4DA]"><ProductCatalog /></div></div>}
        {(tab === "reservas" || tab === "historico") && <BuyerReservations key={`${user.id}:${tab}`} history={tab === "historico"} />}
        {tab === "notificacoes" && <BuyerNotifications key={user.id} socket={realtime.socket} />}
        {tab === "mensagens" && <BuyerConversations key={user.id} userId={user.id} socket={realtime.socket} connected={realtime.connected} />}
        {tab === "enderecos" && <BuyerAddresses key={user.id} userId={user.id} />}
        {tab === "cartoes" && <BuyerCards key={user.id} />}
        {tab === "perfil" && <BuyerProfile key={user.id} userId={user.id} />}
        {tab === "seguranca" && <BuyerSecurity key={user.id} userId={user.id} />}
      </main>
    </div><Footer />
  </div>;
}
