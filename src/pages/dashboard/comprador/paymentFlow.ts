export interface PaymentActivity { busy: boolean; cancelBlocked: boolean }

// Reativar após a API exigir o aceite antes de criar a cobrança.
export const newWebPaymentsEnabled = false;

export function reservationDestination(id: string) {
  return `/dashboardUsuario?aba=reservas&reserva=${encodeURIComponent(id)}`;
}

export function paymentFailureAction(status: number | undefined, details?: { payment_id?: unknown; reconciliation_required?: unknown }) {
  if (!status || status >= 500 || typeof details?.payment_id === "string" || details?.reconciliation_required === true) return "reconcile";
  if (status === 409) return "reload";
  return "retry";
}
