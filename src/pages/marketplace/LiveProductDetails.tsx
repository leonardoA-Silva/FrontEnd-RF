import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { iniciarConversa, obterProdutoPorId } from "../../axios/Axios";
import { apiError, apiStatus } from "../../axios/apiError";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { ResourceError, useApiResource } from "../../hooks/useApiResource";
import MaterialImage from "./MaterialImage";
import ProductLocation from "./ProductLocation";
import { productCondition, productPhotos, productPrice, productStatus } from "./productPresentation";
import { styles } from "./marketplaceStyles";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";

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
      const response = await obterProdutoPorId(productId, signal);
      if (response.data?.id !== productId || typeof response.data?.name !== "string") throw new Error("Resposta inválida.");
      return response;
    } catch (cause) { if ([400, 404].includes(apiStatus(cause) ?? 0)) throw new ResourceError("Material não encontrado.", { cause }); throw cause; }
  }, [productId]);
  const resource = useApiResource(loader);
  const product = resource.data;
  const photos = product ? productPhotos(product) : [];
  const canBuy = isLoggedIn && user?.role === "user" && product?.id_user?.toLowerCase() !== user.id.toLowerCase();
  async function contact() {
    if (!canBuy || !product?.id_user || busy) return;
    setBusy(true); setError("");
    try {
      const response = await iniciarConversa(product.id_user);
      if (!response.data.conversationId) throw new Error("Resposta inválida.");
      try {
        const raw = sessionStorage.getItem("rf_recent_conversations");
        const list = raw ? JSON.parse(raw) : [];
        const next = Array.isArray(list) ? list.filter((i: { id: string }) => i.id !== response.data.conversationId) : [];
        next.unshift({ id: response.data.conversationId, name: product.name, accessedAt: new Date().toISOString() });
        sessionStorage.setItem("rf_recent_conversations", JSON.stringify(next.slice(0, 10)));
      } catch {
        // ignora erro de storage
      }
      navigate(`/dashboardUsuario?aba=mensagens&conversa=${encodeURIComponent(response.data.conversationId)}`);
    } catch (cause) { setError(apiError(cause, "Não foi possível abrir a conversa com o fornecedor.")); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-5 sm:p-8">
    <Link to="/marketplace" className={styles.voltar}>Voltar ao marketplace</Link>
    {resource.loading ? <p role="status">Carregando material...</p> : resource.error ? <div role="alert" className={s.panel}><h1 className={s.title}>{resource.error}</h1><button className={`${s.secondary} mt-5`} onClick={resource.reload}>Tentar novamente</button></div> : product && <div className="grid gap-8 lg:grid-cols-2">
      <section aria-label="Fotos do produto"><div className="aspect-[1.5] overflow-hidden rounded-2xl"><MaterialImage key={photos[photo]} src={photos[photo]} nome={product.name} prioridade /></div><div className="mt-4 grid grid-cols-4 gap-3">{photos.map((src, index) => <button key={index} onClick={() => setPhoto(index)} aria-label={`Ver foto ${index + 1}`} aria-pressed={photo === index} className={`aspect-square overflow-hidden rounded-lg border-2 ${photo === index ? "border-emerald-600" : "border-transparent"}`}><MaterialImage src={src} nome={`Foto ${index + 1} de ${product.name}`} /></button>)}</div></section>
      <section className="min-w-0 space-y-5"><span className={styles.badge}>{product.category}</span><h1 className={s.title}>{product.name}</h1><p className="text-2xl font-bold">{productPrice(product)}</p>{product.type_negotiation === "sale" && <p className={s.copy}>Valor por unidade. O total da solicitação é calculado pelo servidor.</p>}
        <dl className={`${s.panel} grid grid-cols-2 gap-5 text-sm`}>{[["Quantidade", `${product.quantity} unidades`], ["Peso informado", `${product.weight} kg`], ["Conservação", productCondition(product)], ["Disponibilidade", productStatus(product)]].map(([label, value]) => <div key={label}><dt className="text-gray-600">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl>
        <h2 className={s.subtitle}>Descrição do material</h2><p className={`${s.copy} whitespace-pre-wrap break-words`}>{product.description || "Descrição não informada."}</p>
        <ProductLocation key={user?.id ?? "visitante"} productId={productId} />
        {error && <p role="alert" className={s.error}>{error}</p>}
        <div className="flex flex-wrap gap-3">{!isLoggedIn ? <Link to="/login" state={{ from: `/marketplace/produto/${productId}`, tipoUsuario: "comprador" }} className={s.button}>Entrar para solicitar</Link> : canBuy ? <>{product.status === "available" && product.quantity > 0 && <Link to={`/marketplace/reserva/${productId}`} className={s.button}>Solicitar reserva</Link>}{product.id_user && <button disabled={busy} onClick={contact} className={s.secondary}>{busy ? "Abrindo conversa..." : "Conversar com fornecedor"}</button>}</> : <p className={s.notice}>Entre com uma conta de comprador para solicitar materiais de outros usuários.</p>}</div>
      </section>
    </div>}
  </main>;
}
