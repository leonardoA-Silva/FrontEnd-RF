import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(file, dependencies, globals = {}) {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, globals)(name => {
    assert.ok(name in dependencies, `Import não preparado: ${name}`);
    return dependencies[name];
  }, module, module.exports);
  return module.exports;
}

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return tree && typeof tree === "object" ? [tree, ...nodes(tree.props?.children)] : [];
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join("");
  return tree && typeof tree === "object" ? text(tree.props?.children) : String(tree ?? "");
}
const button = (tree, label) => nodes(tree).find(node => node.type === "button" && text(node).includes(label));
const dialog = tree => nodes(tree).find(node => node.type === "ConfirmAction");
const tick = () => new Promise(setImmediate);
const shopping = { id: "00000000-0000-4000-8000-000000000001", value: 10, status: "pending" };
const attempt = (status = "pending", providerStatus = status) => ({
  payment: { id: "00000000-0000-4000-8000-000000000002", id_shopping: shopping.id, method: "pix", value: 10, status },
  checkout: { status, provider_status: providerStatus, qr_code: "codigo-sintetico" },
});

// Executa o componente real; apenas React, transporte e componentes de apresentação são substituídos.
function harness({ data = null, services = {}, props = {}, reservation = false, storage = new Map(), simulateEnabledCheckout = true } = {}) {
  const states = [], effects = [], dependencies = [];
  let cursor = 0;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
      return [states[index], value => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
    },
    useCallback(callback) { cursor++; return callback; },
    useEffect(callback, values) {
      const index = cursor++;
      if (!dependencies[index] || values.some((value, i) => value !== dependencies[index][i])) effects.push(callback);
      dependencies[index] = values;
    },
  };
  const resource = { data, loading: false, error: "", reload() {} };
  const jsx = (type, properties) => ({ type, props: properties });
  const flow = load("src/pages/dashboard/comprador/paymentFlow.ts", {});
  if (simulateEnabledCheckout) flow.newWebPaymentsEnabled = true;
  const loaded = load(reservation ? "src/pages/dashboard/comprador/BuyerReservations.tsx" : "src/pages/dashboard/comprador/BuyerPayment.tsx", {
    react, "react/jsx-runtime": { jsx, jsxs: jsx }, "react-router-dom": { Link: "Link", useSearchParams: () => [new URLSearchParams({ reserva: shopping.id }), () => {}] },
    axios: { isAxiosError: error => !!error.response },
    "../../../api/services": { listarPagamentosReserva: async () => ({ data: [] }), ...services },
    "../../../axios/apiError": { apiStatus: error => error.response?.status, apiError: (_error, fallback) => fallback },
    "../../../hooks/useApiResource": { useApiResource: () => resource, requireArray: value => { assert.ok(Array.isArray(value)); return value; } },
    "./ConfirmAction": "ConfirmAction", "./RequestState": "RequestState", "./BuyerCardPayment": "BuyerCardPayment",
    "./ReservationConfirmation": "ReservationConfirmation", "./buyerStyles": { buyerStyles: {} },
    "./BuyerPayment": "BuyerPayment", "./buyerPresentation": { money: String, shoppingLabel: String, dateLabel: String }, "./paymentFlow": flow,
  }, { sessionStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  } });
  if (reservation) resource.data = [];
  const component = reservation ? loaded.default({}).type : loaded.default;
  resource.data = data;
  states.length = 0; dependencies.length = 0; effects.length = 0;
  return {
    resource,
    render() {
      cursor = 0;
      const tree = component({ shopping: { ...shopping, status: "accepted" }, id: shopping.id, paymentFirst: true, ...props });
      while (effects.length) effects.shift()();
      return tree;
    },
  };
}

async function failCreation(ui) {
  button(ui.render(), "Gerar Pix").props.onClick();
  dialog(ui.render()).props.confirm();
  await tick();
}

