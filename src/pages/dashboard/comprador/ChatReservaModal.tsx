import React, { useState } from "react";
import { X, Send, Building2, CheckCheck, Package } from "lucide-react";
import type { ProductBackend } from "../../../axios/Axios";

interface MensagemChat {
  id: string;
  remetente: "usuario" | "empresa";
  texto: string;
  hora: string;
}

interface ChatReservaModalProps {
  aberto: boolean;
  aoFechar: () => void;
  produto: ProductBackend | null;
  empresaNome?: string;
  usuarioNome?: string;
}

const RESPOSTAS_RAPIDAS = [
  "Qual o melhor horário para retirada?",
  "O material já está embalado em fardos?",
  "Posso retirar nesta semana?",
  "Preciso de veículo utilitário para carregar?",
];

export const ChatReservaModal: React.FC<ChatReservaModalProps> = ({
  aberto,
  aoFechar,
  produto,
  empresaNome = "Curtume & Calçados Franca Ltda",
  usuarioNome = "Você",
}) => {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([
    {
      id: "msg_1",
      remetente: "empresa",
      texto: `Olá! Somos da equipe de logística da ${empresaNome}. Como podemos te ajudar em relação a este lote?`,
      hora: "Hoje, 09:15",
    },
  ]);
  const [novoTexto, setNovoTexto] = useState<string>("");

  if (!aberto || !produto) return null;

  const handleEnviarMensagem = (textoParaEnviar?: string) => {
    const texto = (textoParaEnviar || novoTexto).trim();
    if (!texto) return;

    const agora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const msgUsuario: MensagemChat = {
      id: `msg_${Date.now()}`,
      remetente: "usuario",
      texto,
      hora: `Hoje, ${agora}`,
    };

    setMensagens((prev) => [...prev, msgUsuario]);
    setNovoTexto("");

    // Resposta automática simulada após 1 segundo para experiência funcional e viva
    setTimeout(() => {
      const msgResposta: MensagemChat = {
        id: `msg_resp_${Date.now()}`,
        remetente: "empresa",
        texto: "Recebemos sua mensagem! Nosso setor de expedição retornará a confirmação do horário de coleta.",
        hora: `Hoje, ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      };
      setMensagens((prev) => [...prev, msgResposta]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-xl h-[600px] max-h-[92vh] rounded-3xl border border-[#E7E4DA] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Cabeçalho do Chat */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-[#0F3D2E]">
              <Building2 className="h-6 w-6 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1F2A26]">{empresaNome}</h3>
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Atendimento direto para {usuarioNome} • Online
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
            aria-label="Fechar chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Card do Material em Negociação */}
        <div className="flex items-center justify-between bg-emerald-50/70 px-4 py-2.5 border-b border-emerald-100 text-xs">
          <div className="flex items-center gap-2 truncate">
            <Package className="h-4 w-4 text-emerald-700 shrink-0" />
            <span className="font-semibold text-emerald-950 truncate">
              {produto.name}
            </span>
          </div>
          <span className="font-bold text-emerald-800 shrink-0">
            {produto.type_negotiation === "donation" ? "Doação" : `R$ ${Number(produto.price || 0).toFixed(2)}`}
          </span>
        </div>

        {/* Histórico de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F5]">
          {mensagens.map((msg) => {
            const isUsuario = msg.remetente === "usuario";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUsuario ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-2xs leading-relaxed ${
                    isUsuario
                      ? "bg-[#059669] text-white rounded-br-xs"
                      : "bg-white text-gray-800 border border-[#E7E4DA] rounded-bl-xs"
                  }`}
                >
                  <p>{msg.texto}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      isUsuario ? "text-emerald-100" : "text-gray-400"
                    }`}
                  >
                    <span>{msg.hora}</span>
                    {isUsuario && <CheckCheck className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Perguntas Rápidas Sugeridas */}
        <div className="flex gap-1.5 overflow-x-auto p-2 bg-white border-t border-gray-100">
          {RESPOSTAS_RAPIDAS.map((rapida) => (
            <button
              key={rapida}
              type="button"
              onClick={() => handleEnviarMensagem(rapida)}
              className="whitespace-nowrap rounded-full bg-[#FAF9F5] border border-[#ECE8DC] px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition cursor-pointer"
            >
              {rapida}
            </button>
          ))}
        </div>

        {/* Campo de Envio de Mensagem */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEnviarMensagem();
          }}
          className="flex items-center gap-2 p-3 bg-white border-t border-gray-100"
        >
          <input
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Digite uma mensagem para a empresa..."
            className="flex-1 rounded-xl border border-[#D9D5C8] px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="submit"
            disabled={!novoTexto.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#059669] hover:bg-[#047857] text-white shadow-xs transition cursor-pointer disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
export default ChatReservaModal;
