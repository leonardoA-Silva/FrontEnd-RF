export interface GoogleProfile { credential: string; email: string; name: string; expiresAt: number }

// Claims only prefill the form. The backend verifies the signature and audience.
export function googleProfile(credential: string): GoogleProfile {
  try {
    const part = credential.split(".")[1];
    const bytes = Uint8Array.from(atob(part.replace(/-/g, "+").replace(/_/g, "/")), char => char.charCodeAt(0));
    const claims: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!claims || typeof claims !== "object" || !("email" in claims) || typeof claims.email !== "string" || !("exp" in claims) || typeof claims.exp !== "number" || claims.exp * 1000 <= Date.now()) throw new Error();
    return { credential, email: claims.email, name: "name" in claims && typeof claims.name === "string" ? claims.name : "", expiresAt: claims.exp * 1000 };
  } catch { throw new Error("A identificação do Google expirou. Escolha sua conta novamente."); }
}
