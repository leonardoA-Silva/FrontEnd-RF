// Mapa de Empresas — dados de demonstração.
//
// Lacuna da API (conferida no backend): GET /product devolve os produtos com
// id_user e id_localization, mas sem nome da empresa, sem endereço e sem
// coordenadas; e não existe GET /localization. Para posicionar empresas reais,
// a API precisa fornecer nome público, anúncios e coordenadas. Até lá, a tela
// filtra os exemplos abaixo no navegador. O fundo cartográfico é carregado
// publicamente do OpenStreetMap; as coordenadas são apenas demonstrativas.

export type CategoriaMaterial = "Couro" | "Tecido" | "EVA / Borracha" | "Outros";

export interface EmpresaMapa {
  id: number;
  nome: string;
  nomeCurto: string;
  categoria: CategoriaMaterial;
  /** distância até a empresa, texto pronto para exibição */
  distancia: string;
  residuos: number;
  /** resumo do lote: quantidade + material */
  detalhe: string;
  gratuito: boolean;
  imagem: string;
  /** coordenada demonstrativa; não representa o endereço real da empresa */
  pos: { lat: number; lng: number };
}

export const empresasMapaDemo: EmpresaMapa[] = [
  {
    id: 1,
    nome: "Curtume Franca Fino S.A.",
    nomeCurto: "Curtume Franca Fino",
    categoria: "Couro",
    distancia: "2.3 km de você",
    residuos: 5,
    detalhe: "150 kg de Couro Bovino",
    gratuito: true,
    imagem: "/retalho-couro-nobre.png",
    pos: { lat: -20.5353, lng: -47.3956 },
  },
  {
    id: 2,
    nome: "Calçados Estilo Franca",
    nomeCurto: "Calçados Estilo Franca",
    categoria: "EVA / Borracha",
    distancia: "4.1 km de você",
    residuos: 12,
    detalhe: "40 kg de Rebarbas de EVA",
    gratuito: true,
    imagem: "/eva-camurca-premium.png",
    pos: { lat: -20.55, lng: -47.4135 },
  },
  {
    id: 3,
    nome: "Tecidos Francanos Ltda",
    nomeCurto: "Tecidos Francanos Ltda",
    categoria: "Tecido",
    distancia: "1.2 km de você",
    residuos: 3,
    detalhe: "90 kg de Tecido Sintético",
    gratuito: false,
    imagem: "/retalho-nobuck-macio.png",
    pos: { lat: -20.527, lng: -47.382 },
  },
  {
    id: 4,
    nome: "Solados Renovação",
    nomeCurto: "Solados Renovação",
    categoria: "Outros",
    distancia: "5.5 km de você",
    residuos: 8,
    detalhe: "200 unid. de Solados",
    gratuito: true,
    imagem: "/hero-leather-scraps.jpg",
    pos: { lat: -20.55, lng: -47.386 },
  },
  {
    id: 5,
    nome: "Ateliê Couro & Arte",
    nomeCurto: "Ateliê Couro & Arte",
    categoria: "Couro",
    distancia: "3.0 km de você",
    residuos: 2,
    detalhe: "25 kg de Couro Nobre",
    gratuito: false,
    imagem: "/retalho-couro-nobre.png",
    pos: { lat: -20.526, lng: -47.416 },
  },
];

// Linhas da legenda, na ordem em que aparecem no mapa.
export const legendaMateriais: { categoria: CategoriaMaterial; rotulo: string }[] = [
  { categoria: "Couro", rotulo: "Couro" },
  { categoria: "Tecido", rotulo: "Tecido" },
  { categoria: "EVA / Borracha", rotulo: "EVA / Borracha" },
  { categoria: "Outros", rotulo: "Outros Materiais" },
];
