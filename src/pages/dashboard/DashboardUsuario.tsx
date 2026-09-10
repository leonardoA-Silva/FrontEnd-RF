import { useState } from "react";
import {
  Search,
  ShoppingBag,
  History,
  UserRound,
  Package,
  Handshake,
  ShoppingCart,
  Leaf,
  Plus,
  CheckCircle2,
  Sparkles,
  Star,
  X,
  Check,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLoggedUser } from "../../hooks/useLoggedUser";

interface Residuo {
  id: string;
  titulo: string;
  subtitulo: string;
  valor: string;
  tipoTag: "Venda" | "Doação" | "Coletado";
  categoria?: string;
  descricao?: string;
  data?: string;
}

const resíduosIniciais: Residuo[] = [
  {
    id: "1",
    titulo: "Retalhos de Couro Bovino Premium",
    subtitulo: "Reserva solicitada • Hoje, 09:12",
    valor: "R$ 45,00",
    tipoTag: "Venda",
    categoria: "Couro",
    descricao: "Lote de retalhos selecionados de alta qualidade para calçados e artesanato refinado.",
    data: "Hoje, 09:12",
  },
  {
    id: "2",
    titulo: "Pallets de Madeira Maciça",
    subtitulo: "Pagamento pendente • Ontem, 16:45",
    valor: "Grátis",
    tipoTag: "Doação",
    categoria: "Madeira",
    descricao: "Pallets padrão industrial de madeira tratada para reuso e marcenaria circular.",
    data: "Ontem, 16:45",
  },
  {
    id: "3",
    titulo: "Rebarbas de EVA e Forros",
    subtitulo: "Publicado em 02 de Ago, 10:20",
    valor: "40 kg",
    tipoTag: "Coletado",
    categoria: "EVA",
    descricao: "Rebarbas limpas de forros e solados para reciclagem ou artesanato.",
    data: "02 de Ago, 10:20",
  },
  {
    id: "4",
    titulo: "Retalhos de Tecido Sintético",
    subtitulo: "Publicado em 28 de Jul, 14:00",
    valor: "90 kg",
    tipoTag: "Coletado",
    categoria: "Tecido",
    descricao: "Sobra de corte têxtil para patchwork, enchimento e confecção local.",
    data: "28 de Jul, 14:00",
  },
];

const atividadesIniciais = [
  {
    id: 1,
    iconeTipo: "check",
    destaque: "Silvana M. (Artesã)",
    resto: " reservou os Retalhos de Couro",
    tempo: "Há 10 min",
  },
  {
    id: 2,
    iconeTipo: "check",
    destaque: "Ateliê Reutiliza",
    resto: " coletou 120 kg de Pallets",
    tempo: "Ontem",
  },
  {
    id: 3,
    iconeTipo: "ai",
    destaque: "Reaproveita Franca AI",
    resto: " reclassificou seu lote de EVA como Premium",
    tempo: "Há 2 dias",
  },
  {
    id: 4,
    iconeTipo: "star",
    destaque: "Assoc. Tecendo Franca",
    resto: " avaliou seu curtume com 5 estrelas",
    tempo: "Há 3 dias",
  },
];

