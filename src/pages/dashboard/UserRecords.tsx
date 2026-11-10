import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, useMediaQuery } from "@mui/material";
import { ArrowRight, Check, CircleCheck, Clock3, Layers3, Package, Search, Spool, X } from "lucide-react";
import { useCollectionMotion } from "../../hooks/useCollectionMotion";
import { userReservationExamples, type ReservationExample, type ReservationStatus } from "./userReservationExamples";

const date = new Intl.DateTimeFormat("pt-BR");
const month = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const dateLabel = (value: string) => date.format(new Date(`${value}T12:00:00`));
const statusCopy: Record<ReservationStatus, string> = {
  Pendente: "Aguardando a confirmação da empresa.",
  Confirmada: "Solicitação confirmada pela empresa neste exemplo.",
  Concluída: "Reserva concluída neste exemplo.",
};

function RecordVisual({ item }: { item: ReservationExample }) {
  const Icon = item.id === "exemplo-madeira" ? Layers3 : Spool;
  return <span className="activity-thumbnail" aria-hidden="true">{item.image ? <img src={item.image} width={48} height={48} alt="" loading="lazy" /> : <Icon size={24} strokeWidth={1.4} />}</span>;
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const Icon = status === "Pendente" ? Clock3 : status === "Confirmada" ? Check : CircleCheck;
  return <span className={`activity-badge ${status === "Pendente" ? "is-pending" : "is-confirmed"}`}><Icon size={13} aria-hidden="true" />{status}</span>;
}

