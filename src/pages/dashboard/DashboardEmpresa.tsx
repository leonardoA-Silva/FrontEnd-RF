import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlarmClock,
  CheckCircle2,
  Coins,
  Folder,
  Leaf,
  LogOut,
  Package,
  PackageOpen,
  Plus,
  PlusCircle,
  Sparkles,
  Star,
  UserRound,
  RefreshCw,
  History,
} from "lucide-react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { listarProdutos, listarLogs } from "../../axios/Axios";
import type { ProductBackend, LogBackend } from "../../axios/Axios";

const menuLateral = [
  { icone: Folder, rotulo: "Meus Materiais", ativo: true },
  { icone: PlusCircle, rotulo: "Publicar Novo", ativo: false },
  { icone: UserRound, rotulo: "Perfil", ativo: false },
];

export default function DashboardEmpresa() {
  const navigate = useNavigate();

  const { displayName } = useLoggedUser({
    fallbackName: "Minha Empresa",
  });

  const [produtos, setProdutos] = useState<ProductBackend[]>([]);
  const [logs, setLogs] = useState<LogBackend[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [resProd, resLogs] = await Promise.allSettled([
        listarProdutos(),
        listarLogs(),
      ]);

      if (resProd.status === "fulfilled" && Array.isArray(resProd.value.data)) {
        setProdutos(resProd.value.data);
      } else {
        setProdutos([]);
      }

      if (resLogs.status === "fulfilled" && Array.isArray(resLogs.value.data)) {
        setLogs(resLogs.value.data);
      } else {
        setLogs([]);
      }
    } catch {
      setProdutos([]);
      setLogs([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  function handleLogout() {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem("token");
      storage.removeItem("user");
      storage.removeItem("tipoUsuario");
    }
    navigate("/login");
  }

  // Estatísticas calculadas exclusivamente a partir dos dados reais do backend
  const estatisticasCalculadas = useMemo(() => {
    const totalPublicados = produtos.length;
    const reservados = produtos.filter((p) => p.status === "reserved").length;
    const kgTotal = produtos.reduce((acc, p) => acc + (parseFloat(String(p.weight)) || 0), 0);
    const valorGerado = produtos.reduce((acc, p) => acc + (parseFloat(String(p.price)) || 50), 0);

    return [
      {
        icone: Package,
        rotulo: "Materiais Publicados",
        valor: String(totalPublicados),
        detalhe: totalPublicados > 0 ? `${reservados} já reservados` : "Nenhum material publicado",
      },
      {
        icone: AlarmClock,
        rotulo: "Reservas Ativas",
        valor: String(reservados),
        detalhe: reservados > 0 ? "Aguardando retirada" : "Sem reservas pendentes",
      },
      {
        icone: Leaf,
        rotulo: "Resíduos Desviados",
        valor: kgTotal > 0 ? `${kgTotal.toLocaleString("pt-BR")} kg` : "0 kg",
        detalhe: "Desviados do aterro local",
      },
      {
        icone: Coins,
        rotulo: "Valor Social Gerado",
        valor: valorGerado > 0 ? `R$ ${valorGerado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00",
        detalhe: "Economia p/ artesãos",
      },
    ];
  }, [produtos]);

  const styles = {
    pagina: "flex min-h-screen w-full flex-col bg-[#FAF9F5] text-[#1B4B3A]",
    conteudo: "flex w-full flex-1 flex-col items-stretch lg:flex-row",
    barraLateral: "hidden w-56 shrink-0 flex-col border-r border-[#E7E4DA] bg-white lg:flex xl:w-64",
    barraLateralNav: "flex flex-col gap-2 px-4 py-6",
    itemLateralBase: "flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px]",
    itemLateralAtivo: "bg-emerald-50 font-bold text-[#1B4B3A]",
    itemLateralInativo: "font-medium text-[#4B5A55] transition hover:bg-[#F3F1EA]",
    itemLateralIconeAtivo: "h-5 w-5 shrink-0 text-emerald-500",
    itemLateralIcone: "h-5 w-5 shrink-0 text-[#4B5A55]",

    navegacaoMovel: "border-b border-[#E7E4DA] bg-white lg:hidden",
    navegacaoMovelLista: "flex gap-2 overflow-x-auto px-4 py-3",
    itemMovelBase: "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm",
    itemMovelAtivo: "bg-emerald-50 font-bold text-[#1B4B3A]",
    itemMovelInativo: "font-medium text-[#4B5A55]",

    principal: "min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8",
    principalTopo: "flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between",
    saudacao: "text-2xl font-extrabold tracking-tight text-[#0F3D2E] sm:text-3xl",
    saudacaoDescricao: "mt-1.5 text-sm text-[#4B5A55] sm:text-[15px]",
    botaoPublicar:
      "flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 sm:w-auto sm:self-start cursor-pointer",

    gradeEstatisticas: "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4",
    cartaoEstatistica: "flex min-w-0 items-center gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5",
    estatisticaIconeCaixa: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50",
    estatisticaIcone: "h-6 w-6 text-emerald-500",
    estatisticaTextos: "min-w-0",
    estatisticaRotulo: "truncate text-[13px] text-[#9AA5A0]",
    estatisticaValor: "text-2xl font-extrabold text-[#0F3D2E]",
    estatisticaDetalhe: "mt-0.5 text-[13px] text-[#6B7670]",

    gradeConteudo: "mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.65fr_1fr]",
    cartao: "min-w-0 rounded-2xl border border-[#E7E4DA] bg-white p-4 sm:p-6",
    cartaoCabecalho: "flex flex-wrap items-center justify-between gap-2",
    cartaoTitulo: "text-base font-extrabold text-[#0F3D2E] sm:text-lg",
    cartaoLink: "shrink-0 text-sm font-medium text-emerald-500 hover:text-emerald-600 cursor-pointer",

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
    atividadeIconeCaixa: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F7F4]",
    atividadeIcone: "h-5 w-5 text-emerald-500",
    atividadeTextos: "min-w-0",
    atividadeTexto: "break-words text-sm leading-relaxed text-[#3F4A45]",
    atividadeDestaque: "font-bold text-[#1F2A26]",
    atividadeTempo: "mt-0.5 block text-xs text-[#9AA5A0]",
  };

  return (
    <div className={styles.pagina}>
      <Header />

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
          <div className="mt-auto border-t border-[#E7E4DA] p-4">
            <button
              type="button"
              onClick={handleLogout}
              className={`${styles.itemLateralBase} ${styles.itemLateralInativo} w-full cursor-pointer`}
            >
              <LogOut className={styles.itemLateralIcone} strokeWidth={2} />
              Sair
            </button>
          </div>
        </aside>

        {/* Menu horizontal (mobile) */}
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
              <h1 className={styles.saudacao}>Olá, {displayName}!</h1>
              <p className={styles.saudacaoDescricao}>
                Acompanhe o impacto da sua fábrica e gerencie seus anúncios de resíduos.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={carregarDados}
                className="flex items-center gap-1.5 rounded-lg border border-[#D9D5C8] bg-white px-3 py-2.5 text-xs font-semibold text-[#4B5A55] hover:bg-gray-50 shadow-xs cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${carregando ? "animate-spin text-emerald-600" : ""}`} />
                Atualizar
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboardUsuario")}
                className={styles.botaoPublicar}
              >
                <Plus className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                Publicar Novo Material
              </button>
            </div>
          </div>

          {/* Cartões de resumo dinâmicos */}
          <div className={styles.gradeEstatisticas}>
            {estatisticasCalculadas.map(({ icone: Icone, rotulo, valor, detalhe }) => (
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
            {/* Últimos resíduos (com empty state intuitivo) */}
            <section className={styles.cartao}>
              <div className={styles.cartaoCabecalho}>
                <h2 className={styles.cartaoTitulo}>
                  Últimos Resíduos Publicados
                </h2>
                <span className={styles.cartaoLink}>
                  Ver todos ({produtos.length})
                </span>
              </div>

              {carregando ? (
                <div className="divide-y divide-gray-100 py-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="py-3 animate-pulse">
                      <div className="h-4 w-40 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-24 bg-gray-100 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : produtos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E7E4DA] bg-[#FAF9F5] p-8 text-center my-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF6F2] text-emerald-600 mb-3">
                    <PackageOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F3D2E]">
                    Nenhum resíduo publicado até o momento
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-[#6B7670] leading-relaxed">
                    Sua empresa ainda não publicou anúncios de sobras ou materiais recicláveis.
                  </p>
                </div>
              ) : (
                <div className={styles.listaResiduos}>
                  {produtos.slice(0, 5).map((prod) => (
                    <div key={prod.id} className={styles.residuoItem}>
                      <div className={styles.residuoTextos}>
                        <p className={styles.residuoTitulo}>{prod.name}</p>
                        <p className={styles.residuoData}>
                          {prod.category} • {prod.conservation_state}
                        </p>
                      </div>
                      <div className={styles.residuoLadoDireito}>
                        <span className={styles.residuoQuantidade}>
                          {prod.weight} kg
                        </span>
                        <span
                          className={`${styles.seloBase} ${
                            prod.status === "reserved"
                              ? styles.seloReservado
                              : styles.seloAtivo
                          }`}
                        >
                          {prod.status === "reserved" ? "Reservado" : "Disponível"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Atividade recente (com empty state intuitivo) */}
            <section className={styles.cartao}>
              <h2 className={styles.cartaoTitulo}>
                Atividade Circular Recente
              </h2>

              {logs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E7E4DA] bg-[#FAF9F5] p-8 text-center my-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF6F2] text-emerald-600 mb-3">
                    <History className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F3D2E]">
                    Nenhuma atividade recente registrada
                  </h3>
                  <p className="mx-auto mt-1 max-w-xs text-xs text-[#6B7670] leading-relaxed">
                    Movimentações, reservas e coletas de resíduos da sua fábrica serão notificadas aqui.
                  </p>
                </div>
              ) : (
                <div className={styles.listaAtividades}>
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className={styles.atividadeItem}>
                      <span className={styles.atividadeIconeCaixa}>
                        {log.operation.includes("reserva") ? (
                          <CheckCircle2 className={styles.atividadeIcone} strokeWidth={2} />
                        ) : log.operation.includes("ia") ? (
                          <Sparkles className="h-5 w-5 text-teal-600" strokeWidth={2} />
                        ) : (
                          <Star className="h-5 w-5 text-amber-500" strokeWidth={2} />
                        )}
                      </span>
                      <div className={styles.atividadeTextos}>
                        <p className={styles.atividadeTexto}>
                          <span className={styles.atividadeDestaque}>
                            {log.operation}
                          </span>{" "}
                          registrado na tabela {log.table} ({log.status})
                        </p>
                        <span className={styles.atividadeTempo}>{log.datetime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
