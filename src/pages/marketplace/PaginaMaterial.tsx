import { Navigate, useParams } from "react-router-dom";

// Preserve links published before the shared marketplace layout was introduced.
export default function PaginaMaterial({ compra = false }: { compra?: boolean }) {
  const { produtoId = "" } = useParams();
  const path = produtoId === "compra-exemplo"
    ? `/marketplace/${compra ? "reserva" : "material"}/mkt-1`
    : `/marketplace/produto/${encodeURIComponent(produtoId)}`;
  return <Navigate to={path} replace />;
}
