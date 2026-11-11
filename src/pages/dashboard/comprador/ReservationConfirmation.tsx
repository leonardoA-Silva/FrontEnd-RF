import { useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/client";
import { obterReserva, iniciarConversa, type BuyerImpact } from "../../../api/services";
import { useApiResource } from "../../../hooks/useApiResource";
import RequestState from "./RequestState";
import { buyerStyles as s } from "./buyerStyles";
import { money } from "./buyerPresentation";

export default function ReservationConfirmation({ shoppingId, simulated = false }: { shoppingId: string; simulated?: boolean }) {
  const loader = useCallback(async (signal: AbortSignal) => {
    const response = await obterReserva(shoppingId, signal);
    const seller = response.data.items?.[0]?.seller_id;
    const [impact, conversation] = await Promise.allSettled([api.get<BuyerImpact>(`/environmental-impact/shopping/${encodeURIComponent(shoppingId)}`, { signal }), seller ? iniciarConversa(seller) : Promise.resolve(null)]);
    return { data: { shopping: response.data, impact: impact.status === "fulfilled" ? impact.value.data : null, conversationId: conversation.status === "fulfilled" ? conversation.value?.data.conversationId : null } };
  }, [shoppingId]);
  const resource = useApiResource(loader);
  return <section className={`${s.panel} space-y-5`}><h2 className={s.subtitle}>Pagamento aprovado!</h2>{simulated && <p className={s.notice}>Pagamento de teste, sem comprovação de cobrança real.</p>}<p className={s.copy}>A API confirmou seu pagamento. Combine a retirada com a empresa e acompanhe a reserva no histórico.</p><RequestState {...resource} retry={resource.reload} />{resource.data && <><strong>{money(resource.data.shopping.value)}</strong><ul>{resource.data.shopping.items?.map(item => <li key={item.id}>{item.quantity} un. de {item.product_name}</li>)}</ul>{resource.data.impact && <p>Estimativa: {Number(resource.data.impact.co2_saved_kg).toLocaleString("pt-BR")} kg de CO₂ evitado.</p>}<div className="flex flex-wrap gap-3">{resource.data.conversationId && <Link className={s.button} to={`/dashboardUsuario?aba=mensagens&conversa=${encodeURIComponent(resource.data.conversationId)}`}>Conversar com a empresa</Link>}<Link className={s.secondary} to="/dashboardUsuario?aba=historico">Acompanhar minhas reservas</Link></div></>}</section>;
}
