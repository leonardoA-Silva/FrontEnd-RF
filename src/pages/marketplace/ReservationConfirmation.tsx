import { Link, useOutletContext } from "react-router-dom";
import { CalendarDays, Check, ShieldCheck } from "lucide-react";
import type { MarketplaceContext } from "./MarketplaceLayout";
import { DemoNotice, FlowUnavailable } from "./FlowNotice";
import { materiais, moeda, numero } from "./marketplaceData";
import { styles } from "./marketplaceStyles";
import { useMarketplaceFlow } from "./useMarketplaceFlow";

export default function ReservationConfirmation() {
  const { material, reserva } = useMarketplaceFlow();
  if (!material) return <FlowUnavailable />;
  if (!reserva?.concluida) return <FlowUnavailable materialId={material.id} />;
  const data = new Intl.DateTimeFormat("pt-BR").format(new Date(`${reserva.data}T12:00:00`));
  const total = material.modalidade === "doacao" ? 0 : (material.preco ?? 0) * reserva.quantidade;
  return <main className="mx-auto w-full max-w-[864px] flex-1 px-5 py-12 sm:px-8 sm:py-16">
    <div className="mb-8 text-center"><span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-[var(--mkt-soft)] text-[var(--mkt-primary)] shadow-sm"><Check size={42} strokeWidth={1.5} aria-hidden="true" /></span><h1 className={styles.titulo}>Reserva Confirmada!</h1><p className={`${styles.texto} mt-3`}><strong>Simulação concluída.</strong> Nenhuma reserva foi enviada ao fornecedor e nenhum pagamento foi aprovado.</p></div>
    <DemoNotice />
    <section className={styles.painel}><div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--mkt-line)] pb-6"><div><h2 className="text-xs font-semibold text-amber-700">NÚMERO DA RESERVA DEMONSTRATIVA</h2><p className="mt-1 text-xl font-extrabold">DEMO-0001</p></div><span className={`${styles.badge} gap-1`}><ShieldCheck size={14} />Demonstração</span></div>
      <dl className="grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">{[{ label: "Material Selecionado", valor: material.nome }, { label: "Fornecedor parceiro", valor: material.empresa }, { label: "Quantidade Reservada", valor: `${numero(reserva.quantidade)} ${material.unidade}` }, { label: "Finalidade Declarada", valor: reserva.finalidade }, { label: "Previsão de Retirada", valor: data }, { label: "Local de Retirada", valor: "Franca - SP (ilustrativo)" }, { label: "Valor demonstrativo", valor: material.modalidade === "doacao" ? "Doação gratuita • sem cobrança" : moeda(total) }, { label: "Método selecionado", valor: material.modalidade === "doacao" ? "Não se aplica" : reserva.metodo === "pix" ? "Pix demonstrativo" : "Cartão demonstrativo" }].map(({ label, valor }) => <div key={label}><dt className="mb-1 text-xs text-gray-500">{label}</dt><dd className="font-semibold">{valor}</dd></div>)}</dl>
    </section>
    <section className={`${styles.painel} mt-8`}><h2 className={`${styles.subtitulo} mb-6`}>Próximos Passos</h2><ol className="space-y-5">{[{ titulo: "Aguarde o contato de confirmação", texto: "No fluxo integrado, o fornecedor receberá a solicitação para confirmar os detalhes da retirada." }, { titulo: "Prepare a retirada do material", texto: "Após uma confirmação real, confira com a empresa as condições de coleta e os detalhes do material." }, { titulo: "Realize a pesagem física", texto: "A quantidade final deve ser conferida em conjunto durante a retirada." }].map((passo, index) => <li key={passo.titulo} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--mkt-soft)] text-sm font-semibold text-[var(--mkt-dark)]">{index + 1}</span><div><h3 className="text-sm font-bold">{passo.titulo}</h3><p className={`${styles.texto} mt-1 text-xs`}>{passo.texto}</p></div></li>)}</ol></section>
    <div className="mt-8 flex flex-col gap-4 sm:flex-row"><Link to="/marketplace/minhas-reservas" className={`${styles.botao} flex-1`}>Ver Minhas Reservas</Link><Link to="/marketplace" className={`${styles.secundario} flex-1`}>Voltar ao Marketplace</Link></div>
  </main>;
}

export function DemoReservations() {
  const { reserva, setReserva } = useOutletContext<MarketplaceContext>();
  const material = materiais.find(item => item.id === reserva?.materialId);
  return <main className="mx-auto w-full max-w-[864px] flex-1 px-5 py-12"><h1 className={`${styles.titulo} mb-6`}>Minhas Reservas</h1><DemoNotice />{reserva?.concluida && material ? <section className={styles.painel}><h2 className={styles.subtitulo}>{material.nome}</h2><p className={`${styles.texto} my-4`}>{numero(reserva.quantidade)} {material.unidade} • Reserva demonstrativa desta sessão</p><div className="flex flex-wrap gap-3"><Link className={styles.botao} to={`/marketplace/confirmacao/${material.id}`}><CalendarDays size={16} />Ver demonstração</Link><button className={styles.secundario} onClick={() => setReserva(null)}>Limpar demonstração</button></div></section> : <section className={`${styles.painel} text-center`}><h2 className={styles.subtitulo}>Nenhuma reserva demonstrativa</h2><p className={`${styles.texto} my-4`}>Explore os materiais e percorra o protótipo para visualizar uma reserva aqui.</p><Link to="/marketplace" className={styles.botao}>Explorar Materiais</Link></section>}</main>;
}
