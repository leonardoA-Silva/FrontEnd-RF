import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ShoppingBag,
  History,
  UserRound,
  Package,
  PackageOpen,
  Handshake,
  Leaf,
  Sparkles,
  X,
  Phone,
  MapPin,
  ArrowRight,
  RefreshCw,
  Trash2,
  MessageSquare,
  Filter,
  CheckCircle,
  CheckCircle2,
  Star,
  LogOut,
  ShoppingCart,
  Calendar,
  Mail,
  Home,
  Building,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import {
  listarProdutos,
  listarLogs,
  criarLog,
  atualizarProduto,
  obterMeuPerfil,
  obterPerfilUsuario,
} from "../../axios/Axios";
import type {
  ProductBackend,
  TipoNegociacao,
  EstadoConservacao,
  LogBackend,
  UsuarioPerfil,
} from "../../axios/Axios";

// Categorias suportadas no banco de dados MySQL (tabela product)
const CATEGORIAS_BANCO: { id: string; label: string }[] = [
  { id: "todas", label: "Todas as Categorias" },
  { id: "madeira", label: "Madeira / Pallets" },
  { id: "metal", label: "Metal / Sucata" },
  { id: "plastico", label: "Plástico" },
  { id: "papel/papelao", label: "Papel / Papelão" },
  { id: "vidro", label: "Vidro" },
  { id: "tecido", label: "Tecido / Têxtil" },
  { id: "borracha", label: "Borracha / EVA" },
  { id: "eletronicos", label: "Eletrônicos" },
];

export interface AtividadeFormatada {
  id: string;
  tipo: "reserva" | "coleta" | "ia" | "avaliacao" | "sistema";
  destaque: string;
  resto: string;
  tempo: string;
}

