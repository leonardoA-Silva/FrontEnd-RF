const officialOrigin = "https://reaproveitafranca.vercel.app";
const authorizedOrigins = new Set([
  officialOrigin,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174"
]);

// Keep OAuth on stable origins. Preview hosts change on every deployment.
export function googleAuthTarget(origin: string, pathname: string, accountType: "company" | "user") {
  if (authorizedOrigins.has(origin)) return null;
  const path = ["/login", "/cadastro-empresa", "/cadastro-pessoal"].includes(pathname) ? pathname : "/login";
  const target = new URL(path, officialOrigin);
  if (path === "/login") target.searchParams.set("perfil", accountType === "user" ? "comprador" : "empresa");
  return target.href;
}
