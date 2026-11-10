import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useLoggedUser } from "../hooks/useLoggedUser";

export default function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
  const { token, user } = useLoggedUser();
  const location = useLocation();
  if (!token || !user) return <Navigate to="/login" replace state={{ from: location.pathname, tipoUsuario: allowedRoles?.includes("user") ? "comprador" : undefined }} />;
  if (allowedRoles?.length && !allowedRoles.includes(user.role) && user.role !== "admin") return <Navigate to={user.role === "company" ? "/dashboardEmpresa" : user.role === "user" ? "/dashboardUsuario" : "/login"} replace />;
  if (user.mustChangePassword && location.pathname !== "/primeiro-acesso") return <Navigate to="/primeiro-acesso" replace />;
  return <>{children}</>;
}