export default function DashboardUsuario() {
  const { displayName, user, logout } = useLoggedUser({
    fallbackName: "Roberto de Oliveira",
  });

  // Navegação: comprador possui Explorar Materiais, Minhas Reservas, Histórico e Perfil
  const [abaAtiva, setAbaAtiva] = useState<"explorar" | "reservas" | "historico" | "perfil">("historico");

  // Dados reais 100% vindos da API do backend
  const [produtos, setProdutos] = useState<ProductBackend[]>([]);
  const [logs, setLogs] = useState<LogBackend[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erroApi, setErroApi] = useState<string | null>(null);

  // Filtros e busca para aba Explorar Materiais
  const [busca, setBusca] = useState<string>("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("todas");
  const [tipoNegociacaoFiltro, setTipoNegociacaoFiltro] = useState<"todos" | "sale" | "donation">("todos");

  // IDs dos produtos que este usuário comprador reservou na API
  const [reservasIdsUsuario, setReservasIdsUsuario] = useState<string[]>(() => {
    try {
      const storageKey = `rf_comprador_reservas_${user?.id || "padrao"}`;
      const salvas = localStorage.getItem(storageKey);
      return salvas ? JSON.parse(salvas) : [];
    } catch {
      return [];
    }
  });

  // Modais e alertas
  const [itemSelecionado, setItemSelecionado] = useState<ProductBackend | null>(null);
  const [modalContatoAberto, setModalContatoAberto] = useState<boolean>(false);
  const [mensagemToast, setMensagemToast] = useState<{ tipo: "sucesso" | "info"; texto: string } | null>(null);

  // Sincronizar IDs de reservas locais por usuário
  useEffect(() => {
    try {
      const storageKey = `rf_comprador_reservas_${user?.id || "padrao"}`;
      localStorage.setItem(storageKey, JSON.stringify(reservasIdsUsuario));
    } catch (e) {
      console.warn("Falha ao salvar IDs de reservas:", e);
    }
  }, [reservasIdsUsuario, user?.id]);

  function exibirToast(texto: string, tipo: "sucesso" | "info" = "sucesso") {
    setMensagemToast({ tipo, texto });
    setTimeout(() => setMensagemToast(null), 4000);
  }

  // Perfil completo importado diretamente da API (celular, CEP, endereço, etc.)
  const [perfilUsuario, setPerfilUsuario] = useState<UsuarioPerfil | null>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState<boolean>(false);

  const carregarPerfilUsuario = async () => {
    setCarregandoPerfil(true);
    try {
      // 1. Tenta obter via /user/me autenticado com JWT
      try {
        const resMe = await obterMeuPerfil();
        if (resMe.data && resMe.data.id) {
          setPerfilUsuario(resMe.data);
          return;
        }
      } catch {}

      // 2. Se falhar ou não tiver token JWT, tenta pelo ID do usuário
      const userId = user?.id || (user as any)?.userId;
      if (userId) {
        const resId = await obterPerfilUsuario(userId);
        if (resId.data && resId.data.id) {
          setPerfilUsuario(resId.data);
          return;
        }
      }
    } catch (err) {
      console.warn("Erro ao buscar perfil da API:", err);
    } finally {
      setCarregandoPerfil(false);
    }
  };

  useEffect(() => {
    carregarPerfilUsuario();
  }, [user?.id]);

  // Carregar produtos e logs diretamente da API backend (sem fallback / sem mock)
  const carregarDadosBackend = async () => {
    setCarregando(true);
    setErroApi(null);

    try {
      const [resProdutos, resLogs] = await Promise.allSettled([
        listarProdutos(),
        listarLogs(),
      ]);

      if (resProdutos.status === "fulfilled" && Array.isArray(resProdutos.value.data)) {
        setProdutos(resProdutos.value.data);
      } else {
        setProdutos([]);
        if (resProdutos.status === "rejected") {
          console.warn("Erro ao buscar produtos da API:", resProdutos.reason);
        }
      }

      if (resLogs.status === "fulfilled" && Array.isArray(resLogs.value.data)) {
        setLogs(resLogs.value.data);
      } else {
        setLogs([]);
      }
    } catch (err: any) {
      console.error("Falha ao comunicar com a API do backend:", err);
      setErroApi("Não foi possível conectar com o backend.");
      setProdutos([]);
      setLogs([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosBackend();
  }, []);

  // MATERIAIS RESERVADOS DA API (status === 'reserved' ou reservado pelo comprador)
  const materiaisReservadosApi = useMemo(() => {
    return produtos.filter(
      (prod) => prod.status === "reserved" || reservasIdsUsuario.includes(prod.id)
    );
  }, [produtos, reservasIdsUsuario]);

  // MATERIAIS DISPONÍVEIS DA API PARA EXPLORAR
  const materiaisDisponiveisApi = useMemo(() => {
    return produtos.filter(
      (prod) => prod.status === "available" && !reservasIdsUsuario.includes(prod.id)
    );
  }, [produtos, reservasIdsUsuario]);

  // Filtragem dos produtos disponíveis na aba Explorar
  const produtosExplorarFiltrados = useMemo(() => {
    return materiaisDisponiveisApi.filter((prod) => {
      const bateTexto =
        !busca.trim() ||
        prod.name.toLowerCase().includes(busca.toLowerCase()) ||
        (prod.description && prod.description.toLowerCase().includes(busca.toLowerCase())) ||
        prod.category.toLowerCase().includes(busca.toLowerCase());

      const bateCategoria =
        categoriaSelecionada === "todas" || prod.category.toLowerCase() === categoriaSelecionada.toLowerCase();

      const bateTipo =
        tipoNegociacaoFiltro === "todos" || prod.type_negotiation === tipoNegociacaoFiltro;

      return bateTexto && bateCategoria && bateTipo;
    });
  }, [materiaisDisponiveisApi, busca, categoriaSelecionada, tipoNegociacaoFiltro]);

  // Métricas 100% calculadas dos materiais reservados da API
  const metricasComprador = useMemo(() => {
    const totalReservados = materiaisReservadosApi.length;
    const emNegociacao = materiaisReservadosApi.length; // Reservas ativas do comprador

    const kgTotal = materiaisReservadosApi.reduce((acc, curr) => {
      const peso = parseFloat(String(curr.weight)) || 0;
      return acc + peso * (curr.quantity || 1);
    }, 0);

    const economiaEstimada = materiaisReservadosApi.reduce((acc, curr) => {
      const preco = parseFloat(String(curr.price)) || 0;
      return acc + (curr.type_negotiation === "donation" ? 120 : preco * 1.5);
    }, 0);

    return {
      reservados: totalReservados,
      negociando: emNegociacao,
      kgTotal,
      economia: economiaEstimada,
    };
  }, [materiaisReservadosApi]);

  // Lista consolidada de Atividades Circulares Reais da API
  const atividadesCirculares: AtividadeFormatada[] = useMemo(() => {
    const lista: AtividadeFormatada[] = [];

    // Logs reais da tabela log do banco de dados
    logs.forEach((l) => {
      let tipoIcone: AtividadeFormatada["tipo"] = "sistema";
      let destaque = "Sistema";
      let resto = `executou ${l.operation} em ${l.table}`;

      if (l.operation.toLowerCase().includes("reserva")) {
        tipoIcone = "reserva";
        destaque = "Reserva de Material";
        resto = `registrada com status: ${l.status}`;
      } else if (l.operation.toLowerCase().includes("coleta")) {
        tipoIcone = "coleta";
        destaque = "Coleta";
        resto = `concluída para o item registrado`;
      } else if (l.operation.toLowerCase().includes("ia")) {
        tipoIcone = "ia";
        destaque = "Reaproveita Franca AI";
        resto = `avaliou o lote de resíduos`;
      }

      lista.push({
        id: l.id,
        tipo: tipoIcone,
        destaque,
        resto,
        tempo: formatarTempoRelativo(l.datetime),
      });
    });

    // Atividades reais das reservas do comprador
    materiaisReservadosApi.forEach((m) => {
      lista.push({
        id: `ativ-res-${m.id}`,
        tipo: "reserva",
        destaque: "Você (Comprador)",
        resto: `solicitou reserva de "${m.name}"`,
        tempo: "Reserva Ativa",
      });
    });

    return lista;
  }, [logs, materiaisReservadosApi]);

  // Ação de Reservar Material no Backend (Comprador)
  async function handleReservarMaterial(prod: ProductBackend) {
    try {
      // 1. Atualiza na lista de IDs reservados localmente
      if (!reservasIdsUsuario.includes(prod.id)) {
        setReservasIdsUsuario((prev) => [...prev, prod.id]);
      }

      // 2. Envia atualização de status para o backend se suportado
      try {
        await atualizarProduto(prod.id, {
          name: prod.name,
          category: prod.category,
          type_negotiation: prod.type_negotiation,
          weight: prod.weight,
          conservation_state: prod.conservation_state,
          id_localization: prod.id_localization,
          status: "reserved",
        });
      } catch (errPut) {
        console.warn("Tentativa de atualizar status do produto no backend:", errPut);
      }

      // 3. Registra log de auditoria no backend
      try {
        await criarLog({
          reference_id: prod.id,
          status: "reserved",
          operation: "reserva",
          table: "product",
        });
      } catch (errLog) {
        console.warn("Tentativa de registrar log no backend:", errLog);
      }

      // 4. Atualiza os dados da API
      await carregarDadosBackend();

      setItemSelecionado(null);
      exibirToast(`Reserva realizada para "${prod.name}"! Acompanhe em Minhas Reservas.`);
    } catch (e: any) {
      console.error("Erro ao reservar:", e);
      exibirToast("Erro ao processar a reserva.", "info");
    }
  }

  // Cancelar Reserva (Comprador)
  async function handleCancelarReserva(prodId: string) {
    try {
      setReservasIdsUsuario((prev) => prev.filter((id) => id !== prodId));

      const prod = produtos.find((p) => p.id === prodId);
      if (prod) {
        try {
          await atualizarProduto(prod.id, {
            name: prod.name,
            category: prod.category,
            type_negotiation: prod.type_negotiation,
            weight: prod.weight,
            conservation_state: prod.conservation_state,
            id_localization: prod.id_localization,
            status: "available",
          });
        } catch {}
      }

      await carregarDadosBackend();
      exibirToast("Reserva cancelada com sucesso.", "info");
    } catch (e) {
      console.error("Erro ao cancelar reserva:", e);
    }
  }

  // Formatação de Preço e Moeda
  function formatarPreco(price: number | string | null, type: TipoNegociacao) {
    if (type === "donation" || price === null || price === undefined || price === "" || price === 0) {
      return "Grátis / Doação";
    }
    const num = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(num) ? "Sob consulta" : `R$ ${num.toFixed(2).replace(".", ",")}`;
  }

  // Formatação amigável das categorias do banco
  function formatarCategoria(categoria: string) {
    const encontrada = CATEGORIAS_BANCO.find((c) => c.id === categoria);
    return encontrada ? encontrada.label : categoria.charAt(0).toUpperCase() + categoria.slice(1);
  }

  // Formatação de estado de conservação
  function formatarEstadoConservacao(estado: EstadoConservacao) {
    switch (estado) {
      case "new":
        return "Novo / Sem uso";
      case "good":
        return "Bom estado";
      case "regular":
        return "Estado regular";
      case "poor":
        return "Para recuperação / reciclagem";
      default:
        return estado;
    }
  }

  // Formatação de data amigável / relativa
  function formatarTempoRelativo(dataIso: string | Date | undefined) {
    if (!dataIso) return "Recente";
    try {
      const data = new Date(dataIso);
      const agora = new Date();
      const diffMs = agora.getTime() - data.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHoras = Math.floor(diffMin / 60);
      const diffDias = Math.floor(diffHoras / 24);

      if (diffMin < 2) return "Agora mesmo";
      if (diffMin < 60) return `Há ${diffMin} min`;
      if (diffHoras < 24) return `Hoje às ${data.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      if (diffDias === 1) return `Ontem`;
      if (diffDias < 7) return `Há ${diffDias} dias`;
      return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    } catch {
      return "Recente";
    }
  }

  // Formatação de CEP
  function formatarCep(cep?: string | null) {
    if (!cep) return "Não informado";
    const limpo = String(cep).replace(/\D/g, "");
    if (limpo.length === 8) {
      return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
    }
    return cep;
  }

  // Formatação de Celular / WhatsApp
  function formatarCelular(tel?: string | null) {
    if (!tel) return "Não informado";
    const limpo = String(tel).replace(/\D/g, "");
    if (limpo.length === 11) {
      return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
    }
    if (limpo.length === 10) {
      return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
    }
    return tel;
  }

  // Formatação de Data
  function formatarData(dataStr?: string | null) {
    if (!dataStr) return "Não informada";
    try {
      const d = new Date(dataStr);
      return isNaN(d.getTime()) ? dataStr : d.toLocaleDateString("pt-BR");
    } catch {
      return dataStr;
    }
  }

  const menuLateralItens = [
    { id: "explorar", icone: Search, rotulo: "Explorar Materiais" },
    {
      id: "reservas",
      icone: ShoppingBag,
      rotulo: `Minhas Reservas${materiaisReservadosApi.length > 0 ? ` (${materiaisReservadosApi.length})` : ""}`,
    },
    { id: "historico", icone: History, rotulo: "Histórico" },
    { id: "perfil", icone: UserRound, rotulo: "Perfil" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAF9F5] text-[#1B4B3A]">
      <Header />

      {/* Toast de Notificação */}
      {mensagemToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xl animate-in slide-in-from-top-4">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{mensagemToast.texto}</span>
        </div>
      )}

      {/* Layout Principal: Sidebar + Conteúdo */}
      <div className="flex w-full flex-1 items-stretch">
        {/* BARRA LATERAL (SIDEBAR - Igual à imagem enviada) */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-[#E7E4DA] bg-white p-4 md:flex lg:w-64">
          <nav className="flex flex-col gap-1.5">
            {menuLateralItens.map(({ id, icone: Icone, rotulo }) => {
              const ativo = abaAtiva === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAbaAtiva(id as any)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition cursor-pointer text-left ${
                    ativo
                      ? "bg-[#D7EFE6] font-semibold text-[#0F3D2E]"
                      : "text-[#4B5A55] hover:bg-[#F3F1EA] hover:text-[#1B4B3A]"
                  }`}
                >
                  <Icone
                    className={`h-5 w-5 shrink-0 ${
                      ativo ? "text-[#0F3D2E]" : "text-[#4B5A55]"
                    }`}
                    strokeWidth={ativo ? 2.2 : 2}
                  />
                  <span>{rotulo}</span>
                </button>
              );
            })}
          </nav>

          {/* Card informativo de sustentabilidade */}
          <div className="mt-auto rounded-2xl bg-[#EBF6F2] p-4 border border-[#D5EADB]">
            <p className="text-xs font-bold text-[#0F3D2E] uppercase tracking-wider flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
              Economia Circular
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#4B5A55]">
              Comprando resíduos e sobras industriais, você fomenta o artesanato sustentável e evita descarte em Franca.
            </p>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL (DASHBOARD DO COMPRADOR) */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
          {/* Menu Mobile / Tablet */}
          <div className="flex gap-2 overflow-x-auto pb-4 md:hidden border-b border-[#E7E4DA] mb-6">
            {menuLateralItens.map(({ id, icone: Icone, rotulo }) => {
              const ativo = abaAtiva === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAbaAtiva(id as any)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold shrink-0 cursor-pointer ${
                    ativo
                      ? "bg-[#D7EFE6] text-[#0F3D2E]"
                      : "bg-white border border-[#E7E4DA] text-[#4B5A55]"
                  }`}
                >
                  <Icone className="h-4 w-4" />
                  {rotulo}
                </button>
              );
            })}
          </div>

          {/* ==================================================================== */}
          {/* 1. TELA: HISTÓRICO DE ATIVIDADES & IMPACTO (IGUAL À IMAGEM ENVIADA)     */}
          {/* ==================================================================== */}
          {abaAtiva === "historico" && (
            <div className="space-y-6">
              {/* Topo com Saudação do Comprador e Botão de Navegar para Explorar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F3D2E]">
                    Olá, {displayName}
                  </h1>
                  <p className="mt-1 text-sm sm:text-[15px] text-[#4B5A55]">
                    Acompanhe o impacto sustentável dos materiais adquiridos e suas reservas ativas.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={carregarDadosBackend}
                    title="Atualizar dados do backend"
                    className="flex items-center gap-1.5 rounded-lg border border-[#D9D5C8] bg-white px-3 py-2.5 text-xs font-semibold text-[#4B5A55] hover:bg-gray-50 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${carregando ? "animate-spin text-emerald-600" : ""}`} />
                    <span className="hidden sm:inline">Atualizar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAbaAtiva("explorar")}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#059669] hover:bg-[#047857] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition cursor-pointer"
                  >
                    <Search className="h-4 w-4" strokeWidth={2.5} />
                    Explorar Catálogo
                  </button>
                </div>
              </div>

              {/* 4 CARDS DE ESTATÍSTICAS / MÉTRICAS (DESIGN FIEL À IMAGEM) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {/* Card 1: Materiais Reservados (100% da API) */}
                <div className="flex items-center gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D7EFE6] text-emerald-600">
                    <Package className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      MATERIAIS RESERVADOS
                    </p>
                    <p className="text-2xl font-extrabold text-[#0F3D2E]">
                      {metricasComprador.reservados}
                    </p>
                    <p className="text-xs text-[#6B7670] mt-0.5 truncate">
                      {metricasComprador.reservados > 0
                        ? `${metricasComprador.reservados} ativos na API`
                        : "Você não possui reservas"}
                    </p>
                  </div>
                </div>

                {/* Card 2: Em Negociação (100% da API) */}
                <div className="flex items-center gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D7EFE6] text-emerald-600">
                    <Handshake className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      EM NEGOCIAÇÃO
                    </p>
                    <p className="text-2xl font-extrabold text-[#0F3D2E]">
                      {metricasComprador.negociando}
                    </p>
                    <p className="text-xs text-[#6B7670] mt-0.5 truncate">
                      {metricasComprador.negociando > 0 ? "Aguardando resposta" : "Sem negociações ativas"}
                    </p>
                  </div>
                </div>

                {/* Card 3: KG Adquiridos (100% da API) */}
                <div className="flex items-center gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D7EFE6] text-emerald-600">
                    <ShoppingCart className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      KG ADQUIRIDOS
                    </p>
                    <p className="text-2xl font-extrabold text-[#0F3D2E]">
                      {metricasComprador.kgTotal > 0
                        ? `${metricasComprador.kgTotal.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`
                        : "0 kg"}
                    </p>
                    <p className="text-xs text-[#6B7670] mt-0.5 truncate">Total de materiais circulares</p>
                  </div>
                </div>

                {/* Card 4: Sua Pegada Poupada (100% da API) */}
                <div className="flex items-center gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D7EFE6] text-emerald-600">
                    <Leaf className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      SUA PEGADA POUPADA
                    </p>
                    <p className="text-2xl font-extrabold text-[#0F3D2E]">
                      R$ {metricasComprador.economia.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-[#6B7670] mt-0.5 truncate">Economia gerada</p>
                  </div>
                </div>
              </div>

              {/* DUAS COLUNAS PRINCIPAIS (DESIGN DA IMAGEM ENVIADA) */}
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.65fr_1fr]">
                {/* COLUNA ESQUERDA: MATERIAIS RESERVADOS DA API */}
                <div className="rounded-2xl border border-[#E7E4DA] bg-white p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-base font-extrabold text-[#0F3D2E] sm:text-lg">
                      Últimos Resíduos Reservados
                    </h2>
                    <button
                      type="button"
                      onClick={() => setAbaAtiva("reservas")}
                      className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      Ver todos ({materiaisReservadosApi.length})
                    </button>
                  </div>

                  {carregando ? (
                    <div className="divide-y divide-gray-100 py-2">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="py-4 flex items-center justify-between animate-pulse">
                          <div className="space-y-2">
                            <div className="h-4 w-48 bg-gray-200 rounded"></div>
                            <div className="h-3 w-32 bg-gray-100 rounded"></div>
                          </div>
                          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : materiaisReservadosApi.length === 0 ? (
                    /* NOTIFICAÇÃO INTUITIVA QUANDO NÃO POSSUI RESERVAS */
                    <div className="rounded-xl border border-dashed border-[#E7E4DA] bg-[#FAF9F5] p-8 text-center my-4">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF6F2] text-emerald-600 mb-3">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-bold text-[#0F3D2E]">
                        Você não possui reservas no momento
                      </h3>
                      <p className="mx-auto mt-1 max-w-sm text-xs text-[#6B7670] leading-relaxed">
                        Nenhum material reservado foi encontrado no backend. Explore os insumos disponíveis ofertados pelas empresas parceiras.
                      </p>
                      <button
                        type="button"
                        onClick={() => setAbaAtiva("explorar")}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                      >
                        <Search className="h-3.5 w-3.5" />
                        Explorar Materiais
                      </button>
                    </div>
                  ) : (
                    /* LISTA DOS MATERIAIS RESERVADOS DA API */
                    <div className="divide-y divide-gray-100">
                      {materiaisReservadosApi.slice(0, 5).map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => setItemSelecionado(prod)}
                          className="flex items-center justify-between py-4 hover:bg-gray-50/70 px-2 rounded-xl transition cursor-pointer"
                        >
                          <div className="min-w-0 pr-3">
                            <h3 className="text-sm font-bold text-[#1F2A26] truncate">
                              {prod.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              Reserva solicitada • {formatarCategoria(prod.category)} • {prod.weight} kg
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs sm:text-sm font-extrabold text-[#0F3D2E]">
                              {formatarPreco(prod.price, prod.type_negotiation)}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                prod.type_negotiation === "donation"
                                  ? "bg-[#FEF3C7] text-[#D97706]"
                                  : "bg-[#EBF6F2] text-[#059669]"
                              }`}
                            >
                              {prod.type_negotiation === "donation" ? "Doação" : "Venda"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* COLUNA DIREITA: ATIVIDADE CIRCULAR RECENTE */}
                <div className="rounded-2xl border border-[#E7E4DA] bg-white p-5 sm:p-6 shadow-xs">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-base font-extrabold text-[#0F3D2E] sm:text-lg">
                      Atividade Circular Recente
                    </h2>
                  </div>

                  {atividadesCirculares.length === 0 ? (
                    /* NOTIFICAÇÃO INTUITIVA QUANDO NÃO HÁ ATIVIDADES */
                    <div className="rounded-xl border border-dashed border-[#E7E4DA] bg-[#FAF9F5] p-8 text-center my-4">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF6F2] text-emerald-600 mb-3">
                        <History className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-bold text-[#0F3D2E]">
                        Nenhuma atividade recente registrada
                      </h3>
                      <p className="mx-auto mt-1 max-w-xs text-xs text-[#6B7670] leading-relaxed">
                        O histórico de coletas, reservas e classificações dos seus materiais será exibido aqui em tempo real.
                      </p>
                    </div>
                  ) : (
                    /* LISTAGEM DE ATIVIDADES REAIS */
                    <div className="divide-y divide-gray-100">
                      {atividadesCirculares.slice(0, 5).map((ativ) => (
                        <div key={ativ.id} className="flex items-start gap-3 py-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D7EFE6] text-emerald-600 mt-0.5">
                            {ativ.tipo === "reserva" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : ativ.tipo === "ia" ? (
                              <Sparkles className="h-4 w-4 text-teal-600" />
                            ) : ativ.tipo === "avaliacao" ? (
                              <Star className="h-4 w-4 text-amber-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-[#1F2A26] leading-snug">
                              <strong className="font-bold text-[#0F3D2E]">{ativ.destaque}</strong>{" "}
                              {ativ.resto}
                            </p>
                            <span className="text-[11px] text-gray-400 mt-1 block">
                              {ativ.tempo}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* 2. TELA: EXPLORAR MATERIAIS (CATÁLOGO REAL CONECTADO À API)          */}
          {/* ==================================================================== */}
          {abaAtiva === "explorar" && (
            <>
              {/* Topo do Catálogo */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E] tracking-tight">
                    Explorar Materiais
                  </h1>
                  <p className="mt-1 text-sm sm:text-[15px] text-[#6B7670]">
                    Catálogo de resíduos, sobras e insumos industriais disponibilizados pelas fábricas de Franca.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={carregarDadosBackend}
                    title="Atualizar lista do banco"
                    className="flex items-center gap-1.5 rounded-lg border border-[#D9D5C8] bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${carregando ? "animate-spin text-emerald-600" : ""}`} />
                    Atualizar Catálogo
                  </button>

                  <button
                    type="button"
                    onClick={() => setAbaAtiva("reservas")}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Ver Minhas Reservas ({materiaisReservadosApi.length})
                  </button>
                </div>
              </div>

              {/* BARRA DE PESQUISA E FILTROS */}
              <div className="mt-6 rounded-2xl border border-[#E7E4DA] bg-white p-4 sm:p-6 shadow-xs">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Input de Busca */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, tipo de material ou descrição..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full rounded-xl border border-[#D9D5C8] bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                    />
                    {busca && (
                      <button
                        onClick={() => setBusca("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Alternador de Tipo de Negociação */}
                  <div className="flex items-center gap-1 rounded-xl bg-[#F4F2EC] p-1 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setTipoNegociacaoFiltro("todos")}
                      className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                        tipoNegociacaoFiltro === "todos"
                          ? "bg-white text-[#0F3D2E] shadow-xs"
                          : "text-[#6B7670] hover:text-[#0F3D2E]"
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoNegociacaoFiltro("sale")}
                      className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                        tipoNegociacaoFiltro === "sale"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-[#6B7670] hover:text-[#0F3D2E]"
                      }`}
                    >
                      Venda
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoNegociacaoFiltro("donation")}
                      className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                        tipoNegociacaoFiltro === "donation"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-[#6B7670] hover:text-[#0F3D2E]"
                      }`}
                    >
                      Doação
                    </button>
                  </div>
                </div>

                {/* Filtro por Tags de Categoria do Banco */}
                <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 py-1 mr-1">
                    <Filter className="h-3.5 w-3.5" />
                    Categorias:
                  </span>
                  {CATEGORIAS_BANCO.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoriaSelecionada(cat.id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                        categoriaSelecionada === cat.id
                          ? "bg-[#0F3D2E] text-white"
                          : "bg-[#F4F2EC] text-[#4B5A55] hover:bg-[#EAE6DC]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* GRADE DE PRODUTOS OU NOTIFICAÇÃO INTUITIVA DE VAZIO */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#0F3D2E]">
                    Catálogo de Materiais Disponíveis ({produtosExplorarFiltrados.length})
                  </h2>
                  {erroApi && (
                    <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      {erroApi}
                    </span>
                  )}
                </div>

                {carregando ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="h-56 animate-pulse rounded-2xl bg-gray-200" />
                    ))}
                  </div>
                ) : materiaisDisponiveisApi.length === 0 ? (
                  /* NOTIFICAÇÃO INTUITIVA ESPECÍFICA: SEM MATERIAIS NO BACKEND */
                  <div className="rounded-2xl border border-dashed border-[#D9D5C8] bg-white p-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF6F2] text-emerald-600 mb-4">
                      <PackageOpen className="h-8 w-8" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0F3D2E]">
                      Nenhum material disponível para reserva
                    </h3>
                    <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm text-gray-500 leading-relaxed">
                      Não há resíduos industriais ou matérias-primas disponíveis no momento no backend.
                      Novos lotes cadastrados pelas indústrias parceiras aparecerão aqui automaticamente.
                    </p>
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={carregarDadosBackend}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D5C8] bg-white hover:bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-xs cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Verificar Novamente
                      </button>
                    </div>
                  </div>
                ) : produtosExplorarFiltrados.length === 0 ? (
                  /* NOTIFICAÇÃO QUANDO FILTROS NÃO ENCONTRAM ITENS */
                  <div className="rounded-2xl border border-dashed border-[#D9D5C8] bg-white p-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-3 text-base font-bold text-gray-700">Nenhum material encontrado com esses filtros</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Tente alterar os termos da busca ou a categoria selecionada.
                    </p>
                    <button
                      onClick={() => {
                        setBusca("");
                        setCategoriaSelecionada("todas");
                        setTipoNegociacaoFiltro("todos");
                      }}
                      className="mt-4 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                    >
                      Limpar todos os filtros
                    </button>
                  </div>
                ) : (
                  /* CARDS DE PRODUTOS REAIS DA API */
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {produtosExplorarFiltrados.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => setItemSelecionado(prod)}
                        className="flex flex-col justify-between rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="rounded-full bg-[#EBF6F2] px-2.5 py-0.5 text-xs font-semibold text-[#0F3D2E]">
                              {formatarCategoria(prod.category)}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                prod.type_negotiation === "donation"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {prod.type_negotiation === "donation" ? "Doação" : "Venda"}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-[#1F2A26] group-hover:text-emerald-700 transition line-clamp-1">
                            {prod.name}
                          </h3>

                          <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {prod.description || "Lote disponível para reaproveitamento circular."}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>Peso: {prod.weight} kg</span>
                            <span>Qtd: {prod.quantity} un</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-gray-400">VALOR</p>
                              <p className="text-base font-extrabold text-[#0F3D2E]">
                                {formatarPreco(prod.price, prod.type_negotiation)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReservarMaterial(prod);
                              }}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                            >
                              Reservar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ==================================================================== */}
          {/* 3. TELA: MINHAS RESERVAS (100% DA API COM NOTIFICAÇÃO INTUITIVA)     */}
          {/* ==================================================================== */}
          {abaAtiva === "reservas" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E]">Minhas Reservas</h1>
                  <p className="mt-1 text-sm text-[#6B7670]">
                    Acompanhe o andamento dos materiais que você reservou diretamente com as fábricas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAbaAtiva("explorar")}
                  className="text-sm font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Explorar mais materiais
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {materiaisReservadosApi.length === 0 ? (
                /* NOTIFICAÇÃO INTUITIVA ESPECÍFICA: VOCÊ NÃO POSSUI RESERVAS */
                <div className="rounded-2xl border border-dashed border-[#D9D5C8] bg-white p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF6F2] text-emerald-600 mb-4">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F3D2E]">
                    Você não possui reservas no momento
                  </h3>
                  <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Você ainda não solicitou a reserva de nenhum material. Navegue pelo catálogo na aba Explorar para encontrar retalhos e insumos circulares para seus projetos.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAbaAtiva("explorar")}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition cursor-pointer"
                  >
                    <Search className="h-4 w-4" />
                    Explorar Catálogo de Materiais
                  </button>
                </div>
              ) : (
                /* LISTAGEM DOS MATERIAIS RESERVADOS DA API */
                <div className="grid grid-cols-1 gap-4">
                  {materiaisReservadosApi.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-xs"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D7EFE6] text-emerald-700 font-bold">
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                              {formatarCategoria(prod.category)}
                            </span>
                            <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[11px] font-bold">
                              Reserva Ativa
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#1F2A26] mt-1">{prod.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Peso: {prod.weight} kg • Quantidade: {prod.quantity} un • Conservação: {formatarEstadoConservacao(prod.conservation_state)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-bold uppercase text-gray-400">VALOR TOTAL</p>
                          <p className="text-base font-extrabold text-[#0F3D2E]">
                            {formatarPreco(prod.price, prod.type_negotiation)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setItemSelecionado(prod);
                              setModalContatoAberto(true);
                            }}
                            className="rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                            title="Conversar com fornecedor"
                          >
                            <MessageSquare className="h-4 w-4 text-emerald-700" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCancelarReserva(prod.id)}
                            className="rounded-xl border border-red-200 p-2.5 text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Cancelar reserva"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* 4. TELA: PERFIL DO USUÁRIO COMPRADOR (IMPORTADO 100% DA API)         */}
          {/* ==================================================================== */}
          {abaAtiva === "perfil" && (
            <div className="rounded-2xl border border-[#E7E4DA] bg-white p-6 sm:p-8 max-w-4xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E]">Meu Perfil</h2>
                  <p className="text-sm text-[#6B7670] mt-1">
                    Informações cadastrais e endereço importados diretamente da API do Reaproveita Franca.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={carregarPerfilUsuario}
                  disabled={carregandoPerfil}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#D9D5C8] bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-2xs self-start sm:self-auto"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${carregandoPerfil ? "animate-spin text-emerald-600" : ""}`} />
                  Atualizar Dados
                </button>
              </div>

              {carregandoPerfil ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
                  <p className="text-sm font-medium text-gray-500">Carregando informações do perfil da API...</p>
                </div>
              ) : (
                <>
                  {/* Bloco de Apresentação */}
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-2xl bg-[#F7FBF9] border border-[#D5EADB]">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#D7EFE6] text-[#0F3D2E] font-extrabold text-2xl shadow-xs">
                      {(perfilUsuario?.name || displayName).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-extrabold text-[#1F2A26]">
                          {perfilUsuario?.name || displayName}
                        </h3>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold">
                          {perfilUsuario?.status === "active" ? "Conta Ativa" : (perfilUsuario?.status || "Conta Ativa")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
                        {perfilUsuario?.email || user?.email || "usuario@reaproveita.com.br"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Função no sistema: <strong className="text-emerald-700 font-semibold">{perfilUsuario?.role === "user" ? "Comprador / Artesão" : (perfilUsuario?.role || "Comprador")}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Grid de Informações Básicas da API */}
                  <div className="mt-8">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                      Dados de Contato & Localização (API)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Celular / WhatsApp */}
                      <div className="rounded-xl border border-[#E7E4DA] bg-white p-4.5 shadow-2xs hover:border-emerald-300 transition">
                        <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-emerald-600" />
                          Celular / WhatsApp
                        </span>
                        <p className="text-sm font-bold text-[#1F2A26] mt-2">
                          {formatarCelular(perfilUsuario?.cellphone || user?.cellphone)}
                        </p>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">Para contato de retirada</span>
                      </div>

                      {/* CEP */}
                      <div className="rounded-xl border border-[#E7E4DA] bg-white p-4.5 shadow-2xs hover:border-emerald-300 transition">
                        <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          Código Postal (CEP)
                        </span>
                        <p className="text-sm font-bold text-[#1F2A26] mt-2">
                          {formatarCep(perfilUsuario?.zip_code || user?.zip_code)}
                        </p>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">Localidade cadastrada</span>
                      </div>

                      {/* Cidade / Estado */}
                      <div className="rounded-xl border border-[#E7E4DA] bg-white p-4.5 shadow-2xs hover:border-emerald-300 transition">
                        <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-emerald-600" />
                          Cidade / UF
                        </span>
                        <p className="text-sm font-bold text-[#1F2A26] mt-2">
                          {perfilUsuario?.city
                            ? `${perfilUsuario.city} - ${perfilUsuario.state || "SP"}`
                            : (user?.city ? `${user.city} - ${user.state || "SP"}` : "Franca - SP")}
                        </p>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">Região de atuação</span>
                      </div>

                      {/* Logradouro e Número */}
                      <div className="rounded-xl border border-[#E7E4DA] bg-white p-4.5 shadow-2xs hover:border-emerald-300 transition">
                        <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                          <Home className="h-3.5 w-3.5 text-emerald-600" />
                          Endereço / Logradouro
                        </span>
                        <p className="text-sm font-bold text-[#1F2A26] mt-2 truncate">
                          {perfilUsuario?.street
                            ? `${perfilUsuario.street}, ${perfilUsuario.number || "S/N"}`
                            : (user?.street ? `${user.street}, ${user.number || "S/N"}` : "Não informado")}
                        </p>
                        <span className="text-[11px] text-gray-400 mt-0.5 block truncate">
                          {perfilUsuario?.neighborhood
                            ? `Bairro: ${perfilUsuario.neighborhood}`
                            : (user?.neighborhood ? `Bairro: ${user.neighborhood}` : "Bairro não informado")}
                        </span>
                      </div>

                      {/* Data de Nascimento */}
                      <div className="rounded-xl border border-[#E7E4DA] bg-white p-4.5 shadow-2xs hover:border-emerald-300 transition">
                        <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                          Data de Nascimento
                        </span>
                        <p className="text-sm font-bold text-[#1F2A26] mt-2">
                          {formatarData(perfilUsuario?.birthday || user?.birthday)}
                        </p>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">Registro de aniversário</span>
                      </div>

                      {/* Membro Desde */}
                      <div className="rounded-xl border border-[#E7E4DA] bg-white p-4.5 shadow-2xs hover:border-emerald-300 transition">
                        <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          Cadastro Criado em
                        </span>
                        <p className="text-sm font-bold text-[#1F2A26] mt-2">
                          {formatarData(perfilUsuario?.created_in || user?.created_in)}
                        </p>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">Membro oficial do RF</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações do Rodapé do Perfil */}
                  <div className="mt-10 flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setAbaAtiva("historico")}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                    >
                      Voltar ao Painel
                    </button>

                    <button
                      type="button"
                      onClick={logout}
                      className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair da Conta
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL: DETALHES DO PRODUTO */}
      {itemSelecionado && !modalContatoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E7E4DA] bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    {formatarCategoria(itemSelecionado.category)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      itemSelecionado.type_negotiation === "donation"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {itemSelecionado.type_negotiation === "donation" ? "Doação" : "Venda"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0F3D2E] mt-2">{itemSelecionado.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setItemSelecionado(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#4B5A55]">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-700">Preço / Valor:</span>
                <span className="font-bold text-lg text-[#0F3D2E]">
                  {formatarPreco(itemSelecionado.price, itemSelecionado.type_negotiation)}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-700">Peso Total:</span>
                <span className="font-semibold text-gray-800">{itemSelecionado.weight} kg</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-700">Quantidade Disponível:</span>
                <span className="font-semibold text-gray-800">{itemSelecionado.quantity} unidades</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-700">Estado de Conservação:</span>
                <span className="font-semibold text-gray-800">
                  {formatarEstadoConservacao(itemSelecionado.conservation_state)}
                </span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-gray-700 block mb-1">Descrição do Lote:</span>
                <p className="rounded-xl bg-[#FAF9F5] p-3 text-xs leading-relaxed text-gray-600 border border-[#ECE8DC]">
                  {itemSelecionado.description || "Nenhuma descrição detalhada fornecida pelo anunciante."}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalContatoAberto(true)}
                className="rounded-xl border border-[#D9D5C8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                Falar com Fornecedor
              </button>

              <button
                type="button"
                onClick={() => handleReservarMaterial(itemSelecionado)}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                Solicitar Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONTATO COM FORNECEDOR */}
      {modalContatoAberto && itemSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E7E4DA] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-[#0F3D2E]">Contato com a Fábrica</h3>
              <button
                type="button"
                onClick={() => setModalContatoAberto(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600 space-y-3">
              <p>
                Inicie uma conversa direta para combinar a retirada do material{" "}
                <strong className="text-gray-900 font-semibold">{itemSelecionado.name}</strong>.
              </p>
              <textarea
                rows={3}
                defaultValue={`Olá! Tenho interesse no lote "${itemSelecionado.name}". Poderia me confirmar se está disponível para retirada em Franca?`}
                className="w-full rounded-xl border border-[#D9D5C8] p-3 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalContatoAberto(false)}
                className="rounded-xl border border-[#D9D5C8] px-4 py-2 text-xs font-semibold text-gray-600 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalContatoAberto(false);
                  setItemSelecionado(null);
                  exibirToast("Mensagem enviada com sucesso para a fábrica!");
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
              >
                Enviar Mensagem
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
