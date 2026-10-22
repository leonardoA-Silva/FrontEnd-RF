import type { ProductBackend } from "../../../axios/Axios";
import { RecursoIndisponivel } from "./RecursoIndisponivel";

interface ChatReservaModalProps {
  aberto: boolean;
  aoFechar: () => void;
  produto: ProductBackend | null;
  empresaNome?: string;
  usuarioNome?: string;
}

export function ChatReservaModal({ aberto, aoFechar, produto }: ChatReservaModalProps) {
  if (!aberto || !produto) return null;
  return <RecursoIndisponivel titulo="Não há atendimento disponível" mensagem="Não há conversa disponível com este fornecedor no momento. Nenhuma mensagem foi enviada." aoFechar={aoFechar} />;
}
export default ChatReservaModal;
