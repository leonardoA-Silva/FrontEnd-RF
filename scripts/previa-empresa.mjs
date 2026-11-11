import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";

// Servidor independente de demonstração; não altera a autenticação da aplicação.
const root = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(root, "dist");
for (const [entry, args] of [
  ["node_modules/typescript/bin/tsc", ["-b"]],
  ["node_modules/vite/bin/vite.js", ["build"]],
]) {
  const result = spawnSync(process.execPath, [resolve(root, entry), ...args], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, VITE_API_URL: "/api/reaproveitafranca" },
  });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}

const userId = randomUUID();
let profile = { id: userId, name: "Empresa de demonstração", email: "", cellphone: "" };
const products = [
  { name: "Retalhos de tecido", category: "tecido", weight: 120, quantity: 12, type_negotiation: "donation", price: null },
  { name: "Pallets de madeira", category: "madeira", weight: 80, quantity: 8, type_negotiation: "sale", price: 30 },
  { name: "Aparas de borracha", category: "borracha", weight: 50, quantity: 5, type_negotiation: "donation", price: null },
  { name: "Sobras de papelão", category: "papel/papelao", weight: 30, quantity: 10, type_negotiation: "sale", price: 6 },
].map((product) => ({ ...product, id: randomUUID(), id_user: userId,
  description: "Material fictício para conhecer a interface. Nenhum anúncio real será publicado.",
  status: "available", priority: 0, conservation_state: "good", id_localization: "local-demonstracao" }));

const bootstrap = `<script>
sessionStorage.setItem('token', 'previa-local-sem-autenticacao');
sessionStorage.setItem('user', JSON.stringify({id:'${userId}',name:'Empresa de demonstração',role:'company'}));
</script>`;
const banner = `<aside style="padding:12px 16px;background:#173f32;color:white;font:14px/1.6 system-ui;text-align:center" aria-label="Modo de demonstração">
<strong>Prévia local · sem API</strong> — Dados fictícios e alterações temporárias. Não informe dados pessoais.
<nav style="display:flex;flex-wrap:wrap;gap:8px 20px;justify-content:center" aria-label="Telas da prévia">
${[["/dashboardEmpresa", "Painel"], ["/dashboardEmpresa/materiais", "Materiais"], ["/dashboardEmpresa/materiais/novo", "Publicar"], ["/mapaEmpresas", "Mapa"], ["/dashboardEmpresa/indicadores", "Indicadores"], ["/dashboardEmpresa/negociacoes", "Histórico"], ["/dashboardEmpresa/perfil", "Perfil"], ["/sobre", "Sobre Nós"]].map(([href, label]) => `<a style="color:white;text-decoration:underline;min-height:32px;display:inline-flex;align-items:center" href="${href}">${label}</a>`).join("")}
</nav></aside>`;
const html = (await readFile(resolve(dist, "index.html"), "utf8"))
  .replace("<head>", `<head>${bootstrap}`)
  .replace(/<body[^>]*>/, match => `${match}${banner}`);
const mimeTypes = { ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".ico": "image/x-icon" };

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 50_000) throw new Error("Corpo muito grande");
  }
  return JSON.parse(body || "{}");
}

const server = createServer(async (request, response) => {
  const send = (status, data) => {
    response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    response.end(JSON.stringify(data));
  };
  try {
    const path = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    if (path.startsWith("/api/")) {
      const endpoint = path.replace(/^\/api\/reaproveitafranca/, "").replace(/\/$/, "");
      if (request.method === "GET" && endpoint === "/product") return send(200, products);
      if (request.method === "GET" && endpoint === `/user/${userId}`) return send(200, profile);
      if (request.method === "PUT" && endpoint === `/user/${userId}`) {
        const fields = await readJson(request);
        if (typeof fields.name !== "string" || !fields.name.trim() || !/^\d{11}$/.test(fields.cellphone)) {
          return send(400, { error: "Confira o nome e o celular do exemplo." });
        }
        profile = { ...profile, name: fields.name.trim(), cellphone: fields.cellphone };
        return send(200, { user: profile });
      }
      // Endereço é descartado: somente um identificador de demonstração é retornado.
      if (request.method === "POST" && endpoint === "/localization") {
        await readJson(request);
        return send(201, { id: "local-demonstracao" });
      }
      if (request.method === "POST" && endpoint === "/product/create") {
        const fields = await readJson(request);
        if (typeof fields.name !== "string" || !["sale", "donation"].includes(fields.type_negotiation)) {
          return send(400, { error: "Confira os dados do material de exemplo." });
        }
        if (fields.type_negotiation === "sale" && !(Number(fields.price) > 0)) {
          return send(400, { error: "Informe o preço de venda do exemplo." });
        }
        const product = { ...fields, id: randomUUID(), id_user: userId,
          price: fields.type_negotiation === "donation" ? null : Number(fields.price) };
        products.unshift(product);
        return send(201, { id: product.id, message: "Material adicionado somente à prévia local." });
      }
      return send(404, { error: "Esta ação não está disponível na prévia local." });
    }
    if (request.method !== "GET" && request.method !== "HEAD") return send(405, { error: "Método não permitido." });
    if (path === "/") {
      response.writeHead(302, { Location: "/dashboardEmpresa" });
      return response.end();
    }
    const file = resolve(dist, `.${path}`);
    const relativePath = relative(dist, file);
    if (relativePath.startsWith("..") || relativePath.includes(":")) return send(403, { error: "Acesso não permitido." });
    if (extname(file)) {
      const contents = await readFile(file);
      response.writeHead(200, { "Content-Type": mimeTypes[extname(file)] || "application/octet-stream" });
      return response.end(contents);
    }
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    response.end(html);
  } catch {
    send(404, { error: "Conteúdo não disponível na prévia local." });
  }
});
server.on("error", () => {
  console.error("Não foi possível abrir a prévia na porta 5187. Verifique se ela já está em execução.");
  process.exitCode = 1;
});
server.listen(5187, "127.0.0.1", () => {
  console.log("Prévia sem API: http://127.0.0.1:5187/dashboardEmpresa");
});
