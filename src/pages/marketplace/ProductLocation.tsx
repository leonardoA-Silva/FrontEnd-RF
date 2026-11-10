import { useCallback } from "react";
import { obterLocalizacaoProduto } from "../../axios/Axios";
import { useApiResource } from "../../hooks/useApiResource";
import RequestState from "../dashboard/comprador/RequestState";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";

export default function ProductLocation({ productId }: { productId: string }) {
  const loader = useCallback((signal: AbortSignal) => obterLocalizacaoProduto(productId, signal), [productId]);
  const resource = useApiResource(loader);
  const location = resource.data;
  return <section className="space-y-3" aria-label="Localização do material"><h2 className={s.subtitle}>Localização</h2><RequestState {...resource} retry={resource.reload} />
    {!resource.loading && !resource.error && location && <><p className={s.copy}>{location.neighborhood} · {location.city}</p>{location.addressFull === true ? <p className={s.copy}>{location.street}, {location.number} · {location.state} · CEP {location.zipCode}</p> : <p className={s.copy}>Localização aproximada. O endereço completo é liberado após o aceite da reserva.</p>}</>}
  </section>;
}
