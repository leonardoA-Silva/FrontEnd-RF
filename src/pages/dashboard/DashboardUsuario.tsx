import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Building2,
  User,
  Pencil,
  Camera,
  Save,
  QrCode,
} from "lucide-react";
import axios from "axios";
import { erroCatalogo, validarCatalogo } from "../marketplace/catalogo";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import ResiduoDetalheModal from "./comprador/ResiduoDetalheModal";
import SolicitarReservaModal, { type DadosReservaFinalizada } from "./comprador/SolicitarReservaModal";
import QrCodeRetiradaModal from "./comprador/QrCodeRetiradaModal";
import AvaliacaoColetaModal from "./comprador/AvaliacaoColetaModal";
import ChatReservaModal from "./comprador/ChatReservaModal";
import {
  listarProdutos,
  obterMeuPerfil,
  obterPerfilUsuario,
  atualizarPerfilUsuario,
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
  const navigate = useNavigate();
  const { displayName, user, photoSrc, logout } = useLoggedUser();

  // Navegação: comprador possui Explorar Materiais, Minhas Reservas, Histórico e Perfil
  const [abaAtiva, setAbaAtiva] = useState<"explorar" | "reservas" | "historico" | "perfil">("historico");

  // Dados reais 100% vindos da API do backend
  const [produtos, setProdutos] = useState<ProductBackend[]>([]);
  const [logs] = useState<LogBackend[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erroApi, setErroApi] = useState<string | null>(null);

  // Filtros e busca para aba Explorar Materiais
  const [busca, setBusca] = useState<string>("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("todas");
  const [tipoNegociacaoFiltro, setTipoNegociacaoFiltro] = useState<"todos" | "sale" | "donation">("todos");

  // Sem contrato de reservas verificado, não inferir titularidade pelo status do produto
  // nem tratar dados locais de demonstração como pedidos reais.
  const [reservasIdsUsuario] = useState<string[]>([]);
  const [reservasDetalhes] = useState<DadosReservaFinalizada[]>([]);

  // Modais do fluxo Figma
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState<boolean>(false);
  const [produtoDetalhes, setProdutoDetalhes] = useState<ProductBackend | null>(null);

  const [modalSolicitarReservaAberto, setModalSolicitarReservaAberto] = useState<boolean>(false);
  const [produtoParaReserva, setProdutoParaReserva] = useState<ProductBackend | null>(null);

  const [modalQrCodeAberto, setModalQrCodeAberto] = useState<boolean>(false);
  const [dadosQrCode, setDadosQrCode] = useState<{
    produto: ProductBackend;
    codigo: string;
    quantidade: number;
    dataRetirada?: string;
  } | null>(null);

  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState<boolean>(false);
  const [produtoParaAvaliar, setProdutoParaAvaliar] = useState<ProductBackend | null>(null);

  const [modalChatAberto, setModalChatAberto] = useState<boolean>(false);
  const [produtoParaChat, setProdutoParaChat] = useState<ProductBackend | null>(null);

  // Alertas
  const [mensagemToast, setMensagemToast] = useState<{ tipo: "sucesso" | "info"; texto: string } | null>(null);

  function exibirToast(texto: string, tipo: "sucesso" | "info" = "sucesso") {
    setMensagemToast({ tipo, texto });
    setTimeout(() => setMensagemToast(null), 4000);
  }

  // Perfil completo importado diretamente da API (celular, CEP, endereço, etc.)
  const [perfilUsuario, setPerfilUsuario] = useState<UsuarioPerfil | null>(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState<boolean>(true);

  const [tentativaCatalogo, setTentativaCatalogo] = useState(0);
  const userId = user?.id || user?.userId;
  useEffect(() => {
    let ativo = true;
    async function consultarPerfil() {
      let perfil: UsuarioPerfil;
      try { perfil = (await obterMeuPerfil()).data; }
      catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 404 || !userId) throw error;
        perfil = (await obterPerfilUsuario(userId)).data;
      }
      if (!perfil || typeof perfil.id !== "string" || typeof perfil.name !== "string" || (userId && perfil.id !== userId)) throw new Error("Perfil indisponível");
      return perfil;
    }
    consultarPerfil().then((perfil) => { if (ativo) setPerfilUsuario(perfil); })
      .catch(() => { if (ativo) setPerfilUsuario(null); })
      .finally(() => { if (ativo) setCarregandoPerfil(false); });
    return () => { ativo = false; };
  }, [userId]);

  function carregarDadosBackend() {
    setCarregando(true); setErroApi(null); setTentativaCatalogo((n) => n + 1);
  }
  useEffect(() => {
    let ativo = true;
    listarProdutos().then(({ data }) => validarCatalogo(data)).then((lista) => {
      if (ativo) { setProdutos(lista); setErroApi(null); }
    }).catch((error: unknown) => {
      if (ativo) { setProdutos([]); setErroApi(erroCatalogo(error)); }
    }).finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [tentativaCatalogo]);

  // Sem vínculo confirmado de titularidade, não exibir produtos reservados de outras contas.
  const materiaisReservadosApi = useMemo(() => {
    return produtos.filter(
      (prod) => reservasIdsUsuario.includes(prod.id)
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

  async function handleConfirmarReserva() {
    throw new Error("Não há reserva disponível no momento.");
  }
  function handleCancelarReserva() {
    exibirToast("Não há cancelamento disponível no momento. Nenhuma reserva foi alterada.", "info");
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

  // Formatação de CPF
  function formatarCpf(cpf?: string | null) {
    if (!cpf) return "Não informado";
    const limpo = String(cpf).replace(/\D/g, "");
    if (limpo.length === 11) {
      return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9)}`;
    }
    return cpf;
  }

  // Formatação de CNPJ
  function formatarCnpj(cnpj?: string | null) {
    if (!cnpj) return "Não informado";
    const limpo = String(cnpj).replace(/\D/g, "");
    if (limpo.length === 14) {
      return `${limpo.slice(0, 2)}.${limpo.slice(2, 5)}.${limpo.slice(5, 8)}/${limpo.slice(8, 12)}-${limpo.slice(12)}`;
    }
    return cnpj;
  }

  // Modal e Formulário de Edição de Perfil
  const [modalEditarPerfilAberto, setModalEditarPerfilAberto] = useState<boolean>(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState<boolean>(false);
  const [formPerfil, setFormPerfil] = useState({
    name: "",
    email: "",
    cellphone: "",
    cargo: "",
    cpf: "",
    cnpj: "",
    setor: "",
    zip_code: "",
    street: "",
    neighborhood: "",
    number: "",
    city: "",
    state: "",
    photo: "" as string | null,
    photoFile: null as File | null,
  });

  const abrirModalEdicao = () => {
    if (!perfilUsuario) { exibirToast("Não há perfil disponível para editar no momento.", "info"); return; }
    setFormPerfil({
      name: perfilUsuario?.name || user?.name || displayName || "",
      email: perfilUsuario?.email || user?.email || "",
      cellphone: perfilUsuario?.cellphone || user?.cellphone || "",
      cargo: perfilUsuario?.cargo || user?.cargo || "",
      cpf: perfilUsuario?.cpf || user?.cpf || "",
      cnpj: perfilUsuario?.cnpj || user?.cnpj || "",
      setor: perfilUsuario?.setor || user?.setor || "",
      zip_code: perfilUsuario?.zip_code || user?.zip_code || "",
      street: perfilUsuario?.street || user?.street || "",
      neighborhood: perfilUsuario?.neighborhood || user?.neighborhood || "",
      number: perfilUsuario?.number || user?.number || "",
      city: perfilUsuario?.city || user?.city || "",
      state: perfilUsuario?.state || user?.state || "",
      photo: perfilUsuario?.photo || user?.photo || null,
      photoFile: null,
    });
    setModalEditarPerfilAberto(true);
  };

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvandoPerfil(true);
    try {
      const formData = new FormData();
      formData.append("name", formPerfil.name);
      formData.append("cellphone", formPerfil.cellphone.replace(/\D/g, ""));
      formData.append("zip_code", formPerfil.zip_code.replace(/\D/g, ""));
      formData.append("street", formPerfil.street);
      formData.append("neighborhood", formPerfil.neighborhood);
      formData.append("number", formPerfil.number);
      formData.append("city", formPerfil.city);
      formData.append("state", formPerfil.state);
      if (formPerfil.photoFile) {
        formData.append("photo", formPerfil.photoFile);
      }

      const targetId = perfilUsuario?.id || user?.id;
      if (!targetId) throw new Error("Perfil indisponível");
      await atualizarPerfilUsuario(formData, targetId);

      const novoPerfil: UsuarioPerfil = {
        ...(perfilUsuario || {}),
        id: targetId || "usuario-logado",
        role: perfilUsuario?.role || user?.role || "user",
        status: perfilUsuario?.status || "active",
        name: formPerfil.name,
        email: formPerfil.email,
        cellphone: formPerfil.cellphone,
        cargo: formPerfil.cargo,
        cpf: formPerfil.cpf,
        cnpj: formPerfil.cnpj,
        setor: formPerfil.setor,
        zip_code: formPerfil.zip_code,
        street: formPerfil.street,
        neighborhood: formPerfil.neighborhood,
        number: formPerfil.number,
        city: formPerfil.city,
        state: formPerfil.state,
        photo: formPerfil.photo,
      };

      setPerfilUsuario(novoPerfil);

      const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
      const rawUser = storage.getItem("user");
      const userAtual = rawUser ? JSON.parse(rawUser) : {};
      // Não persistir documentos ou endereços pessoais na sessão.
      storage.setItem("user", JSON.stringify({
        id: userAtual.id, role: userAtual.role, name: novoPerfil.name,
        photo: novoPerfil.photo,
      }));
      window.dispatchEvent(new Event("storage"));

      setModalEditarPerfilAberto(false);
      exibirToast("Perfil atualizado com sucesso!");
    } catch {
      exibirToast("Não foi possível salvar o perfil. Nenhuma alteração foi confirmada.", "info");
    } finally {
      setSalvandoPerfil(false);
    }
  };

  // Foto: se NÃO estiver no banco de dados, fica estritamente VAZIA (null)
  const fotoExibicao: string | null =
    (typeof perfilUsuario?.photo === "string" && perfilUsuario.photo.trim().length > 0)
      ? perfilUsuario.photo
      : (typeof user?.photo === "string" && user.photo.trim().length > 0
        ? user.photo
        : (typeof photoSrc === "string" && photoSrc.trim().length > 0 ? photoSrc : null));

  // Nome: EXATAMENTE o nome do banco de dados (sem alterações ou acréscimos fictícios)
  const nomeExibicao = perfilUsuario?.name || user?.name || displayName || "";
  const nomeCompletoExibicao = perfilUsuario?.name || user?.name || displayName || "";

  const emailExibicao = perfilUsuario?.email || user?.email || "";
  const telefoneExibicao = formatarCelular(perfilUsuario?.cellphone || user?.cellphone);
  const cargoExibicao = perfilUsuario?.cargo || user?.cargo || "";

  const temCnpj = Boolean(perfilUsuario?.cnpj && perfilUsuario.cnpj.trim());
  const temCpf = Boolean(perfilUsuario?.cpf && perfilUsuario.cpf.trim());
  const docLabelExibicao = temCnpj ? "CNPJ" : (temCpf ? "CPF" : "CPF / CNPJ");
  const docValorExibicao = temCnpj
    ? formatarCnpj(perfilUsuario!.cnpj)
    : (temCpf
      ? formatarCpf(perfilUsuario!.cpf)
      : "Não informado");

  const enderecoExibicao = useMemo(() => {
    if (perfilUsuario?.street) {
      const ruaNum = `${perfilUsuario.street}${perfilUsuario.number ? `, ${perfilUsuario.number}` : ""}`;
      const bairro = perfilUsuario.neighborhood ? ` - ${perfilUsuario.neighborhood}` : "";
      const cidadeUf = perfilUsuario.city ? `, ${perfilUsuario.city} - ${perfilUsuario.state || ""}` : "";
      const cep = perfilUsuario.zip_code ? `, ${formatarCep(perfilUsuario.zip_code)}` : "";
      return `${ruaNum}${bairro}${cidadeUf}${cep}`;
    }
    return "Não informado";
  }, [perfilUsuario]);

  const setorExibicao = perfilUsuario?.setor || user?.setor || "";
  const tagExibicao = perfilUsuario?.role === "company" ? "EMPRESA" : "ARTESÃO";

  const menuLateralItens = [
    { id: "explorar", icone: Search, rotulo: "Explorar Materiais" },
    {
      id: "reservas",
      icone: ShoppingBag,
      rotulo: `Minhas Reservas${materiaisReservadosApi.length > 0 ? ` (${materiaisReservadosApi.length})` : ""}`,
    },
    { id: "historico", icone: History, rotulo: "Histórico" },
    { id: "perfil", icone: UserRound, rotulo: "Perfil" },
  ] as const;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F7F9F8] text-[#1B4B3A]">
      <Header />

      {/* Toast de Notificação */}
      {mensagemToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xl animate-in slide-in-from-top-4">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{mensagemToast.texto}</span>
        </div>
      )}

      {/* Layout Principal: Sidebar + Conteúdo */}
      <div className="flex w-full flex-1 items-stretch">
        {/* BARRA LATERAL (SIDEBAR - Igual à imagem enviada) */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-[#E2E9E5] bg-white p-3 md:flex lg:w-56">
          <nav className="flex flex-col gap-1.5">
            {menuLateralItens.map(({ id, icone: Icone, rotulo }) => {
              const ativo = abaAtiva === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => id === "explorar" ? navigate("/marketplace") : setAbaAtiva(id)}
                  className={`flex items-center gap-2 rounded px-3 py-2.5 text-xs font-medium transition cursor-pointer text-left ${
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
          <div className="mt-auto rounded-md bg-[#EBF6F2] p-4 border border-[#D5EADB]">
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
          <div className="flex gap-2 overflow-x-auto pb-4 md:hidden border-b border-[#E2E9E5] mb-6">
            {menuLateralItens.map(({ id, icone: Icone, rotulo }) => {
              const ativo = abaAtiva === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => id === "explorar" ? navigate("/marketplace") : setAbaAtiva(id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold shrink-0 cursor-pointer ${
                    ativo
                      ? "bg-[#D7EFE6] text-[#0F3D2E]"
                      : "bg-white border border-[#E2E9E5] text-[#4B5A55]"
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
                    title="Atualizar materiais"
                    className="flex items-center gap-1.5 rounded-lg border border-[#D9D5C8] bg-white px-3 py-2.5 text-xs font-semibold text-[#4B5A55] hover:bg-gray-50 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${carregando ? "animate-spin text-emerald-600" : ""}`} />
                    <span className="hidden sm:inline">Atualizar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/marketplace")}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#059669] hover:bg-[#047857] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition cursor-pointer"
                  >
                    <Search className="h-4 w-4" strokeWidth={2.5} />
                    Explorar Catálogo
                  </button>
                </div>
              </div>

              {/* 4 CARDS DE ESTATÍSTICAS / MÉTRICAS (DESIGN FIEL À IMAGEM) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {/* Card 1: Materiais Reservados */}
                <div className="flex items-center gap-4 rounded-md border border-[#E2E9E5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#D7EFE6] text-emerald-600">
                    <Package className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      MATERIAIS RESERVADOS
                    </p>
                    <p className="text-base font-extrabold text-[#0F3D2E]">
                      Não disponível
                    </p>
                    <p className="text-xs text-[#6B7670] mt-0.5 truncate">
                      Não há dados disponíveis
                    </p>
                  </div>
                </div>

                {/* Card 2: Em Negociação */}
                <div className="flex items-center gap-4 rounded-md border border-[#E2E9E5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#D7EFE6] text-emerald-600">
                    <Handshake className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      EM NEGOCIAÇÃO
                    </p>
                    <p className="text-base font-extrabold text-[#0F3D2E]">
                      Não disponível
                    </p>
                    <p className="text-xs text-[#6B7670] mt-0.5 truncate">
                      Não há dados disponíveis
                    </p>
                  </div>
                </div>

                {/* Card 3: KG Adquiridos */}
                <div className="flex items-center gap-4 rounded-md border border-[#E2E9E5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#D7EFE6] text-emerald-600">
                    <ShoppingCart className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      KG ADQUIRIDOS
                    </p>
                    <p className="text-base font-extrabold text-[#0F3D2E]">
                      Não disponível
                    </p>
                    <p className="text-xs text-[#6B7670] mt-0.5 truncate">Total de materiais circulares</p>
                  </div>
                </div>

                {/* Card 4: Sua Pegada Poupada */}
                <div className="flex items-center gap-4 rounded-md border border-[#E2E9E5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#D7EFE6] text-emerald-600">
                    <Leaf className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      SUA PEGADA POUPADA
                    </p>
                    <p className="text-base font-extrabold text-[#0F3D2E]">
                      Não disponível
                    </p>
                    <p className="text-xs text-[#6B7670] mt-0.5 truncate">Economia gerada</p>
                  </div>
                </div>
              </div>

              {/* DUAS COLUNAS PRINCIPAIS (DESIGN DA IMAGEM ENVIADA) */}
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.65fr_1fr]">
                {/* COLUNA ESQUERDA: MATERIAIS RESERVADOS DA API */}
                <div className="rounded-md border border-[#E2E9E5] bg-white p-5 sm:p-6 shadow-xs">
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
                    <div className="rounded border border-dashed border-[#E2E9E5] bg-[#F7F9F8] p-8 text-center my-4">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF6F2] text-emerald-600 mb-3">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-bold text-[#0F3D2E]">
                        Não há reservas disponíveis no momento
                      </h3>
                      <p className="mx-auto mt-1 max-w-sm text-xs text-[#6B7670] leading-relaxed">
                        Não há reservas disponíveis para consultar. Explore os materiais das empresas parceiras.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/marketplace")}
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
                          onClick={() => {
                            setProdutoDetalhes(prod);
                            setModalDetalhesAberto(true);
                          }}
                          className="flex items-center justify-between py-4 hover:bg-gray-50/70 px-2 rounded transition cursor-pointer"
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
                <div className="rounded-md border border-[#E2E9E5] bg-white p-5 sm:p-6 shadow-xs">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-base font-extrabold text-[#0F3D2E] sm:text-lg">
                      Atividade Circular Recente
                    </h2>
                  </div>

                  {atividadesCirculares.length === 0 ? (
                    /* NOTIFICAÇÃO INTUITIVA QUANDO NÃO HÁ ATIVIDADES */
                    <div className="rounded border border-dashed border-[#E2E9E5] bg-[#F7F9F8] p-8 text-center my-4">
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
              <div className="mt-6 rounded-md border border-[#E2E9E5] bg-white p-4 sm:p-6 shadow-xs">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Input de Busca */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, tipo de material ou descrição..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full rounded border border-[#D9D5C8] bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
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
                  <div className="flex items-center gap-1 rounded bg-[#F4F2EC] p-1 text-xs font-semibold">
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
                      <div key={n} className="h-56 animate-pulse rounded-md bg-gray-200" />
                    ))}
                  </div>
                ) : materiaisDisponiveisApi.length === 0 ? (
                  /* NOTIFICAÇÃO INTUITIVA ESPECÍFICA: SEM MATERIAIS NO BACKEND */
                  <div className="rounded-md border border-dashed border-[#D9D5C8] bg-white p-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF6F2] text-emerald-600 mb-4">
                      <PackageOpen className="h-8 w-8" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0F3D2E]">
                      Nenhum material disponível para reserva
                    </h3>
                    <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm text-gray-500 leading-relaxed">
                      Não há materiais disponíveis no momento.
                      Novos lotes cadastrados pelas indústrias parceiras aparecerão aqui automaticamente.
                    </p>
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={carregarDadosBackend}
                        className="inline-flex items-center gap-1.5 rounded border border-[#D9D5C8] bg-white hover:bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-xs cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Verificar Novamente
                      </button>
                    </div>
                  </div>
                ) : produtosExplorarFiltrados.length === 0 ? (
                  /* NOTIFICAÇÃO QUANDO FILTROS NÃO ENCONTRAM ITENS */
                  <div className="rounded-md border border-dashed border-[#D9D5C8] bg-white p-12 text-center">
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
                        onClick={() => {
                          setProdutoDetalhes(prod);
                          setModalDetalhesAberto(true);
                        }}
                        className="flex flex-col justify-between rounded-md border border-[#E2E9E5] bg-white p-5 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition cursor-pointer group"
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
                                setProdutoParaReserva(prod);
                                setModalSolicitarReservaAberto(true);
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
          {/* 3. TELA: MINHAS RESERVAS (ESTADO DE DISPONIBILIDADE)     */}
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
                  onClick={() => navigate("/marketplace")}
                  className="text-sm font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Explorar mais materiais
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {materiaisReservadosApi.length === 0 ? (
                /* NOTIFICAÇÃO INTUITIVA ESPECÍFICA: VOCÊ NÃO POSSUI RESERVAS */
                <div className="rounded-md border border-dashed border-[#D9D5C8] bg-white p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF6F2] text-emerald-600 mb-4">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F3D2E]">
                    Não há reservas disponíveis no momento
                  </h3>
                  <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Não há reservas disponíveis para consultar no momento. As compras de exemplo não criam reservas reais.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/marketplace")}
                    className="mt-6 inline-flex items-center gap-2 rounded bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition cursor-pointer"
                  >
                    <Search className="h-4 w-4" />
                    Explorar Catálogo de Materiais
                  </button>
                </div>
              ) : (
                /* LISTAGEM DOS MATERIAIS RESERVADOS DA API */
                <div className="grid grid-cols-1 gap-4">
                  {materiaisReservadosApi.map((prod) => {
                    const detalhe = reservasDetalhes.find((r) => r.produtoId === prod.id);
                    const codigoReserva = detalhe?.codigo || `RF-${prod.id.slice(0, 5).toUpperCase()}`;
                    const qtdReserva = detalhe?.quantidade || prod.quantity || 1;
                    const dataColeta = detalhe?.dataRetirada
                      ? (() => {
                          try {
                            const [ano, mes, dia] = detalhe.dataRetirada.split("-");
                            return `${dia}/${mes}/${ano}`;
                          } catch {
                            return detalhe.dataRetirada;
                          }
                        })()
                      : null;

                    return (
                      <div
                        key={prod.id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 rounded-md border border-[#E2E9E5] bg-white p-5 sm:p-6 shadow-xs hover:border-emerald-500/40 transition"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-[#D7EFE6] text-emerald-800 font-bold">
                            <Package className="h-7 w-7 text-emerald-700" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                                #{codigoReserva}
                              </span>
                              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                                {formatarCategoria(prod.category)}
                              </span>
                              <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[11px] font-bold">
                                {detalhe?.status === "aprovada"
                                  ? "Pronta para Coleta"
                                  : "Aguardando Aprovação"}
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-[#1F2A26] mt-1.5">{prod.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                              <span>Qtd: <strong>{qtdReserva} un</strong></span>
                              <span>Peso ref: {prod.weight} kg</span>
                              <span>Conservação: <strong>{formatarEstadoConservacao(prod.conservation_state)}</strong></span>
                              {dataColeta && <span>Coleta prevista: <strong>{dataColeta}</strong></span>}
                              {detalhe?.finalidade && (
                                <span className="text-emerald-700">Uso: {detalhe.finalidade}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                          <div className="text-left lg:text-right">
                            <p className="text-[10px] font-bold uppercase text-gray-400">VALOR TOTAL</p>
                            <p className="text-lg font-extrabold text-[#0F3D2E]">
                              {detalhe && detalhe.valorTotal > 0
                                ? `R$ ${detalhe.valorTotal.toFixed(2)}`
                                : formatarPreco(prod.price, prod.type_negotiation)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Botão Ver QR Code */}
                            <button
                              type="button"
                              onClick={() => {
                                setDadosQrCode({
                                  produto: prod,
                                  codigo: codigoReserva,
                                  quantidade: qtdReserva,
                                  dataRetirada: dataColeta || undefined,
                                });
                                setModalQrCodeAberto(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
                              title="Ver QR Code de Retirada"
                            >
                              <QrCode className="h-4 w-4 text-emerald-700" />
                              <span>QR Code</span>
                            </button>

                            {/* Botão Falar com a Fábrica */}
                            <button
                              type="button"
                              onClick={() => {
                                setProdutoParaChat(prod);
                                setModalChatAberto(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded border border-[#D9D5C8] bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-2xs"
                              title="Mensagens com a fábrica"
                            >
                              <MessageSquare className="h-4 w-4 text-emerald-700" />
                              <span className="hidden sm:inline">Mensagens</span>
                            </button>

                            {/* Botão Avaliar Coleta */}
                            <button
                              type="button"
                              onClick={() => {
                                setProdutoParaAvaliar(prod);
                                setModalAvaliacaoAberto(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer shadow-2xs"
                              title="Avaliar Coleta"
                            >
                              <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                              <span className="hidden sm:inline">Avaliar</span>
                            </button>

                            {/* Botão Cancelar */}
                            <button
                              type="button"
                              onClick={() => handleCancelarReserva()}
                              className="rounded border border-red-200 p-2 text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Cancelar reserva"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* 4. TELA: PERFIL DO USUÁRIO COMPRADOR (DADOS DA CONTA)         */}
          {/* ==================================================================== */}
          {/* ==================================================================== */}
          {/* 4. TELA: PERFIL DO USUÁRIO COMPRADOR (RESULTADO DA IMAGEM)            */}
          {/* ==================================================================== */}
          {abaAtiva === "perfil" && (
            <div className="w-full max-w-5xl animate-in fade-in duration-200">
              {/* Cabeçalho da Seção */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E] tracking-tight">Meu Perfil</h2>
                  <p className="text-sm text-[#6B7670] mt-1">
                    Gerencie suas informações pessoais e os dados da sua empresa.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={abrirModalEdicao}
                  className="inline-flex items-center gap-2 rounded bg-[#0B4D34] hover:bg-[#083A27] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition cursor-pointer self-start sm:self-auto"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Editar Perfil</span>
                </button>
              </div>

              {!carregandoPerfil && !perfilUsuario && <p role="status" className="mb-5 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Não há dados do perfil disponíveis no momento.</p>}
              {carregandoPerfil ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 rounded-md border border-[#E2E9E5] bg-white">
                  <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
                  <p className="text-sm font-medium text-gray-500">Carregando informações do perfil da API...</p>
                </div>
              ) : (
                <>
                  {/* Grid de Cards Superiores (Foto e Identificação + Informações Pessoais) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Card 1: Foto e Identificação (Esquerda) */}
                    <div className="lg:col-span-4 rounded-md border border-[#E2E9E5] bg-white p-8 flex flex-col items-center justify-center text-center shadow-2xs">
                      <div className="relative">
                        {fotoExibicao ? (
                          <img
                            src={fotoExibicao}
                            alt={`Foto de ${nomeExibicao}`}
                            className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover shadow-sm ring-4 ring-emerald-50"
                          />
                        ) : (
                          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#D7EFE6] flex items-center justify-center shadow-sm ring-4 ring-emerald-50">
                            <UserRound className="h-14 w-14 text-[#0B4D34]" strokeWidth={1.5} />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-[#1F2A26] mt-4">
                        {nomeExibicao}
                      </h3>
                      <span className="mt-2.5 inline-block rounded-full bg-[#D7EFE6] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#065F46]">
                        {tagExibicao}
                      </span>
                    </div>

                    {/* Card 2: Informações Pessoais (Direita) */}
                    <div className="lg:col-span-8 rounded-md border border-[#E2E9E5] bg-white p-7 sm:p-8 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2.5 pb-5 border-b border-gray-100">
                          <User className="h-5 w-5 text-[#0B4D34]" strokeWidth={2.4} />
                          <h3 className="text-lg font-bold text-[#1F2A26]">Informações Pessoais</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 mt-6">
                          {/* Nome Completo */}
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                              NOME COMPLETO
                            </span>
                            <p className="text-sm font-bold text-[#1F2A26] mt-1.5">
                              {nomeCompletoExibicao}
                            </p>
                          </div>

                          {/* E-mail */}
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                              E-MAIL
                            </span>
                            <p className="text-sm font-bold text-[#1F2A26] mt-1.5 break-all">
                              {emailExibicao}
                            </p>
                          </div>

                          {/* Telefone (WhatsApp) */}
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                              TELEFONE (WHATSAPP)
                            </span>
                            <p className="text-sm font-bold text-[#1F2A26] mt-1.5">
                              {telefoneExibicao}
                            </p>
                          </div>

                          {/* Cargo */}
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                              CARGO
                            </span>
                            <p className="text-sm font-bold text-[#1F2A26] mt-1.5">
                              {cargoExibicao}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Dados do Usuário/Entidade (Inferior - Largura Total) */}
                  <div className="mt-6 rounded-md border border-[#E2E9E5] bg-white p-7 sm:p-8 shadow-2xs">
                    <div className="flex items-center gap-2.5 pb-5 border-b border-gray-100">
                      <Building2 className="h-5 w-5 text-[#0B4D34]" strokeWidth={2.4} />
                      <h3 className="text-lg font-bold text-[#1F2A26]">Dados do Usuário/Entidade</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 mt-6">

                        {/* CNPJ / CPF */}
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                            {docLabelExibicao}
                          </span>
                          <p className="text-sm font-bold text-[#1F2A26] mt-1.5">
                            {docValorExibicao}
                          </p>
                        </div>

                      {/* Endereço */}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                          ENDEREÇO
                        </span>
                        <p className="text-sm font-bold text-[#1F2A26] mt-1.5">
                          {enderecoExibicao}
                        </p>
                      </div>

                      {/* Setor */}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                          SETOR
                        </span>
                        <p className="text-sm font-bold text-[#1F2A26] mt-1.5">
                          {setorExibicao}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ações do Usuário / Registro */}
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 text-xs text-gray-400">
                    <span>
                      Conta de usuário cadastrada
                      {perfilUsuario?.created_in ? ` em ${formatarData(perfilUsuario.created_in)}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={logout}
                      className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 font-semibold cursor-pointer transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Encerrar Sessão</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ==================================================================== */}
      {/* MODAIS DO FLUXO COMPLETO DO FIGMA PARA O COMPRADOR / USUÁRIO        */}
      {/* ==================================================================== */}

      {/* 1. MODAL DE DETALHES COMPLETOS DO RESÍDUO (FIGMA SCREEN 2) */}
      <ResiduoDetalheModal
        key={produtoDetalhes?.id}
        aberto={modalDetalhesAberto}
        aoFechar={() => setModalDetalhesAberto(false)}
        produto={produtoDetalhes}
        empresaNome="Fornecedor não informado"
        aoIniciarReserva={(prod) => {
          setModalDetalhesAberto(false);
          setProdutoParaReserva(prod);
          setModalSolicitarReservaAberto(true);
        }}
        aoAbrirContato={(prod) => {
          setModalDetalhesAberto(false);
          setProdutoParaChat(prod);
          setModalChatAberto(true);
        }}
      />

      {/* 2. MODAL MULTIETAPAS: FORMULÁRIO, REVISÃO/CHECKOUT E SUCESSO (FIGMA SCREENS 3, 4 E 7) */}
      <SolicitarReservaModal
        aberto={modalSolicitarReservaAberto}
        aoFechar={() => setModalSolicitarReservaAberto(false)}
        produto={produtoParaReserva}
        usuarioNome={nomeCompletoExibicao || displayName}
        usuarioDoc={docValorExibicao}
        usuarioTelefone={telefoneExibicao}
        fornecedorNome="Fornecedor não informado"
        aoConfirmarReserva={handleConfirmarReserva}
        aoAbrirQrCode={(dados) => {
          const prod = produtos.find((p) => p.id === dados.produtoId) || produtoParaReserva;
          if (prod) {
            setDadosQrCode({
              produto: prod,
              codigo: dados.codigo,
              quantidade: dados.quantidade,
              dataRetirada: dados.dataRetirada,
            });
            setModalQrCodeAberto(true);
          }
        }}
        aoIrParaMinhasReservas={() => setAbaAtiva("reservas")}
      />

      {/* 3. MODAL DE QR CODE DE RETIRADA / COMPROVANTE (FIGMA TOP MODAL) */}
      {dadosQrCode && (
        <QrCodeRetiradaModal
          aberto={modalQrCodeAberto}
          aoFechar={() => setModalQrCodeAberto(false)}
          produto={dadosQrCode.produto}
          codigoReserva={dadosQrCode.codigo}
          quantidade={dadosQrCode.quantidade}
          dataRetirada={dadosQrCode.dataRetirada}
          fornecedorNome="Fornecedor não informado"
        />
      )}

      {/* 4. MODAL DE AVALIAÇÃO DA COLETA E FORNECEDOR (FIGMA SCREEN 6) */}
      <AvaliacaoColetaModal
        aberto={modalAvaliacaoAberto}
        aoFechar={() => setModalAvaliacaoAberto(false)}
        produto={produtoParaAvaliar}
        empresaNome="Fornecedor não informado"
        aoAvaliar={(dados) => {
          exibirToast(`Não há envio de avaliações disponível. A avaliação de ${dados.estrelas} estrelas não foi registrada.`, "info");
        }}
      />

      {/* 5. MODAL DE CHAT E CONTATO DIRETO COM A FÁBRICA (FIGMA SCREEN 5) */}
      <ChatReservaModal
        aberto={modalChatAberto}
        aoFechar={() => setModalChatAberto(false)}
        produto={produtoParaChat}
        empresaNome="Fornecedor não informado"
        usuarioNome={displayName}
      />

      {/* MODAL: EDITAR PERFIL */}
      {modalEditarPerfilAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md border border-[#E2E9E5] bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-emerald-50 text-[#0B4D34]">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F3D2E]">Editar Perfil</h3>
                  <p className="text-xs text-gray-500">Atualize suas informações pessoais e os dados cadastrais da API</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalEditarPerfilAberto(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarPerfil} className="mt-6 space-y-6">
              {/* Foto de Perfil */}
              <div className="flex items-center gap-5 p-4 rounded bg-[#F7F9F8] border border-[#ECE8DC]">
                <div className="relative">
                  {formPerfil.photo ? (
                    <img
                      src={formPerfil.photo}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover shadow-xs border-2 border-white ring-2 ring-emerald-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#D7EFE6] flex items-center justify-center border-2 border-white ring-2 ring-emerald-100">
                      <UserRound className="h-8 w-8 text-[#0B4D34]" strokeWidth={1.5} />
                    </div>
                  )}
                  <label
                    htmlFor="foto-perfil-input"
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#0B4D34] text-white hover:bg-[#083A27] shadow-sm transition"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </label>
                  <input
                    id="foto-perfil-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormPerfil((prev) => ({
                          ...prev,
                          photoFile: file,
                          photo: URL.createObjectURL(file),
                        }));
                      }
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1F2A26]">Foto de Perfil</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Clique no ícone da câmera para enviar uma nova foto</p>
                </div>
              </div>

              {/* Informações Pessoais */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  Informações Pessoais
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={formPerfil.name}
                      onChange={(e) => setFormPerfil({ ...formPerfil, name: e.target.value })}
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">E-mail</label>
                    <input
                      type="email"
                      required
                      value={formPerfil.email}
                      onChange={(e) => setFormPerfil({ ...formPerfil, email: e.target.value })}
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Telefone (WhatsApp)</label>
                    <input
                      type="text"
                      value={formPerfil.cellphone}
                      onChange={(e) => setFormPerfil({ ...formPerfil, cellphone: e.target.value })}
                      placeholder="(16) 99123-4567"
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Cargo / Função</label>
                    <input
                      type="text"
                      value={formPerfil.cargo}
                      onChange={(e) => setFormPerfil({ ...formPerfil, cargo: e.target.value })}
                      placeholder="Gerente de Sustentabilidade"
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Usuário / Entidade */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  Dados do Usuário / Entidade
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">CNPJ ou CPF</label>
                    <input
                      type="text"
                      value={formPerfil.cpf || formPerfil.cnpj}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormPerfil({ ...formPerfil, cpf: val, cnpj: val });
                      }}
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Setor</label>
                    <input
                      type="text"
                      value={formPerfil.setor}
                      onChange={(e) => setFormPerfil({ ...formPerfil, setor: e.target.value })}
                      placeholder="Coureiro-Calçadista"
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">CEP</label>
                    <input
                      type="text"
                      value={formPerfil.zip_code}
                      onChange={(e) => setFormPerfil({ ...formPerfil, zip_code: e.target.value })}
                      placeholder="14406-000"
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={formPerfil.street}
                      onChange={(e) => setFormPerfil({ ...formPerfil, street: e.target.value })}
                      placeholder="Av. Distrito Industrial"
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Número</label>
                    <input
                      type="text"
                      value={formPerfil.number}
                      onChange={(e) => setFormPerfil({ ...formPerfil, number: e.target.value })}
                      placeholder="1500"
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formPerfil.neighborhood}
                      onChange={(e) => setFormPerfil({ ...formPerfil, neighborhood: e.target.value })}
                      placeholder="Distrito Industrial"
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formPerfil.city}
                      onChange={(e) => setFormPerfil({ ...formPerfil, city: e.target.value })}
                      placeholder="Franca"
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Estado (UF)</label>
                    <input
                      type="text"
                      value={formPerfil.state}
                      onChange={(e) => setFormPerfil({ ...formPerfil, state: e.target.value })}
                      placeholder="SP"
                      maxLength={2}
                      className="w-full rounded border border-[#D9D5C8] p-2.5 text-sm text-[#1F2A26] uppercase outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalEditarPerfilAberto(false)}
                  className="rounded border border-[#D9D5C8] px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoPerfil}
                  className="rounded bg-[#0B4D34] hover:bg-[#083A27] px-6 py-2.5 text-sm font-bold text-white shadow-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {salvandoPerfil ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
