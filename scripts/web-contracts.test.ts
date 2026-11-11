import test from "node:test";
import assert from "node:assert/strict";
import { productForm } from "../src/pages/company/productForm.ts";

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
