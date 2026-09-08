import {
  AlarmClock,
  CheckCircle2,
  Coins,
  Folder,
  Leaf,
  Package,
  Plus,
  PlusCircle,
  Repeat2,
  Sparkles,
  Star,
  UserRound,
  XCircle,
} from "lucide-react";
import Footer from "../../components/Footer";

const estatisticas = [
  {
    icone: Package,
    rotulo: "Materiais Publicados",
    valor: "24",
    detalhe: "18 já destinados",
  },
  {
    icone: AlarmClock,
    rotulo: "Reservas Ativas",
    valor: "8",
    detalhe: "Aguardando retirada",
  },
  {
    icone: Leaf,
    rotulo: "Resíduos Desviados",
    valor: "1.450 kg",
    detalhe: "Desviados do aterro local",
  },
  {
    icone: Coins,
    rotulo: "Valor Social Gerado",
    valor: "R$ 12.300",
    detalhe: "Economia p/ artesãos",
  },
];

const residuos = [
  {
    titulo: "Retalhos de Couro Bovino Premium",
    publicadoEm: "Publicado em Hoje, 09:12",
    quantidade: "150 kg",
    status: "Ativo",
  },
  {
    titulo: "Pallets de Madeira Maciça",
    publicadoEm: "Publicado em Ontem, 16:45",
    quantidade: "12 unid",
    status: "Reservado",
  },
  {
    titulo: "Rebarbas de EVA e Forros",
    publicadoEm: "Publicado em 02 de Ago, 10:20",
    quantidade: "40 kg",
    status: "Coletado",
  },
  {
    titulo: "Retalhos de Tecido Sintético",
    publicadoEm: "Publicado em 28 de Jul, 14:00",
    quantidade: "90 kg",
    status: "Coletado",
  },
];

const atividades = [
  {
    icone: XCircle,
    destaque: "Silvana M. (Artesã)",
    resto: " reservou os Retalhos de Couro",
    tempo: "Há 10 min",
  },
  {
    icone: CheckCircle2,
    destaque: "Ateliê Reutiliza",
    resto: " coletou 120 kg de Pallets",
    tempo: "Ontem",
  },
  {
    icone: Sparkles,
    destaque: "Reaproveita Franca AI",
    resto: " reclassificou seu lote de EVA como Premium",
    tempo: "Há 2 dias",
  },
  {
    icone: Star,
    destaque: "Assoc. Tecendo Franca",
    resto: " avaliou seu curtume com 5 estrelas",
    tempo: "Há 3 dias",
  },
];

const menuLateral = [
  { icone: Folder, rotulo: "Meus Materiais", ativo: true },
  { icone: PlusCircle, rotulo: "Publicar Novo", ativo: false },
  { icone: UserRound, rotulo: "Perfil", ativo: false },
];

const navegacaoTopo = [
  "Início",
  "Mapa de Empresas",
  "Indicadores Ambientais",
  "Histórico de Negociações",
  "Sobre Nós",
];

