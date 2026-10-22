import { useOutletContext, useParams } from "react-router-dom";
import type { MarketplaceContext } from "./MarketplaceLayout";
import { materiais } from "./marketplaceData";

export function useMarketplaceFlow() {
  const { materialId } = useParams();
  const contexto = useOutletContext<MarketplaceContext>();
  const material = materiais.find(item => item.id === materialId);
  const reserva = contexto.reserva?.materialId === materialId ? contexto.reserva : null;
  return { material, reserva, setReserva: contexto.setReserva };
}
