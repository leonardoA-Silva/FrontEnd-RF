import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, useMediaQuery } from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldAlert, X } from "lucide-react";
import { loadDisputes, type Dispute } from "./companyResourceApi";
import { useCompanyResource } from "./useCompanyResource";
import { useCompany } from "./CompanyContext";
import { uuidPattern } from "./companyTypes";

const types: Record<string, string> = { material_incompativel: "Material incompatível", nao_retirado: "Material não retirado", nao_comparecimento: "Não comparecimento", comportamento_inadequado: "Comportamento inadequado", item_danificado: "Item danificado", outro: "Outro motivo" };
const statuses: Record<string, string> = { aberta: "Aberta", em_analise: "Em análise", resolvida: "Resolvida", rejeitada: "Rejeitada" };
export default function CompanyDisputes() {
  const { preview } = useCompany();
  return preview ? <div className="company-empty"><ShieldAlert size={30} /><h1>Disputas</h1><p>A consulta está disponível na área autenticada, com os registros vinculados à sua empresa.</p></div> : <LiveDisputes />;
}
function LiveDisputes() {
  const { rows, error, loading, reload } = useCompanyResource(loadDisputes);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [status, setStatus] = useState("all");
  const [params, setParams] = useSearchParams();
  const requestedId = params.get("disputa");
  const selected = requestedId && uuidPattern.test(requestedId) ? rows.find(row => row.id.toLowerCase() === requestedId.toLowerCase()) : undefined;
  function open(row: Dispute) { setParams(current => { const next = new URLSearchParams(current); next.set("disputa", row.id); return next; }); }
  function close() { setParams(current => { const next = new URLSearchParams(current); next.delete("disputa"); return next; }, { replace: true }); }
  const filtered = rows.filter(row => status === "all" || row.status === status);
  return <section><header className="company-page-heading"><div><p className="company-eyebrow">Acompanhamento</p><h1>Disputas</h1><p>Consulte as ocorrências das negociações vinculadas à sua empresa.</p></div><button type="button" className="company-button is-secondary" disabled={loading} onClick={reload}>Atualizar dados</button></header>
    {loading ? <p role="status">Carregando disputas…</p> : error ? <div role="alert" className="company-notice"><p>{error}</p><button type="button" onClick={reload}>Tentar novamente</button><Link to="/login">Entrar novamente</Link></div> : <><label className="company-field mb-5 block max-w-xs" htmlFor="dispute-status"><span>Situação</span><select id="dispute-status" value={status} onChange={e => setStatus(e.target.value)}><option value="all">Todas as situações</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><p role="status" className="mb-4 text-sm text-tinta-suave">{filtered.length} {filtered.length === 1 ? "registro encontrado" : "registros encontrados"}</p>
    {requestedId && !selected && <div role="alert" className="company-notice mb-5"><p>Esta disputa não foi encontrada ou não está disponível para sua conta.</p><button type="button" className="company-inline-link" onClick={close}>Voltar à lista de disputas</button></div>}{filtered.length ? <ul className="grid gap-4">{filtered.map(row => <li key={row.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-linha bg-white/60 p-5"><div><span className="company-badge">{statuses[row.status] ?? "Situação não reconhecida"}</span><h2 className="mt-3 font-semibold">{types[row.type] ?? "Ocorrência"}</h2><time className="mt-2 block text-sm text-tinta-suave" dateTime={row.at}>{new Date(row.at).toLocaleDateString("pt-BR")}</time></div><button type="button" className="company-button is-secondary" onClick={() => open(row)}>Ver detalhes</button></li>)}</ul> : <div className="company-empty"><ShieldAlert size={30} /><h2>{rows.length ? "Nenhuma disputa neste filtro" : "Nenhuma disputa registrada"}</h2><p>{rows.length ? "Escolha outra situação para consultar os registros." : "As ocorrências autorizadas para sua conta aparecerão aqui."}</p></div>}</>}
    <Dialog transitionDuration={reducedMotion ? 0 : { enter: 180, exit: 120 }} open={!loading && !error && !!selected} onClose={close} fullWidth maxWidth="sm" aria-labelledby="dispute-title"><DialogTitle className="flex items-center justify-between"><span id="dispute-title">Detalhes da disputa</span><button type="button" aria-label="Fechar detalhes" onClick={close}><X size={20} /></button></DialogTitle><DialogContent>{selected && <><span className="company-badge">{statuses[selected.status] ?? "Situação não reconhecida"}</span><h2 className="my-4 text-xl font-semibold">{types[selected.type] ?? "Ocorrência"}</h2><p className="whitespace-pre-wrap break-words">{selected.description || "Sem descrição."}</p><h3 className="mb-2 mt-6 font-semibold">Resolução</h3><p className="whitespace-pre-wrap break-words">{selected.resolution || "Ainda não há uma resolução registrada."}</p><p className="mt-6 text-sm text-tinta-suave">A resolução ou rejeição é feita pela administração.</p><button type="button" className="company-button mt-5" onClick={close}>Fechar detalhes</button></>}</DialogContent></Dialog>
  </section>;
}