export default function DashboardUsuario() {
  const { displayName, user } = useLoggedUser({
    fallbackName: "Roberto de Oliveira",
  });

  const [abaAtiva, setAbaAtiva] = useState<"explorar" | "reservas" | "historico" | "perfil">("explorar");
  const [residuos, setResiduos] = useState<Residuo[]>(resíduosIniciais);
  const [atividades] = useState(atividadesIniciais);

  // Estados dos modais
  const [modalPublicarAberto, setModalPublicarAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<Residuo | null>(null);
  const [verTodosAberto, setVerTodosAberto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Form de novo material
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoTipo, setNovoTipo] = useState<"Venda" | "Doação" | "Coletado">("Venda");
  const [novoValor, setNovoValor] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("Couro");
  const [novaDescricao, setNovaDescricao] = useState("");

  const menuLateralItens = [
    { id: "explorar", icone: Search, rotulo: "Explorar Materiais" },
    { id: "reservas", icone: ShoppingBag, rotulo: "Minhas Reservas" },
    { id: "historico", icone: History, rotulo: "Histórico" },
    { id: "perfil", icone: UserRound, rotulo: "Perfil" },
  ];

  function handlePublicarNovoMaterial(e: React.FormEvent) {
    e.preventDefault();
    if (!novoTitulo.trim()) return;

    const novoItem: Residuo = {
      id: Date.now().toString(),
      titulo: novoTitulo.trim(),
      subtitulo: "Publicado agora • Recém-adicionado",
      valor: novoTipo === "Doação" ? "Grátis" : novoValor.trim() || "Sob consulta",
      tipoTag: novoTipo,
      categoria: novaCategoria,
      descricao: novaDescricao.trim() || "Sem descrição adicional fornecida.",
      data: "Agora mesmo",
    };

    setResiduos([novoItem, ...residuos]);
    setNovoTitulo("");
    setNovoValor("");
    setNovaDescricao("");
    setModalPublicarAberto(false);
    setMensagemSucesso("Material publicado com sucesso na plataforma!");
    setTimeout(() => setMensagemSucesso(null), 4000);
  }

  function getTagClasses(tipo: "Venda" | "Doação" | "Coletado") {
    switch (tipo) {
      case "Venda":
        return "bg-[#D1FAE5] text-[#065F46]";
      case "Doação":
        return "bg-[#FEF3C7] text-[#92400E]";
      case "Coletado":
        return "bg-[#F3F4F6] text-[#4B5563]";
      default:
        return "bg-[#F3F4F6] text-[#4B5563]";
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAF9F5] text-[#1B4B3A]">
      {/* Header Unificado com Operador Ternário (Início | Marketplace | Sobre Nós) */}
      <Header />

      {/* Alerta / Toast de feedback */}
      {mensagemSucesso && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xl animate-in slide-in-from-top-4">
          <Check className="h-5 w-5" />
          {mensagemSucesso}
        </div>
      )}

      {/* Layout Principal: Sidebar + Conteúdo */}
      <div className="flex w-full flex-1 items-stretch">
        {/* ================================================================ */}
        {/* BARRA LATERAL (SIDEBAR)                                         */}
        {/* ================================================================ */}
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
                    strokeWidth={2}
                  />
                  <span>{rotulo}</span>
                </button>
              );
            })}
          </nav>

          {/* Card informativo de sustentabilidade */}
          <div className="mt-auto rounded-2xl bg-[#EBF6F2] p-4 border border-[#D5EADB]">
            <p className="text-xs font-bold text-[#0F3D2E] uppercase tracking-wider">
              Economia Circular
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#4B5A55]">
              Cada lote reaproveitado reduz resíduos em aterros industriais de Franca e gera renda local.
            </p>
          </div>
        </aside>

        {/* ================================================================ */}
        {/* CONTEÚDO PRINCIPAL (DASHBOARD)                                  */}
        {/* ================================================================ */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
          {/* Menu de Abas Mobile / Tablet */}
          <div className="flex gap-2 overflow-x-auto pb-4 md:hidden border-b border-[#E7E4DA] mb-6">
            {menuLateralItens.map(({ id, icone: Icone, rotulo }) => {
              const ativo = abaAtiva === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAbaAtiva(id as any)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold shrink-0 ${
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

          {/* Visualização de Perfil se a aba Perfil estiver selecionada */}
          {abaAtiva === "perfil" ? (
            <div className="rounded-2xl border border-[#E7E4DA] bg-white p-6 sm:p-8 max-w-3xl">
              <h2 className="text-2xl font-bold text-[#0F3D2E]">Meu Perfil</h2>
              <p className="text-sm text-[#6B7670] mt-1">
                Informações da sua conta e preferências na plataforma.
              </p>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D7EFE6] text-[#0F3D2E] font-bold text-xl">
                  {displayName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1F2A26]">{displayName}</h3>
                  <p className="text-sm text-gray-500">{user?.email || "usuario@reaproveita.com.br"}</p>
                  <span className="mt-1 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
                    Conta Comprador / Artesão
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#E7E4DA] p-4">
                  <p className="text-xs text-gray-500 font-semibold">LOCALIZAÇÃO</p>
                  <p className="text-sm font-bold text-[#1F2A26] mt-1 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    Franca - SP
                  </p>
                </div>
                <div className="rounded-xl border border-[#E7E4DA] p-4">
                  <p className="text-xs text-gray-500 font-semibold">TIPO DE CONTA</p>
                  <p className="text-sm font-bold text-[#1F2A26] mt-1 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    Artesão / Microempresa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAbaAtiva("explorar")}
                className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition"
              >
                Voltar à Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Topo: Saudação e Botão Publicar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#0F3D2E] tracking-tight">
                    Olá, {displayName}
                  </h1>
                  <p className="mt-1 text-sm sm:text-[15px] text-[#6B7670]">
                    Acompanhe o impacto da sua fábrica e gerencie seus anúncios de resíduos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalPublicarAberto(true)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#059669] hover:bg-[#047857] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  Publicar Novo Material
                </button>
              </div>

              {/* ============================================================ */}
              {/* 4 CARTÕES DE ESTATÍSTICAS (ROW)                              */}
              {/* ============================================================ */}
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* 1. Materiais Reservados */}
                <div className="flex items-center gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D7EFE6] text-emerald-600">
                    <Package className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      MATERIAIS RESERVADOS
                    </p>
                    <p className="text-2xl font-bold text-[#0F3D2E]">24</p>
                    <p className="text-xs text-[#6B7670] mt-0.5">18 já destinados</p>
                  </div>
                </div>

                {/* 2. Em Negociação */}
                <div className="flex items-center gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D7EFE6] text-emerald-600">
                    <Handshake className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      EM NEGOCIAÇÃO
                    </p>
                    <p className="text-2xl font-bold text-[#0F3D2E]">8</p>
                    <p className="text-xs text-[#6B7670] mt-0.5">Aguardando resposta</p>
                  </div>
                </div>

                {/* 3. KG Adquiridos */}
                <div className="flex items-center gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D7EFE6] text-emerald-600">
                    <ShoppingCart className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      KG ADQUIRIDOS
                    </p>
                    <p className="text-2xl font-bold text-[#0F3D2E]">1.450 kg</p>
                    <p className="text-xs text-[#6B7670] mt-0.5">Total de materiais circulares</p>
                  </div>
                </div>

                {/* 4. Sua Pegada Poupada */}
                <div className="flex items-center gap-4 rounded-2xl border border-[#E7E4DA] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D7EFE6] text-emerald-600">
                    <Leaf className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7670]">
                      SUA PEGADA POUPADA
                    </p>
                    <p className="text-2xl font-bold text-[#0F3D2E]">R$ 12.300</p>
                    <p className="text-xs text-[#6B7670] mt-0.5">Economia gerada</p>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* SEÇÃO INFERIOR: ÚLTIMOS RESÍDUOS & ATIVIDADE RECENTE         */}
              {/* ============================================================ */}
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
                {/* ---------------------------------------------------------- */}
                {/* COLUNA ESQUERDA: ÚLTIMOS RESÍDUOS PUBLICADOS               */}
                {/* ---------------------------------------------------------- */}
                <div className="rounded-2xl border border-[#E7E4DA] bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-[#0F3D2E]">
                      Últimos Resíduos Publicados
                    </h2>
                    <button
                      type="button"
                      onClick={() => setVerTodosAberto((prev) => !prev)}
                      className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                    >
                      {verTodosAberto ? "Ocultar" : `Ver todos (${residuos.length})`}
                    </button>
                  </div>

                  {/* Lista de Resíduos */}
                  <div className="mt-4 divide-y divide-[#F0ECE1]">
                    {residuos.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setItemSelecionado(item)}
                        className="flex items-center justify-between py-3.5 hover:bg-[#FAF9F5] px-2 rounded-xl transition cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-sm sm:text-[15px] font-bold text-[#1F2A26] group-hover:text-emerald-700 transition truncate">
                            {item.titulo}
                          </p>
                          <p className="text-xs text-[#9AA5A0] mt-0.5">
                            {item.subtitulo}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-sm sm:text-[15px] font-bold text-[#1F2A26]">
                            {item.valor}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getTagClasses(
                              item.tipoTag
                            )}`}
                          >
                            {item.tipoTag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ---------------------------------------------------------- */}
                {/* COLUNA DIREITA: ATIVIDADE CIRCULAR RECENTE                 */}
                {/* ---------------------------------------------------------- */}
                <div className="rounded-2xl border border-[#E7E4DA] bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <h2 className="text-base sm:text-lg font-bold text-[#0F3D2E]">
                    Atividade Circular Recente
                  </h2>

                  <div className="mt-5 flex flex-col gap-4">
                    {atividades.map((ativ) => {
                      return (
                        <div key={ativ.id} className="flex items-start gap-3">
                          {/* Ícone estilizado */}
                          {ativ.iconeTipo === "ai" ? (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#CCFBF1] text-teal-600">
                              <Sparkles className="h-4 w-4" />
                            </span>
                          ) : ativ.iconeTipo === "star" ? (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D7EFE6] text-emerald-600">
                              <Star className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D7EFE6] text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                          )}

                          <div className="min-w-0 flex-1 text-xs sm:text-[13px] leading-relaxed">
                            <p className="text-[#3F4A45]">
                              <span className="font-bold text-[#1F2A26]">
                                {ativ.destaque}
                              </span>
                              {ativ.resto}
                            </p>
                            <span className="text-[11px] text-[#9AA5A0] mt-0.5 block">
                              {ativ.tempo}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ================================================================== */}
      {/* MODAL: PUBLICAR NOVO MATERIAL                                      */}
      {/* ================================================================== */}
      {modalPublicarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E7E4DA] bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-[#0F3D2E]">Publicar Novo Material</h3>
              <button
                type="button"
                onClick={() => setModalPublicarAberto(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePublicarNovoMaterial} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2F3D38] uppercase">
                  Título do Material
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Retalhos de Couro Bovino Premium"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D9D5C8] px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2F3D38] uppercase">
                    Tipo de Destinação
                  </label>
                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-[#D9D5C8] bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="Venda">Venda</option>
                    <option value="Doação">Doação</option>
                    <option value="Coletado">Coletado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2F3D38] uppercase">
                    Categoria
                  </label>
                  <select
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#D9D5C8] bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="Couro">Couro</option>
                    <option value="Madeira">Madeira / Pallets</option>
                    <option value="EVA">EVA / Solados</option>
                    <option value="Tecido">Tecido Sintético</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2F3D38] uppercase">
                  Preço ou Quantidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: R$ 45,00 ou 150 kg (ou Grátis)"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D9D5C8] px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2F3D38] uppercase">
                  Descrição do Lote
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva detalhes como espessura, conservação, quantidade disponível..."
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D9D5C8] px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalPublicarAberto(false)}
                  className="rounded-xl border border-[#D9D5C8] px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm"
                >
                  Publicar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL: DETALHES DO RESÍDUO CLICADO                                */}
      {/* ================================================================== */}
      {itemSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E7E4DA] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getTagClasses(
                    itemSelecionado.tipoTag
                  )}`}
                >
                  {itemSelecionado.tipoTag}
                </span>
                <h3 className="text-lg font-bold text-[#0F3D2E] mt-1.5">
                  {itemSelecionado.titulo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setItemSelecionado(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#4B5A55]">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-700">Valor / Quantidade:</span>
                <span className="font-bold text-[#0F3D2E]">{itemSelecionado.valor}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-700">Categoria:</span>
                <span>{itemSelecionado.categoria || "Geral"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-700">Status / Histórico:</span>
                <span>{itemSelecionado.subtitulo}</span>
              </div>
              <div className="pt-1">
                <span className="font-semibold text-gray-700 block mb-1">Descrição:</span>
                <p className="rounded-xl bg-[#FAF9F5] p-3 text-xs leading-relaxed text-gray-600">
                  {itemSelecionado.descricao || "Lote inspecionado e disponível para reuso industrial."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemSelecionado(null)}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé Verde Escuro Padronizado */}
      <Footer />
    </div>
  );
}