test("configuração web bloqueia novas cobranças em reservas pendentes e aceitas", () => {
  for (const status of ["pending", "accepted"]) {
    const ui = harness({ simulateEnabledCheckout: false, props: { shopping: { ...shopping, status } } });
    assert.equal(button(ui.render(), "Gerar Pix"), undefined);
    assert.ok(text(ui.render()).includes("Novas cobranças pelo site estão pausadas"));
  }
});

test("reserva pendente esconde o código de Pix antigo e permite conferir ou encerrar", () => {
  const ui = harness({ simulateEnabledCheckout: false, data: attempt(), props: { shopping } });
  assert.equal(button(ui.render(), "Copiar código Pix"), undefined);
  assert.ok(button(ui.render(), "Verificar pagamento"));
  assert.ok(button(ui.render(), "Encerrar Pix"));
});

test("consulta vazia após falha de rede libera recuperação sem enviar nova cobrança", async () => {
  let creates = 0, lists = 0;
  const ui = harness({ services: {
    criarPagamentoPix: async () => { creates++; throw new Error("Falha sintética"); },
    listarPagamentosReserva: async () => { lists++; return { data: [] }; },
  } });
  await failCreation(ui);
  assert.equal(button(ui.render(), "Gerar Pix"), undefined);
  button(ui.render(), "Verificar pagamento").props.onClick();
  await tick();
  assert.ok(button(ui.render(), "Gerar Pix"));
  assert.equal(creates, 1);
  assert.equal(lists, 1);
});

test("falha na recuperação mantém bloqueio de cobrança", async () => {
  const ui = harness({ services: {
    criarPagamentoPix: async () => { throw new Error("Falha sintética"); },
    listarPagamentosReserva: async () => { throw new Error("Consulta indisponível"); },
  } });
  await failCreation(ui);
  button(ui.render(), "Verificar pagamento").props.onClick();
  await tick();
  assert.equal(button(ui.render(), "Gerar Pix"), undefined);
  assert.ok(text(ui.render()).includes("sem confirmação"));
});

test("tentativa incerta sobrevive à remontagem até concluir a conferência", async () => {
  const storage = new Map();
  await failCreation(harness({ storage, services: {
    criarPagamentoPix: async () => { throw new Error("Falha sintética"); },
  } }));
  const reopened = harness({ storage });
  assert.equal(button(reopened.render(), "Gerar Pix"), undefined);
  button(reopened.render(), "Verificar pagamento").props.onClick();
  await tick();
  assert.ok(button(harness({ storage }).render(), "Gerar Pix"));
});

test("envio de Pix persiste o bloqueio antes da resposta e o remove após recusa conclusiva", async () => {
  const storage = new Map();
  let rejectCharge;
  const charge = new Promise((_resolve, reject) => { rejectCharge = reject; });
  const ui = harness({ storage, services: { criarPagamentoPix: () => charge } });
  button(ui.render(), "Gerar Pix").props.onClick();
  dialog(ui.render()).props.confirm();
  assert.equal(button(harness({ storage }).render(), "Gerar Pix"), undefined);
  rejectCharge({ response: { status: 400 } });
  await tick();
  assert.ok(button(harness({ storage }).render(), "Gerar Pix"));
});

test("recuperação encontra e sincroniza tentativa pendente antes de liberar pagamento", async () => {
  let synced = "";
  const payment = attempt();
  const ui = harness({ services: {
    criarPagamentoPix: async () => { throw new Error("Falha sintética"); },
    listarPagamentosReserva: async () => ({ data: [payment.payment] }),
    obterCheckout: async () => ({ data: payment }),
    sincronizarPagamento: async id => { synced = id; return { data: payment }; },
  } });
  await failCreation(ui);
  button(ui.render(), "Verificar pagamento").props.onClick();
  await tick();
  assert.equal(synced, payment.payment.id);
  assert.equal(button(ui.render(), "Gerar Pix"), undefined);
});

