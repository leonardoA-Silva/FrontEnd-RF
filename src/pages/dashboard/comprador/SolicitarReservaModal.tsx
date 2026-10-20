import React, { useState } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  ShoppingBag,
  Info,
  QrCode,
  Package,
} from "lucide-react";
import type { ProductBackend } from "../../../axios/Axios";

export interface DadosReservaFinalizada {
  id: string;
  codigo: string;
  produtoId: string;
  produtoNome: string;
  categoria: string;
  quantidade: number;
  tipoNegociacao: string;
  valorTotal: number;
  finalidade: string;
  dataRetirada: string;
  turnoRetirada: "manha" | "tarde";
  observacoes: string;
  fornecedorNome: string;
  status: "pendente" | "aprovada" | "coletada" | "cancelada";
  dataCriacao: string;
}

interface SolicitarReservaModalProps {
  aberto: boolean;
  aoFechar: () => void;
  produto: ProductBackend | null;
  usuarioNome: string;
  usuarioDoc?: string;
  usuarioTelefone?: string;
  fornecedorNome?: string;
  aoConfirmarReserva: (dados: DadosReservaFinalizada) => Promise<void>;
  aoAbrirQrCode: (dados: DadosReservaFinalizada) => void;
  aoIrParaMinhasReservas: () => void;
}

const FINALIDADES_USO = [
  "Artesanato & Peças Manuais",
  "Fabricação de Calçados & Acessórios",
  "Design de Interiores & Upcycling",
  "Reciclagem e Reaproveitamento Técnico",
  "Projetos Educacionais e Sustentáveis",
  "Outra finalidade circular",
];

