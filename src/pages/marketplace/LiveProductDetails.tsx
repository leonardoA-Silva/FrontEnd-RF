import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Star, ShieldCheck } from "lucide-react";
import { iniciarConversa, obterProdutoPorId, listarAvaliacoes, type ReviewBackend } from "../../api/services";
import { apiError, apiStatus } from "../../axios/apiError";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { ResourceError, useApiResource } from "../../hooks/useApiResource";
import MaterialImage from "./MaterialImage";
import ProductLocation from "./ProductLocation";
import { productCondition, productPhotos, productPrice, productStatus } from "./productPresentation";
import { styles } from "./marketplaceStyles";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";
import { ReviewCard } from "../dashboard/comprador/ReviewDialog";

export default function LiveProductDetails() {
  const { productId = "" } = useParams();
  return <ProductDetails key={productId} productId={productId} />;
}

function ProductDetails({ productId }: { productId: string }) {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useLoggedUser();
  const [photo, setPhoto] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const loader = useCallback(async (signal: AbortSignal) => {
    try {
      const [productRes, reviewsRes] = await Promise.allSettled([
        obterProdutoPorId(productId, signal),
        listarAvaliacoes(signal),
      ]);

      if (productRes.status === "rejected") {
        throw productRes.reason;
      }

      const response = productRes.value;
      if (response.data?.id !== productId || typeof response.data?.name !== "string") throw new Error("Resposta inválida.");

      const allReviews = reviewsRes.status === "fulfilled" && Array.isArray(reviewsRes.value.data) ? reviewsRes.value.data : [];
      const sellerReviews = response.data?.id_user
        ? allReviews.filter((r: ReviewBackend) => r.id_reviewed?.toLowerCase() === response.data.id_user!.toLowerCase())
        : [];

      return {
        data: {
          ...response.data,
          sellerReviews,
        },
      };
    } catch (cause) { if ([400, 404].includes(apiStatus(cause) ?? 0)) throw new ResourceError("Material não encontrado.", { cause }); throw cause; }
  }, [productId]);
  const resource = useApiResource(loader);
  const product = resource.data;
  const photos = product ? productPhotos(product) : [];
  const sellerReviews: ReviewBackend[] = (product as any)?.sellerReviews ?? [];
  const averageRating = sellerReviews.length > 0
    ? (sellerReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / sellerReviews.length).toFixed(1)
    : null;
  const canBuy = isLoggedIn && user?.role === "user" && product?.id_user?.toLowerCase() !== user.id.toLowerCase();
  async function contact() {
    if (!canBuy || !product?.id_user || busy) return;
    setBusy(true); setError("");
    try {
      const response = await iniciarConversa(product.id_user);
      if (!response.data.conversationId) throw new Error("Resposta inválida.");
      navigate(`/dashboardUsuario?aba=mensagens&conversa=${encodeURIComponent(response.data.conversationId)}`);
    } catch (cause) { setError(apiError(cause, "Não foi possível abrir a conversa com o fornecedor.")); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-5 sm:p-8">
    <Link to="/marketplace" className={styles.voltar}>Voltar ao marketplace</Link>
    {resource.loading ? <p role="status">Carregando material...</p> : resource.error ? <div role="alert" className={s.panel}><h1 className={s.title}>{resource.error}</h1><button className={`${s.secondary} mt-5`} onClick={resource.reload}>Tentar novamente</button></div> : product && <div className="grid gap-8 lg:grid-cols-2">
      <section aria-label="Fotos do produto"><div className="aspect-[1.5] overflow-hidden rounded-2xl"><MaterialImage key={photos[photo]} src={photos[photo]} nome={product.name} prioridade /></div><div className="mt-4 grid grid-cols-4 gap-3">{photos.map((src, index) => <button key={index} onClick={() => setPhoto(index)} aria-label={`Ver foto ${index + 1}`} aria-pressed={photo === index} className={`aspect-square overflow-hidden rounded-lg border-2 ${photo === index ? "border-emerald-600" : "border-transparent"}`}><MaterialImage src={src} nome={`Foto ${index + 1} de ${product.name}`} /></button>)}</div></section>
      <section className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={styles.badge}>{product.category}</span>
          {averageRating ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-900" title={`Média de ${averageRating} estrelas com base em ${sellerReviews.length} avaliações do fornecedor`}>
              <Star size={14} className="fill-amber-400 text-amber-500" aria-hidden="true" />
              <span>{averageRating} ({sellerReviews.length} {sellerReviews.length === 1 ? "avaliação" : "avaliações"})</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500 italic">Fornecedor sem avaliações anteriores</span>
          )}
        </div>
        <h1 className={s.title}>{product.name}</h1>
        <p className="text-2xl font-bold">{productPrice(product)}</p>
        {product.type_negotiation === "sale" && <p className={s.copy}>Valor por unidade. O total da solicitação é calculado pelo servidor.</p>}
        <dl className={`${s.panel} grid grid-cols-2 gap-5 text-sm`}>{[["Quantidade", `${product.quantity} unidades`], ["Peso informado", `${product.weight} kg`], ["Conservação", productCondition(product)], ["Disponibilidade", productStatus(product)]].map(([label, value]) => <div key={label}><dt className="text-gray-600">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl>
        <h2 className={s.subtitle}>Descrição do material</h2><p className={`${s.copy} whitespace-pre-wrap break-words`}>{product.description || "Descrição não informada."}</p>
        <ProductLocation key={user?.id ?? "visitante"} productId={productId} />
        {error && <p role="alert" className={s.error}>{error}</p>}
        <div className="flex flex-wrap gap-3">{!isLoggedIn ? <Link to="/login" state={{ from: `/marketplace/produto/${productId}`, tipoUsuario: "comprador" }} className={s.button}>Entrar para solicitar</Link> : canBuy ? <>{product.status === "available" && product.quantity > 0 && <Link to={`/marketplace/reserva/${productId}`} className={s.button}>Solicitar reserva</Link>}{product.id_user && <button disabled={busy} onClick={contact} className={s.secondary}>{busy ? "Abrindo conversa..." : "Conversar com fornecedor"}</button>}</> : <p className={s.notice}>Entre com uma conta de comprador para solicitar materiais de outros usuários.</p>}</div>
        
        {/* Avaliações recebidas pelo fornecedor */}
        {sellerReviews.length > 0 && (
          <div className="border-t border-[#E7E4DA] pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className={s.subtitle}>Avaliações do fornecedor</h2>
              <span className="text-xs text-gray-500">{sellerReviews.length} registrada{sellerReviews.length > 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {sellerReviews.map((rev) => (
                <ReviewCard key={rev.id} review={rev} />
              ))}
            </div>
          </div>
        )}

        {/* Garantia e Denúncia */}
        <div className="rounded-xl border border-[#DCE1D5] bg-[#FCFAF1] p-4 text-xs text-gray-600 flex items-start gap-3">
          <ShieldCheck size={20} className="text-[#0F3D2E] shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Após a conclusão da compra, você pode <strong>registrar uma denúncia</strong> nos detalhes da reserva no painel do usuário.
          </p>
        </div>
      </section>
    </div>}
  </main>;
}
