import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Filter,
  X,
  ChevronDown,
  Building2,
  Package,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import type { ProductBackend } from "../../axios/Axios";
import { ResiduoDetalheModal } from "../dashboard/comprador/ResiduoDetalheModal";
import {
  SolicitarReservaModal,
  type DadosReservaFinalizada,
} from "../dashboard/comprador/SolicitarReservaModal";
import { QrCodeRetiradaModal } from "../dashboard/comprador/QrCodeRetiradaModal";

// Interface para os materiais do marketplace com dados visuais ricos
interface MaterialMarketplace extends ProductBackend {
  distanciaKm: number;
  empresaNome: string;
  estadoVisual: string;
  imagemUrl: string;
  tagCategoria: string;
  disponibilidadeTipo: "imediata" | "encomenda" | "doacao";
}

// Materiais do Marketplace: Exemplos de Doação e Venda (com PIX / Cartão)
const MATERIAIS_INICIAIS: MaterialMarketplace[] = [
  {
    id: "mkt-1",
    name: "Retalhos de Couro Premium",
    description:
      "Sobras de corte limpo de couro nobre automotivo e calçadista. Ideais para confecção de carteiras, chaveiros, calçados artesanais e revestimentos manuais.",
    price: 45.0,
    quantity: 150,
    status: "available",
    category: "couro",
    type_negotiation: "sale",
    weight: "150",
    conservation_state: "good",
    distanciaKm: 3.2,
    empresaNome: "Curtume Franca Fino",
    estadoVisual: "Excelente",
    tagCategoria: "Couro",
    disponibilidadeTipo: "imediata",
    imagemUrl:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "mkt-2",
    name: "Placas de EVA Coloridas",
    description:
      "Aparas e placas de EVA coloridas de diversas densidades e espessuras. Excelente flexibilidade e amortecimento para palmilhas, artesanato e proteção.",
    price: 0,
    quantity: 80,
    status: "available",
    category: "plastico",
    type_negotiation: "donation",
    weight: "45",
    conservation_state: "regular",
    distanciaKm: 1.5,
    empresaNome: "Solados Estrela",
    estadoVisual: "Apenas rebarbas",
    tagCategoria: "EVA",
    disponibilidadeTipo: "imediata",
    imagemUrl:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "mkt-3",
    name: "Borracha Triturada de Sola",
    description:
      "Composto de borracha vulcanizada moída oriunda do processo de lixamento de solados industriais. Granulometria uniforme para reciclagem ou piso de absorção.",
    price: 18.5,
    quantity: 450,
    status: "available",
    category: "borracha",
    type_negotiation: "sale",
    weight: "450",
    conservation_state: "regular",
    distanciaKm: 5.0,
    empresaNome: "Borrachas Francanas",
    estadoVisual: "Industrial",
    tagCategoria: "Borracha",
    disponibilidadeTipo: "imediata",
    imagemUrl:
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "mkt-4",
    name: "Pallets de Madeira Maciça",
    description:
      "Pallets padrão PBR e descartáveis em madeira de pinus e eucalipto tratado. Estrutura íntegra, prontos para reforma, marcenaria rústica ou logística.",
    price: 0,
    quantity: 25,
    status: "available",
    category: "madeira",
    type_negotiation: "donation",
    weight: "350",
    conservation_state: "good",
    distanciaKm: 2.8,
    empresaNome: "Logística Calçados S.A.",
    estadoVisual: "Bom estado",
    tagCategoria: "Pallets",
    disponibilidadeTipo: "imediata",
    imagemUrl:
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "mkt-5",
    name: "Sobra de Solados TR Injetados",
    description:
      "Lote de solados termoplásticos (TR) virgens provenientes de excedentes de produção industrial. Alto poder de reaproveitamento e excelente durabilidade.",
    price: 85.0,
    quantity: 120,
    status: "available",
    category: "plastico",
    type_negotiation: "sale",
    weight: "95",
    conservation_state: "new",
    distanciaKm: 4.1,
    empresaNome: "Injetados Franca Indústria",
    estadoVisual: "Excelente",
    tagCategoria: "EVA",
    disponibilidadeTipo: "imediata",
    imagemUrl:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "mkt-6",
    name: "Retalhos de Forro Têxtil e Espuma",
    description:
      "Aparas têxteis e tecidos sintéticos dublados com espuma para forração de calçados, bolsas, almofadas e artesanato criativo.",
    price: 0,
    quantity: 60,
    status: "available",
    category: "tecido",
    type_negotiation: "donation",
    weight: "60",
    conservation_state: "good",
    distanciaKm: 1.8,
    empresaNome: "Têxtil Francana S.A.",
    estadoVisual: "Bom estado",
    tagCategoria: "Têxteis",
    disponibilidadeTipo: "imediata",
    imagemUrl:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
  },
];

