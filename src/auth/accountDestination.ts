export function accountDestination(role: string, from: unknown) {
  const origin = typeof from === "string" ? from : "";
  const path = origin.split(/[?#]/, 1)[0];
  if (role === "admin" && /^\/admin\/(?:usuarios|anuncios|novo-admin)\/?$/.test(path)) return origin;
  if (role === "company" && /^\/(?:dashboardEmpresa(?:\/[A-Za-z0-9_-]+)*|mapaEmpresas)\/?$/.test(path)) return origin;
  if (role !== "company" && /^\/(?:dashboardUsuario|marketplace(?:\/[A-Za-z0-9_-]+)*)\/?$/.test(path)) return origin;
  return role === "company" ? "/dashboardEmpresa" : "/dashboardUsuario";
}
