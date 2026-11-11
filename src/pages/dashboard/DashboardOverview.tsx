import { useCallback } from "react";
import { Link } from "react-router-dom";
import { listarProdutos, listarReservas, listarImpactos, listarConversas, listarNotificacoes, type BuyerNotification, type Shopping, type ProductBackend } from "../../api/services";
import { useApiResource, requireArray } from "../../hooks/useApiResource";
import RequestState from "./comprador/RequestState";
import { buyerStyles as s } from "./comprador/buyerStyles";
import { dateLabel, shoppingLabel } from "./comprador/buyerPresentation";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import MaterialImage from "../marketplace/MaterialImage";
import { productPhotos, productPrice } from "../marketplace/productPresentation";

import AdminOverviewSection from "../admin/AdminOverviewSection";

function rows<T>(result: PromiseSettledResult<{ data: T[] }>) { return result.status === "fulfilled" ? requireArray(result.value.data) : []; }
function RecommendedMaterials({ products, userId }: { products: ProductBackend[]; userId?: string }) {
  const recommended = products.filter(item => item.status === "available" && Number(item.quantity) > 0 && item.id_user?.toLowerCase() !== userId?.toLowerCase()).slice(0, 2);
  return <section className="space-y-4"><h2 className={s.subtitle}>Materiais para descobrir</h2>{!recommended.length ? <p className={s.copy}>Novos materiais publicados aparecerão aqui.</p> : <div className="grid gap-4 sm:grid-cols-2">{recommended.map(item => <Link key={item.id} className={`${s.panel} space-y-3`} to={`/marketplace/produto/${encodeURIComponent(item.id)}`}><div className="aspect-[2] overflow-hidden rounded-xl"><MaterialImage src={productPhotos(item)[0]} nome={item.name} /></div><h3 className="font-semibold">{item.name}</h3><p>{productPrice(item)}</p></Link>)}</div>}</section>;
}
export default function DashboardOverview({ company = false }: { company?: boolean }) {
  const { user, displayName } = useLoggedUser();
  const isAdmin = user?.role === "admin";
  const loader = useCallback(async (signal: AbortSignal) => {
    const responses = await Promise.allSettled([listarProdutos(signal), listarImpactos(signal), listarConversas(signal), company ? listarNotificacoes("", "", signal) : Promise.resolve({ data: [] as BuyerNotification[] }), !company ? listarReservas(signal) : Promise.resolve({ data: [] as Shopping[] })]);
    return { data: { products: rows(responses[0]), impacts: rows(responses[1]), conversations: rows(responses[2]), notices: rows(responses[3]), purchases: rows(responses[4]), partial: responses.some(item => item.status === "rejected") } };
  }, [company]);
  const resource = useApiResource(loader);
  const data = resource.data;
  const mine = data?.products.filter(item => item.id_user?.toLowerCase() === user?.id.toLowerCase()) ?? [];
  const metrics = company ? [["Anúncios publicados", mine.length], ["Anúncios disponíveis", mine.filter(item => item.status === "available").length], ["Solicitações recebidas", data?.notices.filter(item => item.type === "reserva_solicitada").length ?? 0]] : [["Reservas ativas", data?.purchases.filter(item => ["pending", "accepted"].includes(item.status)).length ?? 0], ["Reservas concluídas", data?.purchases.filter(item => item.status === "completed").length ?? 0], ["Mensagens não lidas", data?.conversations.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0) ?? 0]];
  const shortcuts = company ? [["Publicar material", "/dashboardEmpresa/publicar"], ["Meus anúncios", "/dashboardEmpresa/materiais"], ["Reservas recebidas", "/dashboardEmpresa/reservas"], ["Mensagens", "/dashboardEmpresa/mensagens"], ["Impacto ambiental", "/dashboardEmpresa/indicadores"]] : [["Explorar materiais", "/dashboardUsuario?aba=explorar"], ["Mapa de empresas", "/dashboardUsuario?aba=mapa"], ["Meu histórico", "/dashboardUsuario?aba=historico"], ["Mensagens", "/dashboardUsuario?aba=mensagens"], ["Impacto ambiental", "/dashboardUsuario?aba=impacto"]];
  return <section className="space-y-6">
    {isAdmin && <AdminOverviewSection />}
    <header className="buyer-heading"><p className="buyer-kicker">{company ? "Painel da empresa" : "Meu espaço"}</p><h1 className={s.title}>Olá, {displayName || "bem-vindo"}</h1><p className={s.copy}>Acompanhe seus materiais, reservas e novas possibilidades.</p></header><button className={s.secondary} disabled={resource.loading} onClick={resource.reload}>Atualizar painel</button><RequestState {...resource} retry={resource.reload} />
    {data && <>{data.partial && <p role="alert" className={s.notice}>Alguns dados não carregaram. Atualize o painel para tentar novamente.</p>}<div className="grid gap-4 sm:grid-cols-3">{metrics.map(([label, count]) => <div key={label} className={s.panel}><p className={s.copy}>{label}</p><strong className="mt-2 block text-3xl">{count}</strong></div>)}</div><div className={s.panel}><h2 className={s.subtitle}>Seu impacto</h2><p className="mt-3">{data.impacts.reduce((sum, item) => sum + Number(item.estimated_weight_kg || 0), 0).toLocaleString("pt-BR")} kg reaproveitados · {data.impacts.reduce((sum, item) => sum + Number(item.co2_saved_kg || 0), 0).toLocaleString("pt-BR")} kg de CO₂ evitado estimado</p></div>
    <div className="flex flex-wrap gap-3">{shortcuts.map(([label, to]) => <Link key={to} className={s.secondary} to={to}>{label}</Link>)}</div>
    {!company && <RecommendedMaterials products={data.products} userId={user?.id} />}<section className={`${s.panel} space-y-4`}><h2 className={s.subtitle}>{company ? "Atividades recentes" : "Reservas recentes"}</h2>{company ? data.notices.slice(0, 3).map(item => <Link key={item.id} to={item.type === "reserva_solicitada" ? "/dashboardEmpresa/reservas" : "/dashboardEmpresa/notificacoes"} className="block border-b border-[#E7E4DA] py-3"><strong>{item.title}</strong><p className={s.copy}>{item.content}</p></Link>) : data.purchases.slice(0, 2).map(item => <Link key={item.id} to={`/dashboardUsuario?aba=historico&reserva=${encodeURIComponent(item.id)}`} className="block border-b border-[#E7E4DA] py-3">{shoppingLabel(item.status)} · {dateLabel(item.datetime)}</Link>)}{!(company ? data.notices.length : data.purchases.length) && <p className={s.copy}>Nenhuma atividade por enquanto.</p>}</section></>}
  </section>;
}
