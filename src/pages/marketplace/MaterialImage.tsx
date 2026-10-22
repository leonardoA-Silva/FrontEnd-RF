import { useState } from "react";
import { Package } from "lucide-react";
export default function MaterialImage({ src, nome, prioridade = false }: { src?: string; nome: string; prioridade?: boolean }) {
  const [falhou, setFalhou] = useState(false);
  return src && !falhou
    ? <img src={src} alt={nome} width={640} height={400} loading={prioridade ? "eager" : "lazy"} fetchPriority={prioridade ? "high" : "auto"} onError={() => setFalhou(true)} className="h-full w-full object-cover" />
    : <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#f3f4f5] text-gray-500"><Package size={28} aria-hidden="true" /><span className="text-xs">Imagem indisponível</span></div>;
}
