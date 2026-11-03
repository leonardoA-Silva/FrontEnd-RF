import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, useMediaQuery } from "@mui/material";
import { Compass, History, Package, X } from "lucide-react";
import WorkspaceFrame from "../../components/dashboard/WorkspaceFrame";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { MaterialStorefront } from "../company/CompanyLibrary";
import { createDemoProducts } from "../company/companyDemo";
import { MaterialImage, TypeBadge } from "../company/CompanyUi";
import { categoryLabel, conditionLabel, money, number, statusLabel, type CompanyProduct } from "../company/companyTypes";
import UserRecords from "./UserRecords";
type Section = "explorar" | "reservas" | "historico";

export default function DashboardUsuario({ preview = false }: { preview?: boolean }) {
  const { displayName } = useLoggedUser({ fallbackName: "Visitante", previewName: preview ? "Visitante" : undefined });
  const [section, setSection] = useState<Section>("explorar");
  const [demo, setDemo] = useState(preview);
  const [products] = useState(createDemoProducts);
  const [detail, setDetail] = useState<CompanyProduct | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const label = section === "explorar" ? "Explorar materiais" : section === "reservas" ? "Minhas reservas" : "Histórico";
  const nav = [{ key: "explorar", label: "Explorar", Icon: Compass }, { key: "reservas", label: "Reservas", Icon: Package }, { key: "historico", label: "Histórico", Icon: History }] as const;
  function changeSection(next: Section) { setSection(next); window.scrollTo({ top: 0, behavior: "instant" }); }
  return <WorkspaceFrame user name={displayName} section={label} preview={preview} navigation={nav.map(({ key, label: text, Icon }) => <button key={key} type="button" aria-current={section === key ? "page" : undefined} onClick={() => changeSection(key)}><Icon size={23} strokeWidth={1.5} aria-hidden="true" /><span>{text}</span></button>)}>
    <div className={`user-dashboard ${section !== "explorar" ? "user-dashboard-records" : ""}`}>
      {section === "explorar" ? <>
        <div className="activity-notice"><p><span aria-hidden="true" />{demo ? "Materiais de exemplo. Nenhuma compra ou reserva real é realizada nesta tela." : "Consulta real ainda indisponível. Você pode visualizar exemplos."}</p><button type="button" aria-pressed={demo} onClick={() => { setDemo(!demo); setDetail(null); }}>{demo ? "Ocultar exemplos" : "Explorar exemplos"}</button></div>
        <MaterialStorefront products={demo ? products : []} preview={demo} onSelect={setDetail} />
      </> : <>
        <header key={section} className="activity-page-heading"><div><p className="company-eyebrow">Meu espaço</p><h1>{section === "reservas" ? "Minhas reservas" : "Histórico de reservas"}</h1><p>{section === "reservas" ? "Acompanhe as solicitações e confira quais já foram confirmadas." : "Consulte os materiais e as quantidades das reservas concluídas."}</p></div><span className="workspace-heading-symbol" aria-hidden="true">{section === "reservas" ? <Package size={28} strokeWidth={1.4} /> : <History size={28} strokeWidth={1.4} />}</span></header>
        <div className="activity-notice"><p><span aria-hidden="true" />{demo ? "Dados de exemplo. Nenhuma reserva real é criada nesta tela." : "Consulta real ainda indisponível. Você pode visualizar exemplos."}</p><button type="button" aria-pressed={demo} onClick={() => setDemo(!demo)}>{demo ? "Ocultar exemplos" : "Explorar exemplos"}</button></div>
        <UserRecords key={`${section}-${demo}`} kind={section} demo={demo} onExplore={() => changeSection("explorar")} />
      </>}

    </div>
    <Dialog transitionDuration={reducedMotion ? 0 : { enter: 180, exit: 120 }} open={Boolean(detail)} onClose={() => setDetail(null)} maxWidth="sm" fullWidth aria-labelledby="buyer-material-title" slotProps={{ paper: { className: "user-material-dialog" } }}>
      <DialogTitle className="flex items-center justify-between gap-4"><span id="buyer-material-title">Detalhes do material</span><button type="button" onClick={() => setDetail(null)} className="company-icon-button" aria-label="Fechar detalhes"><X size={20} /></button></DialogTitle>
      <DialogContent>{detail && <>
        <MaterialImage key={detail.id} product={detail} large />
        <div className="buyer-material-meta"><TypeBadge type={detail.type} /><span>{categoryLabel(detail.category)} · {conditionLabel(detail.condition)}</span></div>
        <h2 className="workspace-title mt-2">{detail.name}</h2>
        <div className="market-product-value mt-5"><strong>{detail.type === "donation" ? "Doação" : detail.price !== null ? money(detail.price) : "Valor não informado"}</strong><small>{detail.type === "donation" ? "Sem custo pelo material" : "Valor do anúncio"}</small></div>
        <p className="workspace-description">{detail.description || "Descrição não informada."}</p>
        <p className="mt-5 text-sm">{number(detail.quantity)} un. · {number(detail.weight)} kg · {statusLabel(detail.status)}</p>
        <p className="workspace-demo-detail">Material demonstrativo. A consulta real de anúncios e a solicitação de reserva ainda não estão integradas neste painel.</p>
        <button type="button" className="company-secondary mt-5" onClick={() => setDetail(null)}>Continuar explorando</button>
      </>}</DialogContent>
    </Dialog>
  </WorkspaceFrame>;
}
