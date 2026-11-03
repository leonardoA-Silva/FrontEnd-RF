import { useEffect, useState } from "react";

interface LoggedUserOptions {
  fallbackName?: string;
  previewName?: string;
}

export function useLoggedUser({ fallbackName = "Usuário", previewName }: LoggedUserOptions = {}) {
  const [user, setUser] = useState<Record<string, unknown> | null>(() => {
    if (previewName) return null;
    try {
      const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
    } catch { return null; }
  });
  useEffect(() => {
    if (previewName) return;
    const refresh = () => {
      try {
        const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        setUser(parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null);
      } catch { setUser(null); }
    };
    window.addEventListener("perfil-atualizado", refresh);
    return () => window.removeEventListener("perfil-atualizado", refresh);
  }, [previewName]);
  const name = user?.name ?? user?.nome ?? user?.razaoSocial ?? user?.email;
  const displayName = previewName ?? (typeof name === "string" && name.trim() ? name : fallbackName);
  const photo = previewName ? null : user?.photo ?? user?.foto ?? user?.avatar;
  return { userId: typeof user?.id === "string" ? user.id : null, displayName, firstName: displayName.split(" ")[0] || fallbackName, photoSrc: typeof photo === "string" && photo.trim() ? photo : null };
}
