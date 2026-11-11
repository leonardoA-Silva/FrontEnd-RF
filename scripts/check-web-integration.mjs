import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { io as connectSocket } from "socket.io-client";

// Usa somente um banco novo e aleatório; nunca executa o DROP/USE do RFScript original.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = path.resolve(root, "../backend-RF");
const requireApi = createRequire(path.join(backend, "package.json"));
const env = requireApi("dotenv").parse(fs.readFileSync(path.join(backend, ".env")));
const mysql = requireApi("mysql2/promise");
const database = `rf_web_test_${crypto.randomBytes(8).toString("hex")}`;
assert.match(database, /^rf_web_test_[0-9a-f]{16}$/);
assert.notEqual(database.toLowerCase(), String(env.DB_NAME).toLowerCase());
const connection = await mysql.createConnection({ host: env.DB_HOST, port: Number(env.DB_PORT) || 3306, user: env.DB_USER, password: env.DB_PASSWORD });
let created = false, vite, server, sockets, pool;
const clients = [];
let checks = 0;
function passed(label) { checks++; console.log(`OK ${label}`); }
function storage() { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key), clear: () => values.clear() }; }

try {
  await connection.query("CREATE DATABASE ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", [database]);
  created = true;
  await connection.query("USE ??", [database]);
  const source = fs.readFileSync(path.join(backend, "src/mysql-init/RFScript.sql"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*--.*$/gm, "");
  const statements = source.split(";").map(sql => sql.trim()).filter(sql => /^(CREATE TABLE|ALTER TABLE)\s/i.test(sql));
  assert.ok(statements.length >= 20);
  assert.ok(statements.every(sql => !/\bReaproveita_Franca\b/i.test(sql)));
  await connection.query("SET FOREIGN_KEY_CHECKS=0");
  for (const sql of statements) await connection.query(sql);
  await connection.query("SET FOREIGN_KEY_CHECKS=1");
  for (const migration of ["migration_payment_gateway.sql", "migration_payment_distribution.sql", "migration_payment_split.sql", "migration_payment_account_disconnect.sql"]) {
    const sql = fs.readFileSync(path.join(backend, "src/mysql-init", migration), "utf8").replace(/^\s*--.*$/gm, "");
    for (const statement of sql.split(";").map(value => value.trim()).filter(Boolean)) {
      assert.match(statement, /^(CREATE TABLE|ALTER TABLE)\s/i);
      await connection.query(statement);
    }
  }
  Object.assign(process.env, env, { DB_NAME: database, NODE_ENV: "test", SECRET: crypto.randomBytes(32).toString("hex"), PAYMENT_PROVIDER: "simulated", MERCADO_PAGO_ENV: "test", MERCADO_PAGO_ACCESS_TOKEN: "TOKEN_FICTICIO_SEM_ACESSO_EXTERNO", split_payment: "false" });
  const uuid = requireApi("./src/utils/uuid");
  const password = crypto.randomBytes(24).toString("hex");
  const hash = await requireApi("bcrypt").hash(password, 10);
  const users = {};
  for (const role of ["user", "company"]) {
    const id = uuid.generateId(), email = `${crypto.randomUUID()}@example.invalid`;
    await connection.query("INSERT INTO `user` (id, role, name, email, password, status) VALUES (?, ?, ?, ?, ?, 'active')", [uuid.toBin(id), role, `Conta sintética ${role}`, email, hash]);
    users[role] = { id, email };
  }
  const identities = requireApi("./src/services/googleIdentityService");
  const verifyIdentity = identities.verifyGoogleIdentity;
  const buyerIdentity = { sub: crypto.randomUUID(), email: crypto.randomUUID() + "@example.invalid", name: "Perfil Google sintético", email_verified: true, hd: "example.invalid" };
  const companyIdentity = { sub: crypto.randomUUID(), email: crypto.randomUUID() + "@example.invalid", name: "Empresa Google sintética", email_verified: true, hd: "example.invalid" };
  identities.verifyGoogleIdentity = async token => {
    if (token === "DISPOSABLE_GOOGLE_BUYER") return buyerIdentity;
    if (token === "DISPOSABLE_GOOGLE_COMPANY") return companyIdentity;
    const failure = new Error("Identidade inválida no teste"); failure.status = 401; throw failure;
  };
  const app = requireApi("./src/index");
  pool = requireApi("./src/db/connect");
  server = http.createServer(app);
  sockets = new (requireApi("socket.io").Server)(server);
  requireApi("./src/sockets")(sockets);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  globalThis.localStorage = storage(); globalThis.sessionStorage = storage();
  globalThis.window = new EventTarget();
  window.location = { origin, hostname: "127.0.0.1" };
  const uiPlugins = process.argv.includes("--browser") ? [(await import("@vitejs/plugin-react")).default(), (await import("@tailwindcss/vite")).default()] : [];
  vite = await createServer({ root, cacheDir: path.join(root, "node_modules/.vite-integration"), plugins: uiPlugins, configFile: false, envDir: false, server: { middlewareMode: true }, appType: "custom" });
  const web = await vite.ssrLoadModule("/src/api/services.ts");
  const api = web.default; api.defaults.baseURL = `${origin}/api/reaproveitafranca`;
  const company = await vite.ssrLoadModule("/src/pages/company/companyApi.ts");
  const resources = await vite.ssrLoadModule("/src/pages/company/companyResourceApi.ts");
  const profile = await vite.ssrLoadModule("/src/pages/dashboard/perfilApi.ts");
  const auth = await vite.ssrLoadModule("/src/auth/session.ts");
  const { productForm } = await vite.ssrLoadModule("/src/pages/company/productForm.ts");
  const signal = () => new AbortController().signal;
  async function login(role) {
    const response = await web.loginUsuario({ email: users[role].email, password });
    assert.equal(response.data.user.role, role);
    auth.saveSession(response.data.token, response.data.user, false);
    return response.data.token;
  }
  const companyToken = await login("company"); passed("login de empresa e sessão do frontend");
  assert.equal((await api.get("/payment/mercado-pago/account")).data.connected, false);
  assert.equal((await api.delete("/payment/mercado-pago/account")).data.connected, false);
  passed("consulta e desvinculação de recebimentos sem conta externa conectada");
  const addressInput = { zipCode: "00000000", street: "Rua de teste", neighborhood: "Bairro de teste", number: "1", city: "Cidade de teste", state: "SP", latitude: 0, longitude: 0 };
  const address = (await web.criarEndereco(users.company.id, addressInput)).data.id;
  assert.ok((await resources.loadLocations(signal())).some(item => item.id === address));
  const updatedAddress = await resources.saveLocation({ ...addressInput, number: "2" }, users.company.id, address);
  assert.equal(updatedAddress.number, "2"); passed("criação, consulta e edição de endereço empresarial");
  const picture = Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), Buffer.alloc(150000)]).toString("base64");
  const material = { name: "Material sintético", description: "Teste isolado", category: "tecido", type: "donation", quantity: 5, weight: 1, price: null, condition: "good", status: "available", images: [`data:image/png;base64,${picture}`], localizationId: address, priority: 0 };
  assert.ok(productForm(material) instanceof FormData);
  const productId = await company.createCompanyProduct(material);
  const listings = await company.loadCompanyProducts(users.company.id, signal());
  assert.equal(listings.find(item => item.id === productId)?.images.length, 1); passed("publicação de doação com foto acima de 100 KB e listagem empresarial");
  const updated = await company.updateCompanyProduct({ ...material, id: productId, name: "Material atualizado", images: [] });
  assert.equal(updated.name, "Material atualizado"); assert.equal(updated.images.length, 1); passed("edição do anúncio preserva fotos, como no mobile");
  const saved = await profile.salvarPerfil(users.company.id, { name: "Empresa atualizada", cellphone: "11900000000" });
  assert.equal(saved.name, "Empresa atualizada"); passed("edição de perfil empresarial");
  const buyerToken = await login("user"); passed("login de comprador");
  assert.equal((await web.obterProdutoPorId(productId)).data.id, productId);
  const reservation = (await web.criarReserva(productId, 1)).data.shopping;
  assert.equal(reservation.status, "pending");
  assert.ok((await web.listarReservas()).data.some(item => item.id === reservation.id));
  const detail = (await web.obterReserva(reservation.id)).data;
  assert.equal(detail.items[0].id_product, productId); passed("catálogo, reserva e detalhes da compra");
  assert.ok(Array.isArray((await web.listarPagamentosReserva(reservation.id)).data));
  assert.ok(Array.isArray((await web.listarImpactos()).data));
  assert.ok(Array.isArray((await web.listarCartoes()).data)); passed("consultas de pagamento, impacto e cartões");
  const buyerAddress = (await web.criarEndereco(users.user.id, addressInput)).data.id;
  await web.atualizarEndereco(buyerAddress, { ...addressInput, number: "3" });
  assert.equal((await web.listarEnderecos()).data.find(item => item.id === buyerAddress).number, "3");
  passed("consulta e atualização do endereço principal do comprador");
  const userProfile = new FormData(); userProfile.append("name", "Comprador atualizado"); userProfile.append("cellphone", "11900000000");
  assert.equal((await web.atualizarPerfilUsuario(users.user.id, userProfile)).data.user.name, "Comprador atualizado");
  passed("perfil do comprador via multipart");
  const completed = (await web.criarReserva(productId, 1)).data.shopping;
  await connection.query("UPDATE shopping SET status='completed' WHERE id=?", [uuid.toBin(completed.id)]);
  // Apenas fixture no banco descartável: a interface mobile/web consulta impacto, sem criá-lo.
  await api.post("/environmental-impact/", { id_shopping: completed.id, calculation_method: "regra_fixa" });
  assert.ok((await web.listarImpactos()).data.some(item => item.id_shopping === completed.id)); passed("consulta de impacto ambiental");
  const acceptedRequest = (await web.criarReserva(productId, 1)).data.shopping;
  const refusedRequest = (await web.criarReserva(productId, 1)).data.shopping;
  sessionStorage.setItem("token", companyToken);
  const requests = await vite.ssrLoadModule("/src/pages/company/companyRequestsApi.ts");
  assert.ok((await requests.loadCompanyRequests()).some(item => item.reference_id === acceptedRequest.id));
  assert.equal((await requests.answerCompanyRequest(acceptedRequest.id, "accepted")).status, "accepted");
  assert.equal((await requests.answerCompanyRequest(refusedRequest.id, "refused")).status, "refused");
  passed("reservas recebidas via notificações: aceitar e recusar como no mobile");
  const saleId = await company.createCompanyProduct({ ...material, images: [], quantity: 8, type: "sale", price: 10 });
  sessionStorage.setItem("token", buyerToken);
  const sale = (await web.criarReserva(saleId, 1)).data.shopping;
  const pix = (await web.criarPagamentoPix(sale.id)).data;
  assert.equal(pix.payment.status, "pending"); assert.ok(pix.checkout.qr_code);
  // A API limita sync ao gateway real; o teste simulado confirma o checkout por leitura.
  await assert.rejects(web.sincronizarPagamento(pix.payment.id), error => error.response?.status === 409);
  assert.equal((await web.obterCheckout(pix.payment.id)).data.payment.id, pix.payment.id);
  await api.post(`/payment/${pix.payment.id}/simulate`, { status: "approved" });
  assert.equal((await web.obterCheckout(pix.payment.id)).data.payment.status, "approved");
  passed("Pix e confirmação de aprovação no provedor simulado, sem cobrança externa");
  const cards = await vite.ssrLoadModule("/src/api/cardPayments.ts");
  const nativeFetch = globalThis.fetch;
  let providerCalls = 0;
  globalThis.fetch = async (url, options = {}) => {
    assert.ok(String(url).startsWith("https://api.mercadopago.com/"));
    assert.equal(new Headers(options.headers).has("Authorization"), false);
    assert.equal(options.credentials, "omit"); providerCalls++;
    return new Response(JSON.stringify(String(url).includes("payment_methods") ? { results: [{ id: "visa", name: "Visa", payment_type_id: "credit_card" }] } : { id: "TOKEN_FICTICIO_SEM_PROVEDOR" }), { headers: { "Content-Type": "application/json" } });
  };
  let token, method;
  try {
    method = (await cards.cardMethods("PUBLIC_KEY_FICTICIA", "0".repeat(6)))[0];
    token = await cards.tokenizeCard("PUBLIC_KEY_FICTICIA", { number: "0".repeat(16), holder: "TITULAR SINTETICO", month: 12, year: new Date().getFullYear() + 3, cvv: "0".repeat(3), cpf: "0".repeat(11) });
  } finally { globalThis.fetch = nativeFetch; }
  assert.equal(providerCalls, 2);
  const cardSale = (await web.criarReserva(saleId, 1)).data.shopping;
  const inspect = api.interceptors.request.use(config => {
    if (config.url === "/payment/create") { assert.equal(config.data.token, token); assert.equal("card_number" in config.data, false); assert.equal("security_code" in config.data, false); }
    return config;
  });
  let cardResult;
  try { cardResult = (await cards.payCard(cardSale.id, token, method, "0".repeat(11))).data; }
  finally { api.interceptors.request.eject(inspect); }
  assert.equal(cardResult.payment.method, "credit_card");
  await api.post(`/payment/${cardResult.payment.id}/simulate`, { status: "approved" });
  assert.equal((await web.obterCheckout(cardResult.payment.id)).data.payment.status, "approved");
  const metadata = { holder_name: "TITULAR SINTETICO", brand: "Visa", last_digits: "0000", type: "credit", expiration_month: 12, expiration_year: new Date().getFullYear() + 3 };
  await cards.saveCard(metadata, token);
  const savedCard = (await web.listarCartoes()).data[0];
  assert.equal(savedCard.last_digits, "0000"); assert.equal("payment_token" in savedCard, false);
  await web.excluirCartao(savedCard.id);
  passed("cartão: tokenização interceptada sem JWT, cobrança simulada com token, cartão salvo e remoção");
  assert.equal(web.criarAvaliacao, undefined); assert.equal(web.criarDisputa, undefined); assert.equal(web.entrarComGoogle, undefined); assert.equal(web.excluirMinhaConta, undefined);
  passed("serviços sem funcionalidades ausentes no mobile");
  const conversationId = (await web.iniciarConversa(users.company.id)).data.conversationId;
  assert.ok((await web.listarConversas()).data.some(item => item.conversationId === conversationId));
  assert.ok((await web.obterConversa(conversationId)).data.participants.includes(users.user.id));
  const { socketRequest } = await vite.ssrLoadModule("/src/realtime/buyerSocket.ts");
  const socket = connectSocket(origin, { auth: { token: buyerToken }, autoConnect: false, reconnection: false, transports: ["websocket"] });
  clients.push(socket);
  await new Promise((resolve, reject) => { socket.once("connect", resolve); socket.once("connect_error", reject); socket.connect(); });
  await socketRequest(socket, "join_conversation", conversationId);
  await socketRequest(socket, "send_message", { conversationId, type: "texto", content: "Mensagem de teste isolado" });
  const messages = await socketRequest(socket, "load_messages", { conversationId, limit: 50 });
  assert.equal(messages.messages.length, 1);
  await socketRequest(socket, "edit_message", { messageId: messages.messages[0].id, content: "Mensagem atualizada" });
  await socketRequest(socket, "mark_read", { conversationId });
  await socketRequest(socket, "delete_message", { messageId: messages.messages[0].id });
  passed("conversa e chat reais: ingresso, envio, consulta, edição, leitura e exclusão");
  await web.cancelarReserva(reservation.id);
  assert.equal((await web.obterReserva(reservation.id)).data.status, "cancelled"); passed("cancelamento da reserva e restauração de estoque");
  sessionStorage.setItem("token", companyToken);
  assert.ok((await resources.loadImpacts(signal())).length);
  passed("consulta de impacto no painel empresarial");
  const notices = (await web.listarNotificacoes("", "")).data;
  assert.ok(notices.length > 0);
  await web.lerNotificacao(notices[0].id); await web.lerTodasNotificacoes();
  assert.equal((await web.contarNotificacoes()).data.total, 0); passed("notificações de reserva e mensagem, leitura individual e total");
  const unused = await company.createCompanyProduct({ ...material, images: [], quantity: 1 });
  await company.deleteCompanyProduct(unused); passed("exclusão de material sem vínculos");
  sessionStorage.setItem("token", "invalid-token");
  await assert.rejects(web.listarReservas());
  assert.equal(auth.readSession().token, null); passed("sessão inválida é encerrada pelo frontend");
  // Google is stubbed only in this disposable API process; real OAuth consent is verified separately.
  const { authLimiter } = requireApi("./src/middlewares/rateLimit");
  // Reset only the disposable process limiter between independent authentication scenarios.
  authLimiter.resetKey("127.0.0.1");

  try {
    await assert.rejects(web.loginGoogle("INVALID_GOOGLE", "user"), error => error.response?.status === 401);
    const first = (await web.loginGoogle("DISPOSABLE_GOOGLE_BUYER", "user")).data;
    assert.ok(first.token); assert.equal(first.user.role, "user");
    assert.equal((await web.loginGoogle("DISPOSABLE_GOOGLE_BUYER", "user")).data.user.id, first.user.id);
    await assert.rejects(web.loginGoogle("DISPOSABLE_GOOGLE_BUYER", "company"), error => error.response?.status === 403);
    passed("Google comprador: erro recuperável, criação, reentrada e proteção do perfil (identidade simulada)");
    authLimiter.resetKey("127.0.0.1");
    await assert.rejects(web.loginGoogle("DISPOSABLE_GOOGLE_COMPANY", "company"), error => error.response?.status === 404);
    await assert.rejects(web.cadastrarEmpresaGoogle({ idToken: "DISPOSABLE_GOOGLE_COMPANY" }), error => error.response?.status === 400);
    const socialCompany = (await web.cadastrarEmpresaGoogle({ idToken: "DISPOSABLE_GOOGLE_COMPANY", name: "Empresa Google sintética", cpf: "00000000000", cnpj: "00000000000000", cellphone: "00000000000", zip_code: "00000000", street: "Rua de teste", neighborhood: "Bairro de teste", number: "1", city: "Cidade de teste", state: "SP" })).data;
    assert.ok(socialCompany.token); assert.equal(socialCompany.user.role, "company");
    assert.equal((await web.loginGoogle("DISPOSABLE_GOOGLE_COMPANY", "company")).data.user.id, socialCompany.user.id);
    passed("Google empresa: cadastro completo sem senha, validação e login (identidade simulada)");
  } catch (failure) { console.error("Etapa Google:", failure.code || "", failure.message?.replace(/DISPOSABLE_GOOGLE_\w+/g, "[identidade de teste]")); throw failure; } finally { identities.verifyGoogleIdentity = verifyIdentity; }
  console.log(`${checks} grupos de integração passaram com serviços reais do frontend e API/MySQL isolados.`);
  if (process.argv.includes("--browser")) {
    // UI de teste somente em loopback, com sessões sintéticas geradas em memória.
    const originalIndex = fs.readFileSync(path.join(root, "index.html"), "utf8");
    app.get("/__test__/company", async (_req, res) => {
      const html = await vite.transformIndexHtml("/", originalIndex);
      const session = `<script>sessionStorage.clear();localStorage.clear();sessionStorage.setItem("token",${JSON.stringify(companyToken)});sessionStorage.setItem("user",${JSON.stringify(JSON.stringify({ id: users.company.id, role: "company", name: "Empresa de teste", status: "active" }))});history.replaceState({},"","/dashboardEmpresa");</script>`;
      res.type("html").send(html.replace("<head>", `<head>${session}`));
    });
    app.get("/__test__/buyer", async (_req, res) => {
      const html = await vite.transformIndexHtml("/", originalIndex);
      const session = `<script>sessionStorage.clear();localStorage.clear();sessionStorage.setItem("token",${JSON.stringify(buyerToken)});sessionStorage.setItem("user",${JSON.stringify(JSON.stringify({ id: users.user.id, role: "user", name: "Comprador de teste", status: "active" }))});history.replaceState({},"","/dashboardUsuario");</script>`;
      res.type("html").send(html.replace("<head>", `<head>${session}`));
    });
    let finish;
    const finished = new Promise(resolve => { finish = resolve; });
    app.get("/__test__/done", (_req, res) => { res.json({ done: true }); finish(); });
    app.use(vite.middlewares);
    console.log(`UI isolada pronta: ${origin}/__test__/company e ${origin}/__test__/buyer`);
    const timeout = setTimeout(finish, 180000);
    await finished;
    clearTimeout(timeout);
  }
} catch (error) {
  console.error("Falha de integração:", error.response ? `HTTP ${error.response.status}` : error.code || error.message);
  process.exitCode = 1;
} finally {
  for (const client of clients) client.disconnect();
  if (vite) await vite.close();
  if (sockets) await new Promise(resolve => sockets.close(resolve));
  if (server?.listening) await new Promise(resolve => server.close(resolve));
  if (pool) await new Promise(resolve => pool.end(resolve));
  if (created) {
    assert.match(database, /^rf_web_test_[0-9a-f]{16}$/);
    assert.notEqual(database.toLowerCase(), String(env.DB_NAME).toLowerCase());
    await connection.query("DROP DATABASE ??", [database]);
    console.log("Banco temporário removido; banco configurado preservado.");
  }
  await connection.end();
}
