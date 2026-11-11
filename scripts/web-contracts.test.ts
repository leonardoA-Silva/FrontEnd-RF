import test from "node:test";
import assert from "node:assert/strict";
import { productForm } from "../src/pages/company/productForm.ts";
import { googleProfile } from "../src/auth/googleIdentity.ts";
import { emptyRegistration, validateRegistration } from "../src/pages/register/registrationData.ts";
import { googleAuthTarget } from "../src/auth/googleOrigin.ts";
import { paymentFailureAction, reservationDestination } from "../src/pages/dashboard/comprador/paymentFlow.ts";
import { accountDestination } from "../src/auth/accountDestination.ts";

test("Google usa origens estáveis e preserva perfil e cadastro ao sair de um preview", () => {
  for (const origin of ["https://reaproveitafranca.vercel.app", "http://localhost:5174", "http://127.0.0.1:5174"]) {
    assert.equal(googleAuthTarget(origin, "/login", "user"), null);
  }
  assert.equal(googleAuthTarget("https://reaproveitafranca-preview.vercel.app", "/login", "user"), "https://reaproveitafranca.vercel.app/login?perfil=comprador");
  assert.equal(googleAuthTarget("https://reaproveitafranca-preview.vercel.app", "/cadastro-empresa", "company"), "https://reaproveitafranca.vercel.app/cadastro-empresa");
  assert.equal(googleAuthTarget("https://outro.example.invalid", "//untrusted.example.invalid", "company"), "https://reaproveitafranca.vercel.app/login?perfil=empresa");
});

test("identidade Google preserva caracteres e rejeita credenciais expiradas ou inválidas", () => {
  const credential = (claims: object) => `header.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.signature`;
  const profile = googleProfile(credential({ email: "conta@example.invalid", name: "Conta sintética", exp: Math.floor(Date.now() / 1000) + 3600 }));
  assert.equal(profile.name, "Conta sintética");
  assert.equal(profile.email, "conta@example.invalid");
  assert.throws(() => googleProfile(credential({ email: "conta@example.invalid", exp: 1 })));
  assert.throws(() => googleProfile("invalid-token"));
});

test("empresa Google dispensa senha e mantém documentos e endereço obrigatórios", () => {
  assert.equal(validateRegistration(emptyRegistration, "company", true).password, undefined);
  assert.ok(validateRegistration(emptyRegistration, "company", true).cnpj);
  assert.ok(validateRegistration(emptyRegistration, "company", true).cpf);
  assert.ok(validateRegistration(emptyRegistration, "company", true).street);
  assert.ok(validateRegistration(emptyRegistration, "company").password);
});

test("login preserva destinos internos do perfil e rejeita destinos externos", () => {
  const checkout = "/dashboardUsuario?aba=reservas&reserva=teste&etapa=pagamento";
  assert.equal(accountDestination("user", checkout), checkout);
  assert.equal(accountDestination("company", "/dashboardEmpresa/reservas"), "/dashboardEmpresa/reservas");
  assert.equal(accountDestination("company", checkout), "/dashboardEmpresa");
  assert.equal(accountDestination("admin", "/admin/usuarios"), "/admin/usuarios");
  assert.equal(accountDestination("user", "/admin/usuarios"), "/dashboardUsuario");
  assert.equal(accountDestination("user", "//example.invalid/marketplace"), "/dashboardUsuario");
  assert.equal(accountDestination("user", "/marketplace/../dashboardEmpresa"), "/dashboardUsuario");
});

const material = {
  name: "Material de teste", description: "", category: "tecido", type: "sale", quantity: 1,
  weight: 1, price: 10, condition: "good", status: "available", images: [],
  localizationId: "00000000-0000-4000-8000-000000000001", priority: 0,
};

test("foto maior que o limite JSON é enviada como arquivo multipart", async () => {
  const bytes = Buffer.alloc(150_000, 1);
  const form = productForm({ ...material, images: [`data:image/png;base64,${bytes.toString("base64")}`] });
  const photo = form.get("photos");
  assert.ok(photo instanceof Blob);
  assert.equal(photo.type, "image/png");
  assert.deepEqual(Buffer.from(await photo.arrayBuffer()), bytes);
  assert.equal(form.get("price"), "10");
});

test("doação omite preço e edição preserva as fotos existentes", () => {
  const form = productForm({ ...material, type: "donation", price: 10, quantity: 0 });
  assert.equal(form.has("price"), false);
  assert.equal(form.has("photos"), false);
  assert.equal(form.get("quantity"), "0");
  assert.equal(productForm({ ...material, images: ["imagem existente"] }, false).has("photos"), false);
});

test("imagens inválidas ou acima de 5 MB são recusadas antes da requisição", () => {
  assert.throws(() => productForm({ ...material, images: ["https://example.invalid/foto.png"] }));
  assert.throws(() => productForm({ ...material, images: [`data:image/png;base64,${Buffer.alloc(5 * 1024 * 1024 + 1).toString("base64")}`] }));
});

test("nova reserva abre detalhes sem iniciar pagamento", () => {
  assert.equal(reservationDestination("reserva"), "/dashboardUsuario?aba=reservas&reserva=reserva");
  assert.ok(reservationDestination("id/com espaço").includes("reserva=id%2Fcom%20espa%C3%A7o"));
});

test("conflito sem tentativa financeira recarrega pagamentos sem travar a tela", () => {
  assert.equal(paymentFailureAction(409), "reload");
  assert.equal(paymentFailureAction(409, { reconciliation_required: false }), "reload");
  assert.equal(paymentFailureAction(400), "retry");
  assert.equal(paymentFailureAction(422), "retry");
});

test("falha ambígua exige conciliação antes de nova cobrança", () => {
  assert.equal(paymentFailureAction(undefined), "reconcile");
  assert.equal(paymentFailureAction(500), "reconcile");
  assert.equal(paymentFailureAction(502), "reconcile");
  assert.equal(paymentFailureAction(409, { payment_id: "tentativa" }), "reconcile");
  assert.equal(paymentFailureAction(422, { reconciliation_required: true }), "reconcile");
});
