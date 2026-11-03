import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Bell, CreditCard, History, MapPin, MessagesSquare, Search, ShieldCheck, ShoppingBag, UserRound, LogOut, ArrowUpRight, Repeat2 } from "lucide-react";
import AccountAvatar from "../../components/AccountAvatar";
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

export default function DashboardUsuario() {
  const { user, token, displayName, logout } = useLoggedUser();
  const navigate = useNavigate();
  const realtime = useBuyerSocket(token);
  const [params, setParams] = useSearchParams();
  const tab = tabs.some(item => item.id === params.get("aba")) ? params.get("aba") : "explorar";
  if (!user) return null;
  const activeTab = tabs.find(item => item.id === tab)!;
  const navigation = <nav aria-label="Área do comprador" className="buyer-navigation">{tabs.map(({ id, label, Icon }) => <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => setParams({ aba: id })}><Icon size={20} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span></button>)}</nav>;
  return <div className="buyer-app">
    <a href="#buyer-content" className="rf-skip">Pular para o conteúdo</a>
    <aside className="buyer-rail"><Link to="/marketplace" className="buyer-rail-brand" aria-label="Reaproveita Franca — marketplace"><Repeat2 size={28} /><span>reaproveita.<small>FRANCA</small></span></Link><p className="buyer-rail-label">Minha área</p>
      <div className="buyer-desktop-navigation">{navigation}</div><details className="buyer-mobile-navigation"><summary>Navegação · {activeTab.label}</summary>{navigation}</details>
      <div className="buyer-rail-bottom"><Link to="/marketplace">Ir ao marketplace <ArrowUpRight size={16} /></Link><button type="button" onClick={() => { logout(); navigate("/login"); }}><LogOut size={18} />Sair da conta</button></div>
    </aside>
    <div className="buyer-workspace"><header className="buyer-topbar"><div><Link to="/">Início</Link><span aria-hidden="true">/</span><span>{activeTab.label}</span></div><Link to="/dashboardUsuario?aba=perfil" className="buyer-account-link"><AccountAvatar /><span>{displayName || "Minha conta"}</span></Link></header>
      <main id="buyer-content" tabIndex={-1} className="buyer-main space-y-6">
        {(tab === "mensagens" || tab === "notificacoes") && <div className={`${s.notice} flex flex-wrap items-center justify-between gap-3`}><p role="status">{realtime.connected ? "Conectado às atualizações em tempo real." : realtime.error || "Conectando às atualizações em tempo real..."}</p>{!realtime.connected && <button onClick={realtime.reconnect} className={s.secondary}>Reconectar</button>}</div>}
        {tab === "explorar" && <section className="space-y-8"><header className="buyer-heading"><p className="buyer-kicker">Materiais que continuam</p><h1 className={s.title}>Olá, {displayName || "Comprador"}</h1><p className={s.copy}>Sua próxima criação começa com uma nova possibilidade.</p></header><ProductCatalog embedded /></section>}
        {(tab === "reservas" || tab === "historico") && <BuyerReservations key={`${user.id}:${tab}`} history={tab === "historico"} />}
        {tab === "notificacoes" && <BuyerNotifications key={user.id} socket={realtime.socket} />}
        {tab === "mensagens" && <BuyerConversations key={user.id} userId={user.id} socket={realtime.socket} connected={realtime.connected} />}
        {tab === "enderecos" && <BuyerAddresses key={user.id} userId={user.id} />}
        {tab === "cartoes" && <BuyerCards key={user.id} />}
        {tab === "perfil" && <BuyerProfile key={user.id} userId={user.id} />}
        {tab === "seguranca" && <BuyerSecurity key={user.id} userId={user.id} />}
      </main><footer className="buyer-workspace-footer"><span>© {new Date().getFullYear()} Reaproveita Franca.</span><Link to="/sobre-nos">Conheça nossa proposta <ArrowUpRight size={14} /></Link></footer>
    </div>
  </div>;
}
