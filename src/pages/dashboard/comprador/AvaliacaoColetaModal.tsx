import type { ProductBackend } from "../../../axios/Axios";
import { RecursoIndisponivel } from "./RecursoIndisponivel";

interface AvaliacaoColetaModalProps {
  aberto: boolean;
  aoFechar: () => void;
  produto: ProductBackend | null;
  aoAvaliar: (dados: { estrelas: number; tags: string[]; comentario: string }) => void;
  empresaNome?: string;
}

export function AvaliacaoColetaModal({ aberto, aoFechar, produto }: AvaliacaoColetaModalProps) {
  if (!aberto || !produto) return null;
  return <RecursoIndisponivel titulo="Não há avaliações disponíveis" mensagem="O envio de avaliações não está disponível no momento. Nenhuma avaliação foi registrada." aoFechar={aoFechar} />;
}
export default AvaliacaoColetaModal;
