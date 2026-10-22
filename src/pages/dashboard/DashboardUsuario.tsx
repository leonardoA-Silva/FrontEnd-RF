import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Compass,
  History,
  LogOut,
  Menu,
  Package,
  UserRound,
  X,
} from "lucide-react";
import Footer from "../../components/Footer";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import BrandIcon from "../../components/BrandIcon";

const estatisticas = [
  {
    rotulo: "Materiais Reservados",
    valor: "12",
    detalhe: "Retiradas concluídas",
  },
  {
    rotulo: "Em Negociação",
    valor: "3",
    detalhe: "Aguardando curtume",
  },
  {
    rotulo: "kg Adquiridos",
    valor: "890 kg",
    detalhe: "Insumo circular salvo",
  },
];

const recomendados = [
  {
    imagem: "/retalho-couro-nobre.png",
    imagemAlt: "Pilha de retalhos de couro marrom",
    titulo: "Retalhos de Couro Nobre",
    origem: "Curtume Franca Fino",
    quantidade: "150 kg",
    distancia: "2.3 km",
  },
  {
    imagem: "/eva-camurca-premium.png",
    imagemAlt: "Placas azuis de EVA empilhadas",
    titulo: "EVA Camurça Premium",
    origem: "Borrachas Estrela",
    quantidade: "30 unid",
    distancia: "4.5 km",
  },
  {
    imagem: "/retalho-nobuck-macio.png",
    imagemAlt: "Retalhos de tecido nobuck cinza dobrados",
    titulo: "Retalho Nobuck Macio",
    origem: "Calçados Franca Ltda",
    quantidade: "60 kg",
    distancia: "1.2 km",
  },
];

const reservas = [
  {
    titulo: "Retalhos de Couro Premium",
    status: "Confirmada",
    origem: "Curtume Franca Fino",
    quantidade: "150 kg",
  },
  {
    titulo: "Pallets de Madeira Maciça",
    status: "Pendente",
    origem: "Calçados Franca Ltda",
    quantidade: "12 unid",
  },
  {
    titulo: "Fitas de Cetim e Gorgorão",
    status: "Concluída",
    origem: "Laços & Fitas S/A",
    quantidade: "5 kg",
  },
];

const menuLateral = [
  { icone: Compass, rotulo: "Explorar Materiais", ativo: false },
  { icone: Package, rotulo: "Minhas Reservas", ativo: true },
  { icone: History, rotulo: "Histórico", ativo: false },
  { icone: UserRound, rotulo: "Perfil", ativo: false },
];

const navegacaoTopo = ["Início", "Marketplace", "Sobre Nós"];

