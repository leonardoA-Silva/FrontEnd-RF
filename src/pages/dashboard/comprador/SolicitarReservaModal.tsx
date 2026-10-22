import { useEffect, useRef, useState, type FormEvent } from "react";
import { X, ArrowRight, ArrowLeft, CheckCircle2, Calendar, Package, CreditCard, Copy, Check, Minus, Plus, ShieldCheck, QrCode } from "lucide-react";
import type { ProductBackend } from "../../../axios/Axios";
import { COMPRA_EXEMPLO, IMAGENS_EXEMPLO } from "../../marketplace/catalogo";
import { DialogoComprador } from "./DialogoComprador";

export type MetodoPagamento = "pix" | "cartao_credito" | "cartao_debito" | "doacao";

export interface DadosReservaFinalizada {
  id: string;
  codigo: string;
  produtoId: string;
  produtoNome: string;
  categoria: string;
  quantidade: number;
  tipoNegociacao: string;
  valorTotal: number;
  metodoPagamento?: MetodoPagamento;
  finalidade: string;
  dataRetirada: string;
  turnoRetirada: "manha" | "tarde";
  observacoes: string;
  fornecedorNome: string;
  status: "pendente" | "aprovada" | "coletada" | "cancelada";
  dataCriacao: string;
}

interface SolicitarReservaModalProps {
  aberto: boolean;
  aoFechar: () => void;
  produto: ProductBackend | null;
  usuarioNome: string;
  usuarioDoc?: string;
  usuarioTelefone?: string;
  fornecedorNome?: string;
  simulacao?: boolean;
  pagina?: boolean;
  etapaSolicitada?: 1 | 2 | 3;
  aoMudarEtapa?: (etapa: 1 | 2 | 3) => void;
  aoConfirmarReserva?: (dados: DadosReservaFinalizada) => Promise<void>;
  aoAbrirQrCode?: (dados: DadosReservaFinalizada) => void;
  aoIrParaMinhasReservas: () => void;
}

const FINALIDADES = [
  "Artesanato & Peças Manuais", "Fabricação de Calçados & Acessórios",
  "Design de Interiores & Upcycling", "Projetos Educacionais e Sustentáveis", "Outra finalidade circular",
];
const METODOS = [
  { id: "pix", nome: "PIX" },
  { id: "cartao_credito", nome: "Cartão de crédito" },
  { id: "cartao_debito", nome: "Cartão de débito" },
] as const;
const moeda = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const styles = {
  cartao: "rounded-md border border-[#E2E9E5] bg-white p-5 sm:p-6",
  campo: "mt-2 w-full rounded border border-[#DCE4DF] bg-white px-3 py-2.5 text-sm font-normal text-[#253F33] outline-none focus:border-[#00875B] focus:ring-2 focus:ring-emerald-50",
  rotulo: "block text-xs font-semibold text-[#52665B]",
  principal: "inline-flex w-full items-center justify-center gap-2 rounded bg-[#00875B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006F4B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-50",
  secundario: "inline-flex items-center justify-center gap-2 rounded border border-[#D5E2DA] bg-white px-5 py-2.5 text-sm font-medium text-[#426051] transition hover:bg-[#F5F8F6]",
};

