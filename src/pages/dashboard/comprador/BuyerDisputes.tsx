import { useCallback, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { atualizarDisputa, criarDisputa, listarDisputas, listarReservas, type BuyerDispute, type DisputeType } from "../../../axios/Axios";
import { apiError, apiStatus } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { dateLabel, shoppingLabel } from "./buyerPresentation";

const types: Record<DisputeType, string> = { material_incompativel: "Material incompatível", nao_retirado: "Material não retirado", nao_comparecimento: "Não comparecimento", comportamento_inadequado: "Comportamento inadequado", item_danificado: "Item danificado", outro: "Outro motivo" };
const statuses: Record<string, string> = { aberta: "Aberta", em_analise: "Em análise", resolvida: "Resolvida", rejeitada: "Rejeitada" };

export default function BuyerDisputes({ userId }: { userId: string }) {
  const [params, setParams] = useSearchParams();
  const highlighted = params.get("disputa");
  const [shoppingId, setShoppingId] = useState(params.get("reserva") ?? "");
  const [type, setType] = useState<DisputeType>("outro");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<BuyerDispute | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const loader = useCallback(async (signal: AbortSignal) => {
    const [disputes, shoppings] = await Promise.all([listarDisputas(signal), listarReservas(signal)]);
    return { data: { disputes: [...new Map(requireArray(disputes.data).map(item => [item.id, item])).values()], shoppings: requireArray(shoppings.data) } };
  }, []);
  const resource = useApiResource(loader);
  function reset() { setEditing(null); setShoppingId(""); setType("outro"); setDescription(""); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    if (!description.trim() || (!editing && !resource.data?.shoppings.some(item => item.id === shoppingId))) { setError("Selecione uma reserva e descreva o problema."); return; }
    setBusy(true); setError(""); setSuccess("");
    try {
      if (editing) await atualizarDisputa(editing.id, { type, description: description.trim() });
      else await criarDisputa({ id_shopping: shoppingId, type, description: description.trim() });
      setSuccess(editing ? "Disputa atualizada." : "Disputa aberta. Acompanhe a análise por aqui."); reset(); resource.reload();
    } catch (cause) { setError(apiStatus(cause) === 409 ? "Já existe uma disputa ativa ou a situação mudou. Atualize a lista antes de continuar." : apiError(cause, "Não foi possível salvar a disputa. Sua descrição foi preservada.")); }
    finally { setBusy(false); }
  }
  const rows = resource.data?.disputes.filter(item => !highlighted || item.id === highlighted) ?? [];
  return <section className="space-y-6"><h1 className={s.title}>Disputas</h1><p className={s.copy}>Registre um problema da reserva e acompanhe a análise. A resolução é feita pela administração.</p>
    <RequestState {...resource} retry={resource.reload} />
    <button type="button" disabled={busy || resource.loading} onClick={resource.reload} className={s.secondary}>Atualizar disputas</button>
    {error && <p role="alert" className={s.error}>{error}</p>}{success && <p role="status" className={s.success}>{success}</p>}
    {!resource.loading && !resource.error && <>
      {(editing || !!resource.data?.shoppings.length) && <form onSubmit={submit} className={`${s.panel} space-y-5`}><h2 className={s.subtitle}>{editing ? "Editar disputa aberta" : "Abrir disputa"}</h2>
        <fieldset disabled={busy} className="space-y-4"><legend className="sr-only">Dados da disputa</legend>
          {!editing && <label className={s.label}>Reserva<select required value={shoppingId} onChange={event => setShoppingId(event.target.value)} className={s.input}><option value="">Selecione uma reserva</option>{resource.data?.shoppings.map(item => <option key={item.id} value={item.id}>{dateLabel(item.datetime)} · {shoppingLabel(item.status)} · {item.id.slice(0, 8)}</option>)}</select></label>}
          <label className={s.label}>Motivo<select value={type} onChange={event => setType(event.target.value as DisputeType)} className={s.input}>{Object.entries(types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className={s.label}>Descrição do problema<textarea required rows={5} maxLength={5000} value={description} onChange={event => setDescription(event.target.value)} className={s.input} /></label>
          <p className={s.copy}>Descreva o ocorrido sem incluir senhas, dados bancários ou documentos pessoais.</p>
        </fieldset><div className="flex flex-wrap gap-3"><button disabled={busy} className={s.button}>{busy ? "Salvando..." : "Salvar disputa"}</button>{editing && <button type="button" disabled={busy} onClick={reset} className={s.secondary}>Cancelar edição</button>}</div>
      </form>}
      {highlighted && <button className={s.secondary} onClick={() => setParams({ aba: "disputas" })}>Ver todas as disputas</button>}
      {!rows.length ? <p className={s.notice}>{highlighted ? "Esta disputa não foi encontrada entre as suas reservas." : "Nenhuma disputa registrada."}</p> : <ul className="space-y-4">{rows.map(item => <li key={item.id} className={`${s.panel} space-y-4`}><h2 className={s.subtitle}>{types[item.type] ?? "Disputa da reserva"}</h2><p className="font-semibold">{statuses[item.status] ?? "Situação em atualização"}</p><p className={`${s.copy} whitespace-pre-wrap break-words`}>{item.description}</p>{item.resolution && <p className={s.notice}>Resposta da administração: {item.resolution}</p>}<p className={s.copy}>{dateLabel(item.created_in)}</p><div className="flex flex-wrap gap-3"><Link className={s.secondary} to={`/dashboardUsuario?aba=reservas&reserva=${encodeURIComponent(item.id_shopping)}`}>Abrir reserva</Link>{item.status === "aberta" && item.id_opened_by.toLowerCase() === userId.toLowerCase() && <button type="button" disabled={busy} className={s.secondary} onClick={() => { setEditing(item); setType(item.type); setDescription(item.description); setError(""); }}>Editar disputa</button>}</div></li>)}</ul>}
    </>}
  </section>;
}
