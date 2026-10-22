import { Link, useNavigate } from "react-router-dom";
import { Archive, ArrowLeft, CircleCheck, CreditCard, Leaf, QrCode } from "lucide-react";
import { DemoNotice, FlowUnavailable } from "./FlowNotice";
import MaterialImage from "./MaterialImage";
import { moeda, numero } from "./marketplaceData";
import { styles } from "./marketplaceStyles";
import { useMarketplaceFlow } from "./useMarketplaceFlow";

export default function ReservationCheckout() {
  const { material, reserva, setReserva } = useMarketplaceFlow();
  const navigate = useNavigate();
  if (!material) return <FlowUnavailable />;
  if (!reserva) return <FlowUnavailable materialId={material.id} />;
  const doacao = material.modalidade === "doacao";
  const total = doacao ? 0 : (material.preco ?? 0) * reserva.quantidade;
  function continuar() {
    if (!material || !reserva) return;
    if (doacao) {
      setReserva({ ...reserva, concluida: true });
      navigate(`/marketplace/confirmacao/${material.id}`);
    } else navigate(`/marketplace/pagamento/${material.id}/${reserva.metodo}`);
  }
  return <main className="mx-auto w-full flex-1 bg-[#f8f9fa] px-5 py-8 lg:px-[clamp(24px,6.25vw,100px)]">
    <Link to={`/marketplace/reserva/${material.id}`} className={styles.voltar}><ArrowLeft size={16} />Voltar para a solicitação</Link>
    <h1 className="mb-6 text-[28px] font-bold">Finalizar Reserva</h1><DemoNotice />
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:gap-[clamp(32px,8vw,160px)]">
      <div className="space-y-8">
        <section className={styles.painel}><h2 className="mb-6 flex items-center gap-2 text-xl font-bold"><Archive size={20} className="text-[var(--mkt-payment)]" />Resumo da Reserva</h2>
          <div className="flex items-center gap-4"><div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg"><MaterialImage src={material.fotos[0]} nome={material.nome} /></div><div className="min-w-0 flex-1"><h3 className="font-bold">{material.nome}</h3><p className="mt-1 text-xs text-[var(--mkt-muted)]">{material.empresa} • {numero(material.distancia)} km</p><p className="mt-4 text-sm">{numero(reserva.quantidade)} {material.unidade}</p></div><span className={`${styles.badge} hidden sm:inline-flex`}>{material.categoria}</span></div>
          <div className="mt-6 flex gap-3 rounded-lg border border-[#bbcac0] bg-[#f3f4f5] p-4 text-xs leading-relaxed text-[var(--mkt-muted)]"><Leaf size={18} className="shrink-0 text-[var(--mkt-payment)]" /><p>Você está escolhendo reaproveitar {numero(reserva.quantidade)} {material.unidade} de material da indústria local.</p></div>
        </section>
        <section className={`${styles.painel} pb-10`}>
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold"><CreditCard size={20} className="text-[var(--mkt-payment)]" />{doacao ? "Doação Gratuita" : "Método de Pagamento"}</h2>
          {doacao ? <p className={styles.texto}>Este material é uma doação. A reserva não tem preço e dispensa pagamento.</p> : <fieldset className="space-y-4"><legend className="sr-only">Escolha o método de pagamento demonstrativo</legend>{([{ id: "pix", nome: "PIX", descricao: "Visualizar código demonstrativo", Icon: QrCode }, { id: "cartao", nome: "Cartão de Crédito/Débito", descricao: "Selecionar ou adicionar um cartão demonstrativo", Icon: CreditCard }] as const).map(({ id, nome, descricao, Icon }) => <label key={id} className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 ${reserva.metodo === id ? "border-[var(--mkt-payment)] bg-[#f3f4f5]" : "border-[#bbcac0] bg-white"}`}><input type="radio" name="metodo" value={id} checked={reserva.metodo === id} onChange={() => setReserva({ ...reserva, metodo: id })} className="accent-[var(--mkt-payment)]" /><span className="flex-1"><strong className="block text-sm">{nome}</strong><span className="text-xs text-[var(--mkt-muted)]">{descricao}</span></span><Icon size={20} aria-hidden="true" /></label>)}</fieldset>}
        </section>
      </div>
      <aside className={styles.painel} aria-label="Total da reserva"><h2 className="border-b border-[#bbcac0] pb-4 text-xl font-bold">Total</h2><dl className="my-10 flex items-center justify-between gap-4"><dt className="text-sm text-[var(--mkt-muted)]">{doacao ? "Doação gratuita" : "Valor dos materiais"}</dt><dd className="text-xl font-bold text-[var(--mkt-payment)]">{moeda(total)}</dd></dl><button onClick={continuar} className={styles.pagamentoBotao}>{doacao ? "Confirmar Reserva Gratuitamente" : "Confirmar Reserva e Contribuir"}<CircleCheck size={18} className="shrink-0" aria-hidden="true" /></button><p className="mt-6 text-center text-xs leading-relaxed text-[var(--mkt-muted)]">Esta confirmação apenas avança no protótipo. Nenhuma cobrança será realizada.</p></aside>
    </div>
  </main>;
}
