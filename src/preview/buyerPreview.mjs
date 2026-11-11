const now = "2026-11-10T12:00:00.000Z";
const buyer = { id: "demo-buyer", role: "user", name: "Ana Artesã", email: "ana.demo@example.invalid", cellphone: "16999990000", status: "active", birthday: "1995-04-12", created_in: "2025-03-18T12:00:00.000Z" };

function initialData() {
  return {
    products: [
      { id: "demo-p1", name: "Retalhos de couro caramelo", description: "Retalhos limpos, variados e prontos para novos projetos.", price: 18, quantity: 24, status: "available", category: "couro", type_negotiation: "sale", weight: 12, conservation_state: "good", photos: [] },
      { id: "demo-p2", name: "Lona de algodão cru", description: "Lona excedente em ótimo estado.", price: null, quantity: 40, status: "available", category: "tecido", type_negotiation: "donation", weight: 30, conservation_state: "good", photos: [] },
      { id: "demo-p3", name: "Chapas de EVA colorido", description: "Recortes de EVA de várias cores.", price: 9.5, quantity: 16, status: "available", category: "borracha", type_negotiation: "sale", weight: 8, conservation_state: "regular", photos: [] },
    ],
    reservations: [
      { id: "demo-r1", value: 36, status: "pending", datetime: now, total_items: 2, items: [{ id: "demo-ri1", id_product: "demo-p1", product_name: "Retalhos de couro caramelo", quantity: 2, subtotal: 36 }] },
      { id: "demo-r2", value: 0, status: "completed", datetime: "2026-10-20T12:00:00.000Z", total_items: 1, items: [{ id: "demo-ri2", id_product: "demo-p2", product_name: "Lona de algodão cru", quantity: 1, subtotal: 0 }] },
    ],
    notifications: [
      { id: "demo-n1", title: "Solicitação recebida", content: "Sua solicitação por retalhos de couro aguarda confirmação.", type: "shopping", read: "nao", created_in: now, reference_table: "shopping", reference_id: "demo-r1" },
      { id: "demo-n2", title: "Nova mensagem", content: "A equipe da empresa enviou uma mensagem para você.", type: "message", read: "nao", created_in: "2026-11-09T15:30:00.000Z", reference_table: "conversation", reference_id: "demo-c1" },
    ],
    addresses: [{ id: "demo-a1", zip_code: "14400000", street: "Rua das Oficinas", neighborhood: "Centro", number: "120", city: "Franca", state: "SP", latitude: null, longitude: null }],
    cards: [{ id: "demo-card1", holder_name: "ANA ARTESÃ", brand: "Visa", last_digits: "4242", type: "credit", expiration_month: 12, expiration_year: 2028 }],
    profile: { ...buyer },
    conversations: [{ conversationId: "demo-c1", otherUserId: "demo-company", otherUserName: "Ateliê Circular", unreadCount: 1, updated_in: now }],
    messages: [{ id: "demo-m1", id_conversation: "demo-c1", id_user: "demo-company", type: "texto", content: "Olá! Podemos separar os retalhos para você.", created_in: now }],
  };
}

