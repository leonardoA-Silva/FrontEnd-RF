import { useSyncExternalStore } from "react";

// Session-only media: never persist photos or object URLs in browser storage.
let photo: { ownerId: string; token: string; src: string } | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

export function clearProfilePhoto() {
  if (!photo) return;
  URL.revokeObjectURL(photo.src);
  photo = null;
  emit();
}

export function saveProfilePhoto(ownerId: string, token: string, file: Blob) {
  const src = URL.createObjectURL(file);
  if (photo) URL.revokeObjectURL(photo.src);
  photo = { ownerId, token, src };
  emit();
}

export function useProfilePhoto(ownerId: string | undefined, token: string | null) {
  return useSyncExternalStore(subscribe, () => photo && photo.ownerId === ownerId && photo.token === token ? photo.src : null, () => null);
}
