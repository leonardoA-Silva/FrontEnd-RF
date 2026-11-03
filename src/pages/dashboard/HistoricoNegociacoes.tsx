import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { ArrowRight, Check, ClipboardList, Clock3, Search, SlidersHorizontal, X } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyPage from "./CompanyPage";

// Dados exclusivamente demonstrativos, sem operações persistidas.
const examples = [
  { id: "exemplo-01", date: "2026-11-02", material: "Retalhos de tecido", quantity: "120 kg", type: "Doação", value: 0, status: "Concluída" },
  { id: "exemplo-02", date: "2026-11-01", material: "Pallets de madeira", quantity: "8 un.", type: "Venda", value: 240, status: "Em andamento" },
  { id: "exemplo-03", date: "2026-10-28", material: "Aparas de borracha", quantity: "50 kg", type: "Doação", value: 0, status: "Concluída" },
  { id: "exemplo-04", date: "2026-10-25", material: "Sobras de papelão", quantity: "30 kg", type: "Venda", value: 60, status: "Cancelada" },
];
const statuses = ["Todas", "Em andamento", "Concluída", "Cancelada"];
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateLabel = (date: string) => date.split("-").reverse().join("/");

function NegotiationStatus({ status }: { status: string }) {
  const Icon = status === "Em andamento" ? Clock3 : status === "Cancelada" ? X : Check;
  return <span className={`activity-badge ${status === "Em andamento" ? "is-pending" : status === "Cancelada" ? "is-cancelled" : "is-confirmed"}`}><Icon size={13} aria-hidden="true" />{status}</span>;
}

