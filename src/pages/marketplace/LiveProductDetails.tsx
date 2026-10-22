import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obterProdutoPorId, type ProductBackend } from "../../axios/Axios";
import { apiError, apiStatus } from "../../axios/apiError";
import MaterialImage from "./MaterialImage";
import { productCondition, productPhotos, productPrice, productStatus } from "./productPresentation";
import { styles } from "./marketplaceStyles";

export default function LiveProductDetails() {
  const { productId = "" } = useParams();
  return <ProductDetails key={productId} productId={productId} />;
}

function ProductDetails({ productId }: { productId: string }) {
  const [attempt, setAttempt] = useState(0);
  const [photo, setPhoto] = useState(0);
  const [state, setState] = useState<{ product: ProductBackend | null; loading: boolean; error: string }>({ product: null, loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    obterProdutoPorId(productId, controller.signal).then(({ data }) => {
      if (!data || typeof data.name !== "string") throw new Error("Resposta inválida.");
      if (!controller.signal.aborted) setState({ product: data, loading: false, error: "" });
    }).catch(error => { if (!controller.signal.aborted) setState({ product: null, loading: false, error: [400, 404].includes(apiStatus(error) ?? 0) ? "Material não encontrado." : apiError(error, "Não foi possível carregar este material.") }); });
    return () => controller.abort();
  }, [productId, attempt]);
  const product = state.product;
  const photos = product ? productPhotos(product) : [];
  return <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-5 sm:p-8"><Link to="/marketplace" className={styles.voltar}>Voltar ao marketplace</Link>{state.loading ? <p role="status">Carregando material...</p> : state.error ? <div role="alert" className={styles.painel}><h1 className={styles.titulo}>{state.error}</h1><button className={`${styles.secundario} mt-5`} onClick={() => { setState({ product: null, loading: true, error: "" }); setAttempt(value => value + 1); }}>Tentar novamente</button></div> : product && <div className="grid gap-8 lg:grid-cols-2"><section aria-label="Fotos do produto"><div className="aspect-[1.5] overflow-hidden rounded-2xl"><MaterialImage key={photos[photo]} src={photos[photo]} nome={product.name} prioridade /></div><div className="mt-4 grid grid-cols-4 gap-3">{photos.map((src, index) => <button key={index} onClick={() => setPhoto(index)} aria-label={`Ver foto ${index + 1}`} aria-pressed={photo === index} className={`aspect-square overflow-hidden rounded-lg border-2 ${photo === index ? "border-emerald-600" : "border-transparent"}`}><MaterialImage src={src} nome={`Foto ${index + 1} de ${product.name}`} /></button>)}</div></section><section className="space-y-5"><span className={styles.badge}>{product.category}</span><h1 className={styles.titulo}>{product.name}</h1><p className="text-2xl font-bold">{productPrice(product)}</p><p className="text-xs text-gray-600">Valor anunciado. Condições de negociação não informadas.</p><dl className={`${styles.painel} grid grid-cols-2 gap-5 text-sm`}>{[["Quantidade", `${product.quantity} unidades`], ["Peso informado", `${product.weight} kg`], ["Conservação", productCondition(product)], ["Disponibilidade", productStatus(product)]].map(([label, value]) => <div key={label}><dt className="text-gray-600">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl><h2 className={styles.subtitulo}>Descrição do material</h2><p className={`${styles.texto} whitespace-pre-wrap`}>{product.description || "Descrição não informada."}</p><p className={styles.aviso}>Reservas, pagamentos e contato com o fornecedor ainda não estão disponíveis para este anúncio. O catálogo não informa nome do fornecedor, endereço ou distância.</p><Link to="/marketplace?origem=exemplo" className={styles.secundario}>Conhecer o exemplo de reserva</Link></section></div>}</main>;
}
