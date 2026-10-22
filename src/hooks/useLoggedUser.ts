import { useState, useEffect, useCallback } from "react";
import type { UsuarioPerfil } from "../axios/Axios";

type UsuarioSessao = Partial<UsuarioPerfil> & {
  userId?: string; tipo?: string; tipoUsuario?: string; nome?: string;
  telefone?: string; celular?: string; foto?: string; avatar?: string;
};
function lerUsuario(): UsuarioSessao | null {
  const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
  const data: unknown = raw ? JSON.parse(raw) : null;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

export function useLoggedUser({ fallbackName = "" }: { fallbackName?: string } = {}) {
  const [user, setUser] = useState<UsuarioSessao | null>(() => {
    try {
      return lerUsuario();
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("token") ?? sessionStorage.getItem("token");
    } catch {
      return null;
    }
  });

  const syncUser = useCallback(() => {
    try {
      setUser(lerUsuario());
      const tok = localStorage.getItem("token") ?? sessionStorage.getItem("token");
      setToken(tok);
    } catch {
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, [syncUser]);

  const role: string | null =
    user?.role ??
    user?.tipo ??
    user?.tipoUsuario ??
    (localStorage.getItem("tipoUsuario") ?? sessionStorage.getItem("tipoUsuario")) ??
    (token ? "user" : null);

  const isLoggedIn = Boolean(token);
  const displayName: string =
    user?.name ?? user?.nome ?? user?.razaoSocial ?? user?.email ?? fallbackName;
  const photo: unknown = user?.photo ?? user?.foto ?? user?.avatar;

  const logout = () => {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem("token");
      storage.removeItem("user");
      storage.removeItem("tipoUsuario");
    }
    setUser(null);
    setToken(null);
  };

  return {
    user,
    token,
    role,
    isLoggedIn,
    displayName,
    firstName: displayName.split(" ")[0] || fallbackName,
    photoSrc: typeof photo === "string" && photo.trim() ? photo : null,
    logout,
    syncUser,
  };
}