test("checkout vazio de tentativa existente mantém a cobrança bloqueada", async () => {
  const payment = attempt();
  const ui = harness({ services: {
    criarPagamentoPix: async () => { throw new Error("Falha sintética"); },
    listarPagamentosReserva: async () => ({ data: [payment.payment] }),
    obterCheckout: async () => ({ data: null }),
  } });
  await failCreation(ui);
  button(ui.render(), "Verificar pagamento").props.onClick();
  await tick();
  assert.equal(button(ui.render(), "Gerar Pix"), undefined);
  assert.ok(text(ui.render()).includes("sem confirmação"));
});

test("aprovação na consulta atualiza os detalhes da reserva", async () => {
  let updates = 0;
  const ui = harness({
    data: attempt(),
    services: { sincronizarPagamento: async () => ({ data: attempt("approved") }) },
    props: { onReservationChange: () => { updates++; } },
  });
  button(ui.render(), "Verificar pagamento").props.onClick();
  await tick();
  assert.equal(updates, 1);
  assert.equal(ui.render().type, "ReservationConfirmation");
});

test("resposta de outra tentativa não libera cobrança incerta", async () => {
  const payment = attempt();
  const ui = harness({ services: {
    criarPagamentoPix: async () => { throw new Error("Falha sintética"); },
    listarPagamentosReserva: async () => ({ data: [payment.payment] }),
    obterCheckout: async () => ({ data: payment }),
    sincronizarPagamento: async () => ({ data: {
      ...payment, payment: { ...payment.payment, id: "outro-id", status: "refused" },
    } }),
  } });
  await failCreation(ui);
  button(ui.render(), "Verificar pagamento").props.onClick();
  await tick();
  assert.equal(button(ui.render(), "Gerar Pix"), undefined);
  assert.ok(text(ui.render()).includes("sem confirmação"));
});

test("pagamento informa bloqueio de cancelamento durante processamento e Pix pendente", async () => {
  let activity;
  let finish;
  const response = new Promise(resolve => { finish = resolve; });
  const ui = harness({ props: { onActivityChange: value => { activity = value; } }, services: { criarPagamentoPix: () => response } });
  ui.render();
  assert.equal(activity.cancelBlocked, false);
  button(ui.render(), "Gerar Pix").props.onClick();
  ui.render();
  assert.equal(activity.cancelBlocked, true);
  dialog(ui.render()).props.confirm();
  ui.render();
  assert.equal(activity.busy, true);
  assert.equal(activity.cancelBlocked, true);
  finish({ data: attempt() });
  await tick();
  ui.render();
  assert.equal(activity.busy, false);
  assert.equal(activity.cancelBlocked, true);
});

test("Pix só é encerrado após confirmação e orienta nova reserva", async () => {
  let cancels = 0, refreshed = 0;
  const ui = harness({ data: attempt(), props: { onReservationChange: () => { refreshed++; } }, services: {
    cancelarPagamento: async () => { cancels++; return { data: attempt("refused", "cancelled") }; },
  } });
  button(ui.render(), "Encerrar Pix").props.onClick();
  assert.equal(cancels, 0);
  dialog(ui.render()).props.confirm();
  await tick();
  assert.equal(cancels, 1);
  assert.equal(refreshed, 1);
  assert.ok(text(ui.render()).includes("Criar nova reserva"));
  assert.equal(button(ui.render(), "Gerar Pix"), undefined);
});