export default function HistoricoNegociacoes({ preview = false }: { preview?: boolean }) {
  const [demo, setDemo] = useState(preview);
  const [status, setStatus] = useState("Todas");
  const [search, setSearch] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [datesOpen, setDatesOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const invalidDates = Boolean(start && end && start > end);
  const filtered = (demo ? examples : []).filter(item => (status === "Todas" || item.status === status) && item.material.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")) && (!start || item.date >= start) && (!end || item.date <= end));
  const detail = !invalidDates ? filtered.find(item => item.id === selected) : undefined;
  const hasFilter = Boolean(search || status !== "Todas" || start || end);
  function clearFilters() { setStatus("Todas"); setSearch(""); setStart(""); setEnd(""); setSelected(null); }

  return <CompanyPage>
    <header className="activity-page-heading"><h1>Negociações</h1><p>Consulte a situação, as quantidades e os valores dos seus materiais.</p></header>
    <div className="activity-notice"><p><span aria-hidden="true" />{demo ? "Dados de exemplo. Nenhuma negociação real é realizada nesta tela." : "A consulta de negociações da empresa ainda não está integrada."}</p><button type="button" aria-pressed={demo} onClick={() => { setDemo(!demo); clearFilters(); }}>{demo ? "Ocultar exemplos" : "Visualizar exemplo"}</button></div>
    <section className="activity-view" aria-label="Consulta de negociações">
      <div className="activity-summary"><span>{demo ? `${examples.length} negociações nos exemplos` : "Consulta ainda indisponível"}</span><Link to={preview ? "/previa/dashboard/empresa" : "/dashboardEmpresa/materiais"}>Meus materiais<ArrowRight size={15} aria-hidden="true" /></Link></div>
      <div className="activity-panel">
        <div className="activity-tabs" aria-label="Filtrar negociações por situação">{statuses.map(item => <button key={item} type="button" aria-pressed={status === item} onClick={() => { setStatus(item); setSelected(null); }}>{item}<span>{demo ? item === "Todas" ? examples.length : examples.filter(record => record.status === item).length : "—"}</span></button>)}</div>
        <div className="activity-toolbar"><label className="activity-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Buscar negociações por material</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar material" /></label><button type="button" className="activity-period-button" aria-expanded={datesOpen} aria-controls="periodo-negociacoes" onClick={() => setDatesOpen(!datesOpen)}><SlidersHorizontal size={16} aria-hidden="true" />{start || end ? "Período selecionado" : "Período"}</button>{hasFilter && <button type="button" onClick={clearFilters} className="activity-clear">Limpar filtros<X size={13} aria-hidden="true" /></button>}</div>
        {datesOpen && <div id="periodo-negociacoes" className="activity-date-range"><label>De<input type="date" value={start} onChange={e => setStart(e.target.value)} aria-invalid={invalidDates} aria-describedby={invalidDates ? "erro-periodo" : undefined} /></label><label>Até<input type="date" value={end} onChange={e => setEnd(e.target.value)} aria-invalid={invalidDates} aria-describedby={invalidDates ? "erro-periodo" : undefined} /></label><button type="button" onClick={() => { setStart(""); setEnd(""); }}>Limpar período</button></div>}
        {invalidDates && <p id="erro-periodo" role="alert" className="activity-validation">A data final deve ser igual ou posterior à data inicial.</p>}
        <p role="status" className="activity-results">{!demo ? "Ative os exemplos para visualizar os registros." : invalidDates ? "Confira o período para consultar os registros." : `${filtered.length} ${filtered.length === 1 ? "negociação encontrada" : "negociações encontradas"}`}</p>
        {filtered.length > 0 && !invalidDates ? <table className="activity-table activity-negotiations"><caption className="sr-only">Negociações demonstrativas, sem dados reais da conta</caption><thead><tr>{["Material", "Situação", "Quantidade", "Valor", "Data", "Ações"].map(label => <th scope="col" key={label}>{label === "Ações" ? <span className="sr-only">Ações</span> : label}</th>)}</tr></thead><tbody>{filtered.map(item => <tr className="activity-row" key={item.id}>
          <th scope="row" className="activity-material"><div><div><span>{item.material}</span><small>{item.type}</small></div></div></th>
          <td data-label="Situação"><NegotiationStatus status={item.status} /></td><td data-label="Quantidade" className="activity-quantity">{item.quantity}</td><td data-label="Valor">{item.type === "Doação" ? "Sem custo" : currency.format(item.value)}</td><td data-label="Data"><time dateTime={item.date}>{dateLabel(item.date)}</time></td><td className="activity-action"><button type="button" onClick={() => setSelected(item.id)} aria-label={`Ver detalhes de ${item.material}`}>Detalhes<ArrowRight size={14} aria-hidden="true" /></button></td>
        </tr>)}</tbody></table> : <div className="activity-empty"><ClipboardList size={28} strokeWidth={1.4} aria-hidden="true" /><h2>{invalidDates ? "Período inválido" : !demo ? "Consulta ainda não disponível" : "Nenhuma negociação encontrada"}</h2><p>{invalidDates ? "Ajuste as datas para visualizar os registros." : !demo ? "Visualize os exemplos para conhecer a organização das negociações." : "Altere a busca, a situação ou o período para encontrar os registros."}</p>{demo && hasFilter && <button type="button" className="company-secondary" onClick={clearFilters}>Limpar filtros</button>}</div>}
      </div>
    </section>
    <Dialog open={Boolean(detail)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth aria-labelledby="negotiation-dialog-title" slotProps={{ paper: { className: "activity-dialog" } }}><DialogTitle className="activity-dialog-heading"><span id="negotiation-dialog-title">Detalhes da negociação</span><button type="button" aria-label="Fechar detalhes" className="company-icon-button" onClick={() => setSelected(null)}><X size={20} /></button></DialogTitle><DialogContent>{detail && <><div className="activity-detail-material"><div><h2>{detail.material}</h2><span>{detail.type}</span></div></div><dl className="activity-detail-list"><div><dt>Situação</dt><dd><NegotiationStatus status={detail.status} /></dd></div><div><dt>Quantidade</dt><dd>{detail.quantity}</dd></div><div><dt>Valor</dt><dd>{detail.type === "Doação" ? "Sem custo" : currency.format(detail.value)}</dd></div><div><dt>Data</dt><dd>{dateLabel(detail.date)}</dd></div></dl><p className="activity-detail-note">Registro fictício para demonstração. Não é uma reserva nem uma confirmação de pagamento.</p><button type="button" className="company-secondary" onClick={() => setSelected(null)}>Fechar detalhes</button></>}</DialogContent></Dialog>
  </CompanyPage>;
}
