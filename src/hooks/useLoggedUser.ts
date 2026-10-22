import { useCallback, useEffect, useState } from "react";
import { clearSession, readSession, sessionEvent } from "../auth/session";

export function useLoggedUser({ fallbackName = "" }: { fallbackName?: string } = {}) {
  const [session, setSession] = useState(readSession);
  const syncUser = useCallback(() => setSession(readSession()), []);
  useEffect(() => {
    window.addEventListener("storage", syncUser);
    window.addEventListener(sessionEvent, syncUser);
    return () => { window.removeEventListener("storage", syncUser); window.removeEventListener(sessionEvent, syncUser); };
  }, [syncUser]);
  const { user, token } = session;
  const displayName = user?.name || fallbackName;
  return { user, token, role: user?.role ?? null, isLoggedIn: Boolean(token && user), displayName, firstName: displayName.split(" ")[0], photoSrc: null, logout: clearSession, syncUser };
}
