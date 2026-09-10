import { useState } from "react";

export function useLoggedUser({ fallbackName = "Usuário" }: { fallbackName?: string } = {}) {
  const [user] = useState<any>(() => {
    try {
      const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const displayName: string = user?.name ?? user?.nome ?? user?.razaoSocial ?? user?.email ?? fallbackName;
  const photo: unknown = user?.photo ?? user?.foto ?? user?.avatar;

  return {
    displayName,
    firstName: displayName.split(" ")[0] || fallbackName,
    photoSrc: typeof photo === "string" && photo.trim() ? photo : null,
  };
}
