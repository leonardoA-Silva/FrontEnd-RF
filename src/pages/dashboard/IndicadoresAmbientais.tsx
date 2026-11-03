import { useState } from "react";
import { Droplets, Factory, Leaf, Recycle, Sprout } from "lucide-react";
import CompanyPage, { DemoNotice } from "./CompanyPage";
import { companyStyles as styles } from "./companyStyles";

const metrics = [
  { label: "Resíduos destinados", value: "45.200 kg", icon: Recycle },
  { label: "CO₂ evitado", value: "12,8 ton", icon: Leaf },
  { label: "Água preservada", value: "2,8 mi L", icon: Droplets },
  { label: "Empresas participantes", value: "340", icon: Factory },
];
const distribution = [
  { label: "Tecidos", value: 35, color: "bg-material-couro" },
  { label: "Borracha", value: 30, color: "bg-material-tecido" },
  { label: "Madeira", value: 20, color: "bg-material-eva" },
  { label: "Outros materiais", value: 15, color: "bg-material-outros" },
];
const months = ["Jun", "Jul", "Ago", "Set", "Out", "Nov"];
const evolution = [4, 10, 8, 16, 21, 29];

export default function IndicadoresAmbientais() {
  const [demo, setDemo] = useState(false);
  return <CompanyPage>
    <h1 className={styles.title}>Impacto Ambiental Coletivo</h1>
    <p className={styles.description}>O potencial da economia circular e do reaproveitamento de materiais em Franca.</p>
    <DemoNotice active={demo} onToggle={() => setDemo(!demo)}>
      {demo ? "Os valores e gráficos abaixo ilustram a tela e não representam resultados medidos." : "Os indicadores dependem de dados ambientais verificados. Você pode conhecer a apresentação com um exemplo."}
    </DemoNotice>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon }) => <section key={label} className={styles.card} aria-label={label}>
        <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium text-tinta-suave">{label}</h2><span className="rounded-lg bg-verde-claro p-2 text-verde"><Icon size={19} aria-hidden="true" /></span></div>
        <p className="mt-4 text-3xl font-bold tracking-tight text-verde-escuro">{demo ? value : "—"}</p>
        <p className="mt-2 text-xs text-tinta-suave">{demo ? "Valor demonstrativo" : "Aguardando dados verificados"}</p>
      </section>)}
    </div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.8fr_1fr]">
      <section className={styles.card} aria-labelledby="evolucao-titulo">
        <h2 id="evolucao-titulo" className="font-bold text-verde-escuro">Evolução mensal de resíduos destinados</h2>
        <p className="mt-1 text-xs text-tinta-suave">{demo ? "Exemplo de junho a novembro · toneladas" : "A série histórica aparecerá quando houver medições."}</p>
        {demo ? <>
          <svg viewBox="0 0 600 235" role="img" aria-label="Gráfico demonstrativo: 4, 10, 8, 16, 21 e 29 toneladas, de junho a novembro" className="mt-6 w-full text-verde">
            <defs><linearGradient id="area-impacto" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity="0.16" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
            {[30, 90, 150, 210].map((y, i) => <g key={y}><line x1="35" y1={y} x2="580" y2={y} className="stroke-linha" strokeDasharray="4 5" /><text x="0" y={y + 4} fontSize="12" className="fill-tinta-suave">{30 - i * 10}</text></g>)}
            <path d="M35 186 L144 150 L253 162 L362 114 L471 84 L580 36 L580 210 L35 210 Z" fill="url(#area-impacto)" />
            <polyline points="35,186 144,150 253,162 362,114 471,84 580,36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            {evolution.map((value, i) => <circle key={months[i]} cx={35 + i * 109} cy={210 - value * 6} r="4" fill="currentColor"><title>{months[i]}: {value} toneladas (exemplo)</title></circle>)}
          </svg>
          <div className="ml-8 flex justify-between text-xs text-tinta-suave" aria-hidden="true">{months.map(month => <span key={month}>{month}</span>)}</div>
          <details className="mt-5 text-sm text-tinta-suave"><summary className="w-fit cursor-pointer rounded font-semibold text-verde">Consultar valores do exemplo</summary><ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{months.map((month, i) => <li key={month}>{month}: {evolution[i]} ton</li>)}</ul></details>
        </> : <div className="grid min-h-64 place-content-center text-center"><Recycle size={32} className="mx-auto text-verde" aria-hidden="true" /><p className="mt-4 text-sm text-tinta-suave">Ainda não há uma série histórica disponível.</p></div>}
      </section>
      <section className={styles.card} aria-labelledby="distribuicao-titulo">
        <h2 id="distribuicao-titulo" className="font-bold text-verde-escuro">Destino dos materiais</h2>
        <p className="mt-1 text-xs text-tinta-suave">Distribuição por tipo de resíduo</p>
        <div className="relative mx-auto my-7 grid h-40 w-40 place-items-center">
          {demo ? <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90" role="img" aria-label="Distribuição demonstrativa por tipo de material">
            {[{ value: 35, offset: 0, color: "stroke-material-couro" }, { value: 30, offset: 35, color: "stroke-material-tecido" }, { value: 20, offset: 65, color: "stroke-material-eva" }, { value: 15, offset: 85, color: "stroke-material-outros" }].map(part => <circle key={part.offset} cx="60" cy="60" r="48" fill="none" pathLength="100" strokeWidth="13" strokeDasharray={`${part.value} ${100 - part.value}`} strokeDashoffset={-part.offset} className={part.color} />)}
          </svg> : <span className="absolute inset-0 rounded-full border-[17px] border-linha" />}
          <div className="text-center"><p className="text-2xl font-bold text-verde-escuro">{demo ? "100%" : "—"}</p><p className="text-xs text-tinta-suave">{demo ? "Exemplo" : "Sem dados"}</p></div>
        </div>
        <ul className="space-y-3">{distribution.map(item => <li key={item.label} className="flex items-center gap-2 text-sm text-tinta-suave"><span className={`h-2.5 w-2.5 rounded-full ${item.color}`} aria-hidden="true" /><span className="flex-1">{item.label}</span><span className="font-semibold text-verde-escuro">{demo ? `${item.value}%` : "—"}</span></li>)}</ul>
      </section>
    </div>
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-linha bg-verde-claro p-5"><Sprout size={26} className="shrink-0 text-verde" aria-hidden="true" /><div><h2 className="font-bold text-verde-escuro">Um novo destino para cada material</h2><p className="mt-1 text-sm leading-relaxed text-tinta-suave">Reaproveitar aproxima empresas e comunidade. As estimativas de impacto precisarão de metodologia e dados de destinação confirmados.</p></div></div>
  </CompanyPage>;
}
