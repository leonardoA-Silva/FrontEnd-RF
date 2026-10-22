import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Leaf, ShieldCheck } from "lucide-react";
import { useMarketplaceFlow } from "./useMarketplaceFlow";
import { DemoNotice, FlowUnavailable } from "./FlowNotice";
import { moeda, numero } from "./marketplaceData";
import MaterialImage from "./MaterialImage";
import { styles } from "./marketplaceStyles";

export default function MaterialDetails() {
  const { material } = useMarketplaceFlow();
  const [foto, setFoto] = useState(0);
  const [contato, setContato] = useState(false);
  if (!material) return <FlowUnavailable />;
  return <main className="mx-auto w-full flex-1 px-5 py-8 lg:px-[clamp(24px,4vw,64px)] lg:py-10">
    <Link to="/marketplace" className={styles.voltar}><ArrowLeft size={16} />Voltar para o Marketplace</Link>
    <DemoNotice />
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.1fr)] lg:gap-12">
      <section aria-label="Fotos do material">
        <div className="aspect-[1.48] overflow-hidden rounded-2xl bg-gray-100"><MaterialImage key={material.fotos[foto]} src={material.fotos[foto]} nome={material.nome} prioridade /></div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {material.fotos.map((src, i) => <button key={src} onClick={() => setFoto(i)} aria-label={`Ver foto ${i + 1} de ${material.nome}`} aria-pressed={foto === i} className={`aspect-[1.5] overflow-hidden rounded-lg border-2 ${foto === i ? "border-[var(--mkt-primary)]" : "border-transparent opacity-75 hover:opacity-100"}`}><MaterialImage src={src} nome={`Foto ${i + 1} de ${material.nome}`} /></button>)}
          <div className="flex aspect-[1.5] flex-col items-center justify-center gap-2 rounded-lg border border-[var(--mkt-primary)] bg-[var(--mkt-soft)] text-[var(--mkt-dark)]"><ShieldCheck size={24} /><span className="text-[11px] font-semibold">Selo Circular</span></div>
        </div>
      </section>
      <section>
        <div className="mb-3 flex flex-wrap gap-2"><span className={styles.badge}>{material.categoria}</span><span className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700">{material.estado}</span></div>
        <h1 className={styles.titulo}>{material.nome}</h1>
        <p className="mt-3 text-sm">{material.empresa}<span className="text-[var(--mkt-muted)]"> • Franca - SP ({numero(material.distancia)} km de você)</span></p>
        <dl className="my-6 grid gap-5 rounded-xl border border-[var(--mkt-line)] bg-white p-4 sm:grid-cols-3"><div><dt className="text-xs text-gray-500">Quantidade Disponível</dt><dd className="mt-1 font-bold text-[var(--mkt-dark)]">{numero(material.quantidade)} {material.unidade}</dd></div><div><dt className="text-xs text-gray-500">Tipo de Resíduo</dt><dd className="mt-1 text-sm font-medium">{material.categoria}</dd></div><div><dt className="text-xs text-gray-500">Método de Retirada</dt><dd className="mt-1 text-sm font-medium">Coleta no Local</dd></div></dl>
        <h2 className="mb-2 text-sm font-bold">Descrição do Material</h2><p className={styles.texto}>{material.descricao}</p>
        <h2 className="mt-6 mb-2 text-sm font-bold">Aplicações Sugeridas</h2><div className="flex flex-wrap gap-2">{["Artesanato", "Reaproveitamento", "Reciclagem"].map(aplicacao => <span key={aplicacao} className="rounded-lg border border-[var(--mkt-line)] bg-white px-3 py-1 text-xs text-[var(--mkt-muted)]">{aplicacao}</span>)}</div>
        <div className={`${styles.aviso} mt-6 flex gap-3`}><Leaf size={24} className="shrink-0" aria-hidden="true" /><div><strong>Economia Circular</strong><p>Reaproveite materiais e ajude a dar um novo destino às sobras da indústria local.</p></div></div>
        <p className="my-5 text-sm font-semibold text-[var(--mkt-dark)]">{material.modalidade === "doacao" ? "Doação gratuita • sem cobrança" : `Valor demonstrativo: ${moeda(material.preco ?? 0)} por ${material.unidade === "kg" ? "kg" : "unidade"}`}</p>
        <div className="flex flex-col gap-4 sm:flex-row"><Link to={`/marketplace/reserva/${material.id}`} className={`${styles.botao} flex-1`}>{material.modalidade === "doacao" ? "Reservar Material Gratuitamente" : "Reservar Material"}</Link><button onClick={() => setContato(true)} className={styles.secundario}>Entrar em Contato</button></div>
        {contato && <p role="status" className={`${styles.texto} mt-4`}>O contato com fornecedores ainda não está integrado nesta demonstração.</p>}
      </section>
    </div>
  </main>;
}
