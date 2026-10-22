import { Package, X } from "lucide-react";
import { DialogoComprador } from "./DialogoComprador";

export function RecursoIndisponivel({ titulo, mensagem, aoFechar }: { titulo: string; mensagem: string; aoFechar: () => void }) {
  return <DialogoComprador titulo={titulo} aoFechar={aoFechar}>
    <div className="relative w-full max-w-lg rounded-3xl border border-[#E7E4DA] bg-white p-6 sm:p-8 text-center shadow-2xl">
      <button type="button" onClick={aoFechar} aria-label="Fechar" className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
      <Package className="mx-auto mt-4 h-12 w-12 text-gray-300" /><h2 className="mt-4 text-xl font-bold text-[#0F3D2E]">{titulo}</h2>
      <p className="mt-3 text-sm text-gray-500">{mensagem}</p><button type="button" onClick={aoFechar} className="mt-6 rounded-xl bg-[#059669] px-5 py-3 text-sm font-bold text-white">Voltar aos materiais</button>
    </div>
  </DialogoComprador>;
}
