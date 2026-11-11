import { useSearchParams } from "react-router-dom";
import { Bell, CreditCard, History, MapPin, MessagesSquare, Search, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import WorkspaceFrame from "../../components/dashboard/WorkspaceFrame";
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
import { buyerPreviewUser } from "../../preview/buyerPreview.mjs";

const tabs = [
  { id: "explorar", label: "Explorar materiais", Icon: Search },
  { id: "reservas", label: "Minhas reservas", Icon: ShoppingBag },
  { id: "historico", label: "Histórico", Icon: History },
  { id: "notificacoes", label: "Notificações", Icon: Bell },
  { id: "mensagens", label: "Mensagens", Icon: MessagesSquare },
  { id: "enderecos", label: "Endereços", Icon: MapPin },
  { id: "cartoes", label: "Cartões", Icon: CreditCard },
  { id: "perfil", label: "Perfil", Icon: UserRound },
  { id: "seguranca", label: "Segurança", Icon: ShieldCheck },
];

export default function DashboardUsuario({ preview = false }: { preview?: boolean }) {
  const session = useLoggedUser({ previewName: preview ? buyerPreviewUser.name : undefined });
  const user = preview ? buyerPreviewUser : session.user;
  const token = preview ? null : session.token;
  const displayName = preview ? buyerPreviewUser.name : session.displayName;
  const realtime = useBuyerSocket(token, preview ? user?.id : undefined);
  const [params, setParams] = useSearchParams();
  const tab = tabs.find(item => item.id === params.get("aba"))?.id ?? "explorar";
  if (!user) return null;
  const activeTab = tabs.find(item => item.id === tab)!;
  const navigation = tabs.map(({ id, label, Icon }) => <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => setParams({ aba: id })}><Icon size={23} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span></button>);
  return <WorkspaceFrame user preview={preview} base={preview ? "/previa/dashboard/usuario" : "/dashboardUsuario"} name={displayName || "Minha conta"} section={activeTab.label} navigation={navigation} accountTo={preview ? "/previa/dashboard/usuario?aba=perfil" : "/dashboardUsuario?aba=perfil"}>
    {preview && <p className="company-mode">Prévia interativa · Dados fictícios. Alterações somem ao recarregar; nenhuma API é chamada.</p>}
    <div id="buyer-content" tabIndex={-1} className="buyer-main space-y-6">
      {(tab === "mensagens" || tab === "notificacoes") && <div className={`${s.notice} flex flex-wrap items-center justify-between gap-3`}><p role="status">{preview ? "Mensagens demonstrativas conectadas localmente." : realtime.connected ? "Conectado às atualizações em tempo real." : realtime.error || "Conectando às atualizações em tempo real..."}</p>{!preview && !realtime.connected && <button onClick={realtime.reconnect} className={s.secondary}>Reconectar</button>}</div>}
      {tab === "explorar" && <section className="space-y-8"><header className="buyer-heading"><p className="buyer-kicker">Materiais que continuam</p><h1 className={s.title}>Olá, {displayName || "Comprador"}</h1><p className={s.copy}>Sua próxima criação começa com uma nova possibilidade.</p></header><ProductCatalog embedded preview={preview} /></section>}
      {(tab === "reservas" || tab === "historico") && <BuyerReservations key={`${user.id}:${tab}`} history={tab === "historico"} preview={preview} />}
      {tab === "notificacoes" && <BuyerNotifications key={user.id} socket={realtime.socket} />}
      {tab === "mensagens" && <BuyerConversations key={user.id} userId={user.id} socket={realtime.socket} connected={realtime.connected} />}
      {tab === "enderecos" && <BuyerAddresses key={user.id} userId={user.id} preview={preview} />}
      {tab === "cartoes" && <BuyerCards key={user.id} />}
      {tab === "perfil" && <BuyerProfile key={user.id} userId={user.id} preview={preview} />}
      {tab === "seguranca" && <BuyerSecurity key={user.id} userId={user.id} preview={preview} />}
    </div>
  </WorkspaceFrame>;
}
