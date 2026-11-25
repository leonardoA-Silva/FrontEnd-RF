import { useState } from "react";
import { Star } from "lucide-react";
import { criarAvaliacao, type ReviewBackend } from "../../../api/services";
import { apiError, apiStatus } from "../../../axios/apiError";
import { buyerStyles as s } from "./buyerStyles";

interface ReviewDialogProps {
  shoppingId: string;
  sellerId: string;
  onSuccess: (reviewId: string) => void;
  onClose: () => void;
}

export default function ReviewDialog({ shoppingId, sellerId, onSuccess, onClose }: ReviewDialogProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    if (comment.length > 1000) {
      setError("O comentário não pode ultrapassar 1000 caracteres.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await criarAvaliacao({
        rating,
        comment: comment.trim() || null,
        id_shopping: shoppingId,
        id_reviewed: sellerId,
      });
      onSuccess(response.data.id);
    } catch (err) {
      const status = apiStatus(err);
      if (status === 403) {
        setError("Esta reserva ainda não atende aos requisitos para avaliação. Apenas reservas concluídas e confirmadas entre os participantes podem ser avaliadas.");
      } else if (status === 409) {
        setError("Você já enviou uma avaliação para esta reserva.");
      } else {
        setError(apiError(err, "Não foi possível enviar a avaliação. Verifique se o pedido está concluído."));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      open
      aria-label="Avaliar pedido e fornecedor"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%_-_32px)] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-[#1B4B3A] shadow-xl backdrop:bg-black/40 z-50"
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#E7E4DA] pb-3">
          <h2 className={s.subtitle}>Avaliar negociação</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="text-gray-500 hover:text-gray-700 text-sm font-semibold disabled:opacity-50"
          >
            Fechar
          </button>
        </div>

        <p className={s.copy}>
          Sua avaliação ajuda a comunidade a reconhecer os melhores fornecedores e a qualidade dos materiais entregues.
        </p>

        {error && <p role="alert" className={s.error}>{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota (1 a 5 estrelas) *
            </label>
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Classificação de 1 a 5 estrelas">
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
                {rating} de 5
              </span>
            </div>
          </div>

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
              disabled={busy}
              placeholder="Conte como foi o atendimento, a conservação do material ou a retirada..."
              className={`${s.input} w-full resize-none`}
            />
            <p className="text-right text-xs text-gray-500 mt-1">
              {comment.length} / 1000 caracteres
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-3 border-t border-[#E7E4DA]">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className={s.secondary}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className={s.button}
            >
              {busy ? "Enviando..." : "Enviar avaliação"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export function ReviewCard({ review }: { review: ReviewBackend }) {
  return (
    <div className="rounded-xl border border-[#DCE1D5] bg-[#FCFAF1] p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-amber-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={18}
              className={review.rating >= star ? "fill-amber-400 text-amber-400" : "text-gray-300"}
              aria-hidden="true"
            />
          ))}
          <span className="ml-1.5 text-xs font-semibold text-gray-700">
            {review.rating}/5
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(review.created_in).toLocaleDateString("pt-BR")}
        </span>
      </div>
      {review.comment ? (
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{review.comment}</p>
      ) : (
        <p className="text-xs italic text-gray-500">Avaliação enviada sem comentário por escrito.</p>
      )}
    </div>
  );
}
