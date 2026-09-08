import { useState } from "react";
import {
  AlarmClock,
  CheckCircle2,
  Coins,
  Folder,
  Leaf,
  Menu,
  Package,
  Plus,
  PlusCircle,
  Repeat2,
  Sparkles,
  Star,
  UserRound,
  X,
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
  const [menuAberto, setMenuAberto] = useState(false);

  // Estilos centralizados aqui dentro da função (sem arquivo .css).
  // Cada chave tem um nome semântico e guarda as classes Tailwind correspondentes.
  // Layout 100% fluido (w-full, sem max-width travado) para ocupar a tela em qualquer zoom.
  const styles = {
    pagina: "flex min-h-screen w-full flex-col bg-[#FAF9F5] text-[#1B4B3A]",

    cabecalho: "w-full border-b border-[#E7E4DA] bg-white",
    cabecalhoConteudo:
      "flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8",
    marca: "flex min-w-0 shrink-0 items-center gap-2.5",
    marcaIcone:
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white",
    marcaTextos: "leading-tight",
    marcaTitulo: "text-base font-bold text-[#1B4B3A] sm:text-lg",
    marcaSubtitulo: "text-xs font-bold tracking-wide text-orange-500 sm:text-sm",
    menuTopo: "hidden min-w-0 flex-1 items-center justify-center gap-5 xl:gap-7 lg:flex",
    menuTopoLink:
      "whitespace-nowrap text-sm font-medium text-[#4B5A55] transition hover:text-[#1B4B3A] xl:text-[15px]",
    cabecalhoAcoes: "flex shrink-0 items-center gap-2",
    usuarioPilha:
      "flex items-center gap-2 rounded-full bg-emerald-50 py-1.5 pl-1.5 pr-3 sm:pr-4",
    usuarioAvatar: "h-7 w-7 shrink-0 rounded-full bg-gray-300",
    usuarioNome:
      "hidden max-w-32 truncate text-sm font-semibold text-[#1B4B3A] min-[420px]:block",
    botaoMenu:
      "flex h-10 w-10 items-center justify-center rounded-lg border border-[#E7E4DA] text-[#1B4B3A] transition hover:bg-[#F3F1EA] lg:hidden",
    menuMovel: "border-t border-[#E7E4DA] bg-white px-4 py-2 lg:hidden",
    menuMovelLink:
      "block rounded-lg px-3 py-2.5 text-sm font-medium text-[#4B5A55] transition hover:bg-[#F3F1EA] hover:text-[#1B4B3A]",

    conteudo: "flex w-full flex-1 flex-col items-stretch lg:flex-row",

    barraLateral:
      "hidden w-56 shrink-0 border-r border-[#E7E4DA] bg-white lg:block xl:w-64",
    barraLateralNav: "flex flex-col gap-2 px-4 py-6",
    itemLateralBase: "flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px]",
    itemLateralAtivo: "bg-emerald-50 font-bold text-[#1B4B3A]",
    itemLateralInativo:
      "font-medium text-[#4B5A55] transition hover:bg-[#F3F1EA]",
    itemLateralIconeAtivo: "h-5 w-5 shrink-0 text-emerald-500",
    itemLateralIcone: "h-5 w-5 shrink-0 text-[#4B5A55]",

    navegacaoMovel: "border-b border-[#E7E4DA] bg-white lg:hidden",
    navegacaoMovelLista: "flex gap-2 overflow-x-auto px-4 py-3",
    itemMovelBase:
      "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm",
    itemMovelAtivo: "bg-emerald-50 font-bold text-[#1B4B3A]",
    itemMovelInativo: "font-medium text-[#4B5A55]",

    principal: "min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8",
    principalTopo:
      "flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between",
    saudacao: "text-2xl font-extrabold tracking-tight text-[#0F3D2E] sm:text-3xl",
    saudacaoDescricao: "mt-1.5 text-sm text-[#4B5A55] sm:text-[15px]",
    botaoPublicar:
      "flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 sm:w-auto sm:self-start",

    gradeEstatisticas:
      "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4",
    cartaoEstatistica:
      "flex min-w-0 items-center gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5",
    estatisticaIconeCaixa:
      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50",
    estatisticaIcone: "h-6 w-6 text-emerald-500",
    estatisticaTextos: "min-w-0",
    estatisticaRotulo: "truncate text-[13px] text-[#9AA5A0]",
    estatisticaValor: "text-2xl font-extrabold text-[#0F3D2E]",
    estatisticaDetalhe: "mt-0.5 text-[13px] text-[#6B7670]",

    gradeConteudo: "mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.65fr_1fr]",
    cartao: "min-w-0 rounded-2xl border border-[#E7E4DA] bg-white p-4 sm:p-6",
    cartaoCabecalho: "flex flex-wrap items-center justify-between gap-2",
    cartaoTitulo: "text-base font-extrabold text-[#0F3D2E] sm:text-lg",
    cartaoLink:
      "shrink-0 text-sm font-medium text-emerald-500 hover:text-emerald-600",

    listaResiduos: "mt-2 divide-y divide-[#EDEBE2]",
    residuoItem: "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4",
    residuoTextos: "min-w-0 flex-1 basis-48",
    residuoTitulo: "break-words text-[15px] font-semibold text-[#1F2A26]",
    residuoData: "mt-0.5 text-[13px] text-[#9AA5A0]",
    residuoLadoDireito: "flex shrink-0 items-center gap-3",
    residuoQuantidade: "whitespace-nowrap text-[15px] font-bold text-[#0F3D2E]",
    seloBase: "whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold",
    seloAtivo: "bg-emerald-50 text-emerald-600",
    seloReservado: "bg-amber-100 text-amber-600",
    seloColetado: "bg-gray-100 text-gray-500",

    listaAtividades: "mt-5 flex flex-col gap-5",
    atividadeItem: "flex min-w-0 items-start gap-3",
    atividadeIconeCaixa:
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F7F4]",
    atividadeIcone: "h-5 w-5 text-emerald-500",
    atividadeTextos: "min-w-0",
    atividadeTexto: "break-words text-sm leading-relaxed text-[#3F4A45]",
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

          <div className={styles.cabecalhoAcoes}>
            <div className={styles.usuarioPilha}>
              <span className={styles.usuarioAvatar} />
              <span className={styles.usuarioNome}>Nome Empresa</span>
            </div>
            <button
              type="button"
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuAberto((aberto) => !aberto)}
              className={styles.botaoMenu}
            >
              {menuAberto ? (
                <X className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {menuAberto && (
          <nav className={styles.menuMovel}>
            {navegacaoTopo.map((item) => (
              <a key={item} href="#" className={styles.menuMovelLink}>
                {item}
              </a>
            ))}
          </nav>
        )}
      </header>

      <div className={styles.conteudo}>
        {/* Menu lateral (desktop) */}
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

        {/* Menu horizontal com rolagem (mobile/tablet) */}
        <nav className={styles.navegacaoMovel}>
          <div className={styles.navegacaoMovelLista}>
            {menuLateral.map(({ icone: Icone, rotulo, ativo }) => (
              <a
                key={rotulo}
                href="#"
                className={`${styles.itemMovelBase} ${
                  ativo ? styles.itemMovelAtivo : styles.itemMovelInativo
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
          </div>
        </nav>

        {/* Conteúdo principal */}
        <main className={styles.principal}>
          <div className={styles.principalTopo}>
            <div className="min-w-0">
              <h1 className={styles.saudacao}>Olá, Curtume Franca Fino!</h1>
              <p className={styles.saudacaoDescricao}>
                Acompanhe o impacto da sua fábrica e gerencie seus anúncios de
                resíduos.
              </p>
            </div>
            <button className={styles.botaoPublicar}>
              <Plus className="h-5 w-5 shrink-0" strokeWidth={2.5} />
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
                <div className={styles.estatisticaTextos}>
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
                    <div className={styles.residuoTextos}>
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
                      <div className={styles.atividadeTextos}>
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
