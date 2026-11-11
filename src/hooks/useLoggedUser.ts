import { useCallback, useEffect, useState } from "react";
import { clearSession, readSession, sessionEvent } from "../auth/session";
import { useProfilePhoto } from "../auth/profilePhoto";

interface LoggedUserOptions {
  fallbackName?: string;
  previewName?: string;
}

export function useLoggedUser({ fallbackName = "", previewName }: LoggedUserOptions = {}) {
  const [session, setSession] = useState(() => previewName ? { token: null, user: null } : readSession());
  const syncUser = useCallback(() => setSession(readSession()), []);
  useEffect(() => {
    if (previewName) return;
    window.addEventListener("storage", syncUser);
    window.addEventListener(sessionEvent, syncUser);
    window.addEventListener("perfil-atualizado", syncUser);
    return () => { window.removeEventListener("storage", syncUser); window.removeEventListener(sessionEvent, syncUser); window.removeEventListener("perfil-atualizado", syncUser); };
  }, [previewName, syncUser]);
  const user = previewName ? null : session.user;
  const token = previewName ? null : session.token;
  const photoSrc = useProfilePhoto(user?.id, token);
  const displayName = previewName ?? user?.name ?? fallbackName;
  return { user, userId: user?.id ?? null, token, role: user?.role ?? null, isLoggedIn: Boolean(token && user), displayName, firstName: displayName.split(" ")[0] || fallbackName, photoSrc, logout: clearSession, syncUser };
}
