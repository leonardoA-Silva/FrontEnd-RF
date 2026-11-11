import test from "node:test";
import assert from "node:assert/strict";
import { createBuyerPreview, isBuyerPreviewPath } from "../src/preview/buyerPreview.mjs";

test("buyer preview returns fictional products and reservation details", async () => {
  const demo = createBuyerPreview();
  const products = await demo.request("GET", "/product");
  assert.ok(products.length > 0);
  const reservations = await demo.request("GET", "/shopping/");
  assert.ok(reservations.length > 0);
  assert.equal((await demo.request("GET", `/shopping/${reservations[0].id}`)).id, reservations[0].id);
});

test("buyer preview mutates only its in-memory data", async () => {
  const demo = createBuyerPreview();
  const address = (await demo.request("GET", "/localization/"))[0];
  await demo.request("DELETE", `/localization/${address.id}`);
  assert.equal((await demo.request("GET", "/localization/")).some(item => item.id === address.id), false);
  assert.ok((await createBuyerPreview().request("GET", "/localization/")).some(item => item.id === address.id));
});

test("buyer preview applies notification, card, and profile edits locally", async () => {
  const demo = createBuyerPreview();
  const notification = (await demo.request("GET", "/notification/"))[0];
  await demo.request("PATCH", `/notification/${notification.id}/read`);
  assert.equal((await demo.request("GET", "/notification/")).find(item => item.id === notification.id).read, "sim");
  const card = (await demo.request("GET", "/card/"))[0];
  await demo.request("PUT", `/card/${card.id}`, {}, { holder_name: "ANA DEMONSTRAÇÃO", expiration_month: 10, expiration_year: 2030 });
  assert.equal((await demo.request("GET", "/card/"))[0].holder_name, "ANA DEMONSTRAÇÃO");
  const profile = await demo.request("GET", "/user/demo-buyer");
  await demo.request("PUT", "/user/demo-buyer", {}, { name: "Ana Atualizada" });
  assert.equal((await demo.request("GET", "/user/demo-buyer")).name, "Ana Atualizada");
  assert.equal(profile.name, "Ana Artesã");
});

test("buyer preview rejects unknown requests instead of forwarding them", async () => {
  const demo = createBuyerPreview();
  await assert.rejects(demo.request("GET", "/unregistered-endpoint"), /not available in buyer preview/i);
});

test("only the exact buyer preview route enables demo transport", () => {
  assert.equal(isBuyerPreviewPath("/previa/dashboard/usuario"), true);
  assert.equal(isBuyerPreviewPath("/previa/dashboard/usuario/"), false);
  assert.equal(isBuyerPreviewPath("/dashboardUsuario"), false);
  assert.equal(isBuyerPreviewPath("/previa/dashboard/empresa"), false);
});

test("buyer preview provides sample notifications, address, card, profile, and conversation", async () => {
  const demo = createBuyerPreview();
  assert.ok((await demo.request("GET", "/notification/")).length);
  assert.ok((await demo.request("GET", "/localization/")).length);
  assert.ok((await demo.request("GET", "/card/")).length);
  assert.equal((await demo.request("GET", "/user/demo-buyer")).id, "demo-buyer");
  assert.ok((await demo.request("GET", "/conversation/")).length);
});

test("buyer preview handles chat locally and rejects unsupported socket events", async () => {
  const demo = createBuyerPreview();
  const conversations = await demo.request("GET", "/conversation/");
  const sent = await demo.socketRequest("send_message", { conversationId: conversations[0].conversationId, content: "Mensagem demonstrativa" }, "demo-buyer");
  assert.equal(sent.content, "Mensagem demonstrativa");
  const result = await demo.socketRequest("load_messages", { conversationId: conversations[0].conversationId }, "demo-buyer");
  assert.ok(result.messages.some(message => message.id === sent.id));
  await assert.rejects(demo.socketRequest("transfer_payment", {}, "demo-buyer"), /not available in buyer preview/i);
});
