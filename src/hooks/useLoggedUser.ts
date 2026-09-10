import { useCallback, useEffect, useState } from "react";
import api from "../axios/Axios";

export interface LoggedUser {
  [key: string]: unknown;
}

interface UseLoggedUserOptions {
  /** Texto usado quando não há nome salvo. Padrão: "Usuário". */
  fallbackName?: string;
  /** Se true, busca /user/me para atualizar nome/foto (padrão: true). */
  refreshFromApi?: boolean;
}

function readStoredUser(): LoggedUser | null {
  if (typeof window === "undefined") return null;
  const raw =
    window.localStorage.getItem("user") ??
    window.sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as LoggedUser;
    }
    return null;
  } catch {
    return null;
  }
}

function readStoredRole(fallback: string | null): string | null {
  if (typeof window === "undefined") return fallback;
  return (
    window.localStorage.getItem("tipoUsuario") ??
    window.sessionStorage.getItem("tipoUsuario") ??
    fallback
  );
}

function pickFirstString(
  user: LoggedUser | null,
  keys: string[]
): string | null {
  if (!user) return null;
  for (const key of keys) {
    const value = user[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

function getDisplayName(
  user: LoggedUser | null,
  fallbackName: string
): string {
  const nome =
    pickFirstString(user, [
      "name",
      "nome",
      "razaoSocial",
      "companyName",
      "fantasyName",
      "nomeFantasia",
      "displayName",
      "fullName",
      "email",
    ]) ?? fallbackName;
  return nome;
}

function getInitials(displayName: string): string {
  const partes = displayName.split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function bytesToBase64(bytes: number[] | Uint8Array): string {
  const CHUNK = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const chunk = Array.prototype.slice.call(bytes, i, i + CHUNK) as number[];
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function detectMimeFromBytes(bytes: ArrayLike<number>): string {
  const b0 = bytes[0];
  const b1 = bytes[1];
  const b2 = bytes[2];
  const b3 = bytes[3];
  if (b0 === 0xff && b1 === 0xd8 && b2 === 0xff) return "image/jpeg";
  if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47)
    return "image/png";
  if (b0 === 0x47 && b1 === 0x49 && b2 === 0x46) return "image/gif";
  if (
    bytes.length >= 12 &&
    b0 === 0x52 &&
    b1 === 0x49 &&
    b2 === 0x46 &&
    b3 === 0x46
  ) {
    return "image/webp";
  }
  return "image/jpeg";
}

function guessMimeFromBase64(base64: string): string {
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBOR")) return "image/png";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}

function normalizePhotoValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "string") {
    const v = value.trim();
    if (v.length === 0) return null;
    if (
      v.startsWith("data:") ||
      v.startsWith("http://") ||
      v.startsWith("https://") ||
      v.startsWith("blob:")
    ) {
      return v;
    }
    const semPrefixo = v.includes(",") ? (v.split(",").pop() ?? "") : v;
    const base64 = semPrefixo.replace(/\s/g, "");
    if (base64.length < 50 || !/^[A-Za-z0-9+/=_-]+$/.test(base64)) return null;
    return `data:${guessMimeFromBase64(base64)};base64,${base64}`;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const data = obj["data"];
    if (typeof data === "string") return normalizePhotoValue(data);
    if (Array.isArray(data)) {
      const bytes = data.filter(
        (n): n is number => typeof n === "number"
      );
      if (bytes.length === 0) return null;
      return `data:${detectMimeFromBytes(bytes)};base64,${bytesToBase64(bytes)}`;
    }
    if (data instanceof Uint8Array) {
      if (data.length === 0) return null;
      return `data:${detectMimeFromBytes(data)};base64,${bytesToBase64(data)}`;
    }
  }

  return null;
}

function getPhotoSrc(user: LoggedUser | null): string | null {
  if (!user) return null;
  const keys = [
    "photo",
    "foto",
    "avatar",
    "picture",
    "image",
    "photoUrl",
    "fotoUrl",
    "avatarUrl",
    "imageUrl",
    "profilePhoto",
    "fotoPerfil",
  ];
  for (const key of keys) {
    const normalized = normalizePhotoValue(user[key]);
    if (normalized) return normalized;
  }
  return null;
}

function saveUserToSameStorage(user: LoggedUser): void {
  if (typeof window === "undefined") return;
  const hasLocal = window.localStorage.getItem("user") !== null;
  const target = hasLocal ? window.localStorage : window.sessionStorage;
  try {
    target.setItem("user", JSON.stringify(user));
  } catch {
    // localStorage estoura com foto grande em base64: salva sem a foto
    // para não perder token/nome.
    try {
      const { photo: _photo, ...semFoto } = user;
      void _photo;
      target.setItem("user", JSON.stringify(semFoto));
    } catch {
      // sem armazenamento: mantém só em memória
    }
  }
}

export function useLoggedUser(options?: UseLoggedUserOptions) {
  const fallbackName = options?.fallbackName ?? "Usuário";
  const refreshFromApi = options?.refreshFromApi ?? true;

  const [user, setUser] = useState<LoggedUser | null>(() =>
    readStoredUser()
  );

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token =
      window.localStorage.getItem("token") ??
      window.sessionStorage.getItem("token");
    if (!token) return;
    try {
      const { data } = await api.get("/user/me");
      const fresh = (data?.user ?? data?.usuario ?? null) as
        | LoggedUser
        | null;
      if (fresh && typeof fresh === "object") {
        setUser(fresh);
        saveUserToSameStorage(fresh);
      }
    } catch {
      // Mantém o que já está no storage (ex.: API offline).
    }
  }, []);

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  useEffect(() => {
    if (!refreshFromApi) return;
    void refresh();
  }, [refresh, refreshFromApi]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user") setUser(readStoredUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const displayName = getDisplayName(user, fallbackName);
  const firstName = displayName.split(" ")[0] || fallbackName;

  return {
    user,
    displayName,
    firstName,
    initials: getInitials(displayName),
    photoSrc: getPhotoSrc(user),
    email: pickFirstString(user, ["email"]),
    role:
      pickFirstString(user, ["role"]) ??
      readStoredRole(null) ??
      null,
    refresh,
  };
}
