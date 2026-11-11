import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import api from "../../api/client";
import { useApiResource } from "../../hooks/useApiResource";
import { useCompany } from "./CompanyContext";
import { resourceError } from "./companyResourceApi";

interface PaymentAccount { connected: boolean; environment: "test" | "production"; credentials_expired: boolean }

export default function CompanyPayments() {
  const { preview } = useCompany();
  return preview ? <section className="space-y-5"><h1 className="buyer-title">Recebimentos</h1><p className="company-notice">A vinculação do Mercado Pago está desativada na prévia. Entre com a conta da empresa para consultar e gerenciar o vínculo real.</p></section> : <LivePayments />;
}

function LivePayments() {
  const loader = useCallback(async (signal: AbortSignal) => {
    const response = await api.get<PaymentAccount>("/payment/mercado-pago/account", { signal });
    if (typeof response.data.connected !== "boolean" || !["test", "production"].includes(response.data.environment)) throw new Error("Resposta de vínculo inválida.");
    return response;
  }, []);
  const resource = useApiResource(loader);
  const { reload } = resource;
  useEffect(() => { window.addEventListener("focus", reload); return () => window.removeEventListener("focus", reload); }, [reload]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [url, setUrl] = useState("");
  const [confirm, setConfirm] = useState(false);
  async function connect() {
    if (busy) return;
    setBusy(true); setError(""); setUrl(""); setNotice("");
    try {
      const response = await api.post<{ authorization_url: string }>("/payment/mercado-pago/connect", {}, { timeout: 30000 });
      const target = new URL(response.data.authorization_url);
      if (target.origin !== "https://auth.mercadopago.com.br" || target.pathname !== "/authorization" || target.username || target.password) throw new Error("Destino de autorização inválido.");
      setUrl(target.href);
    } catch (cause) { setError(resourceError(cause)); }
    finally { setBusy(false); }
  }
  async function disconnect() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await api.delete<{ connected: boolean }>("/payment/mercado-pago/account");
      if (response.data.connected !== false) throw new Error("Desvinculação não confirmada.");
      setConfirm(false); setUrl(""); setNotice("Conta desvinculada para novos recebimentos. Os pagamentos anteriores foram preservados."); resource.reload();
    } catch (cause) { setError(resourceError(cause)); }
    finally { setBusy(false); }
  }
  return <section className="space-y-6">
    <header className="company-page-heading"><div><p className="company-eyebrow">Pagamentos</p><h1>Recebimentos</h1><p>Gerencie a conta Mercado Pago utilizada para receber vendas.</p></div></header>
    <div className="buyer-panel space-y-4">
      {resource.loading ? <p role="status">Consultando vínculo…</p> : resource.error ? <p role="alert">{resource.error}</p> : resource.data && <>
        <p role="status">{resource.data.connected ? "Conta Mercado Pago vinculada." : "Nenhuma conta Mercado Pago vinculada."}</p>
        <p>{resource.data.environment === "test" ? "Ambiente de teste. Não realize pagamentos reais." : "Ambiente de produção."}</p>
        {resource.data.credentials_expired && <p className="company-notice">A autorização precisa ser renovada. Consulte o estado do vínculo antes de receber novas vendas.</p>}
        <p>O vínculo permite que a API processe recebimentos. Nenhuma cobrança é criada nesta tela.</p>
        {!resource.data.connected && !url && <button type="button" className="company-button" disabled={busy} onClick={() => void connect()}>{busy ? "Preparando autorização…" : "Vincular Mercado Pago"}</button>}
        {resource.data.connected && <button type="button" className="company-button is-secondary" disabled={busy} onClick={() => { setError(""); setConfirm(true); }}>Desvincular conta</button>}
      </>}
      {url && <div className="space-y-3"><p>Continue no Mercado Pago para autorizar a conta da empresa. Ao concluir, volte a esta tela e atualize o vínculo. O link expira em dez minutos.</p><a className="company-button" href={url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Autorizar no Mercado Pago (nova aba)</a></div>}
      <button type="button" className="company-button is-secondary" disabled={busy || resource.loading} onClick={() => { setUrl(""); resource.reload(); }}>Atualizar vínculo</button>
      {error && !confirm && <p role="alert" className="company-field-error">{error}</p>}{notice && <p role="status" className="company-notice">{notice}</p>}
    </div>
    <Dialog open={confirm} onClose={() => { if (!busy) setConfirm(false); }} aria-labelledby="disconnect-payment-title"><DialogTitle id="disconnect-payment-title">Desvincular Mercado Pago?</DialogTitle><DialogContent><p>Novas cobranças com divisão de pagamento deixarão de usar esta conta. Pagamentos anteriores continuam vinculados ao histórico. A autorização externa no Mercado Pago não é revogada.</p>{error && <p role="alert" className="company-field-error">{error}</p>}</DialogContent><DialogActions><button type="button" className="company-button is-secondary" disabled={busy} onClick={() => setConfirm(false)}>Voltar</button><button type="button" className="company-button" disabled={busy} onClick={() => void disconnect()}>{busy ? "Desvinculando…" : "Confirmar desvinculação"}</button></DialogActions></Dialog>
  </section>;
}
