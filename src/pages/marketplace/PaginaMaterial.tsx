import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, Package, RefreshCw } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { obterProdutoPorId, type ProductBackend } from "../../axios/Axios";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import ResiduoDetalheModal from "../dashboard/comprador/ResiduoDetalheModal";
import SolicitarReservaModal from "../dashboard/comprador/SolicitarReservaModal";
import { COMPRA_EXEMPLO, erroCatalogo, validarCatalogo } from "./catalogo";

export default function PaginaMaterial({ compra = false }: { compra?: boolean }) {
  const { produtoId = "" } = useParams();
  return <ConteudoMaterial key={`${produtoId}-${compra}`} id={produtoId} compra={compra} />;
}

function ConteudoMaterial({ id, compra }: { id: string; compra: boolean }) {
  const navigate = useNavigate();
  const { token, role } = useLoggedUser();
  const exemplo = id === COMPRA_EXEMPLO.id;
  const [produto, setProduto] = useState<ProductBackend | null>(exemplo ? COMPRA_EXEMPLO : null);
  const [carregando, setCarregando] = useState(!exemplo);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [search, setSearch] = useSearchParams();
  const etapa = search.get("etapa") === "conclusao" ? 3 : search.get("etapa") === "revisao" ? 2 : 1;

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  useEffect(() => {
    if (exemplo) return;
    let ativo = true;
    obterProdutoPorId(id).then(({ data }) => {
      const resultado = validarCatalogo([data])[0];
      if (resultado.id !== id) throw new Error("Material indisponível");
      if (ativo) setProduto(resultado);
    }).catch((error: unknown) => { if (ativo) setErro(erroCatalogo(error)); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [id, exemplo, tentativa]);

  function iniciarCompra(material: ProductBackend) {
    if (!exemplo && !token) {
      navigate("/login", { state: { from: `/marketplace/${encodeURIComponent(id)}`, tipoUsuario: "comprador" } });
      return;
    }
    if (!exemplo && role === "company") {
      setAviso("Use uma conta de comprador para solicitar materiais.");
      return;
    }
    navigate(`/marketplace/${encodeURIComponent(material.id)}/compra`);
  }

  return <div className="flex min-h-screen flex-col bg-[#F7F9F8] text-[#1B4B3A]">
    <Header compacto />
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-9">
      <nav aria-label="Caminho da página" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#738078]">
        <Link to="/marketplace" className="hover:text-emerald-700">Marketplace</Link>
        <ChevronRight className="h-3 w-3" />
        {compra ? <><Link to={`/marketplace/${encodeURIComponent(id)}`} className="hover:text-emerald-700">Detalhes do material</Link><ChevronRight className="h-3 w-3" /><span aria-current="page">{exemplo ? "Compra de exemplo" : "Solicitação de reserva"}</span></> : <span aria-current="page">Detalhes do material</span>}
      </nav>
      {aviso && <p role="status" className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{aviso}</p>}
      {carregando ? <div role="status" className="flex min-h-80 items-center justify-center gap-3 text-sm text-gray-500"><RefreshCw className="h-5 w-5 animate-spin" />Carregando material...</div>
        : erro || !produto ? <section role="alert" className="mx-auto max-w-xl rounded-md border border-[#E2E9E5] bg-white px-6 py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300" /><h1 className="mt-4 text-xl font-bold">Material indisponível</h1><p className="mt-3 text-sm text-gray-500">{erro || "Não há informações disponíveis para este material."}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/marketplace" className="rounded-md border border-[#D5E2DA] px-4 py-2.5 text-sm">Voltar ao marketplace</Link><button type="button" onClick={() => { setCarregando(true); setErro(null); setTentativa((n) => n + 1); }} className="rounded-md bg-[#00875B] px-4 py-2.5 text-sm font-semibold text-white">Tentar novamente</button></div>
        </section>
        : compra ? <SolicitarReservaModal aberto pagina simulacao={exemplo} produto={produto} usuarioNome="" etapaSolicitada={etapa}
          aoMudarEtapa={(proxima) => { setSearch(proxima === 1 ? {} : { etapa: proxima === 2 ? "revisao" : "conclusao" }); window.scrollTo({ top: 0, behavior: "instant" }); }}
          aoFechar={() => navigate("/marketplace")} aoIrParaMinhasReservas={() => navigate("/dashboardUsuario")} />
        : <><h1 className="sr-only">Detalhes de {produto.name}</h1><ResiduoDetalheModal pagina aberto produto={produto} aoFechar={() => navigate("/marketplace")} aoIniciarReserva={iniciarCompra} aoAbrirContato={() => setAviso("Não há contato disponível para este fornecedor no momento.")} /></>}
    </main>
    <Footer compacto />
  </div>;
}
