import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CircleCheck, Copy, CreditCard, LockKeyhole, Plus, QrCode } from "lucide-react";
import { FlowUnavailable } from "./FlowNotice";
import MaterialImage from "./MaterialImage";
import PaymentFrame from "./PaymentFrame";
import { moeda, numero } from "./marketplaceData";
import { styles } from "./marketplaceStyles";
import { useMarketplaceFlow } from "./useMarketplaceFlow";

export default function ReservationPayment() {
  const { material, reserva, setReserva } = useMarketplaceFlow();
  const { metodo } = useParams();
  const navigate = useNavigate();
  const [copia, setCopia] = useState<"inicial" | "copiando" | "copiado" | "erro">("inicial");
  const [cartaoSelecionado, setCartaoSelecionado] = useState(true);
  if (!material) return <FlowUnavailable />;
  if (!reserva || material.modalidade === "doacao") return <FlowUnavailable materialId={material.id} />;
  if (metodo !== "pix" && metodo !== "cartao" && metodo !== "novo-cartao") return <FlowUnavailable materialId={material.id} />;
  const total = (material.preco ?? 0) * reserva.quantidade;
  const pix = metodo === "pix";
  const novoCartao = metodo === "novo-cartao";
  const codigoDemo = "DEMONSTRACAO-SEM-VALOR-PARA-PAGAMENTO";
  async function copiar() {
    setCopia("copiando");
    try { await navigator.clipboard.writeText(codigoDemo); setCopia("copiado"); }
    catch { setCopia("erro"); }
  }
  function concluir(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!material || !reserva) return;
    setReserva({ ...reserva, metodo: pix ? "pix" : "cartao", concluida: true });
    navigate(`/marketplace/confirmacao/${material.id}`);
  }
  const rodape = <div className={styles.pagamentoRodape}><div className="flex flex-wrap items-center justify-between gap-3"><span className="font-bold text-[var(--mkt-muted)]">Total</span><strong className="text-[28px] text-[var(--mkt-payment)]">{moeda(total)}</strong></div><button type={novoCartao ? "submit" : "button"} onClick={novoCartao ? undefined : () => concluir()} disabled={!pix && !novoCartao && !cartaoSelecionado} className={styles.pagamentoBotao}>Confirmar Reserva e Contribuir<CircleCheck size={18} className="shrink-0" aria-hidden="true" /></button>{novoCartao && <p className="flex items-center justify-center gap-1 text-center text-xs text-[var(--mkt-muted)]"><LockKeyhole size={12} aria-hidden="true" />Cartão ilustrativo • sem processamento de pagamento</p>}</div>;

  return <PaymentFrame materialId={material.id} estreito={pix}>
    {pix ? <section className={styles.pagamentoPainel}>
      <h1 className="border-b border-[#bbcac0] px-6 py-6 text-center text-sm font-semibold">CÓDIGO DE PAGAMENTO</h1>
      <div className="p-6 sm:p-8"><div className="mx-auto flex aspect-square w-full max-w-[256px] flex-col items-center justify-center gap-3 rounded-lg border border-[#bbcac0] bg-[#f8f9fa]"><QrCode size={112} strokeWidth={1.2} aria-hidden="true" /><span className="text-sm font-bold text-[var(--mkt-dark)]">PIX demonstrativo</span><span className="text-xs text-[var(--mkt-muted)]">Sem valor para pagamento</span></div>
        <p className="mt-8 mb-2 text-xs font-semibold text-[var(--mkt-payment)]">COPIAR CÓDIGO</p><button type="button" onClick={copiar} disabled={copia === "copiando"} className="flex w-full items-start gap-3 rounded-md border border-[#bbcac0] bg-[#f3f4f5] p-4 text-left text-xs leading-relaxed text-[var(--mkt-muted)]" aria-label="Copiar código demonstrativo sem valor para pagamento"><span className="min-w-0 flex-1 break-all">{codigoDemo}</span><Copy size={16} className="shrink-0 text-[var(--mkt-payment)]" /></button>
        <p role="status" className="mt-3 min-h-5 text-xs text-[var(--mkt-muted)]">{copia === "copiando" ? "Copiando..." : copia === "copiado" ? "Código demonstrativo copiado." : copia === "erro" ? "Não foi possível copiar. Selecione o texto acima e copie manualmente." : "O código desta tela é apenas ilustrativo."}</p>
      </div>{rodape}
    </section> : novoCartao ? <form onSubmit={concluir} className={styles.pagamentoPainel}>
      <header className="border-b border-[var(--mkt-line)] p-6 sm:px-8"><h1 className="text-xl font-bold">Adicionar Cartão de Pagamento</h1><p className={`${styles.texto} mt-2`}>Visualize os campos do cartão para confirmar a reserva do material.</p></header>
      <div className="space-y-6 p-6 sm:p-8"><div className="mx-auto flex aspect-[1.83] w-full max-w-[256px] flex-col justify-between rounded-lg bg-[var(--mkt-payment)] p-5 text-white shadow-md" role="img" aria-label="Cartão ilustrativo de demonstração"><CreditCard size={28} /><span className="text-sm tracking-widest">•••• •••• •••• 1234</span><span className="text-[10px] uppercase">Cartão de demonstração</span></div>
        <p className="text-xs text-[var(--mkt-muted)]">Os campos são ilustrativos e não aceitam dados reais de cartão.</p>
        <label className={styles.etiqueta}>Número do Cartão<input readOnly value="•••• •••• •••• 1234" className={`${styles.campo} bg-[#f8f9fa]`} /></label>
        <label className={styles.etiqueta}>Nome do Titular<input readOnly value="TITULAR DE DEMONSTRAÇÃO" className={`${styles.campo} bg-[#f8f9fa]`} /></label>
        <div className="grid gap-6 sm:grid-cols-2"><label className={styles.etiqueta}>Data de Validade<input readOnly value="MM/AA" className={`${styles.campo} bg-[#f8f9fa]`} /></label><label className={styles.etiqueta}>Código de Segurança (CVV/CVC)<input readOnly value="•••" className={`${styles.campo} bg-[#f8f9fa]`} /></label></div>
        <Link to={`/marketplace/pagamento/${material.id}/cartao`} className="text-sm font-semibold text-[var(--mkt-payment)] hover:underline">Voltar para selecionar cartão</Link>
      </div>{rodape}
    </form> : <section className={styles.pagamentoPainel}>
      <div className="flex items-center gap-4 border-b border-[#bbcac0] bg-[#f8f9fa] p-6"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg"><MaterialImage src={material.fotos[0]} nome={material.nome} /></div><div><h1 className="text-base font-bold">{material.nome}</h1><p className="mt-1 text-xs text-[var(--mkt-muted)]">{material.empresa} • {numero(material.distancia)} km</p><div className="mt-1 flex flex-wrap items-center gap-2"><span className={styles.badge}>{material.categoria}</span><span className="text-xs text-[var(--mkt-payment)]">{numero(reserva.quantidade)} {material.unidade}</span></div></div></div>
      <fieldset className="px-6 py-12 sm:px-8"><legend className="sr-only">Selecionar cartão demonstrativo</legend><h2 className="mb-6 text-sm font-medium">SELECIONE/ADICIONE UM CARTÃO</h2><label className="flex cursor-pointer items-center gap-4 rounded-lg border border-[#bbcac0] p-4"><input type="radio" name="cartao" checked={cartaoSelecionado} onChange={() => setCartaoSelecionado(true)} className="accent-[var(--mkt-payment)]" /><CreditCard size={28} aria-hidden="true" /><span className="text-sm">Crédito • Cartão virtual de demonstração<span className="mt-1 block text-xs text-[var(--mkt-muted)]">•••• 1234</span></span></label><Link to={`/marketplace/pagamento/${material.id}/novo-cartao`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--mkt-payment)] hover:underline"><Plus size={14} />ADICIONAR NOVO CARTÃO</Link></fieldset>{rodape}
    </section>}
  </PaymentFrame>;
}
