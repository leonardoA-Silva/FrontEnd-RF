import { useCallback, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star, MessageSquarePlus, Edit3, Trash2 } from "lucide-react";
import {
  atualizarAvaliacao,
  criarAvaliacao,
  excluirAvaliacao,
  listarAvaliacoes,
  listarReservas,
  obterReserva,
  type ReviewBackend,
  type Shopping,
} from "../../../api/services";
import { apiError, apiStatus } from "../../../axios/apiError";
import { requireArray, useApiResource } from "../../../hooks/useApiResource";
import ConfirmAction from "./ConfirmAction";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { dateLabel, money, shoppingLabel } from "./buyerPresentation";

export default function BuyerReviews({ userId }: { userId: string }) {
  const [params] = useSearchParams();
  const [shoppingId, setShoppingId] = useState(params.get("reserva") ?? "");
  const [sellerId, setSellerId] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState<ReviewBackend | null>(null);
  const [deleting, setDeleting] = useState<ReviewBackend | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loader = useCallback(async (signal: AbortSignal) => {
    const [reviewsRes, shoppingsRes] = await Promise.allSettled([
      listarAvaliacoes(signal),
      listarReservas(signal),
    ]);

    const allReviews = reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value.data)
      ? reviewsRes.value.data
      : [];

    const userReviews = allReviews.filter(
      (item: ReviewBackend) =>
        item.id_reviewer?.toLowerCase() === userId.toLowerCase() ||
        item.id_reviewed?.toLowerCase() === userId.toLowerCase()
    );

    const shoppings = shoppingsRes.status === "fulfilled" && Array.isArray(shoppingsRes.value.data)
      ? requireArray(shoppingsRes.value.data)
      : [];

    return {
      data: {
        reviews: userReviews,
        shoppings,
      },
    };
  }, [userId]);

  const resource = useApiResource(loader);

  const detailLoader = useCallback(async (signal: AbortSignal) => {
    if (!shoppingId) return { data: null };
    return obterReserva(shoppingId, signal);
  }, [shoppingId]);

  const detail = useApiResource(detailLoader);

  const sellers = [...new Set(
    detail.data?.items
      ?.map((item) => item.seller_id)
      .filter((id): id is string => Boolean(id)) ?? []
  )];
  const reviewedId = sellers.length === 1 ? sellers[0] : sellerId;

  function resetForm() {
    setEditing(null);
    setShoppingId("");
    setSellerId("");
    setRating(5);
    setHoverRating(null);
    setComment("");
    setError("");
  }

  function startEdit(rev: ReviewBackend) {
    setEditing(rev);
    setRating(rev.rating);
    setComment(rev.comment ?? "");
    setShoppingId(rev.id_shopping);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;

    if (rating < 1 || rating > 5) {
      setError("A nota deve ser de 1 a 5 estrelas.");
      return;
    }

    if (comment.length > 1000) {
      setError("O comentário não pode ultrapassar 1000 caracteres.");
      return;
    }

    if (!editing && !shoppingId) {
      setError("Selecione a compra ou reserva para avaliar.");
      return;
    }

    if (!editing && !reviewedId) {
      setError("Não foi possível identificar o fornecedor desta reserva.");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      if (editing) {
        await atualizarAvaliacao(editing.id, {
          rating,
          comment: comment.trim() || null,
        });
        setSuccess("Avaliação atualizada com sucesso!");
      } else {
        await criarAvaliacao({
          rating,
          comment: comment.trim() || null,
          id_shopping: shoppingId,
          id_reviewed: reviewedId,
        });
        setSuccess("Avaliação cadastrada com sucesso! Obrigado pela colaboração.");
      }
      resetForm();
      resource.reload();
    } catch (cause) {
      const status = apiStatus(cause);
      if (status === 409) {
        setError("Você já enviou uma avaliação para esta compra. Você pode editá-la na lista abaixo.");
      } else if (status === 403) {
        setError("A avaliação só pode ser registrada para compras finalizadas ou concluídas pela plataforma.");
      } else {
        setError(apiError(cause, "Não foi possível salvar a avaliação. Verifique os dados e tente novamente."));
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    setError("");

    try {
      await excluirAvaliacao(deleting.id);
      if (editing?.id === deleting.id) resetForm();
      setDeleting(null);
      setSuccess("Avaliação excluída com sucesso.");
      resource.reload();
    } catch (cause) {
      setError(apiError(cause, "Não foi possível excluir a avaliação."));
    } finally {
      setBusy(false);
    }
  }

  const reviews = resource.data?.reviews ?? [];
  const eligibleShoppings = (resource.data?.shoppings ?? []).filter(
    (s: Shopping) => ["completed", "accepted"].includes(s.status)
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={s.title}>Minhas Avaliações</h1>
          <p className={s.copy}>
            Avalie suas experiências de negociação e acompanhe o feedback da comunidade.
          </p>
        </div>
        <button
          type="button"
          disabled={busy || resource.loading}
          onClick={resource.reload}
          className={s.secondary}
        >
          Atualizar avaliações
        </button>
      </div>

      <RequestState {...resource} retry={resource.reload} />

      {success && <p role="status" className={s.success}>{success}</p>}
      {error && !deleting && <p role="alert" className={s.error}>{error}</p>}

      {!resource.loading && !resource.error && (
        <>
          {/* Formulário de Avaliação (Novo ou Edição) */}
          <form onSubmit={submit} className={`${s.panel} space-y-5`}>
            <div className="flex items-center gap-2 border-b border-[#E7E4DA] pb-3">
              <MessageSquarePlus size={22} className="text-[#0F3D2E]" aria-hidden="true" />
              <h2 className={s.subtitle}>
                {editing ? "Editar avaliação" : "Avaliar negociação"}
              </h2>
            </div>

            <fieldset disabled={busy} className="space-y-4">
              <legend className="sr-only">Dados da avaliação</legend>

              {!editing && (
                <div>
                  <label className={s.label}>
                    Selecione a reserva ou compra *
                  </label>
                  {eligibleShoppings.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      Você ainda não possui reservas aceitas ou concluídas para avaliar.
                    </p>
                  ) : (
                    <select
                      required
                      value={shoppingId}
                      onChange={(e) => {
                        setShoppingId(e.target.value);
                        setSellerId("");
                      }}
                      className={`${s.input} w-full`}
                    >
                      <option value="">Selecione uma reserva</option>
                      {eligibleShoppings.map((item) => (
                        <option key={item.id} value={item.id}>
                          {shoppingLabel(item.status)} · {dateLabel(item.datetime)} · {money(item.value)}
                        </option>
                      ))}
                    </select>
                  )}
                  {shoppingId && <RequestState {...detail} retry={detail.reload} />}

                  {sellers.length > 1 && (
                    <div className="mt-3">
                      <label className={s.label}>Fornecedor responsável *</label>
                      <select
                        required
                        value={sellerId}
                        onChange={(e) => setSellerId(e.target.value)}
                        className={`${s.input} w-full`}
                      >
                        <option value="">Selecione o fornecedor</option>
                        {sellers.map((id) => (
                          <option key={id} value={id}>
                            {detail.data?.items
                              ?.filter((item) => item.seller_id === id)
                              .map((item) => item.product_name)
                              .join(", ") || id.slice(0, 8)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Seletor de Estrelas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nota (1 a 5 estrelas) *
                </label>
                <div
                  className="flex items-center gap-1.5"
                  role="radiogroup"
                  aria-label="Classificação de 1 a 5 estrelas"
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating !== null ? hoverRating : rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        disabled={busy}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                        aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          size={28}
                          className={active ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-sm font-semibold text-gray-700">
                    {rating} de 5 estrelas
                  </span>
                </div>
              </div>

              {/* Comentário */}
              <div>
                <label htmlFor="review-comment" className={s.label}>
                  Comentário (opcional)
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte como foi a negociação, o atendimento ou a retirada do material..."
                  className={`${s.input} w-full resize-none`}
                />
                <p className="text-right text-xs text-gray-500 mt-1">
                  {comment.length} / 1000 caracteres
                </p>
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={busy || (!editing && (!shoppingId || detail.loading || Boolean(detail.error)))}
                className={s.button}
              >
                {busy ? "Salvando..." : editing ? "Salvar alterações" : "Enviar avaliação"}
              </button>
              {editing && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={resetForm}
                  className={s.secondary}
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>

          {/* Lista de Avaliações */}
          <div className="space-y-4">
            <h2 className={s.subtitle}>Histórico de avaliações ({reviews.length})</h2>

            {reviews.length === 0 ? (
              <div className={`${s.panel} text-center py-8 space-y-3`}>
                <Star size={36} className="mx-auto text-gray-300" aria-hidden="true" />
                <h3 className="font-semibold text-gray-800">Nenhuma avaliação encontrada</h3>
                <p className={s.copy}>
                  Suas avaliações sobre fornecedores e negociações realizadas aparecerão aqui.
                </p>
                <Link to="/marketplace" className={s.button}>
                  Explorar materiais no marketplace
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {reviews.map((rev) => {
                  const isAuthor = rev.id_reviewer?.toLowerCase() === userId.toLowerCase();
                  return (
                    <li key={rev.id} className={`${s.panel} space-y-3`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={20}
                              className={
                                rev.rating >= star
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-gray-300"
                              }
                              aria-hidden="true"
                            />
                          ))}
                          <span className="ml-1 text-sm font-bold text-gray-900">
                            {rev.rating} / 5
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {dateLabel(rev.created_in)}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-emerald-800">
                        {isAuthor ? "Avaliação enviada por você" : "Avaliação recebida por você"}
                      </p>

                      {rev.comment ? (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                          {rev.comment}
                        </p>
                      ) : (
                        <p className="text-xs italic text-gray-500">
                          Avaliação registrada sem comentário por escrito.
                        </p>
                      )}

                      {isAuthor && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E7E4DA]">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => startEdit(rev)}
                            className={`${s.secondary} flex items-center gap-1.5 text-xs`}
                          >
                            <Edit3 size={14} aria-hidden="true" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setDeleting(rev)}
                            className="buyer-secondary flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-800"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}

      {deleting && (
        <ConfirmAction
          title="Excluir avaliação?"
          description="Sua avaliação será removida permanentemente do sistema."
          busy={busy}
          error={error}
          confirm={remove}
          cancel={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
