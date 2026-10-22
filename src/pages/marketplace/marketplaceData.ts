export interface MaterialMarketplace {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  grupo: string;
  empresa: string;
  distancia: number;
  quantidade: number;
  unidade: string;
  estado: string;
  modalidade: "venda" | "doacao";
  preco: number | null;
  disponibilidade: "imediata" | "encomenda";
  fotos: string[];
}

// Catálogo demonstrativo já existente, separado dos registros reais da API.
// As fotos exatas do Figma aguardam autorização de download.
export const materiais: MaterialMarketplace[] = [
  { id: "mkt-1", nome: "Retalhos de Couro Premium", descricao: "Sobras limpas de corte de couro para confecção de carteiras, chaveiros, bolsas e peças artesanais.", categoria: "Couro", grupo: "couro", empresa: "Curtume Franca Fino", distancia: 3.2, quantidade: 150, unidade: "kg", estado: "Excelente", modalidade: "venda", preco: 45, disponibilidade: "imediata", fotos: ["/retalho-couro-nobre.png", "/retalho-nobuck-macio.png", "/hero-leather-scraps.jpg"] },
];

export const categorias = [
  { id: "todos", nome: "Todos" }, { id: "couro", nome: "Couros" },
  { id: "tecido", nome: "Têxteis" }, { id: "eva-borracha", nome: "EVA & Borracha" },
  { id: "madeira", nome: "Pallets & Madeira" },
];
export const moeda = (valor: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
export const numero = (valor: number) => new Intl.NumberFormat("pt-BR").format(valor);

export interface ReservaDemonstrativa {
  materialId: string;
  quantidade: number;
  finalidade: string;
  data: string;
  observacoes: string;
  metodo: "pix" | "cartao";
  concluida: boolean;
}
