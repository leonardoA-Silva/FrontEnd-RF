import type { CompanyProduct } from "./companyTypes";

// Material examples only. No contact, documents, address or account records.
export function createDemoProducts(): CompanyProduct[] {
  return [
    { id: "tecidos-naturais", name: "Tecidos naturais", category: "tecido", type: "donation", quantity: 18, weight: 40, price: null, images: ["/retalho-nobuck-macio.png"] },
    { id: "placas-eva", name: "Placas de EVA", category: "plastico", type: "sale", quantity: 25, weight: 12, price: 45, images: ["/eva-camurca-premium.png"] },
    { id: "madeira", name: "Madeira de reaproveitamento", category: "madeira", type: "sale", quantity: 12, weight: 60, price: 30, images: [] },
    { id: "borracha", name: "Aparas de borracha", category: "borracha", type: "donation", quantity: 30, weight: 30, price: null, images: [] },
    { id: "retalhos", name: "Retalhos para criação", category: "tecido", type: "donation", quantity: 8, weight: 15, price: null, images: ["/retalho-nobuck-macio.png"] },
    { id: "papelao", name: "Chapas de papelão", category: "papel/papelao", type: "donation", quantity: 20, weight: 10, price: null, images: [] },
  ].map(item => ({ ...item, type: item.type as CompanyProduct["type"], condition: "good", status: "available", description: "Material ilustrativo para explorar a área da empresa. Confira as características e condições antes de anunciar." }));
}