export default function UserRecords({ kind, demo, onExplore }: { kind: "reservas" | "historico"; demo: boolean; onExplore: () => void }) {
  const history = kind === "historico";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todas");
  const [period, setPeriod] = useState("");
  const [selected, setSelected] = useState<ReservationExample | null>(null);
  const records = demo ? userReservationExamples.filter(item => history ? item.status === "Concluída" : item.status !== "Concluída") : [];
  const filtered = records.filter(item => item.name.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")) && (status === "Todas" || item.status === status) && (!period || item.date.startsWith(period)));
  const listRef = useRef<HTMLElement>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  useCollectionMotion(listRef, filtered.map(item => item.id).join(","));
  const periods = [...new Set(records.map(item => item.date.slice(0, 7)))].sort().reverse();
  const hasFilter = Boolean(search || status !== "Todas" || period);
  function clearFilters() { setSearch(""); setStatus("Todas"); setPeriod(""); }

  return <section ref={listRef} className="activity-view" aria-label={history ? "Histórico de reservas" : "Acompanhamento de reservas"}>
    <div className="activity-summary"><span>{demo ? `${records.length} ${history ? "concluída" : "reserva"}${records.length === 1 ? "" : "s"}` : "Consulta ainda indisponível"}</span>{demo && !history && <span>{records.filter(item => item.status === "Pendente").length} aguardando confirmação</span>}<button type="button" onClick={onExplore}>Explorar materiais<ArrowRight size={15} aria-hidden="true" /></button></div>
    <div className="activity-panel">
      {!history && <div className="activity-tabs" aria-label="Filtrar reservas por situação">{[{ value: "Todas", label: "Todas" }, { value: "Pendente", label: "Aguardando confirmação" }, { value: "Confirmada", label: "Confirmadas" }].map(item => <button key={item.value} type="button" aria-pressed={status === item.value} onClick={() => setStatus(item.value)}>{item.label}<span>{demo ? (item.value === "Todas" ? records.length : records.filter(record => record.status === item.value).length) : "—"}</span></button>)}</div>}
      <div className="activity-toolbar"><label className="activity-search"><Search size={17} aria-hidden="true" /><span className="sr-only">{history ? "Buscar no histórico" : "Buscar reservas"}</span><input type="search" placeholder="Buscar material" value={search} onChange={event => setSearch(event.target.value)} /></label><label className="activity-select"><span className="sr-only">Filtrar por período</span><select value={period} onChange={event => setPeriod(event.target.value)}><option value="">Todos os períodos</option>{periods.map(value => <option key={value} value={value}>{month.format(new Date(`${value}-01T12:00:00`))}</option>)}</select></label>{hasFilter && <button type="button" className="activity-clear" onClick={clearFilters}>Limpar filtros<X size={13} aria-hidden="true" /></button>}</div>
      <p className="activity-results" role="status">{demo ? `${filtered.length} ${filtered.length === 1 ? "registro encontrado" : "registros encontrados"}` : "Ative os exemplos para visualizar os registros."}</p>
      {filtered.length ? <table className="activity-table"><caption className="sr-only">{history ? "Reservas concluídas — dados de exemplo" : "Reservas em andamento — dados de exemplo"}</caption><thead><tr><th scope="col">Material</th><th scope="col">Situação</th><th scope="col">Quantidade</th><th scope="col">{history ? "Data do registro" : "Solicitada em"}</th><th scope="col"><span className="sr-only">Ações</span></th></tr></thead><tbody>{filtered.map(item => <tr className="activity-row" data-motion-key={item.id} key={item.id}>
        <th scope="row" className="activity-material"><div><RecordVisual item={item} /><div><span>{item.name}</span><small>{item.type}</small></div></div></th>
        <td data-label="Situação"><StatusBadge status={item.status} /></td>
        <td data-label="Quantidade" className="activity-quantity">{item.quantity}</td>
        <td data-label={history ? "Data do registro" : "Solicitada em"}><time dateTime={item.date}>{dateLabel(item.date)}</time></td>
        <td className="activity-action"><button type="button" onClick={() => setSelected(item)} aria-label={`Ver detalhes de ${item.name}`}>Detalhes<ArrowRight size={14} aria-hidden="true" /></button></td>
      </tr>)}</tbody></table> : <div className="activity-empty"><Package size={28} strokeWidth={1.4} aria-hidden="true" /><h2>{!demo ? "Consulta ainda não disponível" : hasFilter ? "Nenhum registro encontrado" : "Nenhum registro nesta seção"}</h2><p>{!demo ? "A consulta real ainda não está integrada. Visualize os exemplos para conhecer a organização da tela." : hasFilter ? "Altere a busca ou limpe os filtros para ver os registros." : "Os registros aparecerão aqui quando estiverem disponíveis."}</p>{hasFilter && <button type="button" className="company-secondary" onClick={clearFilters}>Limpar filtros</button>}</div>}
    </div>
    <Dialog transitionDuration={reducedMotion ? 0 : { enter: 180, exit: 120 }} open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth aria-labelledby="reservation-dialog-title" slotProps={{ paper: { className: "activity-dialog" } }}>
      <DialogTitle className="activity-dialog-heading"><span id="reservation-dialog-title">{history ? "Detalhes do registro" : "Detalhes da reserva"}</span><button type="button" className="company-icon-button" aria-label="Fechar detalhes" onClick={() => setSelected(null)}><X size={20} /></button></DialogTitle>
      <DialogContent>{selected && <><div className="activity-detail-material"><RecordVisual item={selected} /><div><h2>{selected.name}</h2><span>{selected.type}</span></div></div><dl className="activity-detail-list"><div><dt>Situação</dt><dd><StatusBadge status={selected.status} /></dd></div><div><dt>Quantidade</dt><dd>{selected.quantity}</dd></div><div><dt>{history ? "Data do registro" : "Solicitada em"}</dt><dd>{dateLabel(selected.date)}</dd></div></dl><p className="activity-status-description">{statusCopy[selected.status]}</p><p className="activity-detail-note">Dados de exemplo. Este registro não representa uma reserva, retirada ou pagamento real.</p><button type="button" className="company-secondary" onClick={() => setSelected(null)}>Fechar detalhes</button></>}</DialogContent>
    </Dialog>
  </section>;
}
