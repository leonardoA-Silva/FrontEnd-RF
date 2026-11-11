import { useEffect } from "react";
import { Info, X } from "lucide-react";

interface AvisoEmBreveProps {
  texto: string;
  onFechar: () => void;
}

// Aviso flutuante para telas e ações que ainda não existem.
export default function AvisoEmBreve({ texto, onFechar }: AvisoEmBreveProps) {
  useEffect(() => {
    const timer = setTimeout(onFechar, 4500);
    return () => clearTimeout(timer);
  }, [texto, onFechar]);

  return (
    <div
      role="status"
      className="fixed bottom-6 left-4 right-4 z-50 mx-auto flex max-w-md items-start gap-2.5 rounded-xl bg-verde-escuro px-4 py-3 text-[13px] leading-relaxed text-white shadow-lg sm:left-1/2 sm:right-auto sm:w-full sm:-translate-x-1/2"
    >
      <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p className="flex-1">
        A tela de <strong className="font-semibold">{texto}</strong> ainda está em
        desenvolvimento.
      </p>
      <button
        type="button"
        onClick={onFechar}
        aria-label="Fechar aviso"
        className="mt-0.5 rounded p-0.5 text-white/70 transition-colors hover:text-white"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
