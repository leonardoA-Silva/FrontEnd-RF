import { useState } from "react";

interface LoggedUserOptions {
  fallbackName?: string;
  previewName?: string;
}

export function useLoggedUser({ fallbackName = "Usuário", previewName }: LoggedUserOptions = {}) {
  const [user] = useState<Record<string, unknown> | null>(() => {
    if (previewName) return null;
    try {
      const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
    } catch { return null; }
  });
  const name = user?.name ?? user?.nome ?? user?.razaoSocial ?? user?.email;
  const displayName = previewName ?? (typeof name === "string" && name.trim() ? name : fallbackName);
  const photo = previewName ? null : user?.photo ?? user?.foto ?? user?.avatar;
  return { displayName, firstName: displayName.split(" ")[0] || fallbackName, photoSrc: typeof photo === "string" && photo.trim() ? photo : null };
}
