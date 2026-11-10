import { useCallback, useState, type FormEvent } from "react";
import { atualizarCartao, excluirCartao, listarCartoes, type BuyerCard } from "../../../axios/Axios";
import { apiError } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";

export default function BuyerCards() {
  const loader = useCallback(async (signal: AbortSignal) => { const response = await listarCartoes(signal); return { data: requireArray(response.data) }; }, []);
  const resource = useApiResource(loader);
  const [editing, setEditing] = useState<BuyerCard | null>(null);
  const [selected, setSelected] = useState<BuyerCard | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function remove() {
    if (busy || !selected) return;
    setBusy(true); setError("");
    try { await excluirCartao(selected.id); setSelected(null); setSuccess("Cartão removido."); resource.reload(); }
    catch (cause) { setError(apiError(cause, "Não foi possível remover o cartão.")); }
    finally { setBusy(false); }
  }
  if (editing) return <CardForm card={editing} cancel={() => setEditing(null)} saved={() => { setEditing(null); setSuccess("Dados do cartão atualizados."); resource.reload(); }} />;
  return <section className="space-y-6"><h1 className={s.title}>Meus cartões</h1><p role="alert" className={s.notice}>Você pode consultar e gerenciar cartões já vinculados à sua conta. O cadastro de novos cartões depende da integração com o provedor de pagamento; cobranças ainda não estão disponíveis.</p><button disabled={resource.loading} onClick={resource.reload} className={s.secondary}>Atualizar cartões</button>{success && <p role="status" className={s.success}>{success}</p>}<RequestState {...resource} retry={resource.reload} />
    {!resource.loading && !resource.error && (!resource.data?.length ? <p className={s.copy}>Nenhum cartão cadastrado.</p> : <ul className="grid gap-5 lg:grid-cols-2">{resource.data.map(card => <li key={card.id} className={`${s.panel} space-y-4`}><h2 className={s.subtitle}>{card.brand} · final {card.last_digits}</h2><p className={s.copy}>{card.type === "credit" ? "Crédito" : "Débito"} · validade {String(card.expiration_month).padStart(2, "0")}/{card.expiration_year}</p><p className={s.copy}>{card.holder_name}</p><div className="flex flex-wrap gap-3"><button onClick={() => setEditing(card)} className={s.secondary}>Editar cartão</button><button onClick={() => { setError(""); setSelected(card); }} className={s.secondary}>Remover cartão</button></div></li>)}</ul>)}
    {selected && <ConfirmAction title="Remover cartão?" description="O cartão será desvinculado da sua conta. Nenhuma cobrança é realizada nesta ação." busy={busy} error={error} confirm={remove} cancel={() => setSelected(null)} />}
  </section>;
}

function CardForm({ card, saved, cancel }: { card: BuyerCard; saved: () => void; cancel: () => void }) {
  const [name, setName] = useState(card.holder_name);
  const [expiry, setExpiry] = useState(`${card.expiration_year}-${String(card.expiration_month).padStart(2, "0")}`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    const [year, month] = expiry.split("-").map(Number);
    const now = new Date();
    if (!name.trim() || !Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12 || year < now.getFullYear() || year > 9999 || (year === now.getFullYear() && month < now.getMonth() + 1)) { setError("Confira o nome do titular e informe uma validade atual ou futura."); return; }
    setBusy(true); setError("");
    try { await atualizarCartao(card.id, { holder_name: name.trim(), expiration_month: month, expiration_year: year }); saved(); }
    catch (cause) { setError(apiError(cause, "Não foi possível atualizar o cartão.")); }
    finally { setBusy(false); }
  }
  return <section className="max-w-2xl space-y-6"><h1 className={s.title}>Editar cartão</h1><form onSubmit={submit} className={`${s.panel} space-y-6`}><p className={s.copy}>{card.brand} · final {card.last_digits}</p><fieldset disabled={busy} className="space-y-5"><legend className="sr-only">Dados do cartão</legend><label className={s.label}>Nome do titular *<input required maxLength={100} autoComplete="cc-name" value={name} onChange={e => setName(e.target.value)} className={s.input} /></label><label className={s.label}>Validade *<input required type="month" value={expiry} onChange={e => setExpiry(e.target.value)} className={s.input} /></label></fieldset>{error && <p role="alert" className={s.error}>{error}</p>}<div className="flex flex-wrap gap-3"><button disabled={busy} className={s.button}>{busy ? "Salvando..." : "Salvar cartão"}</button><button type="button" disabled={busy} onClick={cancel} className={s.secondary}>Voltar aos cartões</button></div></form></section>;
}