export default function DashboardUsuario() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  // Nome e foto vêm do login (local/sessionStorage) e são atualizados via /user/me.
  const { displayName, firstName, photoSrc } = useLoggedUser({
    fallbackName: "Usuário",
  });

  function handleLogout() {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem("token");
      storage.removeItem("user");
      storage.removeItem("tipoUsuario");
    }
    navigate("/login");
  }

  // Estilos centralizados aqui dentro da função (sem arquivo .css).
  // Cada chave tem um nome semântico e guarda as classes Tailwind correspondentes.
  // Layout 100% fluido (w-full, sem max-width travado) para ocupar a tela em qualquer zoom.
  const styles = {
    pagina: "flex min-h-screen w-full flex-col bg-papel text-carvao",

    cabecalho: "w-full border-b border-areia bg-cru",
    cabecalhoConteudo:
      "flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8",
    marca: "flex min-w-0 shrink-0 items-center gap-2.5",
    marcaTitulo: "font-display text-base font-semibold text-carvao sm:text-lg",
    menuTopo: "hidden min-w-0 flex-1 items-center justify-center gap-8 lg:flex",
    menuTopoLink:
      "whitespace-nowrap text-[15px] font-medium text-carvao-suave transition hover:text-carvao",
    cabecalhoAcoes: "flex shrink-0 items-center gap-2",
    usuarioPilha:
      "flex items-center gap-2 rounded-full border border-areia bg-papel py-1.5 pl-1.5 pr-3 sm:pr-4",
    usuarioAvatar:
      "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-areia-clara",
    usuarioAvatarIcone: "h-5 w-5 text-carvao-suave",
    usuarioAvatarImg: "h-7 w-7 shrink-0 rounded-full object-cover",
    usuarioNome:
      "hidden max-w-40 truncate text-sm font-semibold text-carvao min-[420px]:block",
    botaoMenu:
      "flex h-10 w-10 items-center justify-center rounded-lg border border-areia text-carvao transition hover:bg-areia-clara lg:hidden",
    menuMovel: "border-t border-areia bg-cru px-4 py-2 lg:hidden",
    menuMovelLink:
      "block rounded-lg px-3 py-2.5 text-sm font-medium text-carvao-suave transition hover:bg-areia-clara hover:text-carvao",

    conteudo: "flex w-full flex-1 flex-col items-stretch lg:flex-row",

    barraLateral: "hidden w-60 shrink-0 flex-col border-r border-areia bg-cru lg:flex xl:w-64",
    barraLateralNav: "flex flex-col gap-1.5 px-4 py-6",
    itemLateralBase: "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[15px]",
    itemLateralAtivo: "bg-canela/10 font-bold text-canela-escura",
    itemLateralInativo: "font-medium text-carvao-suave transition hover:bg-areia-clara hover:text-carvao",
    itemLateralIconeAtivo: "h-5 w-5 shrink-0 text-canela",
    itemLateralIcone: "h-5 w-5 shrink-0 text-carvao-suave",
    dicaCaixa:
      "mx-4 mb-6 mt-auto rounded-xl border border-musgo/25 bg-musgo-claro p-4",
    dicaTitulo: "text-sm font-bold text-musgo",
    dicaTexto: "mt-2 text-[13px] leading-relaxed text-carvao-suave",

    navegacaoMovel: "border-b border-areia bg-cru lg:hidden",
    navegacaoMovelLista: "flex gap-2 overflow-x-auto px-4 py-3",
    itemMovelBase:
      "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-transparent px-4 py-2 text-sm",
    itemMovelAtivo: "border-canela/30 bg-canela/10 font-bold text-canela-escura",
    itemMovelInativo: "font-medium text-carvao-suave",

    principal: "min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8",
    saudacao: "font-display text-2xl font-semibold tracking-tight text-carvao sm:text-3xl",
    saudacaoDescricao: "mt-1.5 text-sm text-carvao-suave sm:text-[15px]",

    gradeEstatisticas: "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4",
    cartaoEstatistica:
      "flex min-w-0 flex-col justify-center rounded-2xl border border-areia bg-cru p-5",
    estatisticaRotulo: "text-[13px] text-carvao-suave/80",
    estatisticaValor: "mt-1 font-display text-2xl font-semibold text-carvao",
    estatisticaDetalhe: "mt-1 text-[13px] text-carvao-suave",
    pegadaCaixa:
      "flex min-w-0 items-start gap-3 rounded-2xl border border-musgo/40 bg-musgo-claro/60 p-5",
    pegadaIcone: "h-8 w-8 shrink-0 text-musgo",
    pegadaTitulo: "text-[15px] font-bold text-carvao",
    pegadaTexto: "mt-1 text-[13px] leading-relaxed text-carvao-suave",
    pegadaDestaque: "font-bold text-musgo",

    gradeConteudo: "mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.65fr_1fr]",
    secaoTitulo: "text-base font-extrabold text-carvao sm:text-lg",

    gradeRecomendados: "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3",
    cartaoProduto: "min-w-0 overflow-hidden rounded-xl border border-areia bg-cru",
    produtoImagem: "h-40 w-full object-cover",
    produtoCorpo: "p-4",
    produtoTitulo: "break-words text-[15px] font-bold text-carvao",
    produtoOrigem: "mt-0.5 truncate text-[13px] text-carvao-suave/80",
    produtoRodape: "mt-2 flex items-center justify-between gap-2",
    produtoQuantidade: "text-sm font-bold text-canela",
    produtoDistancia: "shrink-0 text-[13px] text-carvao-suave",

    cartaoReservas: "min-w-0 rounded-2xl border border-areia bg-cru p-4 sm:p-6",
    listaReservas: "mt-4 flex flex-col gap-3",
    reservaItem: "rounded-xl border border-areia p-4",
    reservaTopo: "flex flex-wrap items-start justify-between gap-2",
    reservaTitulo: "min-w-0 flex-1 basis-40 break-words text-[15px] font-bold text-carvao",
    reservaOrigemRotulo: "mt-2 text-xs text-carvao-suave/70",
    reservaRodape: "mt-0.5 flex items-end justify-between gap-2",
    reservaOrigem: "min-w-0 truncate text-sm text-carvao-suave",
    reservaQuantidade: "shrink-0 whitespace-nowrap text-[15px] font-extrabold text-carvao",
    seloBase: "shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold",
    seloConfirmada: "bg-musgo-claro text-musgo",
    seloPendente: "bg-canela-clara text-canela-escura",
    seloConcluida: "bg-areia-clara text-carvao-suave",

    dicaMovel: "mt-6 rounded-xl border border-musgo/25 bg-musgo-claro p-4 lg:hidden",
  };

  function estiloSelo(status: string) {
    if (status === "Confirmada") return `${styles.seloBase} ${styles.seloConfirmada}`;
    if (status === "Pendente") return `${styles.seloBase} ${styles.seloPendente}`;
    return `${styles.seloBase} ${styles.seloConcluida}`;
  }

  return (
    <div className={styles.pagina}>
      {/* Topo do dashboard */}
      <header className={styles.cabecalho}>
        <div className={styles.cabecalhoConteudo}>
          <div className={styles.marca}>
            <BrandIcon className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-verde-escuro text-white" />
            <p className={styles.marcaTitulo}>Reaproveita Franca</p>
          </div>

          <nav className={styles.menuTopo}>
            {navegacaoTopo.map((item) => (
              <a key={item} href="#" className={styles.menuTopoLink}>
                {item}
              </a>
            ))}
          </nav>

          <div className={styles.cabecalhoAcoes}>
            <div className={styles.usuarioPilha} title={displayName}>
              <span className={styles.usuarioAvatar}>
                {photoSrc ? (
                  <img
                    src={photoSrc}
                    alt={`Foto de perfil de ${displayName}`}
                    className={styles.usuarioAvatarImg}
                  />
                ) : (
                  <UserRound className={styles.usuarioAvatarIcone} strokeWidth={2} />
                )}
              </span>
              <span className={styles.usuarioNome}>{firstName}</span>
            </div>
            <button
              type="button"
              aria-label="Sair da conta"
              title="Sair da conta"
              onClick={handleLogout}
              className={styles.botaoMenu}
            >
              <LogOut className="h-5 w-5" strokeWidth={2} />
            </button>
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

          <div className={styles.dicaCaixa}>
            <p className={styles.dicaTitulo}>Dica de circularidade</p>
            <p className={styles.dicaTexto}>
              Retalhos de couro classificados como premium têm 3x mais
              liquidez no artesanato de calçados finos.
            </p>
          </div>

          <div className="px-4 pb-6">
            <button
              type="button"
              onClick={handleLogout}
              className={`${styles.itemLateralBase} ${styles.itemLateralInativo} w-full`}
            >
              <LogOut className={styles.itemLateralIcone} strokeWidth={2} />
              Sair
            </button>
          </div>
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
          <div className="min-w-0">
            <h1 className={styles.saudacao}>Olá, {firstName}!</h1>
            <p className={styles.saudacaoDescricao}>
              Artesã Autônoma • Confira suas reservas e novos materiais
              recomendados para suas bolsas.
            </p>
          </div>

          {/* Cartões de resumo */}
          <div className={styles.gradeEstatisticas}>
            {estatisticas.map(({ rotulo, valor, detalhe }) => (
              <div key={rotulo} className={styles.cartaoEstatistica}>
                <p className={styles.estatisticaRotulo}>{rotulo}</p>
                <p className={styles.estatisticaValor}>{valor}</p>
                <p className={styles.estatisticaDetalhe}>{detalhe}</p>
              </div>
            ))}

            <div className={styles.pegadaCaixa}>
              <Award className={styles.pegadaIcone} strokeWidth={1.8} />
              <div className="min-w-0">
                <p className={styles.pegadaTitulo}>Sua pegada poupada</p>
                <p className={styles.pegadaTexto}>
                  Você evitou{" "}
                  <span className={styles.pegadaDestaque}>
                    2.670 kg de CO₂
                  </span>{" "}
                  na atmosfera!
                </p>
              </div>
            </div>
          </div>

          <div className={styles.gradeConteudo}>
            {/* Recomendados */}
            <section className="min-w-0">
              <h2 className={styles.secaoTitulo}>
                Recomendados para seu perfil (couro e EVA)
              </h2>

              <div className={styles.gradeRecomendados}>
                {recomendados.map(
                  ({ imagem, imagemAlt, titulo, origem, quantidade, distancia }) => (
                    <article key={titulo} className={styles.cartaoProduto}>
                      <img
                        src={imagem}
                        alt={imagemAlt}
                        loading="lazy"
                        className={styles.produtoImagem}
                      />
                      <div className={styles.produtoCorpo}>
                        <p className={styles.produtoTitulo}>{titulo}</p>
                        <p className={styles.produtoOrigem}>{origem}</p>
                        <div className={styles.produtoRodape}>
                          <span className={styles.produtoQuantidade}>
                            {quantidade}
                          </span>
                          <span className={styles.produtoDistancia}>
                            {distancia}
                          </span>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            </section>

            {/* Reservas ativas */}
            <section className={styles.cartaoReservas}>
              <h2 className={styles.secaoTitulo}>Minhas reservas ativas</h2>

              <div className={styles.listaReservas}>
                {reservas.map(({ titulo, status, origem, quantidade }) => (
                  <div key={titulo} className={styles.reservaItem}>
                    <div className={styles.reservaTopo}>
                      <p className={styles.reservaTitulo}>{titulo}</p>
                      <span className={estiloSelo(status)}>{status}</span>
                    </div>
                    <p className={styles.reservaOrigemRotulo}>Doador / origem</p>
                    <div className={styles.reservaRodape}>
                      <span className={styles.reservaOrigem}>{origem}</span>
                      <span className={styles.reservaQuantidade}>
                        {quantidade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Dica de circularidade (mobile/tablet) */}
          <div className={styles.dicaMovel}>
            <p className={styles.dicaTitulo}>Dica de circularidade</p>
            <p className={styles.dicaTexto}>
              Retalhos de couro classificados como premium têm 3x mais
              liquidez no artesanato de calçados finos.
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
