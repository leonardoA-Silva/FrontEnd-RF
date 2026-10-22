export const marketplaceTheme = "[--mkt-primary:#10b981] [--mkt-dark:#064e3b] [--mkt-muted:#4b5563] [--mkt-line:#e5e7eb] [--mkt-soft:#ecfdf5] [--mkt-payment:#006c4a] [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-40 [&_:is(a,button,input,select,textarea):focus-visible]:outline-2 [&_:is(a,button,input,select,textarea):focus-visible]:outline-offset-4 [&_:is(a,button,input,select,textarea):focus-visible]:outline-[var(--mkt-payment)]";

export const styles = {
  pagina: `min-h-screen flex flex-col bg-[#fbfbf9] font-sans text-[#1f2937] ${marketplaceTheme}`,
  titulo: "text-2xl sm:text-[30px] leading-tight font-extrabold text-[var(--mkt-dark)]",
  subtitulo: "text-lg font-bold text-[var(--mkt-dark)]",
  texto: "text-sm leading-relaxed text-[var(--mkt-muted)]",
  botao: "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--mkt-primary)] px-5 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-[var(--mkt-payment)] active:bg-[var(--mkt-dark)]",
  secundario: "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--mkt-primary)] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[var(--mkt-payment)] transition-colors hover:bg-[var(--mkt-soft)] active:bg-emerald-100",
  voltar: "mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--mkt-payment)] hover:underline",
  painel: "rounded-2xl border border-[var(--mkt-line)] bg-white p-5 sm:p-8",
  campo: "mt-2 min-h-12 w-full min-w-0 rounded-lg border border-[var(--mkt-line)] bg-white px-4 py-3 text-sm text-[#1f2937] placeholder:text-gray-500 focus:border-[var(--mkt-primary)]",
  etiqueta: "block text-sm font-semibold text-[#1f2937]",
  badge: "inline-flex rounded-md bg-[var(--mkt-soft)] px-2 py-1 text-[11px] font-bold text-[var(--mkt-dark)]",
  aviso: "rounded-xl border border-[var(--mkt-primary)] bg-[var(--mkt-soft)] p-4 text-xs leading-relaxed text-[var(--mkt-dark)]",
  pagamentoPainel: "w-full overflow-hidden rounded-xl border border-[#bbcac0] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)]",
  pagamentoRodape: "space-y-6 border-t border-[#bbcac0] bg-[#f3f4f5] p-6 sm:p-8",
  pagamentoBotao: "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--mkt-payment)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--mkt-dark)] active:bg-emerald-900",
};