const CATEGORIAS_PILLS = [
  { id: "todos", label: "Todos" },
  { id: "couro", label: "Couros" },
  { id: "tecido", label: "Têxteis" },
  { id: "eva-borracha", label: "EVA & Borracha" },
  { id: "madeira", label: "Pallets & Madeira" },
];

export default function Marketplace() {
  const navigate = useNavigate();
  const { user, displayName } = useLoggedUser();
  const usuarioTelefone =
    user?.cellphone || user?.telefone || user?.celular || "(16) 99876-5432";

  // Estados de busca e filtros
  const [buscaTexto, setBuscaTexto] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [distanciaMaxima, setDistanciaMaxima] = useState<number>(10);
  const [filtroRetiradaImediata, setFiltroRetiradaImediata] = useState(true);
  const [filtroSobEncomenda, setFiltroSobEncomenda] = useState(false);
  const [filtroDoacao, setFiltroDoacao] = useState(false);
  const [filtroVenda, setFiltroVenda] = useState(false);
  const [ordenacao, setOrdenacao] = useState<"recentes" | "distancia" | "quantidade">("recentes");

  // Tags ativas visíveis no topo da sidebar
  const [filtroCourosAtivo, setFiltroCourosAtivo] = useState(true);
  const [filtroFrancaAtivo, setFiltroFrancaAtivo] = useState(true);

  // Estados de modais
  const [produtoDetalhe, setProdutoDetalhe] = useState<MaterialMarketplace | null>(null);
  const [modalDetalheAberto, setModalDetalheAberto] = useState(false);

  const [produtoReserva, setProdutoReserva] = useState<MaterialMarketplace | null>(null);
  const [modalReservaAberto, setModalReservaAberto] = useState(false);

  const [reservaConcluida, setReservaConcluida] = useState<DadosReservaFinalizada | null>(null);
  const [modalQrAberto, setModalQrAberto] = useState(false);

  // Filtragem dos materiais em memória
  const materiaisFiltrados = useMemo(() => {
    return MATERIAIS_INICIAIS.filter((item) => {
      // Filtro de texto
      if (buscaTexto.trim()) {
        const termo = buscaTexto.toLowerCase();
        const bateNome = item.name.toLowerCase().includes(termo);
        const bateEmpresa = item.empresaNome.toLowerCase().includes(termo);
        const bateDesc = (item.description || "").toLowerCase().includes(termo);
        const bateTag = item.tagCategoria.toLowerCase().includes(termo);
        if (!bateNome && !bateEmpresa && !bateDesc && !bateTag) return false;
      }

      // Filtro por categoria nas pílulas
      if (categoriaAtiva !== "todos") {
        if (categoriaAtiva === "couro" && item.category !== "couro") return false;
        if (categoriaAtiva === "tecido" && item.category !== "tecido") return false;
        if (
          categoriaAtiva === "eva-borracha" &&
          item.category !== "borracha" &&
          item.category !== "plastico"
        )
          return false;
        if (categoriaAtiva === "madeira" && item.category !== "madeira") return false;
      }

      // Filtro de doação vs venda
      if (filtroDoacao && !filtroVenda && item.type_negotiation !== "donation") {
        return false;
      }
      if (filtroVenda && !filtroDoacao && item.type_negotiation !== "sale") {
        return false;
      }

      // Filtro de distância máxima
      if (item.distanciaKm > distanciaMaxima) return false;

      return true;
    }).sort((a, b) => {
      if (ordenacao === "distancia") return a.distanciaKm - b.distanciaKm;
      if (ordenacao === "quantidade") return Number(b.quantity) - Number(a.quantity);
      return 0; // "recentes" mantém a ordem inicial
    });
  }, [buscaTexto, categoriaAtiva, distanciaMaxima, filtroDoacao, filtroVenda, ordenacao]);

  // Abertura dos modais
  const handleAbrirDetalhes = (material: MaterialMarketplace) => {
    setProdutoDetalhe(material);
    setModalDetalheAberto(true);
  };

  const handleIniciarReserva = (material: ProductBackend) => {
    setModalDetalheAberto(false);
    const encontrado = MATERIAIS_INICIAIS.find((m) => m.id === material.id) || (material as MaterialMarketplace);
    setProdutoReserva(encontrado);
    setModalReservaAberto(true);
  };

  const handleConfirmarReserva = async (dados: DadosReservaFinalizada) => {
    // 1. Salva nos registros do localStorage para sincronizar com o DashboardUsuario
    try {
      const reservasRaw = localStorage.getItem("rf_comprador_reservas_ids");
      const ids: string[] = reservasRaw ? JSON.parse(reservasRaw) : [];
      if (!ids.includes(dados.produtoId)) {
        ids.push(dados.produtoId);
        localStorage.setItem("rf_comprador_reservas_ids", JSON.stringify(ids));
      }

      const detalhesRaw = localStorage.getItem("rf_comprador_reservas_detalhes");
      const detalhes: DadosReservaFinalizada[] = detalhesRaw ? JSON.parse(detalhesRaw) : [];
      detalhes.push(dados);
      localStorage.setItem("rf_comprador_reservas_detalhes", JSON.stringify(detalhes));
    } catch {
      // Ignora falhas de serialização no storage
    }

    setReservaConcluida(dados);
  };

  const handleAbrirQrCode = (dados: DadosReservaFinalizada) => {
    setModalReservaAberto(false);
    setReservaConcluida(dados);
    setModalQrAberto(true);
  };

  const handleIrParaMinhasReservas = () => {
    setModalReservaAberto(false);
    setModalQrAberto(false);
    navigate("/dashboardUsuario");
  };

  const handleLimparFiltros = () => {
    setBuscaTexto("");
    setCategoriaAtiva("todos");
    setDistanciaMaxima(15);
    setFiltroRetiradaImediata(true);
    setFiltroSobEncomenda(false);
    setFiltroDoacao(false);
    setFiltroCourosAtivo(false);
    setFiltroFrancaAtivo(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-[#1B4B3A]">
      {/* 1. Header principal */}
      <Header />

      {/* 2. Barra de Busca Superior e Pílulas de Categoria (Figma Topo) */}
      <section className="bg-white border-b border-[#E7E4DA] pt-8 pb-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Caixa de Pesquisa Centralizada */}
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center shadow-xs rounded-full border-2 border-[#D5EADB] bg-white p-1.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition">
              <span className="pl-4 text-gray-400">
                <Search className="h-5 w-5 text-emerald-700" />
              </span>
              <input
                type="text"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                placeholder="Buscar retalhos, EVA, pallets..."
                className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-[#1B4B3A] placeholder:text-gray-400 focus:outline-hidden"
              />
              {buscaTexto && (
                <button
                  type="button"
                  onClick={() => setBuscaTexto("")}
                  className="p-1 mr-1 text-gray-400 hover:text-gray-600 transition"
                  title="Limpar texto"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-6 py-2.5 text-sm font-semibold transition shrink-0 shadow-xs cursor-pointer"
              >
                Buscar
              </button>
            </div>

            {/* Pílulas de Categoria */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pt-5 pb-1 no-scrollbar justify-start sm:justify-center">
              {CATEGORIAS_PILLS.map((cat) => {
                const isSelected = categoriaAtiva === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoriaAtiva(cat.id)}
                    className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? "bg-[#059669] text-white shadow-xs"
                        : "bg-[#F3F4F0] text-[#3D4D46] hover:bg-[#EAECE6] border border-[#E0E2DC]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Corpo Principal com Sidebar de Filtros e Grid de Produtos */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ========================================================= */}
          {/* SIDEBAR DE FILTROS (ESQUERDA - EXATO AO FIGMA)           */}
          {/* ========================================================= */}
          <aside className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-[#E7E4DA] p-5 shadow-xs">
            {/* Cabeçalho da Sidebar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#1B4B3A]">
                  Filtros Ativos
                </h2>
              </div>
              {(filtroCourosAtivo || filtroFrancaAtivo) && (
                <button
                  type="button"
                  onClick={handleLimparFiltros}
                  className="text-xs text-emerald-700 hover:underline font-medium"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Tags Ativas */}
            {(filtroCourosAtivo || filtroFrancaAtivo) && (
              <div className="flex flex-wrap gap-2 pt-3 pb-4 border-b border-gray-100">
                {filtroCourosAtivo && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF6F2] border border-[#D5EADB] px-3 py-1 text-xs font-semibold text-emerald-800">
                    Couros
                    <button
                      type="button"
                      onClick={() => setFiltroCourosAtivo(false)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filtroFrancaAtivo && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF6F2] border border-[#D5EADB] px-3 py-1 text-xs font-semibold text-emerald-800">
                    Franca - SP
                    <button
                      type="button"
                      onClick={() => setFiltroFrancaAtivo(false)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Seção: Modalidade e Disponibilidade */}
            <div className="py-4 border-b border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Modalidade & Disponibilidade
              </h3>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2.5 text-sm text-[#3D4D46] cursor-pointer hover:text-emerald-800">
                  <input
                    type="checkbox"
                    checked={filtroRetiradaImediata}
                    onChange={(e) => setFiltroRetiradaImediata(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <span>Retirada Imediata</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm text-[#3D4D46] cursor-pointer hover:text-emerald-800">
                  <input
                    type="checkbox"
                    checked={filtroDoacao}
                    onChange={(e) => setFiltroDoacao(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <span>Apenas Doações (Gratuitos)</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm text-[#3D4D46] cursor-pointer hover:text-emerald-800">
                  <input
                    type="checkbox"
                    checked={filtroVenda}
                    onChange={(e) => setFiltroVenda(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <span>Materiais à Venda (PIX / Cartão)</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm text-[#3D4D46] cursor-pointer hover:text-emerald-800">
                  <input
                    type="checkbox"
                    checked={filtroSobEncomenda}
                    onChange={(e) => setFiltroSobEncomenda(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <span>Sob Encomenda</span>
                </label>
              </div>
            </div>

            {/* Seção: Distância Máxima */}
            <div className="pt-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                <span>Distância Máxima</span>
                <span className="text-emerald-700 font-semibold lowercase">
                  Até {distanciaMaxima} km (Franca/SP)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={distanciaMaxima}
                onChange={(e) => setDistanciaMaxima(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>1 km</span>
                <span>10 km</span>
                <span>25 km</span>
              </div>
            </div>

            {/* Aviso Institucional: Pagamento 100% Digital / Proibição de Dinheiro */}
            <div className="mt-6 rounded-xl bg-amber-50/80 p-3.5 border border-amber-200 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>Pagamento Seguro:</strong> Todas as compras são pagas exclusivamente por <strong>PIX ou Cartão</strong>. <u>É terminantemente proibido o pagamento com dinheiro em espécie</u>.
              </p>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* GRID DE PRODUTOS / MATERIAIS (DIREITA)                   */}
          {/* ========================================================= */}
          <div className="flex-1 w-full">
            {/* Barra Superior de Resultados e Ordenação */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white px-5 py-3.5 rounded-2xl border border-[#E7E4DA] shadow-xs">
              <p className="text-sm font-medium text-[#4B5A55]">
                Mostrando{" "}
                <span className="font-bold text-[#1B4B3A]">
                  1-{materiaisFiltrados.length}
                </span>{" "}
                de 124 materiais disponíveis
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">Ordenar por:</span>
                <div className="relative">
                  <select
                    value={ordenacao}
                    onChange={(e) =>
                      setOrdenacao(
                        e.target.value as "recentes" | "distancia" | "quantidade"
                      )
                    }
                    className="appearance-none rounded-lg border border-[#D5EADB] bg-[#FDFBF7] pl-3 pr-8 py-1.5 text-xs font-semibold text-[#1B4B3A] focus:border-emerald-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="recentes">Mais Recentes</option>
                    <option value="distancia">Menor Distância</option>
                    <option value="quantidade">Maior Quantidade</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Grid dos Cards */}
            {materiaisFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-[#E7E4DA] bg-white p-12 text-center shadow-xs">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-base font-bold text-[#1B4B3A]">Nenhum material encontrado</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                  Tente alterar seus termos de busca ou aumentar a distância máxima no painel lateral.
                </p>
                <button
                  type="button"
                  onClick={handleLimparFiltros}
                  className="rounded-full bg-emerald-600 text-white px-5 py-2 text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  Restaurar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {materiaisFiltrados.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between bg-white rounded-2xl border border-[#E7E4DA] overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition group"
                  >
                    {/* Imagem do Produto e Badge */}
                    <div
                      className="relative h-48 w-full bg-gray-100 overflow-hidden cursor-pointer"
                      onClick={() => handleAbrirDetalhes(item)}
                    >
                      <img
                        src={item.imagemUrl}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      {/* Pílula de Categoria no topo esquerdo */}
                      <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm border border-emerald-100">
                        {item.tagCategoria}
                      </span>

                      {/* Pílula de Modalidade no topo direito */}
                      {item.type_negotiation === "donation" ? (
                        <span className="absolute top-3 right-3 rounded-full bg-emerald-700/90 backdrop-blur-xs px-3 py-1 text-xs font-bold text-white shadow-sm">
                          Doação Gratuita
                        </span>
                      ) : (
                        <span className="absolute top-3 right-3 rounded-full bg-[#0F3D2E]/90 backdrop-blur-xs px-3 py-1 text-xs font-bold text-white shadow-sm flex items-center gap-1">
                          <CreditCard className="h-3 w-3 text-emerald-300" />
                          <span>R$ {Number(item.price).toFixed(2)}</span>
                        </span>
                      )}
                    </div>

                    {/* Informações do Material */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Título */}
                        <h3
                          onClick={() => handleAbrirDetalhes(item)}
                          className="text-base sm:text-lg font-bold text-[#1B4B3A] hover:text-emerald-600 transition cursor-pointer"
                        >
                          {item.name}
                        </h3>

                        {/* Fornecedor e Distância */}
                        <p className="text-xs text-[#5D6B65] mt-1 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          <span>{item.empresaNome}</span>
                          <span className="text-gray-300">•</span>
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-medium text-emerald-700">{item.distanciaKm} km</span>
                        </p>

                        {/* Detalhes de Disponibilidade e Estado */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-3">
                          <div>
                            <span className="text-gray-400 block text-[11px]">Disponível:</span>
                            <span className="font-bold text-[#1B4B3A]">
                              {item.quantity}{" "}
                              {item.category === "couro" || item.category === "borracha"
                                ? "kg"
                                : "unidades"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[11px]">Estado:</span>
                            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                              {item.estadoVisual}
                            </span>
                          </div>
                        </div>

                        {/* Bloco de Valor e Meio de Pagamento Digital (Sem Dinheiro) */}
                        <div className="mt-3.5 p-3 rounded-xl bg-[#F8FAF7] border border-[#E7E4DA] flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium block">
                              {item.type_negotiation === "donation" ? "Modalidade:" : "Valor do Lote:"}
                            </span>
                            <span className="text-sm font-extrabold text-[#0F3D2E]">
                              {item.type_negotiation === "donation"
                                ? "Gratuito (R$ 0,00)"
                                : `R$ ${Number(item.price).toFixed(2)}`}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 block">Meio de Pagamento:</span>
                            <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 justify-end">
                              {item.type_negotiation === "donation" ? (
                                "Sem cobrança"
                              ) : (
                                <>
                                  <CreditCard className="h-3 w-3 text-emerald-600" /> PIX ou Cartão
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botão de Ação: Reservar / Comprar */}
                      <div className="mt-5 pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleIniciarReserva(item)}
                          className="w-full rounded-xl bg-[#00A86B] hover:bg-[#008f5b] text-white py-3 px-4 text-sm font-bold tracking-wide transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>
                            {item.type_negotiation === "sale"
                              ? "Comprar e Reservar"
                              : "Reservar Material"}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação inferior (Figma: < 1 2 3 >) */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                className="h-9 w-9 rounded-lg border border-[#D5EADB] bg-white text-gray-500 hover:bg-[#F3F1EA] flex items-center justify-center text-sm font-bold transition disabled:opacity-40"
                disabled
              >
                &lt;
              </button>
              <button
                type="button"
                className="h-9 w-9 rounded-lg bg-[#00A86B] text-white flex items-center justify-center text-sm font-bold shadow-xs"
              >
                1
              </button>
              <button
                type="button"
                className="h-9 w-9 rounded-lg border border-[#D5EADB] bg-white text-[#1B4B3A] hover:bg-[#F3F1EA] flex items-center justify-center text-sm font-medium transition"
              >
                2
              </button>
              <button
                type="button"
                className="h-9 w-9 rounded-lg border border-[#D5EADB] bg-white text-[#1B4B3A] hover:bg-[#F3F1EA] flex items-center justify-center text-sm font-medium transition"
              >
                3
              </button>
              <button
                type="button"
                className="h-9 w-9 rounded-lg border border-[#D5EADB] bg-white text-[#1B4B3A] hover:bg-[#F3F1EA] flex items-center justify-center text-sm font-bold transition"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Modais Integrados ao Fluxo de Reserva */}
      <ResiduoDetalheModal
        aberto={modalDetalheAberto}
        aoFechar={() => setModalDetalheAberto(false)}
        produto={produtoDetalhe}
        empresaNome={produtoDetalhe?.empresaNome}
        aoIniciarReserva={handleIniciarReserva}
        aoAbrirContato={() => {
          setModalDetalheAberto(false);
          navigate("/dashboardUsuario");
        }}
      />

      <SolicitarReservaModal
        aberto={modalReservaAberto}
        aoFechar={() => setModalReservaAberto(false)}
        produto={produtoReserva}
        usuarioNome={displayName || "Comprador Artesão"}
        usuarioTelefone={usuarioTelefone}
        fornecedorNome={produtoReserva?.empresaNome || "Curtume Franca Fino"}
        aoConfirmarReserva={handleConfirmarReserva}
        aoAbrirQrCode={handleAbrirQrCode}
        aoIrParaMinhasReservas={handleIrParaMinhasReservas}
      />

      <QrCodeRetiradaModal
        aberto={modalQrAberto}
        aoFechar={() => setModalQrAberto(false)}
        produto={produtoReserva}
        codigoReserva={reservaConcluida?.codigo || "RF-84920"}
        quantidade={reservaConcluida?.quantidade || 1}
        dataRetirada={reservaConcluida?.dataRetirada}
        fornecedorNome={reservaConcluida?.fornecedorNome || produtoReserva?.empresaNome}
      />

      {/* 5. Rodapé padrão */}
      <Footer />
    </div>
  );
}
