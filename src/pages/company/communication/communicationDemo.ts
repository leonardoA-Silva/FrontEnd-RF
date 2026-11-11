import type { Conversation, CompanyNotification, ChatMessage } from "./communicationTypes";

function at(hour: number, minute: number, daysAgo = 0) {
  const date = new Date(); date.setDate(date.getDate() - daysAgo); date.setHours(hour, minute, 0, 0); return date.toISOString();
}
export function createConversations(): Conversation[] {
  const messages: ChatMessage[] = [
    { id: "a1", text: "Olá! Os retalhos ainda estão disponíveis?", mine: false, at: at(9, 12) },
    { id: "a2", text: "Olá! Sim, ainda temos o lote de 15 kg.", mine: true, at: at(9, 14) },
    { id: "a3", text: "Ótimo. Podemos combinar a retirada para amanhã?", mine: false, at: at(9, 16) },
    { id: "a4", text: "Podemos. Qual horário funciona melhor para vocês?", mine: true, at: at(9, 18) },
    { id: "a5", text: "Por volta das 14h. Pode ser?", mine: false, at: at(9, 20) },
  ];
  return [
    { id: "atelie-aurora", name: "Ateliê Aurora", initials: "AA", unread: 0, productId: "retalhos", productName: "Retalhos para criação", productImage: "/hero-leather-scraps.jpg", materialSummary: "Doação · 15 kg", messages },
    { id: "oficina-circular", name: "Oficina Circular", initials: "OC", unread: 1, productId: "placas-eva", productName: "Placas de EVA", productImage: "/eva-camurca-premium.png", materialSummary: "Venda · Material de exemplo", messages: [{ id: "o1", text: "Olá! Vocês ainda têm as placas disponíveis?", mine: false, at: at(16, 10, 1) }] },
    { id: "cooperativa-horizonte", name: "Cooperativa Horizonte", initials: "CH", unread: 1, productId: "madeira", productName: "Madeira de reaproveitamento", productImage: "", materialSummary: "Material de exemplo", messages: [{ id: "h1", text: "Conseguimos retirar na sexta-feira.", mine: false, at: at(15, 40, 1) }] },
    { id: "atelie-origem", name: "Ateliê Origem", initials: "AO", unread: 0, productId: "tecidos-naturais", productName: "Tecidos naturais", productImage: "/retalho-nobuck-macio.png", materialSummary: "Doação · 40 kg", messages: [{ id: "r1", text: "Obrigado pelo retorno! Vou organizar a retirada.", mine: false, at: at(14, 20, 1) }] },
    { id: "estudio-origem", name: "Estúdio Origem", initials: "EO", unread: 0, productId: "retalhos", productName: "Retalhos para criação", productImage: "/hero-leather-scraps.jpg", materialSummary: "Doação · 15 kg", messages: [{ id: "e1", text: "Perfeito, aguardo a confirmação.", mine: false, at: at(11, 30, 2) }] },
  ];
}
export function createNotifications(): CompanyNotification[] {
  return [
    { id: "reserva-exemplo", type: "reserva_solicitada", title: "Nova solicitação de reserva", content: "Ateliê Aurora solicitou 15 kg de retalhos para criação.", read: false, at: at(9, 35), image: "/hero-leather-scraps.jpg", action: "Ver solicitação" },
    { id: "mensagem-exemplo", type: "nova_mensagem", title: "Nova mensagem de Oficina Circular", content: "Olá! Vocês ainda têm as placas disponíveis?", read: false, at: at(9, 20), conversationId: "oficina-circular", action: "Abrir conversa" },
    { id: "retirada-exemplo", type: "sistema", title: "Retirada confirmada", content: "Cooperativa Horizonte confirmou a retirada de madeira de reaproveitamento.", read: false, at: at(9, 5), action: "Ver detalhes" },
    { id: "anuncio-exemplo", type: "sistema", title: "Anúncio atualizado", content: "As informações de Placas de EVA foram atualizadas.", read: true, at: at(8, 30), image: "/eva-camurca-premium.png" },
    { id: "conclusao-exemplo", type: "sistema", title: "Reserva concluída", content: "O registro de tecidos naturais foi concluído.", read: true, at: at(17, 26, 1), image: "/retalho-nobuck-macio.png" },
    { id: "mensagem-anterior", type: "nova_mensagem", title: "Mensagem de Estúdio Origem", content: "Perfeito, aguardo a confirmação.", read: true, at: at(14, 7, 1), conversationId: "estudio-origem", action: "Abrir conversa" },
    { id: "publicacao-exemplo", type: "sistema", title: "Material publicado", content: "Seu anúncio de retalhos para criação está na biblioteca.", read: true, at: at(9, 31, 1), image: "/hero-leather-scraps.jpg" },
  ];
}