export default function DashboardEmpresa() {
  // Estilos centralizados aqui dentro da função (sem arquivo .css).
  // Cada chave tem um nome semântico e guarda as classes Tailwind correspondentes.
  const styles = {
    pagina: "min-h-screen bg-[#FAF9F5] text-[#1B4B3A] flex flex-col",

    cabecalho: "border-b border-[#E7E4DA] bg-white",
    cabecalhoConteudo:
      "mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 sm:px-10",
    marca: "flex shrink-0 items-center gap-3",
    marcaIcone:
      "flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white",
    marcaTextos: "leading-tight",
    marcaTitulo: "text-lg font-bold text-[#1B4B3A]",
    marcaSubtitulo: "text-sm font-bold tracking-wide text-orange-500",
    menuTopo: "hidden items-center gap-7 xl:flex",
    menuTopoLink:
      "text-[15px] font-medium text-[#4B5A55] transition hover:text-[#1B4B3A]",
    usuarioPilha:
      "flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 py-1.5 pl-1.5 pr-4",
    usuarioAvatar: "h-7 w-7 shrink-0 rounded-full bg-gray-300",
    usuarioNome: "text-sm font-semibold text-[#1B4B3A]",

    conteudo: "mx-auto flex w-full max-w-7xl flex-1 items-stretch",

    barraLateral: "hidden w-60 shrink-0 border-r border-[#E7E4DA] bg-white lg:block",
    barraLateralNav: "flex flex-col gap-2 px-4 py-6",
    itemLateralBase: "flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px]",
    itemLateralAtivo: "bg-emerald-50 font-bold text-[#1B4B3A]",
    itemLateralInativo:
      "font-medium text-[#4B5A55] transition hover:bg-[#F3F1EA]",
    itemLateralIconeAtivo: "h-5 w-5 text-emerald-500",
    itemLateralIcone: "h-5 w-5 text-[#4B5A55]",

    principal: "flex-1 px-6 py-8 sm:px-10",
    principalTopo:
      "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
    saudacao: "text-3xl font-extrabold tracking-tight text-[#0F3D2E]",
    saudacaoDescricao: "mt-1.5 text-[15px] text-[#4B5A55]",
    botaoPublicar:
      "flex shrink-0 items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600",

    gradeEstatisticas: "mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
    cartaoEstatistica:
      "flex items-center gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5",
    estatisticaIconeCaixa:
      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50",
    estatisticaIcone: "h-6 w-6 text-emerald-500",
    estatisticaRotulo: "text-[13px] text-[#9AA5A0]",
    estatisticaValor: "text-2xl font-extrabold text-[#0F3D2E]",
    estatisticaDetalhe: "mt-0.5 text-[13px] text-[#6B7670]",

    gradeConteudo: "mt-6 grid items-start gap-6 lg:grid-cols-[1.65fr_1fr]",
    cartao: "rounded-2xl border border-[#E7E4DA] bg-white p-6",
    cartaoCabecalho: "flex items-center justify-between gap-4",
    cartaoTitulo: "text-lg font-extrabold text-[#0F3D2E]",
    cartaoLink: "shrink-0 text-sm font-medium text-emerald-500 hover:text-emerald-600",

    listaResiduos: "mt-2 divide-y divide-[#EDEBE2]",
    residuoItem: "flex items-center justify-between gap-4 py-4",
    residuoTitulo: "text-[15px] font-semibold text-[#1F2A26]",
    residuoData: "mt-0.5 text-[13px] text-[#9AA5A0]",
    residuoLadoDireito: "flex shrink-0 items-center gap-3",
    residuoQuantidade: "text-[15px] font-bold text-[#0F3D2E]",
    seloBase: "rounded-md px-2.5 py-1 text-xs font-semibold",
    seloAtivo: "bg-emerald-50 text-emerald-600",
    seloReservado: "bg-amber-100 text-amber-600",
    seloColetado: "bg-gray-100 text-gray-500",

    listaAtividades: "mt-5 flex flex-col gap-5",
    atividadeItem: "flex items-start gap-3",
    atividadeIconeCaixa:
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F7F4]",
    atividadeIcone: "h-5 w-5 text-emerald-500",
    atividadeTexto: "text-sm leading-relaxed text-[#3F4A45]",
    atividadeDestaque: "font-bold text-[#1F2A26]",
    atividadeTempo: "mt-0.5 block text-xs text-[#9AA5A0]",
  };

  function estiloSelo(status: string) {
    if (status === "Ativo") return `${styles.seloBase} ${styles.seloAtivo}`;
    if (status === "Reservado")
      return `${styles.seloBase} ${styles.seloReservado}`;
    return `${styles.seloBase} ${styles.seloColetado}`;
  }

  return (
    <div className={styles.pagina}>
      {/* Topo do dashboard */}
      <header className={styles.cabecalho}>
        <div className={styles.cabecalhoConteudo}>
          <div className={styles.marca}>
            <span className={styles.marcaIcone}>
              <Repeat2 className="h-6 w-6" strokeWidth={2.4} />
            </span>
            <div className={styles.marcaTextos}>
              <p className={styles.marcaTitulo}>Reaproveita</p>
              <p className={styles.marcaSubtitulo}>FRANCA</p>
            </div>
          </div>

          <nav className={styles.menuTopo}>
            {navegacaoTopo.map((item) => (
              <a key={item} href="#" className={styles.menuTopoLink}>
                {item}
              </a>
            ))}
          </nav>

          <div className={styles.usuarioPilha}>
            <span className={styles.usuarioAvatar} />
            <span className={styles.usuarioNome}>Nome Empresa</span>
          </div>
        </div>
      </header>

      <div className={styles.conteudo}>
        {/* Menu lateral */}
        <aside className={styles.barraLateral}>
          <nav className={styles.barraLateralNav}>
            {menuLateral.map(({ icone: Icone, rotulo, ativo }) => (
              <a
                key={rotulo}
                href="#"
                className={`${styles.itemLateralBase} ${
                  ativo ? styles.itemLateralAtivo : styles.itemLateralInativo
                }`}
              >
                <Icone
                  className={
                    ativo ? styles.itemLateralIconeAtivo : styles.itemLateralIcone
                  }
                  strokeWidth={2}
                />
                {rotulo}
              </a>
            ))}
          </nav>
        </aside>

        {/* Conteúdo principal */}
        <main className={styles.principal}>
          <div className={styles.principalTopo}>
            <div>
              <h1 className={styles.saudacao}>Olá, Curtume Franca Fino!</h1>
              <p className={styles.saudacaoDescricao}>
                Acompanhe o impacto da sua fábrica e gerencie seus anúncios de
                resíduos.
              </p>
            </div>
            <button className={styles.botaoPublicar}>
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              Publicar Novo Material
            </button>
          </div>

          {/* Cartões de resumo */}
          <div className={styles.gradeEstatisticas}>
            {estatisticas.map(({ icone: Icone, rotulo, valor, detalhe }) => (
              <div key={rotulo} className={styles.cartaoEstatistica}>
                <span className={styles.estatisticaIconeCaixa}>
                  <Icone className={styles.estatisticaIcone} strokeWidth={2} />
                </span>
                <div>
                  <p className={styles.estatisticaRotulo}>{rotulo}</p>
                  <p className={styles.estatisticaValor}>{valor}</p>
                  <p className={styles.estatisticaDetalhe}>{detalhe}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.gradeConteudo}>
            {/* Últimos resíduos */}
            <section className={styles.cartao}>
              <div className={styles.cartaoCabecalho}>
                <h2 className={styles.cartaoTitulo}>
                  Últimos Resíduos Publicados
                </h2>
                <a href="#" className={styles.cartaoLink}>
                  Ver todos (24)
                </a>
              </div>

              <div className={styles.listaResiduos}>
                {residuos.map(({ titulo, publicadoEm, quantidade, status }) => (
                  <div key={titulo} className={styles.residuoItem}>
                    <div>
                      <p className={styles.residuoTitulo}>{titulo}</p>
                      <p className={styles.residuoData}>{publicadoEm}</p>
                    </div>
                    <div className={styles.residuoLadoDireito}>
                      <span className={styles.residuoQuantidade}>
                        {quantidade}
                      </span>
                      <span className={estiloSelo(status)}>{status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Atividade recente */}
            <section className={styles.cartao}>
              <h2 className={styles.cartaoTitulo}>
                Atividade Circular Recente
              </h2>

              <div className={styles.listaAtividades}>
                {atividades.map(
                  ({ icone: Icone, destaque, resto, tempo }) => (
                    <div key={`${destaque}-${tempo}`} className={styles.atividadeItem}>
                      <span className={styles.atividadeIconeCaixa}>
                        <Icone
                          className={styles.atividadeIcone}
                          strokeWidth={2}
                        />
                      </span>
                      <div>
                        <p className={styles.atividadeTexto}>
                          <span className={styles.atividadeDestaque}>
                            {destaque}
                          </span>
                          {resto}
                        </p>
                        <span className={styles.atividadeTempo}>{tempo}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
