export type ReservationStatus = "Pendente" | "Confirmada" | "Concluída";

export interface ReservationExample {
  id: string;
  name: string;
  quantity: string;
  date: string;
  status: ReservationStatus;
  type: "Doação" | "Venda";
  image?: string;
}

// Somente exemplos visuais; não representam reservas da conta.
export const userReservationExamples: ReservationExample[] = [
  { id: "exemplo-couro", name: "Retalhos de couro", quantity: "15 kg", date: "2026-11-02", status: "Confirmada", type: "Doação", image: "/retalho-couro-nobre.png" },
  { id: "exemplo-madeira", name: "Pallets de madeira", quantity: "2 un.", date: "2026-11-01", status: "Pendente", type: "Venda" },
  { id: "exemplo-cetim", name: "Fitas de cetim", quantity: "5 kg", date: "2026-10-28", status: "Concluída", type: "Doação" },
];