test("reabrir durante encerramento oculta o Pix até verificar a tentativa", async () => {
  const storage = new Map();
  const payment = attempt();
  const ui = harness({ storage, data: payment, services: {
    cancelarPagamento: () => new Promise(() => {}),
  } });
  button(ui.render(), "Encerrar Pix").props.onClick();
  dialog(ui.render()).props.confirm();
  let synced, updates = 0;
  const reopened = harness({ storage, data: payment, props: {
    onReservationChange: () => { updates++; },
  }, services: {
    sincronizarPagamento: async id => { synced = id; return { data: attempt("refused", "cancelled") }; },
  } });
  assert.equal(button(reopened.render(), "Copiar código Pix"), undefined);
  button(reopened.render(), "Verificar pagamento").props.onClick();
  await tick();
  assert.equal(synced, payment.payment.id);
  assert.equal(updates, 1);
  assert.equal(storage.size, 0);
  assert.ok(text(reopened.render()).includes("Criar nova reserva"));
});

test("falha ao encerrar Pix não informa sucesso e exige consulta", async () => {
  let refreshed = 0;
  const ui = harness({ data: attempt(), props: { onReservationChange: () => { refreshed++; } }, services: {
    cancelarPagamento: async () => { throw Object.assign(new Error("Conflito"), { response: { status: 409 } }); },
  } });
  button(ui.render(), "Encerrar Pix").props.onClick();
  dialog(ui.render()).props.confirm();
  await tick();
  assert.equal(refreshed, 0);
  assert.ok(text(ui.render()).includes("sem confirmação"));
  assert.equal(button(ui.render(), "Encerrar Pix"), undefined);
});

test("ação de reserva em andamento bloqueia criação de pagamento", () => {
  const ui = harness({ props: { blocked: true } });
  assert.equal(button(ui.render(), "Gerar Pix"), undefined);
});

test("cancelamento da reserva respeita atividade do pagamento e revalida ao confirmar", async () => {
  let cancels = 0;
  const ui = harness({ reservation: true, data: { ...shopping, items: [] }, services: {
    cancelarReserva: async () => { cancels++; return { data: { shopping: { ...shopping, status: "cancelled" } } }; },
  } });
  const payment = nodes(ui.render()).find(node => node.type === "BuyerPayment");
  assert.equal(button(ui.render(), "Cancelar reserva").props.disabled, true);
  payment.props.onActivityChange({ busy: false, cancelBlocked: false });
  button(ui.render(), "Cancelar reserva").props.onClick();
  assert.equal(nodes(ui.render()).find(node => node.type === "BuyerPayment").props.blocked, true);
  payment.props.onActivityChange({ busy: true, cancelBlocked: true });
  assert.equal(button(ui.render(), "Cancelar reserva").props.disabled, true);
  assert.equal(button(ui.render(), "Atualizar detalhes").props.disabled, true);
  dialog(ui.render()).props.confirm();
  await tick();
  assert.equal(cancels, 0);
});

test("cartão em processamento bloqueia cancelamento da reserva", () => {
  let activity;
  const ui = harness({ props: { onActivityChange: value => { activity = value; } } });
  const radio = nodes(ui.render()).find(node => node.type === "input" && node.props?.name === "payment-method" && !node.props.checked);
  radio.props.onChange();
  nodes(ui.render()).find(node => node.type === "BuyerCardPayment").props.onBusy(true);
  ui.render();
  assert.equal(activity.busy, true);
  assert.equal(activity.cancelBlocked, true);
});

test("resposta vazia ao criar cobrança não libera nova tentativa", async () => {
  const ui = harness({ services: { criarPagamentoPix: async () => ({ data: null }) } });
  await failCreation(ui);
  assert.equal(button(ui.render(), "Gerar Pix"), undefined);
  assert.ok(text(ui.render()).includes("sem confirmação"));
});

test("falha ao recarregar reserva após encerrar Pix não prende a navegação", () => {
  const ui = harness({ reservation: true, data: { ...shopping, items: [] } });
  const payment = nodes(ui.render()).find(node => node.type === "BuyerPayment");
  payment.props.onActivityChange({ busy: true, cancelBlocked: true });
  payment.props.onReservationChange();
  ui.resource.error = "Falha sintética ao recarregar";
  assert.equal(button(ui.render(), "Voltar às reservas").props.disabled, false);
});
