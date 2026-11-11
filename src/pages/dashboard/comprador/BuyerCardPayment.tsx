import { useCallback, useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { listarCartoes, excluirCartao, type BuyerCard, type BuyerPaymentResult, type Shopping } from "../../../api/services";
import { cardMethods, paymentConfiguration, payCard, saveCard, tokenizeCard, type CardMethod } from "../../../api/cardPayments";
import { useApiResource, requireArray } from "../../../hooks/useApiResource";
import { apiError, apiStatus } from "../../../axios/apiError";
import RequestState from "./RequestState";
import ConfirmAction from "./ConfirmAction";
import { buyerStyles as s } from "./buyerStyles";
import { money } from "./buyerPresentation";

export default function BuyerCardPayment({ shopping, onResult, onUncertain, onBusy }: { shopping: Shopping; onResult: (result: BuyerPaymentResult) => void; onUncertain: (id?: string) => void; onBusy: (busy: boolean) => void }) {
  const loader = useCallback(async (signal: AbortSignal) => {
    const [config, cards] = await Promise.all([paymentConfiguration(signal), listarCartoes(signal)]);
    return { data: { config: config.data, cards: requireArray(cards.data) } };
  }, []);
  const resource = useApiResource(loader);
  const [selected, setSelected] = useState<BuyerCard | null>(null);
  const [deleting, setDeleting] = useState<BuyerCard | null>(null);
  const [card, setCard] = useState({ number: "", holder: "", month: "", year: "", cvv: "", cpf: "" });
  const [type, setType] = useState("credit"), [remember, setRemember] = useState(true);
  const [methods, setMethods] = useState<CardMethod[]>([]), [identifying, setIdentifying] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const bin = card.number.slice(0, 6), publicKey = resource.data?.config.public_key;
  const method = methods.find(item => type === "debit" ? item.payment_type_id === "debit_card" : ["credit_card", "prepaid_card"].includes(item.payment_type_id));
  useEffect(() => {
    if (!publicKey || bin.length < 6) return;
    const controller = new AbortController();
    cardMethods(publicKey, bin, controller.signal).then(result => { if (!controller.signal.aborted) { setMethods(result); setIdentifying(false); } }).catch(() => { if (!controller.signal.aborted) { setMethods([]); setIdentifying(false); } });
    return () => controller.abort();
  }, [publicKey, bin]);
  function choose(saved: BuyerCard | null) {
    setSelected(saved); setError(""); setMethods([]); setIdentifying(false);
    setCard({ number: "", cvv: "", cpf: "", holder: saved?.holder_name ?? "", month: saved ? String(saved.expiration_month) : "", year: saved ? String(saved.expiration_year) : "" });
    setType(saved?.type ?? "credit");
  }
  async function remove() {
    if (!deleting || busy) return; setBusy(true); setError("");
    try { await excluirCartao(deleting.id); if (selected?.id === deleting.id) choose(null); setDeleting(null); resource.reload(); }
    catch (cause) { setError(apiError(cause, "Não foi possível remover o cartão.")); } finally { setBusy(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy || !publicKey || shopping.status !== "pending") return;
    setError(""); setNotice("");
    const month = Number(card.month), year = Number(card.year), now = new Date();
    if (!/^\d{13,19}$/.test(card.number) || !card.holder.trim() || !/^\d{3,4}$/.test(card.cvv) || !/^\d{11}$/.test(card.cpf) || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year > 9999 || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) { setError("Confira número, titular, validade, CVV e CPF do titular."); return; }
    if (selected && card.number.slice(-4) !== selected.last_digits) { setError("O número informado não corresponde ao final do cartão selecionado."); return; }
    if (!method || identifying) { setError(type === "debit" ? "Débito não disponível para esta bandeira. Use crédito ou Pix." : "Não foi possível identificar a bandeira. Confira o número ou use Pix."); return; }
    setBusy(true); onBusy(true); let dispatched = false;
    try {
      const token = await tokenizeCard(publicKey, { number: card.number, holder: card.holder.trim(), month, year, cvv: card.cvv, cpf: card.cpf });
      dispatched = true;
      const response = await payCard(shopping.id, token, method, card.cpf);
      if (response.data.payment?.id_shopping !== shopping.id) throw new Error("Pagamento não confirmado.");
      if (response.data.payment.status === "approved" && remember && !selected) {
        try {
          const cards = (await listarCartoes()).data;
          if (!cards.some(item => item.last_digits === card.number.slice(-4) && item.brand === method.name && Number(item.expiration_month) === month && Number(item.expiration_year) === year)) {
            await saveCard({ holder_name: card.holder.trim(), brand: method.name, last_digits: card.number.slice(-4), type: method.payment_type_id === "debit_card" ? "debit" : "credit", expiration_month: month, expiration_year: year }, token);
          }
        } catch { setNotice("Pagamento aprovado. Não foi possível salvar o cartão na conta."); }
      }
      setCard(previous => ({ ...previous, number: "", cvv: "", cpf: "" }));
      onResult(response.data);
    } catch (cause) {
      const status = apiStatus(cause);
      const id: unknown = axios.isAxiosError(cause) ? cause.response?.data?.payment_id : undefined;
      if (dispatched && (!status || status >= 500 || status === 409 || typeof id === "string")) onUncertain(typeof id === "string" && /^[a-f0-9-]{36}$/i.test(id) ? id : undefined);
      setError(dispatched ? apiError(cause, "Não recebemos confirmação da cobrança. Consulte a tentativa antes de pagar novamente.") : "Não foi possível tokenizar o cartão. Confira os dados ou tente Pix. Nenhuma cobrança foi enviada à API local.");
    } finally { setBusy(false); onBusy(false); }
  }
  return <div className="space-y-5"><RequestState {...resource} retry={resource.reload} />{resource.data && (publicKey ? <>
    {resource.data.config.environment === "test" && <p className={s.notice}>Ambiente de teste. Não use cartões ou pagamentos reais.</p>}
    <p className={s.copy}>Número e CVV são enviados diretamente ao Mercado Pago. Cartões salvos exigem nova digitação do número e CVV, como no aplicativo.</p>
    <fieldset disabled={busy} className="space-y-3"><legend className={s.label}>Escolha seu cartão</legend><button type="button" className={s.secondary} aria-pressed={!selected} onClick={() => choose(null)}>Usar novo cartão</button>{resource.data.cards.map(item => <div key={item.id} className="flex flex-wrap items-center gap-3"><button type="button" aria-pressed={selected?.id === item.id} className={s.secondary} onClick={() => choose(item)}>{item.brand} · final {item.last_digits} · {String(item.expiration_month).padStart(2, "0")}/{item.expiration_year}</button><button type="button" className="underline" onClick={() => { setError(""); setDeleting(item); }}>Remover cartão</button></div>)}</fieldset>
    <form onSubmit={submit} className="space-y-5"><fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2"><legend className="sr-only">Pagamento com cartão</legend>
      <label className={s.label}>Número do cartão *<input required inputMode="numeric" autoComplete="cc-number" maxLength={19} value={card.number} onChange={event => { const number = event.target.value.replace(/\D/g, ""); if (number.slice(0, 6) !== bin) { setMethods([]); setIdentifying(number.length >= 6); } setCard(previous => ({ ...previous, number })); }} className={s.input} /></label>
      <label className={s.label}>Titular *<input required autoComplete="cc-name" maxLength={100} value={card.holder} onChange={event => setCard(previous => ({ ...previous, holder: event.target.value }))} className={s.input} /></label>
      <label className={s.label}>Mês de validade *<input required inputMode="numeric" autoComplete="cc-exp-month" maxLength={2} value={card.month} onChange={event => setCard(previous => ({ ...previous, month: event.target.value.replace(/\D/g, "") }))} className={s.input} /></label>
      <label className={s.label}>Ano de validade *<input required inputMode="numeric" autoComplete="cc-exp-year" maxLength={4} placeholder="AAAA" value={card.year} onChange={event => setCard(previous => ({ ...previous, year: event.target.value.replace(/\D/g, "") }))} className={s.input} /></label>
      <label className={s.label}>CVV *<input required type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={card.cvv} onChange={event => setCard(previous => ({ ...previous, cvv: event.target.value.replace(/\D/g, "") }))} className={s.input} /></label>
      <label className={s.label}>CPF do titular *<input required inputMode="numeric" autoComplete="off" maxLength={11} value={card.cpf} onChange={event => setCard(previous => ({ ...previous, cpf: event.target.value.replace(/\D/g, "") }))} className={s.input} /></label>
      <label className={s.label}>Função<select className={s.input} value={type} onChange={event => setType(event.target.value)}><option value="credit">Crédito</option><option value="debit">Débito</option></select></label>
    </fieldset><p role="status">{identifying ? "Identificando bandeira…" : method ? `${method.name} · ${type === "debit" ? "Débito" : "Crédito"}` : card.number.length >= 6 ? "Bandeira não disponível para a função selecionada." : "Informe o cartão para identificar a bandeira."}</p>
    {!selected && <label className="flex items-start gap-3"><input type="checkbox" disabled={busy} checked={remember} onChange={event => setRemember(event.target.checked)} /><span>Salvar bandeira, final, titular e validade após aprovação. Número e CVV não serão salvos.</span></label>}
    {error && !deleting && <p role="alert" className={s.error}>{error}</p>}{notice && <p role="status" className={s.notice}>{notice}</p>}<button className={s.button} disabled={busy || identifying || !method}>{busy ? "Processando pagamento…" : `Pagar ${money(shopping.value)} com cartão`}</button></form>
    </> : <p role="status" className={s.notice}>Pagamento com cartão indisponível na configuração atual da API. Use Pix ou tente novamente mais tarde.</p>)}
    {deleting && <ConfirmAction title="Remover cartão?" description={`O cartão final ${deleting.last_digits} será removido da conta. Nenhuma cobrança é realizada.`} busy={busy} error={error} confirm={remove} cancel={() => { if (!busy) setDeleting(null); }} />}
  </div>;
}
