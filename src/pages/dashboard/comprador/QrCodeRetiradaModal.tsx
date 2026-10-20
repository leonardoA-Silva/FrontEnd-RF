import React, { useState } from "react";
import { X, QrCode, Printer, Check, Copy, Building2, Calendar, Package } from "lucide-react";
import type { ProductBackend } from "../../../axios/Axios";

interface QrCodeRetiradaModalProps {
  aberto: boolean;
  aoFechar: () => void;
  produto: ProductBackend | null;
  codigoReserva?: string;
  quantidade?: number;
  dataRetirada?: string;
  fornecedorNome?: string;
}

export const QrCodeRetiradaModal: React.FC<QrCodeRetiradaModalProps> = ({
  aberto,
  aoFechar,
  produto,
  codigoReserva = "RF-84920",
  quantidade = 1,
  dataRetirada,
  fornecedorNome = "Calçados & Curtume Franca",
}) => {
  const [copiado, setCopiado] = useState(false);

  if (!aberto || !produto) return null;

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(codigoReserva);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-[#E7E4DA] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={aoFechar}
          className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cabeçalho */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <QrCode className="h-3.5 w-3.5 text-emerald-600" />
            Comprovante Oficial de Retirada
          </span>
          <h3 className="mt-3 text-xl sm:text-2xl font-extrabold text-[#0F3D2E] tracking-tight">
            QR Code de Retirada
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-[#6B7670] leading-relaxed">
            Apresente este código na portaria ou recepção da empresa para validação e liberação do material.
          </p>
        </div>

        {/* Box com QR Code Visual de Alta Resolução */}
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-[#FAF9F5] p-6 border-2 border-dashed border-[#D9D5C8]">
          <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* SVG QR Code simulado com padrões de localização característicos de QR */}
            <svg
              className="w-48 h-48 sm:w-52 sm:h-52 text-[#0F3D2E]"
              viewBox="0 0 120 120"
              fill="currentColor"
            >
              {/* Canto Superior Esquerdo - Finder */}
              <rect x="10" y="10" width="28" height="28" rx="4" fill="#0F3D2E" />
              <rect x="15" y="15" width="18" height="18" rx="2" fill="white" />
              <rect x="19" y="19" width="10" height="10" rx="1" fill="#0F3D2E" />

              {/* Canto Superior Direito - Finder */}
              <rect x="82" y="10" width="28" height="28" rx="4" fill="#0F3D2E" />
              <rect x="87" y="15" width="18" height="18" rx="2" fill="white" />
              <rect x="91" y="19" width="10" height="10" rx="1" fill="#0F3D2E" />

              {/* Canto Inferior Esquerdo - Finder */}
              <rect x="10" y="82" width="28" height="28" rx="4" fill="#0F3D2E" />
              <rect x="15" y="87" width="18" height="18" rx="2" fill="white" />
              <rect x="19" y="91" width="10" height="10" rx="1" fill="#0F3D2E" />

              {/* Linhas de sincronização e matriz de dados interna */}
              <rect x="42" y="14" width="4" height="4" rx="1" />
              <rect x="50" y="14" width="4" height="4" rx="1" />
              <rect x="58" y="14" width="4" height="4" rx="1" />
              <rect x="66" y="14" width="4" height="4" rx="1" />
              <rect x="74" y="14" width="4" height="4" rx="1" />

              <rect x="42" y="22" width="4" height="4" rx="1" />
              <rect x="58" y="22" width="4" height="4" rx="1" />
              <rect x="70" y="22" width="4" height="4" rx="1" />

              <rect x="46" y="30" width="4" height="4" rx="1" />
              <rect x="54" y="30" width="4" height="4" rx="1" />
              <rect x="62" y="30" width="4" height="4" rx="1" />

              {/* Centro de dados */}
              <rect x="14" y="46" width="4" height="4" rx="1" />
              <rect x="22" y="46" width="4" height="4" rx="1" />
              <rect x="34" y="46" width="4" height="4" rx="1" />
              <rect x="46" y="46" width="8" height="8" rx="2" fill="#059669" />
              <rect x="58" y="46" width="4" height="4" rx="1" />
              <rect x="70" y="46" width="4" height="4" rx="1" />
              <rect x="82" y="46" width="4" height="4" rx="1" />
              <rect x="94" y="46" width="4" height="4" rx="1" />
              <rect x="102" y="46" width="4" height="4" rx="1" />

              <rect x="14" y="58" width="4" height="4" rx="1" />
              <rect x="26" y="58" width="4" height="4" rx="1" />
              <rect x="42" y="58" width="4" height="4" rx="1" />
              <rect x="54" y="58" width="4" height="4" rx="1" />
              <rect x="66" y="58" width="8" height="8" rx="2" />
              <rect x="82" y="58" width="4" height="4" rx="1" />
              <rect x="98" y="58" width="4" height="4" rx="1" />

              <rect x="22" y="70" width="4" height="4" rx="1" />
              <rect x="38" y="70" width="4" height="4" rx="1" />
              <rect x="50" y="70" width="4" height="4" rx="1" />
              <rect x="62" y="70" width="4" height="4" rx="1" />
              <rect x="78" y="70" width="4" height="4" rx="1" />
              <rect x="90" y="70" width="4" height="4" rx="1" />
              <rect x="102" y="70" width="4" height="4" rx="1" />

              {/* Inferior direito dados */}
              <rect x="46" y="82" width="4" height="4" rx="1" />
              <rect x="58" y="82" width="4" height="4" rx="1" />
              <rect x="70" y="82" width="8" height="8" rx="2" fill="#059669" />
              <rect x="86" y="82" width="4" height="4" rx="1" />
              <rect x="98" y="82" width="4" height="4" rx="1" />

              <rect x="42" y="94" width="4" height="4" rx="1" />
              <rect x="54" y="94" width="4" height="4" rx="1" />
              <rect x="66" y="94" width="4" height="4" rx="1" />
              <rect x="82" y="94" width="4" height="4" rx="1" />
              <rect x="94" y="94" width="4" height="4" rx="1" />
              <rect x="102" y="94" width="4" height="4" rx="1" />

              <rect x="46" y="102" width="4" height="4" rx="1" />
              <rect x="58" y="102" width="4" height="4" rx="1" />
              <rect x="74" y="102" width="4" height="4" rx="1" />
              <rect x="90" y="102" width="4" height="4" rx="1" />
            </svg>
          </div>

          {/* Código de Identificação com Botão de Copiar */}
          <div className="mt-4 flex items-center gap-2">
            <span className="font-mono text-base sm:text-lg font-extrabold text-[#0F3D2E] tracking-wider bg-white px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
              {codigoReserva}
            </span>
            <button
              type="button"
              onClick={handleCopiarCodigo}
              title="Copiar código da reserva"
              className="flex items-center gap-1 rounded-xl bg-white border border-[#D9D5C8] px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition cursor-pointer"
            >
              {copiado ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-gray-500" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Detalhes Rápidos do Material e Retirada */}
        <div className="mt-5 space-y-2 rounded-2xl bg-[#FAF9F5] p-4 text-xs border border-[#ECE8DC]">
          <div className="flex items-center justify-between text-gray-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Package className="h-3.5 w-3.5 text-emerald-600" />
              Material:
            </span>
            <span className="font-bold text-gray-900 truncate max-w-[180px]">{produto.name}</span>
          </div>

          <div className="flex items-center justify-between text-gray-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-emerald-600" />
              Empresa Doadora/Vendedora:
            </span>
            <span className="font-semibold text-gray-800">{fornecedorNome}</span>
          </div>

          <div className="flex items-center justify-between text-gray-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
              Data Prevista:
            </span>
            <span className="font-semibold text-gray-800">
              {dataRetirada || "A combinar com a empresa"}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-600 pt-1 border-t border-gray-200">
            <span className="font-medium">Quantidade:</span>
            <span className="font-bold text-emerald-700">{quantidade} {Number(produto.weight) > 0 ? "kg / unid." : "unid."}</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleImprimir}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#D9D5C8] bg-white py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Imprimir Comprovante
          </button>
          <button
            type="button"
            onClick={aoFechar}
            className="flex-1 flex items-center justify-center rounded-xl bg-[#0B4D34] hover:bg-[#083A27] py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-xs cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
export default QrCodeRetiradaModal;
