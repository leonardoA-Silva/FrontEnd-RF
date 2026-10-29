import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listarConversas, sairConversa, type BuyerConversation } from "../../../axios/Axios";
import { apiError } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import type { BuyerSocket } from "../../../realtime/buyerSocket";
import ConfirmAction from "./ConfirmAction";
import ConversationMessages from "./ConversationMessages";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";

interface RecentConversation {
  id: string;
  name?: string;
  accessedAt: string;
}

const RECENT_KEY = "rf_recent_conversations";

function getRecentConversations(): RecentConversation[] {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentConversation(id: string, name?: string) {
  try {
    const current = getRecentConversations().filter(item => item.id !== id);
    current.unshift({ id, name: name || "Conversa", accessedAt: new Date().toISOString() });
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(current.slice(0, 10)));
  } catch {
    // ignora falhas de storage
  }
}

function removeRecentConversation(id: string) {
  try {
    const current = getRecentConversations().filter(item => item.id !== id);
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(current));
  } catch {
    // ignora falhas de storage
  }
}

export default function BuyerConversations({ userId, socket, connected }: { userId: string; socket: BuyerSocket | null; connected: boolean }) {
  const [params, setParams] = useSearchParams();
  const selected = params.get("conversa");

  if (selected) {
    return (
      <ConversationDetail
        key={selected}
        id={selected}
        userId={userId}
        socket={socket}
        connected={connected}
        onBack={() => setParams({ aba: "mensagens" })}
      />
    );
  }

  return (
    <ConversationsList
      onSelect={(id) => setParams({ aba: "mensagens", conversa: id })}
    />
  );
}

function ConversationDetail({
  id,
  userId,
  socket,
  connected,
  onBack,
}: {
  id: string;
  userId: string;
  socket: BuyerSocket | null;
  connected: boolean;
  onBack: () => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    saveRecentConversation(id);
  }, [id]);

  async function leave() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await sairConversa(id);
      removeRecentConversation(id);
      setLeaving(false);
      onBack();
    } catch (cause) {
      setError(apiError(cause, "Não foi possível sair da conversa."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button onClick={onBack} className={s.secondary}>
          Voltar às conversas
        </button>
        <button className={s.secondary} onClick={() => { setError(""); setLeaving(true); }}>
          Sair desta conversa
        </button>
      </div>
      <ConversationMessages id={id} userId={userId} socket={socket} connected={connected} />
      {leaving && (
        <ConfirmAction
          title="Sair da conversa?"
          description="Você deixará de participar desta conversa e de acessar suas mensagens."
          busy={busy}
          error={error}
          confirm={leave}
          cancel={() => setLeaving(false)}
        />
      )}
    </section>
  );
}

function ConversationsList({ onSelect }: { onSelect: (id: string) => void }) {
  const loader = useCallback(async (signal: AbortSignal) => {
    try {
      const response = await listarConversas(signal);
      return { data: requireArray(response.data) };
    } catch {
      // Se a listagem geral da API falhar (ex.: erro 500 na query SQL do backend),
      // exibe as conversas ativas da sessão para permitir que o usuário continue conversando.
      const recent = getRecentConversations();
      const fallbackList: BuyerConversation[] = recent.map(item => ({
        conversationId: item.id,
        otherUserId: "",
        otherUserName: item.name || "Conversa",
        unreadCount: 0,
        updated_in: item.accessedAt,
      }));
      return { data: fallbackList };
    }
  }, []);
  const resource = useApiResource(loader);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={s.title}>Mensagens</h1>
        <button disabled={resource.loading} onClick={resource.reload} className={s.secondary}>
          Atualizar conversas
        </button>
      </div>

      <RequestState {...resource} retry={resource.reload} />

      {!resource.loading && !resource.error && (
        !resource.data?.length ? (
          <div className={`${s.panel} space-y-4`}>
            <p className={s.notice}>
              Nenhuma conversa encontrada. Abra um material e use “Conversar com fornecedor” para iniciar.
            </p>
            <Link to="/marketplace" className={s.button}>
              Explorar materiais
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {resource.data.map(item => (
              <li key={item.conversationId} className={`${s.panel} flex flex-wrap items-center justify-between gap-4`}>
                <div>
                  <h2 className={s.subtitle}>{item.otherUserName || "Conversa"}</h2>
                  <p className={s.copy}>{item.unreadCount ?? 0} mensagens não lidas</p>
                </div>
                <button onClick={() => onSelect(item.conversationId)} className={s.secondary}>
                  Abrir conversa
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  );
}
