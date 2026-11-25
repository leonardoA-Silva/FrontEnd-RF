import { useCallback, useEffect, useState } from "react";
import { useApiResource } from "../../hooks/useApiResource";
import { lerNotificacao, type BuyerNotification } from "../../api/services";
import { loadCompanyRequests, answerCompanyRequest } from "./companyRequestsApi";
import ConfirmAction from "../dashboard/comprador/ConfirmAction";
import RequestState from "../dashboard/comprador/RequestState";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";
import { dateLabel } from "../dashboard/comprador/buyerPresentation";
import { apiError, apiStatus } from "../../axios/apiError";
import { RefreshCw } from "lucide-react";

const STORAGE_KEY = "rf_company_answered_requests";

function readStoredAnswers(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function CompanyRequests() {
  const loader = useCallback(async (signal: AbortSignal) => ({ data: await loadCompanyRequests(signal) }), []);
  const resource = useApiResource(loader);
  const [answers, setAnswers] = useState<Record<string, string>>(readStoredAnswers);
  const [selection, setSelection] = useState<{ item: BuyerNotification; status: "accepted" | "refused" | "completed" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const { reload } = resource;

  // Polling automático a cada 5 segundos para carregar novas reservas dos compradores
  useEffect(() => {
    const timer = setInterval(() => {
      reload();
    }, 5000);
    return () => clearInterval(timer);
  }, [reload]);

  async function answer() {
    if (!selection?.item.reference_id || busy) return;
    setBusy(true); setError("");
    try {
      const shopping = await answerCompanyRequest(selection.item.reference_id, selection.status);
      setAnswers(current => {
        const next = { ...current, [shopping.id]: shopping.status };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (err) { void err; }
        return next;
      });
      const notification = selection.item;
      setSelection(null);
      setNotice(
        shopping.status === "accepted"
          ? "Reserva aceita com sucesso! O comprador foi notificado imediatamente."
          : shopping.status === "completed"
            ? "Entrega confirmada! A reserva foi concluída e o comprador já pode avaliar o pedido."
            : "Reserva recusada. O comprador foi avisado e o estoque foi restaurado."
      );
      if (notification.read !== "sim") {
        try { await lerNotificacao(notification.id); } catch (err) { void err; }
      }
    } catch (cause) {
      const msg = apiError(cause, "");
      const status = apiStatus(cause);
      if (msg.includes("accepted") || msg.includes("aceita")) {
        setAnswers(prev => {
          const next = { ...prev, [selection.item.reference_id!]: "accepted" };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (err) { void err; }
          return next;
        });
        setSelection(null);
        setNotice("Esta reserva já havia sido aceita.");
      } else if (msg.includes("refused") || msg.includes("recusada") || msg.includes("cancelled")) {
        setAnswers(prev => {
          const next = { ...prev, [selection.item.reference_id!]: "refused" };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (err) { void err; }
          return next;
        });
        setSelection(null);
        setNotice("Esta reserva já foi finalizada anteriormente.");
      } else {
        setError([400, 403, 404, 409].includes(status ?? 0)
          ? "A reserva pode ter mudado de situação ou não pertencer integralmente à sua empresa. Atualize antes de responder novamente."
          : apiError(cause, "Não foi possível confirmar a resposta. Atualize antes de repetir."));
      }
    } finally {
      setBusy(false);
    }
  }

  return <section className="space-y-6">
    <header className="company-page-heading">
      <div>
        <p className="company-eyebrow">Solicitações recebidas</p>
        <h1>Reservas</h1>
        <p>Acompanhe e responda às solicitações de reserva feitas pelos usuários da comunidade.</p>
      </div>
    </header>
    <p className={s.notice}>
      Ao aceitar uma reserva, a resposta é sincronizada em tempo real para o painel do comprador.
    </p>
    <button type="button" className={s.secondary} disabled={resource.loading || busy} onClick={resource.reload}>
      <RefreshCw size={15} className="inline mr-1" aria-hidden="true" />
      Atualizar solicitações
    </button>
    <RequestState {...resource} retry={resource.reload} />
    {notice && <p role="status" className={s.success}>{notice}</p>}
    {!resource.loading && !resource.error && (!resource.data?.length ? (
      <p className={s.notice}>Nenhuma solicitação de reserva recebida no momento.</p>
    ) : (
      <ul className="space-y-4">
        {resource.data.map(item => {
          const currentStatus = answers[item.reference_id!];
          return (
            <li key={item.id} className={`${s.panel} space-y-4`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className={s.subtitle}>{item.title}</h2>
                {currentStatus && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    currentStatus === "accepted" || currentStatus === "completed" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                  }`}>
                    {currentStatus === "completed" ? "Entrega confirmada" : currentStatus === "accepted" ? "Reserva aceita" : "Reserva recusada"}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words">{item.content}</p>
              <p className={s.copy}>{dateLabel(item.created_in)}</p>
              {currentStatus ? (
                <div className="space-y-3">
                  <p role="status" className="text-xs text-gray-500">
                    {currentStatus === "completed"
                      ? "Entrega confirmada. O comprador já pode avaliar o pedido."
                      : currentStatus === "accepted"
                        ? "Reserva aceita. Aguardando pagamento ou retirada pelo comprador."
                        : "Reserva recusada. O material foi retornado à disponibilidade."}
                  </p>
                  {currentStatus === "accepted" && (
                    <button
                      type="button"
                      disabled={busy}
                      className={s.button}
                      onClick={() => { setError(""); setSelection({ item, status: "completed" }); }}
                    >
                      Confirmar entrega
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    className={s.button}
                    onClick={() => { setError(""); setSelection({ item, status: "accepted" }); }}
                  >
                    Aceitar reserva
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    className={s.secondary}
                    onClick={() => { setError(""); setSelection({ item, status: "refused" }); }}
                  >
                    Recusar reserva
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    ))}
    {selection && (
      <ConfirmAction
        title={selection.status === "accepted" ? "Aceitar reserva?" : selection.status === "completed" ? "Confirmar entrega do material?" : "Recusar reserva?"}
        description={selection.status === "accepted"
          ? "Confirme que o material ficará reservado para este comprador. Ele receberá a atualização imediatamente."
          : selection.status === "completed"
            ? "Confirme que o material foi entregue ou retirado. Isso concluirá a reserva e liberará a avaliação para o comprador."
            : "Ao recusar, o estoque retorna ao anúncio e o comprador é avisado."}
        busy={busy}
        error={error}
        confirm={answer}
        cancel={() => { if (!busy) setSelection(null); }}
      />
    )}
  </section>;
}
