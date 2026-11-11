import { useEffect, useSyncExternalStore } from "react";
import axios from "axios";
import api from "../api/services";
import { clearSession } from "./session";

// Only memory and authenticated requests; never persist photos or URLs in storage.
let photo: { ownerId: string; token: string; src: string } | null = null;
type Load = { ownerId: string; token: string; controller: AbortController; error: string };
let load: Load | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

export function clearProfilePhoto() {
  load?.controller.abort(); load = null;
  if (photo) URL.revokeObjectURL(photo.src);
  photo = null;
  emit();
}

export function saveProfilePhoto(ownerId: string, token: string, file: Blob) {
  load?.controller.abort();
  load = { ownerId, token, controller: new AbortController(), error: "" };
  const src = URL.createObjectURL(file);
  if (photo) URL.revokeObjectURL(photo.src);
  photo = { ownerId, token, src };
  emit();
}

export async function loadProfilePhoto(ownerId: string, token: string, force = false) {
  if (!force && load?.ownerId === ownerId && load.token === token) return;
  load?.controller.abort();
  const request: Load = { ownerId, token, controller: new AbortController(), error: "" };
  load = request; emit();
  try {
    if (load !== request || request.controller.signal.aborted) return;
    const response = await api.get<Blob>(`/user/${encodeURIComponent(ownerId)}/photo`, { responseType: "blob", signal: request.controller.signal });
    if (load !== request || request.controller.signal.aborted) return;
    if (response.status === 204) { if (photo) URL.revokeObjectURL(photo.src); photo = null; emit(); return; }
    if (!(response.data instanceof Blob) || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(response.data.type)) throw new Error("Imagem inválida.");
    const src = URL.createObjectURL(response.data);
    if (photo) URL.revokeObjectURL(photo.src);
    photo = { ownerId, token, src }; emit();
  } catch (cause) {
    if (load !== request || request.controller.signal.aborted) return;
    if (load !== request || request.controller.signal.aborted) return;
    if (axios.isAxiosError(cause) && cause.response?.status === 401) {
      clearSession(); return;
    }
    request.error = "Não foi possível carregar sua foto. Tente novamente."; emit();
  }
}

export function useProfilePhoto(ownerId: string | undefined, token: string | null) {
  useEffect(() => { if (ownerId && token) void loadProfilePhoto(ownerId, token); }, [ownerId, token]);
  return useSyncExternalStore(subscribe, () => photo && photo.ownerId === ownerId && photo.token === token ? photo.src : null, () => null);
}

export function useProfilePhotoError(ownerId: string, token: string | null) {
  return useSyncExternalStore(subscribe, () => load?.ownerId === ownerId && load.token === token ? load.error : "", () => "");
}
