import React, { useState } from "react";
import { X, Star, CheckCircle, MessageSquare, ThumbsUp } from "lucide-react";
import type { ProductBackend } from "../../../axios/Axios";

interface AvaliacaoColetaModalProps {
  aberto: boolean;
  aoFechar: () => void;
  produto: ProductBackend | null;
  aoAvaliar: (dados: { estrelas: number; tags: string[]; comentario: string }) => void;
  empresaNome?: string;
}

const CRITERIOS_TAGS = [
  "Material de alta qualidade",
  "Fiel às fotos e descrição",
  "Retirada ágil e organizada",
  "Excelente comunicação",
  "Embalagem / fardos adequados",
  "Bom estado de conservação",
];

export const AvaliacaoColetaModal: React.FC<AvaliacaoColetaModalProps> = ({
  aberto,
  aoFechar,
  produto,
  aoAvaliar,
  empresaNome = "Calçados & Curtume Franca",
}) => {
  const [estrelas, setEstrelas] = useState<number>(5);
  const [hoverEstrelas, setHoverEstrelas] = useState<number | null>(null);
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>([
    "Material de alta qualidade",
    "Retirada ágil e organizada",
  ]);
  const [comentario, setComentario] = useState<string>("");
  const [enviado, setEnviado] = useState<boolean>(false);

  if (!aberto || !produto) return null;

  const toggleTag = (tag: string) => {
    setTagsSelecionadas((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
    aoAvaliar({ estrelas, tags: tagsSelecionadas, comentario });
    setTimeout(() => {
      setEnviado(false);
      aoFechar();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#E7E4DA] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95">
        {/* Fechar */}
        <button
          type="button"
          onClick={aoFechar}
          className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {enviado ? (
          <div className="py-10 text-center animate-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0F3D2E]">
              Obrigado pela sua avaliação!
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Seu feedback contribui para a transparência e credibilidade da rede circular de Franca.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Topo */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                Avaliação de Coleta & Qualidade
              </span>
              <h3 className="mt-3 text-xl sm:text-2xl font-extrabold text-[#0F3D2E] tracking-tight">
                Como foi sua experiência?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[#6B7670]">
                Avalie o lote <strong>"{produto.name}"</strong> fornecido por <strong>{empresaNome}</strong>.
              </p>
            </div>

            {/* Estrelas */}
            <div className="my-6 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((nota) => {
                  const preenchida = (hoverEstrelas ?? estrelas) >= nota;
                  return (
                    <button
                      key={nota}
                      type="button"
                      onMouseEnter={() => setHoverEstrelas(nota)}
                      onMouseLeave={() => setHoverEstrelas(null)}
                      onClick={() => setEstrelas(nota)}
                      className="p-1 transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`h-8 w-8 sm:h-9 sm:w-9 ${
                          preenchida
                            ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                            : "text-gray-300 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-gray-600">
                {estrelas === 5
                  ? "Excelente! Superou expectativas"
                  : estrelas === 4
                  ? "Muito Bom! Material de qualidade"
                  : estrelas === 3
                  ? "Regular, atendeu ao básico"
                  : estrelas === 2
                  ? "Abaixo do esperado"
                  : "Experiência insatisfatória"}
              </span>
            </div>

            {/* Tags de Destaques Positivos */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2 flex items-center gap-1.5">
                <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                O que você mais gostou?
              </label>
              <div className="flex flex-wrap gap-2">
                {CRITERIOS_TAGS.map((tag) => {
                  const sel = tagsSelecionadas.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        sel
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-[#F4F2EC] text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comentário Aberto */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                Comentário ou Sugestão (Opcional)
              </label>
              <textarea
                rows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Conte como o resíduo ajudará na sua produção ou projeto circular..."
                className="w-full rounded-2xl border border-[#D9D5C8] p-3 text-xs sm:text-sm text-gray-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={aoFechar}
                className="rounded-xl border border-[#D9D5C8] px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#0B4D34] hover:bg-[#083A27] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition cursor-pointer"
              >
                Enviar Avaliação
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default AvaliacaoColetaModal;
