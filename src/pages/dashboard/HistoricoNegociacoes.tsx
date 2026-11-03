import { useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardList, Search } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyPage, { DemoNotice } from "./CompanyPage";
import { companyStyles as styles } from "./companyStyles";

// Exemplos locais da referência visual, sem dados pessoais ou operações persistidas.
const examples = [
  { id: "exemplo-01", date: "2026-11-02", material: "Retalhos de tecido", quantity: "120 kg", type: "Doação", value: 0, status: "Concluída" },
  { id: "exemplo-02", date: "2026-11-01", material: "Pallets de madeira", quantity: "8 un.", type: "Venda", value: 240, status: "Em andamento" },
  { id: "exemplo-03", date: "2026-10-28", material: "Aparas de borracha", quantity: "50 kg", type: "Doação", value: 0, status: "Concluída" },
  { id: "exemplo-04", date: "2026-10-25", material: "Sobras de papelão", quantity: "30 kg", type: "Venda", value: 60, status: "Cancelada" },
];
const statuses = ["Todas", "Em andamento", "Concluída", "Cancelada"];
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateLabel = (date: string) => date.split("-").reverse().join("/");

export default function HistoricoNegociacoes() {
  const [demo, setDemo] = useState(false);
  const [status, setStatus] = useState("Todas");
  const [search, setSearch] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const invalidDates = Boolean(start && end && start > end);
  const filtered = (demo ? examples : []).filter(item => (status === "Todas" || item.status === status) && item.material.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")) && (!start || item.date >= start) && (!end || item.date <= end));
  const detail = !invalidDates ? filtered.find(item => item.id === selected) : undefined;

  function clearFilters() { setStatus("Todas"); setSearch(""); setStart(""); setEnd(""); setSelected(null); }

  return <CompanyPage>
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><h1 className={styles.title}>Histórico de Negociações</h1><p className={styles.description}>Acompanhe o destino dos seus materiais e o andamento das negociações.</p></div><div className="flex gap-6 rounded-xl border border-linha bg-white px-5 py-4"><div><p className="text-xs text-tinta-suave">Valor negociado</p><p className="mt-1 font-bold text-verde-escuro">{demo ? currency.format(240) : "—"}</p></div><div className="border-l border-linha pl-6"><p className="text-xs text-tinta-suave">Negociações</p><p className="mt-1 font-bold text-verde-escuro">{demo ? examples.length : "—"}</p></div></div></div>
    <DemoNotice active={demo} onToggle={() => { setDemo(!demo); clearFilters(); }}>{demo ? "Use os filtros e os detalhes para explorar os exemplos. Nenhuma negociação será realizada." : "O histórico dos materiais da empresa ainda não está disponível. Os exemplos mostram como será a consulta."}</DemoNotice>
    <section className={styles.card} aria-label="Consulta de negociações">
      <div className="flex flex-wrap gap-2" aria-label="Filtrar por situação">{statuses.map(item => <button key={item} type="button" aria-pressed={status === item} onClick={() => { setStatus(item); setSelected(null); }} className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${status === item ? "bg-verde text-white" : "bg-bruma text-tinta-suave hover:bg-verde-claro"}`}>{item}</button>)}</div>
      <div className="my-5 grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_180px_180px_auto]">
        <label className="text-sm font-medium text-tinta">Buscar material<div className="relative"><Search size={17} className="pointer-events-none absolute left-3 top-5 text-tinta-suave" aria-hidden="true" /><input type="search" value={search} onChange={e => setSearch(e.target.value)} className={`${styles.input} pl-10`} placeholder="Nome do material" /></div></label>
        <label className="text-sm font-medium text-tinta">De<input type="date" value={start} onChange={e => setStart(e.target.value)} aria-invalid={invalidDates} aria-describedby={invalidDates ? "erro-periodo" : undefined} className={`${styles.input} min-w-0`} /></label>
        <label className="text-sm font-medium text-tinta">Até<input type="date" value={end} onChange={e => setEnd(e.target.value)} aria-invalid={invalidDates} aria-describedby={invalidDates ? "erro-periodo" : undefined} className={`${styles.input} min-w-0`} /></label>
        <button type="button" onClick={clearFilters} className={styles.secondary}>Limpar filtros</button>
      </div>
      {invalidDates && <p id="erro-periodo" role="alert" className="mb-4 text-sm text-danger">A data final deve ser igual ou posterior à data inicial.</p>}
      <p role="status" className="mb-4 text-xs text-tinta-suave">{filtered.length} {filtered.length === 1 ? "negociação encontrada" : "negociações encontradas"}{demo ? " na demonstração" : ""}</p>
      {filtered.length && !invalidDates ? <div className="overflow-x-auto rounded-lg border border-linha"><table className="w-full min-w-[640px] text-left text-sm"><caption className="sr-only">Negociações demonstrativas, sem dados reais da conta</caption><thead className="bg-bruma text-xs text-tinta-suave"><tr>{["Data", "Material", "Quantidade", "Modalidade", "Valor", "Situação", "Ação"].map(label => <th scope="col" key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-linha">{filtered.map(item => <tr key={item.id} className="hover:bg-bruma/50"><td className="whitespace-nowrap px-4 py-4 text-tinta-suave">{dateLabel(item.date)}</td><th scope="row" className="px-4 py-4 font-semibold text-verde-escuro">{item.material}</th><td className="px-4 py-4 text-tinta-suave">{item.quantity}</td><td className="px-4 py-4">{item.type}</td><td className="whitespace-nowrap px-4 py-4">{item.type === "Doação" ? "Sem custo" : currency.format(item.value)}</td><td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "Concluída" ? "bg-verde-claro text-verde-escuro" : item.status === "Cancelada" ? "bg-bruma text-tinta-suave" : "bg-ambar-fundo text-ambar"}`}>{item.status}</span></td><td className="px-3 py-2"><button className="grid h-11 w-11 place-items-center rounded-lg text-verde hover:bg-verde-claro" type="button" onClick={() => setSelected(item.id)} aria-expanded={selected === item.id} aria-controls="detalhes-negociacao" aria-label={`Ver detalhes de ${item.material}`}><ArrowRight size={18} aria-hidden="true" /></button></td></tr>)}</tbody></table></div> : <div className="grid min-h-64 place-content-center px-4 text-center"><ClipboardList size={36} className="mx-auto text-verde" aria-hidden="true" /><h2 className="mt-4 font-bold text-verde-escuro">{demo ? "Nenhuma negociação neste filtro" : "Seu histórico aparecerá aqui"}</h2><p className="mt-2 max-w-md text-sm leading-relaxed text-tinta-suave">{demo ? "Altere a busca, a situação ou o período para consultar outros exemplos." : "Quando a consulta estiver disponível, você poderá acompanhar as negociações dos materiais publicados."}</p><Link to="/dashboardEmpresa/materiais" className="mx-auto mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-verde"><ArrowLeft size={16} aria-hidden="true" />Ver meus materiais</Link></div>}
      {detail && <section id="detalhes-negociacao" aria-label="Detalhes da negociação demonstrativa" className="mt-5 rounded-xl bg-bruma p-5"><div className="flex flex-wrap items-start justify-between gap-3"><h2 className="font-bold text-verde-escuro">{detail.material}</h2><button type="button" className="min-h-11 text-sm font-semibold text-verde" onClick={() => setSelected(null)}>Fechar detalhes</button></div><dl className="mt-3 grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-tinta-suave">Data</dt><dd className="mt-1 font-semibold">{dateLabel(detail.date)}</dd></div><div><dt className="text-tinta-suave">Quantidade</dt><dd className="mt-1 font-semibold">{detail.quantity}</dd></div><div><dt className="text-tinta-suave">Situação</dt><dd className="mt-1 font-semibold">{detail.status}</dd></div></dl><p className="mt-4 text-xs text-tinta-suave">Registro fictício para demonstração. Não é uma reserva ou confirmação de pagamento.</p></section>}
    </section>
  </CompanyPage>;
}
