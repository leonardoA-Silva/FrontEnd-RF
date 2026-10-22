import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { styles } from "./marketplaceStyles";

export function DemoNotice() {
  return <div role="note" className="mb-6 flex items-start gap-2 rounded-lg bg-[var(--mkt-soft)] px-4 py-3 text-xs leading-relaxed text-[var(--mkt-dark)]"><Info size={16} className="shrink-0" aria-hidden="true" /><p><strong>Fluxo demonstrativo.</strong> Nenhuma reserva é enviada e nenhum pagamento é realizado. A integração com o serviço de reservas e pagamentos está pendente.</p></div>;
}

export function FlowUnavailable({ materialId }: { materialId?: string }) {
  return <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16 text-center"><h1 className={styles.titulo}>{materialId ? "Retome sua solicitação" : "Material não encontrado"}</h1><p className={`${styles.texto} my-5`}>{materialId ? "Os dados desta demonstração ficam apenas nesta sessão. Preencha a solicitação para continuar." : "Este material não está no catálogo demonstrativo. Volte para encontrar outros materiais."}</p><Link to={materialId ? `/marketplace/reserva/${materialId}` : "/marketplace"} className={styles.botao}>{materialId ? "Preencher solicitação" : "Voltar ao Marketplace"}</Link></main>;
}
