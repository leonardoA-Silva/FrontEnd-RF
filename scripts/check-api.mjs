import assert from "node:assert/strict";
import { io } from "socket.io-client";

// Somente leitura: não cria usuários, reservas, mensagens ou pagamentos.
const base = (process.env.RF_CHECK_API_URL || "http://127.0.0.1:5174/api/reaproveitafranca").replace(/\/$/, "");
async function request(path, expected) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, expected, `${path}: HTTP ${response.status}, esperado ${expected}`);
  assert.match(response.headers.get("content-type") || "", /application\/json/);
  return response.json();
}
const products = await request("/product/", 200);
assert.ok(Array.isArray(products), "Catálogo deve retornar lista");
if (products.length) {
  const product = await request(`/product/${encodeURIComponent(products[0].id)}`, 200);
  assert.equal(product.id, products[0].id);
  assert.ok(["sale", "donation"].includes(product.type_negotiation));
  assert.ok(Array.isArray(product.photos));
}
await request("/product/invalid-id", 400);
for (const path of ["/user/", "/shopping/", "/localization/", "/card/", "/notification/", "/conversation/", "/environmental-impact/", "/payment/configuration"]) {
  const body = await request(path, 401);
  assert.equal(body.auth, false, `${path}: deve recusar sessão ausente`);
}
await new Promise((resolve, reject) => {
  const socket = io(new URL(base).origin, { autoConnect: false, reconnection: false, timeout: 10000, transports: ["websocket"] });
  const timer = setTimeout(() => { socket.disconnect(); reject(new Error("Socket.IO sem resposta")); }, 12000);
  // O servidor aceita o transporte anônimo, mas protege cada operação do chat.
  socket.on("connect", () => {
    socket.timeout(10000).emit("load_messages", { conversationId: "00000000-0000-4000-8000-000000000001" }, (error, response) => {
      clearTimeout(timer); socket.disconnect();
      if (!error && /autentica/i.test(response?.error || "")) resolve();
      else reject(new Error("Chat não confirmou recusa de operação sem autenticação"));
    });
  });
  socket.on("connect_error", error => {
    clearTimeout(timer); socket.disconnect();
    if (/jwt|token|autentica/i.test(error.message)) resolve(); else reject(new Error("Socket.IO não confirmou recusa de autenticação"));
  });
  socket.connect();
});
console.log("API: catálogo, detalhes, validação, 8 rotas protegidas e autenticação Socket.IO verificados sem escrita.");