export const SolicitarReservaModal: React.FC<SolicitarReservaModalProps> = ({
  aberto,
  aoFechar,
  produto,
  usuarioNome,
  usuarioDoc = "Não informado",
  usuarioTelefone = "Não informado",
  fornecedorNome = "Curtume & Calçados Franca Ltda",
  aoConfirmarReserva,
  aoAbrirQrCode,
  aoIrParaMinhasReservas,
}) => {
  // Etapa atual: 1 = Formulário, 2 = Revisão / Checkout, 3 = Sucesso
  const [etapa, setEtapa] = useState<1 | 2 | 3>(1);

  // Formulário da Etapa 1
  const [quantidade, setQuantidade] = useState<number>(1);
  const [finalidade, setFinalidade] = useState<string>(FINALIDADES_USO[0]);
  const [dataRetirada, setDataRetirada] = useState<string>(() => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 2);
    return amanha.toISOString().split("T")[0];
  });
  const [turnoRetirada, setTurnoRetirada] = useState<"manha" | "tarde">("manha");
  const [observacoes, setObservacoes] = useState<string>("");

  // Estado de envio
  const [processando, setProcessando] = useState<boolean>(false);
  const [reservaGerada, setReservaGerada] = useState<DadosReservaFinalizada | null>(null);

  if (!aberto || !produto) return null;

  const precoUnitario = produto.type_negotiation === "donation" ? 0 : Number(produto.price) || 0;
  const valorTotal = precoUnitario * quantidade;

  const maxQtd = Math.max(1, produto.quantity || 1);

  const handleIncrementarQtd = () => {
    if (quantidade < maxQtd) setQuantidade((q) => q + 1);
  };

  const handleDecrementarQtd = () => {
    if (quantidade > 1) setQuantidade((q) => q - 1);
  };

  const handleAvancarParaRevisao = (e: React.FormEvent) => {
    e.preventDefault();
    setEtapa(2);
  };

  const handleFinalizarReserva = async () => {
    setProcessando(true);
    try {
      const codigoAleatorio = `RF-${Math.floor(10000 + Math.random() * 90000)}`;
      const novaReserva: DadosReservaFinalizada = {
        id: `res_${Date.now()}`,
        codigo: codigoAleatorio,
        produtoId: produto.id,
        produtoNome: produto.name,
        categoria: produto.category,
        quantidade,
        tipoNegociacao: produto.type_negotiation,
        valorTotal,
        finalidade,
        dataRetirada,
        turnoRetirada,
        observacoes,
        fornecedorNome,
        status: "pendente",
        dataCriacao: new Date().toISOString(),
      };

      await aoConfirmarReserva(novaReserva);
      setReservaGerada(novaReserva);
      setEtapa(3);
    } catch (err) {
      console.error("Erro ao confirmar reserva:", err);
    } finally {
      setProcessando(false);
    }
  };

  const formatarDataBr = (dataIso: string) => {
    try {
      const [ano, mes, dia] = dataIso.split("-");
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dataIso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-[#E7E4DA] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95">
        {/* Botão Fechar (apenas antes do sucesso ou para sair) */}
        <button
          type="button"
          onClick={aoFechar}
          className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ==================================================================== */}
        {/* ETAPA 1: FORMULÁRIO DE SOLICITAÇÃO DE RESERVA (Figma Screen 3)       */}
        {/* ==================================================================== */}
        {etapa === 1 && (
          <form onSubmit={handleAvancarParaRevisao} className="space-y-6">
            {/* Header da Etapa */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px]">
                  1
                </span>
                <span>Etapa 1 de 2 • Informações da Reserva</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#0F3D2E] tracking-tight">
                Solicitar Reserva de Resíduo
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#6B7670]">
                Preencha os detalhes para solicitar este lote industrial à fábrica parceira.
              </p>
            </div>

            {/* Card Resumo do Produto Selecionado */}
            <div className="flex items-center justify-between rounded-2xl bg-[#FAF9F5] p-4 border border-[#ECE8DC]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-[#0F3D2E]">
                  <Package className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1F2A26] line-clamp-1">{produto.name}</h4>
                  <p className="text-xs text-gray-500">
                    {produto.category.toUpperCase()} • {fornecedorNome}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 block">
                  {produto.type_negotiation === "donation"
                    ? "Doação Gratuita"
                    : `R$ ${Number(produto.price || 0).toFixed(2)}/un`}
                </span>
                <span className="text-[11px] text-gray-400">Disp: {produto.quantity} un</span>
              </div>
            </div>

            {/* Finalidade do Uso */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                Finalidade do Uso Circular
              </label>
              <select
                value={finalidade}
                onChange={(e) => setFinalidade(e.target.value)}
                className="w-full rounded-xl border border-[#D9D5C8] bg-white p-3 text-xs sm:text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                {FINALIDADES_USO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantidade Desejada com Seletor + / - */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Quantidade Desejada
                </label>
                <span className="text-xs text-gray-500">Disponível: {maxQtd} un</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-[#D9D5C8] bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={handleDecrementarQtd}
                    className="px-4 py-2.5 text-base font-bold text-gray-600 hover:bg-gray-100 rounded-l-xl transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-5 py-2.5 text-sm font-extrabold text-[#0F3D2E] min-w-[50px] text-center">
                    {quantidade}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrementarQtd}
                    className="px-4 py-2.5 text-base font-bold text-gray-600 hover:bg-gray-100 rounded-r-xl transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {Number(produto.weight) > 0
                    ? `Equivale a aproximadamente ${(Number(produto.weight) * (quantidade / maxQtd)).toFixed(1)} kg`
                    : "Unidades para coleta"}
                </span>
              </div>
            </div>

            {/* Data e Turno Previsto para Retirada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  Data Prevista para Coleta
                </label>
                <input
                  type="date"
                  required
                  value={dataRetirada}
                  onChange={(e) => setDataRetirada(e.target.value)}
                  className="w-full rounded-xl border border-[#D9D5C8] p-2.5 text-xs sm:text-sm text-[#1F2A26] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  Turno de Preferência
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTurnoRetirada("manha")}
                    className={`rounded-xl p-2.5 text-xs font-semibold border transition cursor-pointer ${
                      turnoRetirada === "manha"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-[#D9D5C8] bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Manhã (08h-12h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTurnoRetirada("tarde")}
                    className={`rounded-xl p-2.5 text-xs font-semibold border transition cursor-pointer ${
                      turnoRetirada === "tarde"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-[#D9D5C8] bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Tarde (13h-17h)
                  </button>
                </div>
              </div>
            </div>

            {/* Mensagem Opcional */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                Mensagem ou Observação para a Empresa (Opcional)
              </label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex.: Comparecerei em veículo utilitário para carregamento das caixas."
                className="w-full rounded-xl border border-[#D9D5C8] p-3 text-xs sm:text-sm text-gray-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Botões de Navegação */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={aoFechar}
                className="rounded-xl border border-[#D9D5C8] px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#059669] hover:bg-[#047857] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm flex items-center gap-2 transition cursor-pointer"
              >
                <span>Avançar para Revisão</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* ==================================================================== */}
        {/* ETAPA 2: REVISÃO E CHECKOUT DA RESERVA (Figma Screen 4)              */}
        {/* ==================================================================== */}
        {etapa === 2 && (
          <div className="space-y-6">
            {/* Header da Etapa */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px]">
                  2
                </span>
                <span>Etapa 2 de 2 • Conferência e Confirmação</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#0F3D2E] tracking-tight">
                Confirmar Solicitação de Reserva
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#6B7670]">
                Verifique os detalhes antes de formalizar seu pedido com a fábrica.
              </p>
            </div>

            {/* Card 1: Resumo do Item */}
            <div className="rounded-2xl border border-[#E7E4DA] bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1F2A26]">{produto.name}</h4>
                    <span className="text-xs text-gray-500">
                      Qtd: {quantidade} un • {finalidade}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block uppercase font-bold text-[10px]">
                    Subtotal
                  </span>
                  <span className="text-sm font-extrabold text-[#0F3D2E]">
                    {produto.type_negotiation === "donation"
                      ? "Gratuito"
                      : `R$ ${valorTotal.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Informações da Coleta Presencial */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 block font-semibold">Local de Coleta:</strong>
                    <span>Av. Distrito Industrial, 1500 - Franca - SP</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 block font-semibold">Data e Turno Previsto:</strong>
                    <span>
                      {formatarDataBr(dataRetirada)} ({turnoRetirada === "manha" ? "Manhã: 08h-12h" : "Tarde: 13h-17h"})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Dados do Solicitante */}
            <div className="rounded-2xl bg-[#FAF9F5] p-4 border border-[#ECE8DC] text-xs">
              <div className="flex items-center gap-2 font-bold text-gray-700 mb-2">
                <User className="h-4 w-4 text-emerald-700" />
                <span>Dados do Comprador / Solicitante:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                <div>
                  <span className="font-medium text-gray-500">Nome: </span>
                  <span className="font-semibold text-gray-900">{usuarioNome}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Documento: </span>
                  <span className="font-semibold text-gray-900">{usuarioDoc}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Telefone: </span>
                  <span className="font-semibold text-gray-900">{usuarioTelefone}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Empresa Fornecedora: </span>
                  <span className="font-semibold text-gray-900">{fornecedorNome}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Resumo Financeiro */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Subtotal dos Resíduos:</span>
                <span className="font-semibold text-gray-800">
                  {produto.type_negotiation === "donation" ? "R$ 0,00" : `R$ ${valorTotal.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span>Taxa da Plataforma Circular:</span>
                <span className="font-semibold text-emerald-700">R$ 0,00 (Isento)</span>
              </div>
              <div className="flex items-center justify-between border-t border-emerald-200 pt-2 text-sm sm:text-base font-extrabold text-[#0F3D2E]">
                <span>Total a Pagar na Retirada:</span>
                <span>
                  {produto.type_negotiation === "donation"
                    ? "Gratuito (Doação)"
                    : `R$ ${valorTotal.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEtapa(1)}
                className="flex items-center gap-1.5 rounded-xl border border-[#D9D5C8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={handleFinalizarReserva}
                disabled={processando}
                className="rounded-xl bg-[#059669] hover:bg-[#047857] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{processando ? "Processando Solicitação..." : "Confirmar Solicitação de Reserva"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* ETAPA 3: RESERVA SOLICITADA COM SUCESSO! (Figma Screen 7)            */}
        {/* ==================================================================== */}
        {etapa === 3 && reservaGerada && (
          <div className="space-y-6 text-center animate-in zoom-in-95">
            {/* Ícone de Sucesso Redondo Grande */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E] tracking-tight">
                Reserva Solicitada com Sucesso!
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-[#6B7670] max-w-md mx-auto leading-relaxed">
                Sua solicitação foi enviada para <strong>{reservaGerada.fornecedorNome}</strong>.
                Você já pode visualizar o seu comprovante com QR Code para retirada presencial.
              </p>
            </div>

            {/* Card com Dados do Pedido */}
            <div className="rounded-2xl border border-[#E7E4DA] bg-white p-5 text-left shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    CÓDIGO DA RESERVA
                  </span>
                  <p className="font-mono text-base font-extrabold text-emerald-800">
                    #{reservaGerada.codigo}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  Aguardando Aprovação
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400 block font-medium">Material Solicitado:</span>
                  <span className="font-bold text-gray-900">{reservaGerada.produtoNome}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Quantidade:</span>
                  <span className="font-bold text-gray-900">{reservaGerada.quantidade} unidades</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Data Prevista:</span>
                  <span className="font-bold text-gray-900">
                    {formatarDataBr(reservaGerada.dataRetirada)} ({reservaGerada.turnoRetirada})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Valor Total:</span>
                  <span className="font-bold text-emerald-700">
                    {reservaGerada.tipoNegociacao === "donation"
                      ? "Gratuito (Doação)"
                      : `R$ ${reservaGerada.valorTotal.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Box: Próximos Passos (Conforme Figma Screen 7) */}
            <div className="rounded-2xl bg-[#FAF9F5] p-5 text-left border border-[#ECE8DC]">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0F3D2E] mb-3 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-emerald-600" />
                Próximos Passos para a Coleta
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-600">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                    1
                  </span>
                  <span>A fábrica analisará e aprovará sua solicitação em até 24 horas úteis.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                    2
                  </span>
                  <span>
                    Acesse seu <strong>QR Code de Retirada</strong> para apresentar na portaria da fábrica parceira no Distrito Industrial de Franca.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                    3
                  </span>
                  <span>Após coletar o material, confirme o recebimento e avalie a qualidade do lote.</span>
                </li>
              </ul>
            </div>

            {/* Botões de Ação Final */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  aoFechar();
                  aoAbrirQrCode(reservaGerada);
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#0B4D34] hover:bg-[#083A27] py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                <span>Ver QR Code de Retirada</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  aoFechar();
                  aoIrParaMinhasReservas();
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-[#D9D5C8] bg-white hover:bg-gray-50 py-3 text-xs sm:text-sm font-bold text-gray-700 transition cursor-pointer shadow-xs"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Ir para Minhas Reservas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SolicitarReservaModal;
