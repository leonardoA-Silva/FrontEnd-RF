import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { criarDisputa, type DisputeType, type DisputeBackend } from "../../../api/services";
import { apiError } from "../../../axios/apiError";
import { buyerStyles as s } from "./buyerStyles";

export const DISPUTE_TYPES: { value: DisputeType; label: string }[] = [
  { value: "material_incompativel", label: "Material diferente ou incompatível com o anúncio" },
  { value: "item_danificado", label: "Item danificado ou com avarias graves" },
  { value: "nao_comparecimento", label: "Fornecedor ou responsável não compareceu ao local" },
  { value: "nao_retirado", label: "Impossibilidade de realizar a retirada no local" },
  { value: "comportamento_inadequado", label: "Comportamento inadequado ou desrespeito" },
  { value: "outro", label: "Outro problema com o produto ou negociação" },
];

export const DISPUTE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  aberta: { label: "Aberta", color: "bg-amber-100 text-amber-800 border-amber-300" },
  em_analise: { label: "Em análise", color: "bg-blue-100 text-blue-800 border-blue-300" },
  resolvida: { label: "Resolvida", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  rejeitada: { label: "Rejeitada", color: "bg-rose-100 text-rose-800 border-rose-300" },
};

interface DisputeDialogProps {
  shoppingId: string;
  onSuccess: (disputeId: string) => void;
  onClose: () => void;
}

export default function DisputeDialog({ shoppingId, onSuccess, onClose }: DisputeDialogProps) {
  const [type, setType] = useState<DisputeType>("material_incompativel");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Por favor, descreva o motivo da denúncia/disputa com detalhes.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await criarDisputa({
        type,
        description: description.trim(),
        id_shopping: shoppingId,
      });
      onSuccess(response.data.id);
    } catch (err) {
      setError(apiError(err, "Não foi possível registrar a denúncia. Verifique se já não há uma disputa ativa."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      open
      aria-label="Denunciar produto ou abrir contestação"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%_-_32px)] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-[#1B4B3A] shadow-xl backdrop:bg-black/40 z-50"
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#E7E4DA] pb-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle size={22} aria-hidden="true" />
            <h2 className={s.subtitle}>Denunciar / Abrir Disputa</h2>
          </div>
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
          Use este formulário para relatar problemas com o material entregue, divergências ou inconformidades com o anúncio. Os administradores analisarão o caso.
        </p>

        {error && <p role="alert" className={s.error}>{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dispute-type" className={s.label}>
              Motivo da ocorrência *
            </label>
            <select
              id="dispute-type"
              value={type}
              onChange={(e) => setType(e.target.value as DisputeType)}
              disabled={busy}
              className={`${s.input} w-full`}
            >
              {DISPUTE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dispute-desc" className={s.label}>
              Descrição detalhada do ocorrido *
            </label>
            <textarea
              id="dispute-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={busy}
              placeholder="Descreva claramente o que aconteceu (ex: quantidade divergente, danos não informados no anúncio)..."
              className={`${s.input} w-full resize-none`}
            />
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
              className={`${s.button} bg-rose-700 hover:bg-rose-800 text-white border-transparent`}
            >
              {busy ? "Registrando..." : "Registrar denúncia"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export function DisputeCard({ dispute }: { dispute: DisputeBackend }) {
  const typeLabel = DISPUTE_TYPES.find((t) => t.value === dispute.type)?.label || dispute.type;
  const statusInfo = DISPUTE_STATUS_MAP[dispute.status] || {
    label: dispute.status,
    color: "bg-gray-100 text-gray-800 border-gray-300",
  };

  return (
    <div className="rounded-xl border border-[#DCE1D5] bg-[#FCFAF1] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7E4DA] pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-600" aria-hidden="true" />
          <strong className="text-sm text-gray-900">{typeLabel}</strong>
        </div>
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      <div>
        <p className="text-xs text-gray-500 font-medium">Relato informado:</p>
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words mt-1">{dispute.description}</p>
      </div>

      {dispute.resolution && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 space-y-1">
          <p className="text-xs font-semibold text-emerald-800">Resolução do administrador:</p>
          <p className="text-sm text-emerald-900 whitespace-pre-wrap break-words">{dispute.resolution}</p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Aberta em {new Date(dispute.created_in).toLocaleDateString("pt-BR")}
        {dispute.resolved_in && ` · Finalizada em ${new Date(dispute.resolved_in).toLocaleDateString("pt-BR")}`}
      </p>
    </div>
  );
}
