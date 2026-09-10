import { useState, useEffect, useCallback } from "react";

export function useLoggedUser({ fallbackName = "Roberto de Oliveira" }: { fallbackName?: string } = {}) {
  const [user, setUser] = useState<any>(() => {
    try {
      const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
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
      const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
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

  const isLoggedIn = Boolean(token || user);
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

