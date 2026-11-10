import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Bell, CreditCard, History, MapPin, MessagesSquare, Search, ShieldCheck, ShoppingBag, UserRound, LogOut, ArrowUpRight, X, Star, Leaf, Scale, Building2 } from "lucide-react";
import BrandIcon from "../../components/BrandIcon";
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
import BuyerReviews from "./comprador/BuyerReviews";
import BuyerDisputes from "./comprador/BuyerDisputes";
import BuyerImpact from "./comprador/BuyerImpact";
import BuyerCompanies from "./comprador/BuyerCompanies";
import { buyerStyles as s } from "./comprador/buyerStyles";

const tabs = [
  { id: "explorar", label: "Explorar materiais", Icon: Search },
  { id: "reservas", label: "Minhas reservas", Icon: ShoppingBag },
  { id: "historico", label: "Histórico", Icon: History },
  { id: "avaliacoes", label: "Avaliações", Icon: Star },
  { id: "disputas", label: "Disputas", Icon: Scale },
  { id: "impacto", label: "Impacto ambiental", Icon: Leaf },
  { id: "empresas", label: "Encontrar empresas", Icon: Building2 },
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
  const [dismissedKey, setDismissedKey] = useState("");
  const [expiredKey, setExpiredKey] = useState("");

  const isRealtimeTab = tab === "mensagens" || tab === "notificacoes";
  const realtimeKey = `${tab}:${realtime.connected}:${realtime.error}`;
  const showRealtimeAlert = isRealtimeTab && dismissedKey !== realtimeKey && expiredKey !== realtimeKey;

  useEffect(() => {
    if (!isRealtimeTab) return;
    const timer = setTimeout(() => {
      setExpiredKey(realtimeKey);
    }, 10000);
    return () => clearTimeout(timer);
  }, [isRealtimeTab, realtimeKey]);

  if (!user) return null;
  const activeTab = tabs.find(item => item.id === tab)!;
  const navigation = <nav aria-label="Área do comprador" className="mt-2 flex flex-col gap-1 [&_button]:flex [&_button]:items-center [&_button]:gap-3 [&_button]:rounded-xl [&_button]:px-3 [&_button]:py-2.5 [&_button]:text-left [&_button]:text-sm [&_button]:text-muted [&_button]:transition-colors [&_button:hover]:bg-canvas [&_button[aria-current=page]]:bg-primary [&_button[aria-current=page]]:font-semibold [&_button[aria-current=page]]:text-white">{tabs.map(({ id, label, Icon }) => <button key={id} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => setParams({ aba: id })}><Icon size={20} strokeWidth={1.5} aria-hidden="true" /><span>{label}</span></button>)}</nav>;
  return <div className="screen-enter flex min-h-screen flex-col bg-canvas font-app text-ink lg:flex-row">
    <a href="#buyer-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:p-3 focus:text-white">Pular para o conteúdo</a>
    <aside className="flex shrink-0 flex-col gap-5 border-b border-line bg-surface p-5 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:overflow-y-auto lg:border-r lg:border-b-0"><Link to="/marketplace" className="flex items-center gap-3 text-lg font-bold text-primary [&_small]:block [&_small]:text-xs [&_small]:tracking-widest [&_small]:text-accent" aria-label="Reaproveita Franca — marketplace"><BrandIcon /><span>reaproveita.<small>FRANCA</small></span></Link><p className="text-xs font-semibold tracking-wider text-muted">Minha área</p>
      <div className="hidden lg:block">{navigation}</div><details className="rounded-xl border border-line p-3 lg:hidden [&_summary]:cursor-pointer [&_summary]:font-semibold"><summary>Navegação · {activeTab.label}</summary>{navigation}</details>
      <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4 text-sm [&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_button]:flex [&_button]:items-center [&_button]:gap-2"><Link to="/marketplace">Ir ao marketplace <ArrowUpRight size={16} /></Link><button type="button" onClick={() => { logout(); navigate("/login"); }}><LogOut size={18} />Sair da conta</button></div>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface px-5 py-4 sm:px-8 [&>div]:flex [&>div]:items-center [&>div]:gap-3 [&>div]:text-sm [&>div]:text-muted"><div><Link to="/">Início</Link><span aria-hidden="true">/</span><span>{activeTab.label}</span></div><Link to="/dashboardUsuario?aba=perfil" className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold [&>span:last-child]:truncate"><AccountAvatar /><span>{displayName || "Minha conta"}</span></Link></header>
      <main id="buyer-content" tabIndex={-1} className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-5 py-7 sm:px-8 lg:p-10">
        {(tab === "mensagens" || tab === "notificacoes") && showRealtimeAlert && (
          <div role="status" className={`${s.notice} flex items-center justify-between gap-3 transition-opacity duration-300`}>
            <p className="flex-1">
              {realtime.connected
                ? "Conectado às atualizações em tempo real."
                : realtime.error || "Conectando às atualizações em tempo real..."}
            </p>
            <div className="flex items-center gap-2">
              {!realtime.connected && (
                <button type="button" onClick={realtime.reconnect} className={s.secondary}>
                  Reconectar
                </button>
              )}
              <button
                type="button"
                aria-label="Fechar alerta"
                onClick={() => setDismissedKey(realtimeKey)}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-black/5 hover:text-gray-800"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        {tab === "explorar" && <section className="space-y-8"><header className="space-y-3"><p className="text-xs font-bold uppercase tracking-wider text-accent">Materiais que continuam</p><h1 className={s.title}>Olá, {displayName || "Comprador"}</h1><p className={s.copy}>Sua próxima criação começa com uma nova possibilidade.</p></header>{params.get("empresa") && <div className={s.notice}>Exibindo materiais da empresa selecionada. <button className="underline" onClick={() => setParams({ aba: "explorar" })}>Ver todas as empresas</button></div>}<ProductCatalog key={params.get("empresa") ?? "all"} embedded companyId={params.get("empresa") ?? undefined} /></section>}
        {(tab === "reservas" || tab === "historico") && <BuyerReservations key={`${user.id}:${tab}`} history={tab === "historico"} />}
        {tab === "avaliacoes" && <BuyerReviews key={`${user.id}:${params.get("reserva") ?? ""}:${params.get("avaliacao") ?? ""}`} userId={user.id} />}
        {tab === "disputas" && <BuyerDisputes key={`${user.id}:${params.get("reserva") ?? ""}:${params.get("disputa") ?? ""}`} userId={user.id} />}
        {tab === "impacto" && <BuyerImpact key={`${user.id}:${params.get("reserva") ?? ""}`} />}
        {tab === "empresas" && <BuyerCompanies key={user.id} />}
        {tab === "notificacoes" && <BuyerNotifications key={user.id} socket={realtime.socket} />}
        {tab === "mensagens" && <BuyerConversations key={user.id} userId={user.id} socket={realtime.socket} connected={realtime.connected} />}
        {tab === "enderecos" && <BuyerAddresses key={user.id} userId={user.id} />}
        {tab === "cartoes" && <BuyerCards key={user.id} />}
        {tab === "perfil" && <BuyerProfile key={user.id} userId={user.id} />}
        {tab === "seguranca" && <BuyerSecurity key={user.id} userId={user.id} />}
      </main><footer className="flex flex-wrap justify-between gap-3 border-t border-line px-5 py-5 text-xs text-muted sm:px-8 [&_a]:flex [&_a]:items-center [&_a]:gap-2"><span>© {new Date().getFullYear()} Reaproveita Franca.</span><Link to="/sobre-nos">Conheça nossa proposta <ArrowUpRight size={14} /></Link></footer>
    </div>
  </div>;
}
