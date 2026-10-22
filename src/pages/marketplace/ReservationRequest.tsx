import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf } from "lucide-react";
import { DemoNotice, FlowUnavailable } from "./FlowNotice";
import { numero } from "./marketplaceData";
import { styles } from "./marketplaceStyles";
import { useMarketplaceFlow } from "./useMarketplaceFlow";

const finalidades = ["Confecção de Pequenos Artigos de Marroquinaria (Artesanato)", "Fabricação de Calçados e Acessórios", "Design de Interiores e Upcycling", "Reciclagem e Reaproveitamento Técnico", "Projetos Educacionais e Sustentáveis", "Outra finalidade circular"];
function dataLocal() { const agora = new Date(); return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`; }

export default function ReservationRequest() {
  const { material, reserva, setReserva } = useMarketplaceFlow();
  const navigate = useNavigate();
  const [quantidade, setQuantidade] = useState(String(reserva?.quantidade ?? material?.quantidade ?? 1));
  const [finalidade, setFinalidade] = useState(reserva?.finalidade ?? finalidades[0]);
  const [data, setData] = useState(reserva?.data ?? "");
  const [observacoes, setObservacoes] = useState(reserva?.observacoes ?? "");
  const [aceite, setAceite] = useState(Boolean(reserva));
  const [erro, setErro] = useState("");
  const [hoje] = useState(dataLocal);
  if (!material) return <FlowUnavailable />;
  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!material) return;
    const valor = Number(quantidade);
    if (!Number.isInteger(valor) || valor < 1 || valor > material.quantidade) { setErro(`Informe uma quantidade entre 1 e ${material.quantidade} ${material.unidade}.`); return; }
    if (!data || data < hoje || !aceite) { setErro("Informe uma data a partir de hoje e aceite os termos para continuar."); return; }
    setReserva({ materialId: material.id, quantidade: valor, finalidade, data, observacoes: observacoes.trim(), metodo: reserva?.metodo ?? "pix", concluida: false });
    navigate(`/marketplace/finalizar/${material.id}`);
  }
  return <main className="mx-auto w-full max-w-[864px] flex-1 px-5 py-10 sm:px-8 sm:py-12">
    <Link to={`/marketplace/material/${material.id}`} className={styles.voltar}><ArrowLeft size={16} />Voltar para Detalhes do Material</Link>
    <h1 className={styles.titulo}>Solicitar Reserva de Material</h1><p className={`${styles.texto} mt-2 mb-6`}>Envie sua solicitação de reserva para o fornecedor. Confira a quantidade e a data desejada para retirada.</p>
    <DemoNotice />
    <section className="mb-6 rounded-2xl border border-emerald-100 bg-[var(--mkt-soft)] p-5"><h2 className={styles.subtitulo}>{material.nome}</h2><p className="mt-1 text-sm text-amber-700">{material.empresa}</p><dl className="mt-5 grid gap-4 border-t border-emerald-100 pt-4 sm:grid-cols-3"><div><dt className="text-xs text-[var(--mkt-muted)]">Quantidade Disponível</dt><dd className="mt-1 font-bold text-[var(--mkt-dark)]">{numero(material.quantidade)} {material.unidade}</dd></div><div><dt className="text-xs text-[var(--mkt-muted)]">Tipo de Resíduo</dt><dd className="mt-1 text-sm">{material.categoria}</dd></div><div><dt className="text-xs text-[var(--mkt-muted)]">Local de Retirada</dt><dd className="mt-1 text-sm">Franca - SP</dd></div></dl></section>
    <form onSubmit={enviar} className={`${styles.painel} space-y-6`}>
      <label className={styles.etiqueta}>Quantidade Desejada ({material.unidade}) *<input name="quantidade" type="number" min={1} max={material.quantidade} step={1} required value={quantidade} onChange={e => setQuantidade(e.target.value)} aria-describedby="limite-quantidade" className={styles.campo} /><span id="limite-quantidade" className="mt-1 block text-xs font-normal text-gray-500">Máximo {numero(material.quantidade)} {material.unidade}</span></label>
      <label className={styles.etiqueta}>Finalidade do Material (Destinação Circular) *<select name="finalidade" required value={finalidade} onChange={e => setFinalidade(e.target.value)} className={styles.campo}>{finalidades.map(f => <option key={f}>{f}</option>)}</select></label>
      <label className={styles.etiqueta}>Data Preferencial de Retirada *<input name="data" type="date" required min={hoje} value={data} onChange={e => setData(e.target.value)} className={styles.campo} aria-describedby="ajuda-data" /><span id="ajuda-data" className="mt-2 block text-xs font-normal text-gray-500">Agende a retirada preferencialmente para dias úteis, em horário comercial.</span></label>
      <label className={styles.etiqueta}>Observações para o Fornecedor (Opcional)<textarea name="observacoes" value={observacoes} onChange={e => setObservacoes(e.target.value)} maxLength={1000} rows={4} placeholder="Descreva detalhes sobre veículo de transporte, embalagem necessária ou dúvidas gerais..." className={`${styles.campo} resize-y font-normal`} /></label>
      <label className="flex items-start gap-3 text-sm text-[var(--mkt-muted)]"><input type="checkbox" required checked={aceite} onChange={e => setAceite(e.target.checked)} className="mt-1 accent-[var(--mkt-payment)]" /><span>Li e aceito os termos de uso da plataforma Reaproveita Franca nesta demonstração.</span></label>
      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
      <div className="flex flex-col gap-4 border-t border-[var(--mkt-line)] pt-6 sm:flex-row"><button type="submit" className={`${styles.botao} flex-1`}>{material.modalidade === "doacao" ? "Confirmar Reserva Gratuitamente" : "Continuar Reserva"}</button><Link to={`/marketplace/material/${material.id}`} className={styles.secundario}>Voltar ao Material</Link></div>
    </form>
    <div className={`${styles.aviso} mt-6 flex items-center gap-4`}><Leaf size={28} aria-hidden="true" /><div><strong>Economia Circular de Alto Impacto</strong><p>Conecte materiais disponíveis a novas possibilidades de reaproveitamento.</p></div></div>
  </main>;
}
