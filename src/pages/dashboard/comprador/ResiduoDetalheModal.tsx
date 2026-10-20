import React, { useState } from "react";
import {
  X,
  MapPin,
  Building2,
  ShieldCheck,
  Star,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Info,
} from "lucide-react";
import type { ProductBackend } from "../../../axios/Axios";

interface ResiduoDetalheModalProps {
  aberto: boolean;
  aoFechar: () => void;
  produto: ProductBackend | null;
  aoIniciarReserva: (produto: ProductBackend) => void;
  aoAbrirContato: (produto: ProductBackend) => void;
  empresaNome?: string;
}

// Imagens ilustrativas de resíduos industriais por categoria para exibição de alta fidelidade
const IMAGENS_EXEMPLO: Record<string, string[]> = {
  couro: [
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  ],
  madeira: [
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
  ],
  metal: [
    "https://images.unsplash.com/photo-1530982011887-3ce11ab8212a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
  ],
  tecido: [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
  ],
  padrao: [
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
  ],
};

export const ResiduoDetalheModal: React.FC<ResiduoDetalheModalProps> = ({
  aberto,
  aoFechar,
  produto,
  aoIniciarReserva,
  aoAbrirContato,
  empresaNome = "Curtume & Calçados Franca Ltda",
}) => {
  const [fotoSelecionadaIdx, setFotoSelecionadaIdx] = useState<number>(0);

  if (!aberto || !produto) return null;

  // Obtém imagens correspondentes
  const categoriaKey = (produto.category || "").toLowerCase();
  const fotosGaleria =
    IMAGENS_EXEMPLO[categoriaKey] ||
    (categoriaKey.includes("couro") ? IMAGENS_EXEMPLO.couro : null) ||
    (categoriaKey.includes("madeira") ? IMAGENS_EXEMPLO.madeira : null) ||
    (categoriaKey.includes("tecido") ? IMAGENS_EXEMPLO.tecido : null) ||
    IMAGENS_EXEMPLO.padrao;

  const fotoPrincipal = fotosGaleria[fotoSelecionadaIdx] || fotosGaleria[0];

  const formatarPreco = (preco: number | string | null, tipo: string) => {
    if (tipo === "donation" || preco === 0 || preco === "0") {
      return "Gratuito (Doação)";
    }
    const val = Number(preco) || 0;
    return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatarEstadoConservacao = (estado: string) => {
    switch (estado) {
      case "new":
        return "Novo / Sobra de Linha";
      case "good":
        return "Bom Estado";
      case "regular":
        return "Regular / Aproveitável";
      case "poor":
        return "Sucata / Para Reciclagem";
      default:
        return "Bom Estado";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-[#E7E4DA] bg-white p-5 sm:p-8 shadow-2xl animate-in zoom-in-95">
        {/* Botão Fechar Flutuante */}
        <button
          type="button"
          onClick={aoFechar}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 shadow-sm border border-gray-100 transition cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Grade Principal: Fotos à esquerda, Informações à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* COLUNA ESQUERDA: GALERIA DE FOTOS */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            {/* Foto Grande Principal */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-gray-100 border border-[#ECE8DC] shadow-inner">
              <img
                src={fotoPrincipal}
                alt={produto.name}
                className="h-full w-full object-cover transition duration-300 hover:scale-105"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0F3D2E] shadow-xs backdrop-blur-xs">
                  {produto.category.toUpperCase()}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold shadow-xs ${
                    produto.type_negotiation === "donation"
                      ? "bg-amber-500 text-white"
                      : "bg-[#059669] text-white"
                  }`}
                >
                  {produto.type_negotiation === "donation" ? "Doação" : "Venda"}
                </span>
              </div>
            </div>

            {/* Miniaturas Clicáveis */}
            <div className="grid grid-cols-4 gap-2">
              {fotosGaleria.map((img, idx) => {
                const ativo = fotoSelecionadaIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFotoSelecionadaIdx(idx)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                      ativo
                        ? "border-[#059669] ring-2 ring-emerald-200"
                        : "border-[#ECE8DC] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>

            {/* Card Informativo de Sustentabilidade Circular */}
            <div className="rounded-2xl bg-[#EBF6F2] p-4 border border-[#D5EADB] text-xs text-[#0F3D2E] flex items-start gap-3 mt-1">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold">Impacto Sustentável Garantido</p>
                <p className="text-gray-600 mt-0.5 leading-relaxed">
                  Ao reservar este lote, você reduz o envio de sobras para aterros e economiza matéria-prima na produção artesanal ou industrial de Franca.
                </p>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: INFORMAÇÕES DETALHADAS */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Localização e Badges */}
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>Distrito Industrial • Franca - SP</span>
              </div>

              {/* Título Principal */}
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#0F3D2E] tracking-tight leading-tight">
                {produto.name}
              </h2>

              {/* Box de Preço e Quantidade */}
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-[#FAF9F5] p-4 border border-[#ECE8DC]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    VALOR DO LOTE
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E]">
                    {formatarPreco(produto.price, produto.type_negotiation)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    DISPONIBILIDADE
                  </span>
                  <div className="text-base font-extrabold text-gray-800">
                    {produto.quantity} {Number(produto.weight) > 0 ? `unid. (${produto.weight} kg)` : "unidades"}
                  </div>
                </div>
              </div>

              {/* Especificações Rápidas */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-2xs">
                  <span className="text-gray-400 font-semibold block text-[11px] uppercase">
                    ESTADO DE CONSERVAÇÃO
                  </span>
                  <span className="font-bold text-gray-800 mt-1 block">
                    {formatarEstadoConservacao(produto.conservation_state)}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-2xs">
                  <span className="text-gray-400 font-semibold block text-[11px] uppercase">
                    PESO TOTAL ESTIMADO
                  </span>
                  <span className="font-bold text-gray-800 mt-1 block">
                    {produto.weight} kg
                  </span>
                </div>
              </div>

              {/* Descrição Detalhada */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-emerald-600" />
                  Descrição do Material
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed rounded-2xl bg-[#FAF9F5] p-3.5 border border-[#ECE8DC]">
                  {produto.description ||
                    "Material recolhido de linhas produtivas de alta qualidade de Franca. Lote limpo, embalado e pronto para coleta presencial na sede da fábrica."}
                </p>
              </div>

              {/* Card da Empresa Anunciante */}
              <div className="mt-5 rounded-2xl border border-[#E7E4DA] bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-[#0B4D34] font-bold text-lg">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-[#1F2A26]">{empresaNome}</h4>
                        <span title="Empresa Verificada">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                        <div className="flex items-center text-amber-500">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="font-bold ml-1 text-gray-700">4.9</span>
                        </div>
                        <span>• Indústria Parceira Certificada</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO (Conforme design do Figma) */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => aoAbrirContato(produto)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9D5C8] bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-xs"
              >
                <MessageSquare className="h-4 w-4 text-emerald-700" />
                <span>Falar com a Fábrica</span>
              </button>

              <button
                type="button"
                onClick={() => aoIniciarReserva(produto)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#059669] hover:bg-[#047857] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Solicitar Reserva</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResiduoDetalheModal;
