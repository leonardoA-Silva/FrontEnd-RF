import { useState } from "react";
import { X, MapPin, Building2, MessageSquare, ShoppingBag, Info, Package } from "lucide-react";
import type { ProductBackend } from "../../../axios/Axios";
import { COMPRA_EXEMPLO, estadoMaterial, imagensMaterial, precoMaterial } from "../../marketplace/catalogo";
import { DialogoComprador } from "./DialogoComprador";

interface ResiduoDetalheModalProps {
  aberto: boolean;
  aoFechar: () => void;
  produto: ProductBackend | null;
  aoIniciarReserva: (produto: ProductBackend) => void;
  aoAbrirContato: (produto: ProductBackend) => void;
  empresaNome?: string;
  pagina?: boolean;
}

export function ResiduoDetalheModal({ aberto, aoFechar, produto, aoIniciarReserva, aoAbrirContato, empresaNome, pagina = false }: ResiduoDetalheModalProps) {
  const [fotoSelecionada, setFotoSelecionada] = useState(0);
  const [imagemFalhou, setImagemFalhou] = useState(false);
  if (!aberto || !produto) return null;
  const fotos = imagensMaterial(produto);
  const conteudo = <div className={`relative w-full bg-white ${pagina ? "border border-[#E2E9E5] p-5 sm:p-7 rounded-md" : "max-w-4xl rounded border border-[#E7E4DA] p-5 sm:p-8 shadow-xl"}`}>
      {!pagina && <button type="button" onClick={aoFechar} aria-label="Fechar detalhes" className="absolute right-4 top-4 z-10 rounded-full border border-gray-100 bg-white/90 p-2 text-gray-500 shadow-sm hover:bg-gray-100"><X className="h-5 w-5" /></button>}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-gray-100 border border-[#E2E9E5]">
            {fotos.length > 0 && !imagemFalhou ? <img src={fotos[fotoSelecionada] || fotos[0]} alt={`Imagem ilustrativa de ${produto.name}`} onError={() => setImagemFalhou(true)} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-gray-500"><Package className="h-12 w-12" />Sem imagem disponível</div>}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5"><span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold">{produto.category}</span><span className="rounded-full bg-[#00875B] px-3 py-1 text-xs font-bold text-white">{produto.type_negotiation === "donation" ? "Doação" : "Venda"}</span></div>
          </div>
          {fotos.length > 0 && <p className="text-xs text-gray-500">Imagem ilustrativa. Não há fotos do anúncio disponíveis.</p>}
          {fotos.length > 1 && <div className="grid grid-cols-4 gap-2">{fotos.map((foto, index) => <button key={foto} type="button" aria-label={`Ver imagem ilustrativa ${index + 1}`} aria-pressed={index === fotoSelecionada} onClick={() => { setFotoSelecionada(index); setImagemFalhou(false); }} className={`aspect-4/3 overflow-hidden rounded-sm border-2 ${fotoSelecionada === index ? "border-emerald-600" : "border-gray-100"}`}><img src={foto} alt="" className="h-full w-full object-cover" /></button>)}</div>}
        </div>
        <div className="lg:col-span-6">
          <p className="pr-8 flex items-center gap-2 text-xs text-gray-500"><MapPin className="h-4 w-4 shrink-0" />Localização não informada</p>
          <h2 className="mt-2 text-xl sm:text-2xl font-bold text-[#0F3D2E] tracking-tight">{produto.name}</h2>
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 rounded-md border border-[#ECE8DC] bg-[#F7F9F8] p-4">
            <div><span className="text-[11px] font-bold uppercase text-gray-400">Valor informado</span><p className="text-2xl font-extrabold">{precoMaterial(produto)}</p></div>
            <div><span className="text-[11px] font-bold uppercase text-gray-400">Disponibilidade</span><p className="font-bold">{produto.status === "available" ? `${produto.quantity} unidades` : "Indisponível"}</p></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div className="rounded border border-gray-100 p-3"><span className="block text-gray-400 uppercase">Conservação</span><strong className="mt-1 block">{estadoMaterial(produto.conservation_state)}</strong></div><div className="rounded border border-gray-100 p-3"><span className="block text-gray-400 uppercase">Peso informado</span><strong className="mt-1 block">{Number.isFinite(Number(produto.weight)) && Number(produto.weight) > 0 ? `${produto.weight} kg` : "Não informado"}</strong></div></div>
          <div className="mt-5"><h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-gray-500"><Info className="h-4 w-4" />Descrição do material</h3><p className="rounded-md border border-[#ECE8DC] bg-[#F7F9F8] p-3.5 text-sm text-gray-600">{produto.description?.trim() || "Não há descrição disponível para este material."}</p></div>
          <div className="mt-5 flex items-center gap-3 rounded-md border border-[#E7E4DA] p-4"><Building2 className="h-8 w-8 text-emerald-700" /><div><h3 className="text-sm font-bold">{empresaNome || "Fornecedor não informado"}</h3><p className="mt-1 text-xs text-gray-500">Não há avaliações disponíveis.</p></div></div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={() => aoAbrirContato(produto)} className="flex items-center justify-center gap-2 rounded-md border border-[#D9D5C8] px-4 py-3 text-sm font-semibold"><MessageSquare className="h-4 w-4" />Contato</button>
            <button type="button" disabled={produto.status !== "available" || produto.quantity < 1} onClick={() => aoIniciarReserva(produto)} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#00875B] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><ShoppingBag className="h-4 w-4" />{produto.id === COMPRA_EXEMPLO.id ? "Simular compra" : "Solicitar reserva"}</button>
          </div>
        </div>
      </div>
    </div>;
  return pagina ? conteudo : <DialogoComprador titulo={`Detalhes de ${produto.name}`} aoFechar={aoFechar}>{conteudo}</DialogoComprador>;
}
export default ResiduoDetalheModal;
