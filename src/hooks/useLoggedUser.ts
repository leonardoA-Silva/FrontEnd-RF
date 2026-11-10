import { useCallback, useEffect, useState } from "react";
import { clearSession, readSession, sessionEvent } from "../auth/session";
import { useProfilePhoto } from "../auth/profilePhoto";

export function useLoggedUser({ fallbackName = "" }: { fallbackName?: string } = {}) {
  const [session, setSession] = useState(readSession);
  const syncUser = useCallback(() => setSession(readSession()), []);
  useEffect(() => {
    window.addEventListener("storage", syncUser);
    window.addEventListener(sessionEvent, syncUser);
    return () => { window.removeEventListener("storage", syncUser); window.removeEventListener(sessionEvent, syncUser); };
  }, [syncUser]);
  const { user, token } = session;
  const photoSrc = useProfilePhoto(user?.id, token);
  const displayName = user?.name || fallbackName;
  return { userId: user?.id ?? null, user, token, role: user?.role ?? null, isLoggedIn: Boolean(token && user), displayName, firstName: displayName.split(" ")[0], photoSrc, logout: clearSession, syncUser };
}