export function createBuyerPreview() {
  const data = initialData();
  let nextId = 1;
  const id = prefix => `demo-${prefix}-${nextId++}`;
  const findByPath = (items, path, key = "id") => items.find(item => item[key] === decodeURIComponent(path));

  async function request(method, url, params = {}, body) {
    const path = `/${String(url).replace(/^\/+/, "").replace(/\?.*$/, "")}`;
    const verb = method.toUpperCase();
    if (verb === "GET" && path === "/product") return structuredClone(data.products);
    if (verb === "GET" && path === "/shopping/") return structuredClone(data.reservations);
    if (verb === "GET" && path.startsWith("/shopping/")) return structuredClone(findByPath(data.reservations, path.slice("/shopping/".length)) ?? {});
    if (verb === "PATCH" && path.startsWith("/shopping/") && path.endsWith("/cancel")) {
      const item = findByPath(data.reservations, path.slice("/shopping/".length, -"/cancel".length));
      if (!item) throw new Error("Reservation not found in buyer preview.");
      item.status = "cancelled";
      return { shopping: structuredClone(item) };
    }
    if (path === "/notification/" && verb === "GET") return structuredClone(data.notifications.filter(item => (!params.read || item.read === params.read) && (!params.type || item.type === params.type)));
    if (path === "/notification/unread/count" && verb === "GET") return { total: data.notifications.filter(item => item.read === "nao").length };
    if (path === "/notification/read-all" && verb === "PATCH") { data.notifications.forEach(item => { item.read = "sim"; }); return {}; }
    if (path.startsWith("/notification/") && path.endsWith("/read") && verb === "PATCH") {
      const item = findByPath(data.notifications, path.slice("/notification/".length, -"/read".length));
      if (item) item.read = "sim";
      return {};
    }
    if (path.startsWith("/notification/") && verb === "DELETE") { data.notifications = data.notifications.filter(item => item.id !== decodeURIComponent(path.slice("/notification/".length))); return {}; }
    if (path === "/localization/" && verb === "GET") return structuredClone(data.addresses);
    if (path === "/localization/" && verb === "POST") {
      const item = { id: id("address"), zip_code: body.zipCode, street: body.street, neighborhood: body.neighborhood, number: body.number, city: body.city, state: body.state, latitude: body.latitude, longitude: body.longitude };
      data.addresses.push(item); return { id: item.id };
    }
    if (path.startsWith("/localization/") && verb === "PUT") {
      const item = findByPath(data.addresses, path.slice("/localization/".length));
      if (item) Object.assign(item, { zip_code: body.zipCode, street: body.street, neighborhood: body.neighborhood, number: body.number, city: body.city, state: body.state, latitude: body.latitude, longitude: body.longitude });
      return {};
    }
    if (path.startsWith("/localization/") && verb === "DELETE") { data.addresses = data.addresses.filter(item => item.id !== decodeURIComponent(path.slice("/localization/".length))); return {}; }
    if (path === "/card/" && verb === "GET") return structuredClone(data.cards);
    if (path.startsWith("/card/") && verb === "PUT") { const item = findByPath(data.cards, path.slice("/card/".length)); if (item) Object.assign(item, body); return {}; }
    if (path.startsWith("/card/") && verb === "DELETE") { data.cards = data.cards.filter(item => item.id !== decodeURIComponent(path.slice("/card/".length))); return {}; }
    if (path === "/conversation/" && verb === "GET") return structuredClone(data.conversations);
    if (path.startsWith("/conversation/") && verb === "DELETE") { data.conversations = data.conversations.filter(item => item.conversationId !== decodeURIComponent(path.slice("/conversation/".length))); return {}; }
    if (path.startsWith("/user/") && verb === "GET" && !path.endsWith("/photo")) return structuredClone(data.profile);
    if (path.startsWith("/user/") && verb === "PUT") {
      if (body instanceof FormData) {
        for (const key of ["name", "cellphone", "birthday"]) if (body.has(key)) data.profile[key] = body.get(key);
      } else Object.assign(data.profile, body);
      return { message: "Preview updated", user: structuredClone(data.profile) };
    }
    throw new Error(`${verb} ${path} is not available in buyer preview.`);
  }

  async function socketRequest(event, payload = {}, userId = buyer.id) {
    const conversationId = payload.conversationId ?? payload.id;
    if (event === "join_conversation" || event === "mark_read") return { ok: true };
    if (event === "load_messages") return { messages: structuredClone(data.messages.filter(message => message.id_conversation === conversationId)) };
    if (event === "send_message") {
      const message = { id: id("message"), id_conversation: payload.conversationId, id_user: userId, type: "texto", content: payload.content, created_in: new Date().toISOString() };
      data.messages.push(message); return structuredClone(message);
    }
    if (event === "edit_message") {
      const message = data.messages.find(item => item.id === payload.messageId);
      if (!message || message.id_user !== userId) throw new Error("Message is not available in buyer preview.");
      message.content = payload.content; message.edited_in = new Date().toISOString(); return structuredClone(message);
    }
    if (event === "delete_message") {
      const message = data.messages.find(item => item.id === payload.messageId);
      if (!message || message.id_user !== userId) throw new Error("Message is not available in buyer preview.");
      message.deleted_in = new Date().toISOString(); return { ok: true };
    }
    if (event === "load_older_messages") return { messages: [] };
    throw new Error(`${event} is not available in buyer preview.`);
  }

  function createSocket(userId = buyer.id) {
    const listeners = new Map();
    return {
      connected: true,
      on(event, listener) { const group = listeners.get(event) ?? new Set(); group.add(listener); listeners.set(event, group); },
      off(event, listener) { listeners.get(event)?.delete(listener); },
      connect() {}, disconnect() {},
      timeout() { return { emit(event, payload, callback) { socketRequest(event, payload, userId).then(response => callback(null, response), error => callback(error, null)); } }; },
    };
  }

  return { request, socketRequest, createSocket };
}

export function isBuyerPreviewPath(pathname) {
  return pathname === "/previa/dashboard/usuario";
}

export const buyerPreview = createBuyerPreview();
export const buyerPreviewUser = Object.freeze({ ...buyer });