export function SolicitarReservaModal({
  aberto, aoFechar, produto, simulacao = false, pagina = false, etapaSolicitada = 1, aoMudarEtapa,
}: SolicitarReservaModalProps) {
  const [etapaLocal, setEtapaLocal] = useState<1 | 2 | 3>(1);
  const [revisaoValidada, setRevisaoValidada] = useState(false);
  const [finalizada, setFinalizada] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [finalidade, setFinalidade] = useState(FINALIDADES[0]);
  const [data, setData] = useState("");
  const [turno, setTurno] = useState("manha");
  const [observacoes, setObservacoes] = useState("");
  const [metodo, setMetodo] = useState<MetodoPagamento>("pix");
  const [copiado, setCopiado] = useState(false);
  const [erroCopia, setErroCopia] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const solicitada = pagina ? etapaSolicitada : etapaLocal;
  const etapa = solicitada === 3 && finalizada ? 3 : solicitada >= 2 && revisaoValidada ? 2 : 1;
  useEffect(() => {
    if (pagina) { window.scrollTo({ top: 0, behavior: "instant" }); tituloRef.current?.focus({ preventScroll: true }); }
  }, [etapa, pagina]);
  if (!aberto || !produto) return null;
  const exemplo = simulacao && produto.id === COMPRA_EXEMPLO.id;
  const total = Number(produto.price) * quantidade;
  const hoje = new Date();
  const dataMinima = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  const Titulo = pagina ? "h1" : "h2";
  const nomeMetodo = METODOS.find((item) => item.id === metodo)?.nome;
  const dataFormatada = data.split("-").reverse().join("/");

  function mudarEtapa(proxima: 1 | 2 | 3) {
    if (pagina && aoMudarEtapa) aoMudarEtapa(proxima);
    else setEtapaLocal(proxima);
  }
  function invalidarRevisao() { setRevisaoValidada(false); setFinalizada(false); }
  function avancar(event: FormEvent) {
    event.preventDefault();
    if (data < dataMinima || quantidade < 1 || quantidade > produto!.quantity || !Number.isInteger(quantidade)) return;
    setRevisaoValidada(true); setFinalizada(false); mudarEtapa(2);
  }
  function concluir() { setFinalizada(true); mudarEtapa(3); }
  async function copiarExemplo() {
    try {
      await navigator.clipboard.writeText("DEMONSTRACAO-SEM-VALOR-PARA-PAGAMENTO");
      setCopiado(true); setErroCopia(false);
    } catch { setErroCopia(true); }
  }

  const itemMaterial = <div className="flex items-center gap-4">
    <img src={IMAGENS_EXEMPLO[0]} alt="Retalhos de couro ilustrativos" className="h-16 w-20 shrink-0 rounded object-cover" />
    <div className="min-w-0"><span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Material de demonstração</span><h3 className="mt-1 text-sm font-semibold text-[#244C39]">{produto.name}</h3><p className="mt-1 text-xs text-[#76837C]">{moeda(Number(produto.price))} por unidade de exemplo</p></div>
  </div>;

  const conteudo = <div className={pagina ? "w-full" : "relative w-full max-w-3xl rounded-lg bg-[#F7F9F8] p-5 sm:p-7 shadow-xl"}>
    {!pagina && <button type="button" onClick={aoFechar} aria-label="Fechar compra" className="absolute right-3 top-3 rounded p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>}
    {!exemplo ? <section className={`${styles.cartao} mx-auto max-w-xl py-12 text-center`}>
      <Package className="mx-auto h-12 w-12 text-gray-300" /><h2 className="mt-4 text-xl font-semibold">Não há reserva disponível no momento</h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-500">A compra e o pagamento deste material ainda não estão disponíveis. Nenhuma reserva ou cobrança foi realizada.</p>
      <button type="button" onClick={aoFechar} className={`${styles.principal} mt-6`}>Voltar ao marketplace</button>
    </section> : <>
      <div className={`mb-6 ${etapa === 2 ? "" : "mx-auto max-w-2xl"}`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded border border-[#D2E8DA] bg-[#EEF7F1] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#278454]">Demonstração • sem cobrança</span>
          <span className="text-xs text-[#819087]">Compra de exemplo</span>
        </div>
        <Titulo ref={tituloRef} tabIndex={-1} className="mt-4 text-2xl font-bold tracking-tight text-[#164A35] outline-none">
          {etapa === 1 ? "Solicitar reserva de material" : etapa === 2 ? "Revisar solicitação e pagamento" : "Simulação concluída!"}
        </Titulo>
        <p className="mt-2 text-sm leading-relaxed text-[#7A887F]">{etapa === 1 ? "Escolha a quantidade e os detalhes da retirada para conhecer o fluxo de compra." : etapa === 2 ? "Confira o material selecionado e experimente as opções de pagamento." : "Veja abaixo o resumo da sua compra de exemplo."}</p>
        {etapa !== 3 && <ol aria-label={`Etapa ${etapa} de 3`} className="mt-5 flex flex-wrap items-center gap-3 text-xs">
          {["Solicitação", "Revisão e pagamento", "Conclusão"].map((nome, index) => <li key={nome} aria-current={etapa === index + 1 ? "step" : undefined} className={`flex items-center gap-2 ${etapa >= index + 1 ? "text-[#00875B]" : "text-[#9BA69F]"}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${etapa >= index + 1 ? "border-[#00875B] bg-[#00875B] text-white" : "border-[#D5DED8]"}`}>{index + 1}</span>{nome}{index < 2 && <ArrowRight className="ml-1 h-3 w-3 text-[#C8D1CC]" />}</li>)}
        </ol>}
      </div>

      {etapa === 1 && <div className="mx-auto max-w-2xl">
        <form onSubmit={avancar} className={`${styles.cartao} space-y-5`}>
          <div className="border-b border-[#EDF1EE] pb-5">{itemMaterial}</div>
          <div>
            <label htmlFor="exemplo-quantidade" className={styles.rotulo}>Quantidade</label>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" aria-label="Diminuir quantidade" disabled={!Number.isFinite(quantidade) || quantidade <= 1} onClick={() => { setQuantidade((q) => Math.max(1, q - 1)); invalidarRevisao(); }} className="rounded border border-[#DCE4DF] p-2.5 disabled:opacity-40"><Minus className="h-4 w-4" /></button>
              <input id="exemplo-quantidade" type="number" required min={1} max={produto.quantity} step={1} value={Number.isFinite(quantidade) ? quantidade : ""} onChange={(e) => { setQuantidade(e.target.valueAsNumber); invalidarRevisao(); }} className="w-20 rounded border border-[#DCE4DF] p-2 text-center text-sm" />
              <button type="button" aria-label="Aumentar quantidade" disabled={quantidade >= produto.quantity} onClick={() => { setQuantidade((q) => Number.isFinite(q) ? Math.min(produto.quantity, Math.max(1, q + 1)) : 1); invalidarRevisao(); }} className="rounded border border-[#DCE4DF] p-2.5 disabled:opacity-40"><Plus className="h-4 w-4" /></button>
              <span className="ml-auto text-sm font-semibold text-[#00875B]">{Number.isFinite(total) ? moeda(total) : "Informe a quantidade"}</span>
            </div>
          </div>
          <label className={styles.rotulo}>Finalidade do uso
            <select value={finalidade} onChange={(e) => { setFinalidade(e.target.value); invalidarRevisao(); }} className={styles.campo}>{FINALIDADES.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={styles.rotulo}>Data de retirada de exemplo<input type="date" required min={dataMinima} value={data} onChange={(e) => { setData(e.target.value); invalidarRevisao(); }} className={styles.campo} /></label>
            <label className={styles.rotulo}>Turno de exemplo<select value={turno} onChange={(e) => { setTurno(e.target.value); invalidarRevisao(); }} className={styles.campo}><option value="manha">Manhã (08h–12h)</option><option value="tarde">Tarde (13h–17h)</option></select></label>
          </div>
          <div><label htmlFor="observacoes-exemplo" className={styles.rotulo}>Observações de exemplo (opcional)</label><textarea id="observacoes-exemplo" value={observacoes} maxLength={500} onChange={(e) => { setObservacoes(e.target.value); invalidarRevisao(); }} rows={3} placeholder="Instruções de manuseio, sem dados pessoais." className={styles.campo} /></div>
          <div className="flex items-center justify-between border-t border-[#EDF1EE] pt-4 text-sm"><span className="text-[#75847B]">Total da simulação</span><strong className="text-lg text-[#00875B]">{Number.isFinite(total) ? moeda(total) : "—"}</strong></div>
          <button type="submit" className={styles.principal}>Avançar para Revisão<ArrowRight className="h-4 w-4" /></button>
          <button type="button" onClick={aoFechar} className={`${styles.secundario} w-full`}>Cancelar</button>
        </form>
        <div className="mt-4 flex items-start gap-2 rounded border border-[#DDECE2] bg-[#EFF7F2] p-4 text-xs leading-relaxed text-[#4B705B]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><p>Esta é uma simulação. Não cria pedido, reserva ou agendamento real. Não informe dados pessoais ou de cartão.</p></div>
      </div>}

      {etapa === 2 && <div className={`grid items-start gap-6 ${pagina ? "lg:grid-cols-[minmax(0,1fr)_320px]" : ""}`}>
        <div className="min-w-0 space-y-5">
          <section className={styles.cartao}>
            <div className="mb-5 flex items-center justify-between border-b border-[#EDF1EE] pb-4"><h3 className="text-sm font-semibold">Material selecionado</h3><span className="text-xs text-[#819087]">{quantidade} unidades</span></div>
            {itemMaterial}
            <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-[#EDF1EE] pt-4 text-xs sm:grid-cols-2">
              <div><dt className="text-[#819087]">Retirada de exemplo</dt><dd className="mt-1 flex items-center gap-2 font-medium"><Calendar className="h-3.5 w-3.5" />{dataFormatada} • {turno === "manha" ? "Manhã" : "Tarde"}</dd></div>
              <div><dt className="text-[#819087]">Finalidade</dt><dd className="mt-1 font-medium">{finalidade}</dd></div>
              {observacoes.trim() && <div className="sm:col-span-2"><dt className="text-[#819087]">Observações</dt><dd className="mt-1 whitespace-pre-wrap break-words">{observacoes}</dd></div>}
            </dl>
          </section>
          <section className={styles.cartao}>
            <fieldset><legend className="mb-4 text-sm font-semibold">Forma de pagamento</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{METODOS.map((item) => <label key={item.id} className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-3 text-xs font-medium ${metodo === item.id ? "border-[#00875B] bg-[#EFF8F3] text-[#00875B]" : "border-[#DCE4DF] text-[#6B7C71]"}`}><input type="radio" name="metodo-exemplo" checked={metodo === item.id} onChange={() => { setMetodo(item.id); setFinalizada(false); }} className="accent-[#00875B]" />{item.nome}</label>)}</div>
            </fieldset>
            {metodo === "pix" ? <div className="mt-5 rounded border border-[#E2E9E5] bg-[#FAFCFB] p-4">
              <div className="flex items-start gap-4"><div className="rounded border border-[#E2E9E5] bg-white p-4"><QrCode className="h-10 w-10 text-[#AAB8AF]" /></div><div><h3 className="text-sm font-semibold">PIX de demonstração</h3><p className="mt-2 text-xs leading-relaxed text-[#819087]">A prévia não gera uma cobrança nem um QR Code de pagamento.</p></div></div>
              <p className="mt-4 break-all rounded border border-[#E2E9E5] bg-white p-3 font-mono text-[10px] text-[#6B7C71]">DEMONSTRACAO-SEM-VALOR-PARA-PAGAMENTO</p>
              <button type="button" onClick={copiarExemplo} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#00875B]">{copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copiado ? "Texto de exemplo copiado" : "Copiar texto de exemplo"}</button>
              {erroCopia && <p role="alert" className="mt-2 text-xs text-amber-800">Não foi possível copiar. Selecione o texto acima.</p>}
            </div> : <div className="mt-5">
              <h3 className="flex items-center gap-2 text-sm font-medium"><CreditCard className="h-4 w-4" />{nomeMetodo} de demonstração</h3><p className="mt-2 text-xs text-[#819087]">Prévia visual. Os campos não recebem dados reais.</p>
              <fieldset disabled className="mt-4 grid grid-cols-2 gap-4"><label className={`${styles.rotulo} col-span-2`}>Número do cartão<input value="•••• •••• •••• ••••" readOnly className={styles.campo} /></label><label className={`${styles.rotulo} col-span-2`}>Titular<input value="CARTÃO DE DEMONSTRAÇÃO" readOnly className={styles.campo} /></label><label className={styles.rotulo}>Validade<input value="MM/AA" readOnly className={styles.campo} /></label><label className={styles.rotulo}>Código de segurança<input value="•••" readOnly className={styles.campo} /></label></fieldset>
            </div>}
          </section>
          <button type="button" onClick={() => mudarEtapa(1)} className="inline-flex items-center gap-2 text-xs font-semibold text-[#6C8073]"><ArrowLeft className="h-3.5 w-3.5" />Voltar e editar solicitação</button>
        </div>
        <aside aria-label="Resumo da compra" className={`${styles.cartao} lg:sticky lg:top-24`}>
          <h3 className="border-b border-[#EDF1EE] pb-4 text-sm font-semibold">Resumo da solicitação</h3>
          <dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-[#819087]">Quantidade</dt><dd>{quantidade} unidades</dd></div><div className="flex justify-between gap-3"><dt className="text-[#819087]">Valor unitário de exemplo</dt><dd>{moeda(Number(produto.price))}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#819087]">Forma de pagamento</dt><dd>{nomeMetodo}</dd></div><div className="flex justify-between gap-3 border-t border-[#EDF1EE] pt-4 text-base font-semibold"><dt>Total da simulação</dt><dd className="text-[#00875B]">{moeda(total)}</dd></div></dl>
          <p className="my-5 rounded bg-[#EFF8F3] p-3 text-[11px] leading-relaxed text-[#597B65]">Nenhum valor será cobrado. Os dados desta simulação não serão salvos como uma reserva.</p>
          <button type="button" onClick={concluir} className={styles.principal}>Concluir simulação<ArrowRight className="h-4 w-4" /></button>
        </aside>
      </div>}

      {etapa === 3 && <div className="mx-auto max-w-2xl" role="status">
        <div className="mb-6 flex items-center gap-3 rounded-md border border-[#CFE7D7] bg-[#EFF8F2] p-4 text-[#23834E]"><CheckCircle2 className="h-9 w-9 shrink-0" /><p className="text-sm leading-relaxed">Simulação finalizada. Nenhuma cobrança, reserva ou solicitação foi enviada ao fornecedor.</p></div>
        <section className={styles.cartao}>
          <div className="flex items-center justify-between gap-4 border-b border-[#EDF1EE] pb-4"><h3 className="text-sm font-semibold">Resumo da compra de exemplo</h3><span className="rounded bg-[#EEF7F1] px-2 py-1 text-[10px] font-semibold text-[#278454]">Sem cobrança</span></div>
          <div className="my-5">{itemMaterial}</div>
          <dl className="grid grid-cols-1 gap-5 border-t border-[#EDF1EE] pt-5 text-xs sm:grid-cols-2"><div><dt className="text-[#819087]">Quantidade</dt><dd className="mt-1 font-semibold">{quantidade} unidades</dd></div><div><dt className="text-[#819087]">Método de exemplo</dt><dd className="mt-1 font-semibold">{nomeMetodo}</dd></div><div><dt className="text-[#819087]">Data ilustrativa</dt><dd className="mt-1 font-semibold">{dataFormatada} • {turno === "manha" ? "Manhã" : "Tarde"}</dd></div><div><dt className="text-[#819087]">Total ilustrativo</dt><dd className="mt-1 text-lg font-semibold text-[#00875B]">{moeda(total)}</dd></div></dl>
          <div className="mt-6 border-t border-[#EDF1EE] pt-5"><h3 className="text-sm font-semibold">Sobre a retirada</h3><p className="mt-2 text-xs leading-relaxed text-[#819087]">Não há comprovante ou QR Code de retirada disponível para uma simulação. O material não foi reservado e a data não foi agendada.</p></div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"><button type="button" onClick={aoFechar} className={styles.principal}>Voltar ao marketplace</button><button type="button" onClick={() => mudarEtapa(2)} className={styles.secundario}>Rever simulação</button></div>
        </section>
      </div>}
    </>}
  </div>;
  return pagina ? conteudo : <DialogoComprador titulo={exemplo ? "Compra de exemplo" : "Reserva indisponível"} aoFechar={aoFechar}>{conteudo}</DialogoComprador>;
}
export default SolicitarReservaModal;
