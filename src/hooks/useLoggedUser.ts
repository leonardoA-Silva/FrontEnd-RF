import { useState } from "react";

// Campos que o front lê do usuário salvo no login (a API pode usar nomes variados).
interface StoredUser {
  id?: string;
  name?: string;
  nome?: string;
  razaoSocial?: string;
  email?: string;
  photo?: string;
  foto?: string;
  avatar?: string;
}

export function useLoggedUser({ fallbackName = "Usuário" }: { fallbackName?: string } = {}) {
  const [user] = useState<StoredUser | null>(() => {
    try {
      const raw = localStorage.getItem("user") ?? sessionStorage.getItem("user");
      return raw ? (JSON.parse(raw) as StoredUser) : null;
    } catch {
      return null;
    }
  });

  const displayName: string =
    user?.name ?? user?.nome ?? user?.razaoSocial ?? user?.email ?? fallbackName;
  const photo = user?.photo ?? user?.foto ?? user?.avatar;

  return {
    displayName,
    firstName: displayName.split(" ")[0] || fallbackName,
    photoSrc: typeof photo === "string" && photo.trim() ? photo : null,
    // Usado para filtrar os produtos da empresa em GET /product.
    userId: typeof user?.id === "string" ? user.id : null,
  };
}
