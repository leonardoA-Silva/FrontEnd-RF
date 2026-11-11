import { useSearchParams } from "react-router-dom";
import { Bell, History, MapPin, MessagesSquare, Search, ShieldCheck, UserRound, Home, Leaf } from "lucide-react";
import WorkspaceFrame from "../../components/dashboard/WorkspaceFrame";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { useBuyerSocket } from "../../hooks/useBuyerSocket";
import ProductCatalog from "../marketplace/ProductCatalog";
import BuyerProfile from "./comprador/BuyerProfile";
import BuyerSecurity from "./comprador/BuyerSecurity";
import BuyerReservations from "./comprador/BuyerReservations";
import AccountNotifications from "../../components/account/AccountNotifications";
import BuyerAddresses from "./comprador/BuyerAddresses";
import BuyerConversations from "./comprador/BuyerConversations";
import BuyerImpact from "./comprador/BuyerImpact";
import DashboardOverview from "./DashboardOverview";
import CompanyMap from "./CompanyMap";
import { buyerStyles as s } from "./comprador/buyerStyles";

const tabs = [
  { id: "inicio", label: "Início", Icon: Home }, { id: "mapa", label: "Mapa de empresas", Icon: MapPin },
  { id: "explorar", label: "Marketplace", Icon: Search }, { id: "historico", label: "Histórico e reservas", Icon: History },
  { id: "impacto", label: "Impacto ambiental", Icon: Leaf }, { id: "notificacoes", label: "Notificações", Icon: Bell },
  { id: "mensagens", label: "Mensagens", Icon: MessagesSquare }, { id: "enderecos", label: "Endereço", Icon: MapPin },
  { id: "perfil", label: "Perfil", Icon: UserRound }, { id: "seguranca", label: "Segurança", Icon: ShieldCheck },
];
export default function DashboardUsuario() {
  const { user, token, displayName } = useLoggedUser();
  const [params, setParams] = useSearchParams(); const realtime = useBuyerSocket(params.get("aba") === "notificacoes" ? token : null);
  const requested = params.get("aba") === "reservas" ? "historico" : params.get("aba");
  const tab = tabs.some(item => item.id === requested) ? requested : "inicio";
  if (!user) return null;
  const activeTab = tabs.find(item => item.id === tab)!;
  const navigation = tabs.map(({ id, label, Icon }) => <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => setParams({ aba: id })}><Icon size={23} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span></button>);
  return <WorkspaceFrame name={displayName || "Minha conta"} section={activeTab.label} user base="/dashboardUsuario" navigation={navigation} accountTo="/dashboardUsuario?aba=perfil"><div className="buyer-main space-y-6">
      {tab === "notificacoes" && !realtime.connected && <div role="status" className={s.notice}><p>{realtime.error || "Conectando às atualizações em tempo real…"}</p><button type="button" onClick={realtime.reconnect} className={s.secondary}>Reconectar</button></div>}
      {tab === "inicio" && <DashboardOverview />}{tab === "mapa" && <CompanyMap />}
      {tab === "explorar" && <ProductCatalog key={params.get("empresa") ?? "all"} embedded companyId={params.get("empresa") ?? undefined} />}
      {tab === "historico" && <BuyerReservations key={user.id} history />}{tab === "impacto" && <BuyerImpact />}
      {tab === "notificacoes" && <AccountNotifications socket={realtime.socket} />}{tab === "mensagens" && <BuyerConversations key={user.id} />}
      {tab === "enderecos" && <BuyerAddresses userId={user.id} />}{tab === "perfil" && <BuyerProfile key={user.id} userId={user.id} />}{tab === "seguranca" && <BuyerSecurity />}
    </div></WorkspaceFrame>;
}
