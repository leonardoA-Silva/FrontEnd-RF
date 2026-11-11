import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  Search, 
  ArrowLeft, 
  AlertCircle, 
  Tag, 
  Leaf, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Trash2,
  ExternalLink
} from "lucide-react";
import { listarProdutos, excluirProdutoAdmin, type ProductBackend } from "../../api/services";
import { productPhotos, productPrice } from "../marketplace/productPresentation";
import MaterialImage from "../marketplace/MaterialImage";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";

const statusFilters = [
  { id: "all", label: "Todos" },
  { id: "available", label: "Publicados" },
  { id: "reserved", label: "Reservados" },
  { id: "unavailable", label: "Indisponíveis" },
];

export default function AdminAdvertisementsPage() {
  const [products, setProducts] = useState<ProductBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deletingProduct, setDeletingProduct] = useState<ProductBackend | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");
      const response = await listarProdutos();
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError("Não foi possível carregar os anúncios da plataforma.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingProduct || saving) return;

    try {
      setSaving(true);
      await excluirProdutoAdmin(deletingProduct.id);
      setProducts((prev) => prev.filter((item) => item.id !== deletingProduct.id));
      setDeletingProduct(null);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      alert(msg || "Não foi possível excluir o anúncio.");
    } finally {
      setSaving(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "available":
        return { label: "Publicado", bg: "bg-emerald-100 text-emerald-800 border-emerald-200", Icon: CheckCircle2 };
      case "reserved":
        return { label: "Reservado", bg: "bg-amber-100 text-amber-800 border-amber-200", Icon: Clock };
      default:
        return { label: "Indisponível", bg: "bg-gray-100 text-gray-700 border-gray-200", Icon: XCircle };
    }
  }

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchStatus = filter === "all" || p.status === filter;
      const matchSearch =
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [products, filter, search]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/dashboardUsuario"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 hover:text-emerald-950 transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Voltar ao Painel
          </Link>
          <h1 className={s.title}>Gerenciar Anúncios</h1>
          <p className={s.copy}>Acompanhe e audite todos os materiais cadastrados pelas empresas na plataforma.</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className={`${s.panel} space-y-4`}>
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-papel-suave border border-cinza-linha rounded-xl">
            {statusFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  filter === f.id
                    ? "bg-white text-emerald-900 shadow-sm font-semibold"
                    : "text-tinta-suave hover:text-tinta"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Campo de Busca */}
          <div className="relative min-w-[260px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta-suave" />
            <input
              type="text"
              placeholder="Buscar por material, categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${s.input} pl-10 h-10 py-1 text-sm`}
            />
          </div>
        </div>

        {/* Totalizador */}
        <div className="text-xs text-tinta-suave flex items-center justify-between border-t border-cinza-linha pt-3">
          <span>Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> anúncios</span>
          {loading && <span className="text-emerald-700 animate-pulse">Carregando anúncios...</span>}
        </div>
      </div>

      {/* Grid de Anúncios */}
      {filteredProducts.length === 0 && !loading ? (
        <div className={`${s.panel} text-center py-12 space-y-3`}>
          <Package size={36} className="mx-auto text-tinta-suave opacity-40" />
          <h3 className="font-semibold text-tinta">Nenhum anúncio encontrado</h3>
          <p className="text-sm text-tinta-suave">Ajuste os filtros de busca para conferir outros produtos.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((item) => {
            const badge = getStatusBadge(item.status);
            const BadgeIcon = badge.Icon;
            const photos = productPhotos(item);

            return (
              <div
                key={item.id}
                className={`${s.panel} flex flex-col justify-between overflow-hidden border border-cinza-linha hover:border-emerald-700/40 transition-all p-0`}
              >
                {/* Imagem do Produto */}
                <div className="aspect-[16/9] w-full bg-papel-suave relative overflow-hidden">
                  <MaterialImage src={photos[0]} nome={item.name} />
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-xs border ${badge.bg}`}>
                      <BadgeIcon size={12} />
                      {badge.label}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-black/60 text-white backdrop-blur-xs">
                      {item.type_negotiation === "donation" ? (
                        <>
                          <Leaf size={12} className="text-emerald-300" /> Doação
                        </>
                      ) : (
                        <>
                          <Tag size={12} className="text-amber-300" /> Venda
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider font-semibold text-emerald-800">
                      {item.category || "Material"}
                    </p>
                    <h2 className="font-semibold text-base text-tinta line-clamp-1" title={item.name}>
                      {item.name}
                    </h2>
                    <p className="text-lg font-bold text-emerald-900">
                      {productPrice(item)}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-cinza-linha flex items-center justify-between text-xs text-tinta-suave">
                    <span>
                      <strong>{item.quantity}</strong> unid. · <strong>{Number(item.weight || 0).toLocaleString("pt-BR")}</strong> kg
                    </span>

                    <div className="flex items-center gap-1">
                      <Link
                        to={`/marketplace/produto/${encodeURIComponent(item.id)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-tinta-suave hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                        title="Ver página no Marketplace"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeletingProduct(item)}
                        className="p-1.5 rounded-lg text-tinta-suave hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Excluir Anúncio (Admin)"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Exclusão de Anúncio */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-red-100 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-700">
              <div className="p-3 rounded-full bg-red-100">
                <Trash2 size={24} />
              </div>
              <h3 className="font-semibold text-lg">Excluir Anúncio</h3>
            </div>

            <p className="text-sm text-tinta-suave">
              Tem certeza que deseja excluir o anúncio{" "}
              <strong className="text-tinta">“{deletingProduct.name}”</strong>?
              Esta ação removerá o material do catálogo imediatamente.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={saving}
                className={s.secondary}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-red-700 hover:bg-red-800 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                {saving ? "Excluindo..." : "Sim, Excluir Anúncio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
