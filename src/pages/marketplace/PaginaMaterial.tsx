import { Navigate, useParams } from "react-router-dom";

// Preserve links published before the shared marketplace layout was introduced.
export default function PaginaMaterial({ compra = false }: { compra?: boolean }) {
  const { produtoId = "" } = useParams();
  const path = produtoId === "compra-exemplo" || produtoId === "mkt-1"
    ? "/marketplace"
    : `/marketplace/${compra ? "reserva" : "produto"}/${encodeURIComponent(produtoId)}`;
  return <Navigate to={path} replace />;
}
