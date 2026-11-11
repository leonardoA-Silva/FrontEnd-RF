export interface PaymentActivity { busy: boolean; cancelBlocked: boolean }

export function reservationDestination(id: string, negotiation: string) {
  const destination = `/dashboardUsuario?aba=reservas&reserva=${encodeURIComponent(id)}`;
  return negotiation === "sale" ? `${destination}&etapa=pagamento` : destination;
}

export function paymentFailureAction(status: number | undefined, details?: { payment_id?: unknown; reconciliation_required?: unknown }) {
  if (!status || status >= 500 || typeof details?.payment_id === "string" || details?.reconciliation_required === true) return "reconcile";
  if (status === 409) return "reload";
  return "retry";
}
