import type { CompanyProduct } from "./companyTypes";

// A API aceita multipart para fotos; JSON/base64 excede facilmente o limite do Express.
export function productForm(product: Omit<CompanyProduct, "id">, includePhotos = true) {
  const form = new FormData();
  const fields = {
    name: product.name, description: product.description, price: product.type === "donation" ? null : product.price,
    priority: product.priority ?? 0, quantity: product.quantity, status: product.status || "available",
    category: product.category, type_negotiation: product.type, weight: product.weight,
    conservation_state: product.condition, id_localization: product.localizationId,
  };
  for (const [key, value] of Object.entries(fields)) {
    if (value != null) form.append(key, String(value));
  }
  // A edição do mobile preserva fotos; só a publicação faz upload.
  if (!includePhotos) return form;
  for (const [index, image] of product.images.entries()) {
    const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/\r\n]*={0,2})$/.exec(image);
    if (!match) throw new Error("Selecione uma imagem PNG, JPEG, GIF ou WebP válida.");
    const bytes = Uint8Array.from(atob(match[2].replace(/\s/g, "")), char => char.charCodeAt(0));
    if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error("Selecione imagens de até 5 MB cada.");
    const extension = match[1].split("/")[1];
    form.append("photos", new Blob([bytes], { type: match[1] }), `material-${index + 1}.${extension}`);
  }
  return form;
}
