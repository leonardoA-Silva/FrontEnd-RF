import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

// 1. Verifica se existe token salvo (prova de que o usuário fez login)
function temToken(): boolean {
  return Boolean(
    localStorage.getItem("token") ?? sessionStorage.getItem("token")
  );
}

// 2. Protege rotas privadas:
//    - sem token -> manda para /login
//    - com token -> mostra a página (children)
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!temToken()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
