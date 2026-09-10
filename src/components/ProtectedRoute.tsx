import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

// 1. Token salvo (prova de que o usuário fez login)
function getStoredToken(): string | null {
  return (
    localStorage.getItem("token") ?? sessionStorage.getItem("token")
  );
}

// 2. Role salva no login (back retorna "company" | "user" | "admin")
function getStoredRole(): string | null {
  try {
    const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
    if (!raw) return null;
    const role = (JSON.parse(raw) as Record<string, unknown>)?.["role"];
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
}

function dashboardForRole(role: string | null): string {
  if (role === "company") return "/dashboardEmpresa";
  if (role === "user") return "/dashboardUsuario";
  return "/login";
}

// 3. Protege rotas privadas:
//    - sem token -> manda para /login
//    - com token mas role diferente de allowedRoles -> manda para o dashboard correto
//    - admin passa em todas (não tem dashboard próprio no front)
export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) {
  if (!getStoredToken()) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && allowedRoles.length > 0) {
    const role = getStoredRole();
    if (role && !allowedRoles.includes(role) && role !== "admin") {
      return <Navigate to={dashboardForRole(role)} replace />;
    }
  }
  return <>{children}</>;
}
