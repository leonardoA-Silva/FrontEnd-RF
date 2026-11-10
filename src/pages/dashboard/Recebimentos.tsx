import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../axios/Axios";
import DashboardShell from "../../components/dashboard/DashboardShell";

interface AccountStatus {
  connected: boolean;
  credentials_expired: boolean;
  environment: string;
}

const styles = {
  panel: "mt-6 max-w-2xl rounded-2xl border border-linha bg-white p-6",
  button: "inline-flex min-h-11 items-center justify-center rounded-full bg-verde-escuro px-5 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60",
  secondary: "inline-flex min-h-11 items-center justify-center rounded-full border border-linha px-5 py-2 text-sm font-semibold text-tinta disabled:opacity-60",
};

function safeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
    if (error.response?.status === 403) return "Esta conta não tem permissão para gerenciar recebimentos.";
  }
  return "Não foi possível acessar os recebimentos. Tente novamente.";
}

export default function Recebimentos() {
  const [account, setAccount] = useState<AccountStatus | null>(null);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirm, setConfirm] = useState(false);

  async function load(signal?: AbortSignal) {
    try {
      const [status, configuration] = await Promise.all([
        api.get<AccountStatus>("/payment/mercado-pago/account", { signal }),
        api.get<{ oauth_configured: boolean }>("/payment/configuration", { signal }),
      ]);
      if (signal?.aborted) return;
      setAccount(status.data);
      setConfigured(configuration.data.oauth_configured);
    } catch (cause) {
      if (!signal?.aborted) setError(safeError(cause));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  function refresh() {
    setLoading(true);
    setError("");
    return load();
  }

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) return load(controller.signal);
    });
    return () => controller.abort();
  }, []);

  async function connect() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post<{ authorization_url: string }>("/payment/mercado-pago/connect");
      const destination = new URL(data.authorization_url);
      if (destination.origin !== "https://auth.mercadopago.com.br" || destination.pathname !== "/authorization") {
        throw new Error("Invalid authorization destination");
      }
      window.location.assign(destination.href);
    } catch (cause) {
      setError(safeError(cause));
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.delete("/payment/mercado-pago/account");
      setConfirm(false);
      setNotice("Conta desvinculada para novas cobranças.");
      await refresh();
    } catch (cause) {
      setError(safeError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardShell onSoon={() => setNotice("Esta seção ainda não está disponível.")}>
      <h1 className="text-3xl font-semibold tracking-tight">Recebimentos</h1>
      <p className="mt-2 max-w-2xl text-tinta-suave">Gerencie a vinculação da sua empresa ao Mercado Pago.</p>
      {notice && <p role="status" className="mt-4 text-verde-escuro">{notice}</p>}
      {error && <div role="alert" className={styles.panel}><p>{error}</p><button type="button" className={`${styles.secondary} mt-4`} disabled={loading || busy} onClick={() => void refresh()}>Tentar novamente</button></div>}
      <section className={styles.panel} aria-labelledby="conta-pagamento" aria-busy={loading || busy}>
        <h2 id="conta-pagamento" className="text-xl font-semibold">Conta Mercado Pago</h2>
        {loading ? <p role="status" className="mt-4">Consultando vinculação…</p> : account && !error ? <>
          <p className="mt-4 font-semibold">{account.connected ? account.credentials_expired ? "Vinculação expirada" : "Conta vinculada" : "Nenhuma conta vinculada"}</p>
          {account.environment === "sandbox" && <p className="mt-2">Ambiente de testes. Esta vinculação não comprova recebimentos reais.</p>}
          <p className="mt-3 text-tinta-suave">A autorização acontece no site do Mercado Pago. Ao concluir, volte a esta tela e atualize a situação.</p>
          {!configured && <p className="mt-4">A vinculação está indisponível na configuração atual do serviço.</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            {configured && (!account.connected || account.credentials_expired) && <button type="button" className={styles.button} disabled={busy} onClick={() => void connect()}>{busy ? "Aguarde…" : account.connected ? "Renovar vinculação" : "Conectar Mercado Pago"}</button>}
            <button type="button" className={styles.secondary} disabled={busy} onClick={() => void refresh()}>Atualizar situação</button>
            {account.connected && !confirm && <button type="button" className={styles.secondary} disabled={busy} onClick={() => setConfirm(true)}>Desvincular conta</button>}
          </div>
          {confirm && <div className="mt-5 rounded-xl bg-bruma p-4"><p>Desvincular a conta para novas cobranças? Isso não cancela nem estorna pagamentos existentes.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" className={styles.button} disabled={busy} onClick={() => void disconnect()}>Confirmar desvinculação</button><button type="button" className={styles.secondary} disabled={busy} onClick={() => setConfirm(false)}>Manter vinculada</button></div></div>}
        </> : !error && <p className="mt-4">Nenhuma informação de vinculação disponível.</p>}
      </section>
    </DashboardShell>
  );
}
