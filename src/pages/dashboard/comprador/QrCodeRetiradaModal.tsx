import type { ProductBackend } from "../../../axios/Axios";
import { RecursoIndisponivel } from "./RecursoIndisponivel";

interface QrCodeRetiradaModalProps {
  aberto: boolean;
  aoFechar: () => void;
  produto: ProductBackend | null;
  codigoReserva?: string;
  quantidade?: number;
  dataRetirada?: string;
  fornecedorNome?: string;
}

export function QrCodeRetiradaModal({ aberto, aoFechar, produto }: QrCodeRetiradaModalProps) {
  if (!aberto || !produto) return null;
  return <RecursoIndisponivel titulo="Não há QR Code disponível" mensagem="Não há comprovante de retirada disponível. Uma simulação não gera autorização para retirar materiais." aoFechar={aoFechar} />;
}
export default QrCodeRetiradaModal;
