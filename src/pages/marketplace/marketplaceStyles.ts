import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";
export const marketplaceTheme = "[&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-50";
export const styles = {
  pagina: `flex min-h-screen flex-col bg-canvas font-app text-ink ${marketplaceTheme}`, titulo: s.title, subtitulo: s.subtitle, texto: s.copy,
  botao: s.button, secundario: s.secondary, voltar: "inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4", painel: s.panel, campo: s.input,
  etiqueta: s.label, badge: "inline-flex rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-primary", aviso: s.notice,
  pagamentoPainel: s.panel, pagamentoRodape: "space-y-6 rounded-2xl bg-canvas p-6 sm:p-8", pagamentoBotao: `${s.button} w-full`,
};
