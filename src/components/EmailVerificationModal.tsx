import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { enviarCodigoOtp, verificarCodigoOtp } from "../axios/Axios";
import { mensagemDeErroApi } from "../utils/apiError";

// O componente é sempre montado condicionalmente pelos pais
// ({aberto && <EmailVerificationModal …/>}), então cada abertura
// começa com estado limpo — sem reset manual de estado em efeito.
interface EmailVerificationModalProps {
  userId: string;
  email: string;
  onSuccess: () => void;
  onClose?: () => void;
}

export default function EmailVerificationModal({
  userId,
  email,
  onSuccess,
  onClose,
}: EmailVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [infoReenvio, setInfoReenvio] = useState<string | null>(null);

  // Temporizador de 30 segundos (sincronizado com rate limit da API)
  const [tempoRestante, setTempoRestante] = useState(30);

  // Foco no primeiro input quando o modal abre
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // Contagem regressiva do reenvio
  useEffect(() => {
    if (tempoRestante <= 0) return;

    const interval = setInterval(() => {
      setTempoRestante((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [tempoRestante]);

  const codigoCompleto = digits.join("");
  const codigoPreenchido = codigoCompleto.length === 6;

  const handleDigitChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setErro(null);
    setInfoReenvio(null);

    if (!val) {
      const novos = [...digits];
      novos[index] = "";
      setDigits(novos);
      return;
    }

    // Se o usuário digitou ou colou múltiplos dígitos
    if (val.length > 1) {
      const chars = val.slice(0, 6).split("");
      const novos = [...digits];
      chars.forEach((c, i) => {
        if (index + i < 6) novos[index + i] = c;
      });
      setDigits(novos);
      const nextIdx = Math.min(index + chars.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const novos = [...digits];
    novos[index] = val;
    setDigits(novos);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter" && codigoPreenchido) {
      handleVerificar();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const novos = ["", "", "", "", "", ""];
    pasteData.split("").forEach((c, i) => {
      novos[i] = c;
    });
    setDigits(novos);
    setErro(null);

    const nextIdx = Math.min(pasteData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const handleVerificar = async () => {
    if (!codigoPreenchido || !userId || verificando || sucesso) return;

    setVerificando(true);
    setErro(null);
    setInfoReenvio(null);

    try {
      await verificarCodigoOtp(userId, codigoCompleto);
      setSucesso(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: unknown) {
      console.error("Erro ao verificar código OTP:", err);
      setErro(
        mensagemDeErroApi(err, "Código incorreto ou expirado. Tente novamente.")
      );
    } finally {
      setVerificando(false);
    }
  };

  const handleReenviar = async () => {
    if (tempoRestante > 0 || reenviando || !userId) return;

    setReenviando(true);
    setErro(null);
    setInfoReenvio(null);

    try {
      const res = await enviarCodigoOtp(userId);
      setInfoReenvio(res.data?.message || "Novo código enviado com sucesso!");
      setTempoRestante(30);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      console.error("Erro ao reenviar código OTP:", err);
      setErro(
        mensagemDeErroApi(
          err,
          "Não foi possível reenviar o código. Aguarde alguns instantes."
        )
      );
    } finally {
      setReenviando(false);
    }
  };

  const styles = {
    overlay:
      "fixed inset-0 z-[9999] flex items-center justify-center bg-carvao/70 p-4 backdrop-blur-sm",
    cartao: "relative w-full max-w-md rounded-2xl border border-areia bg-cru p-6 shadow-2xl sm:p-8",
    botaoFechar:
      "absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-areia-clara text-carvao-suave transition hover:bg-areia hover:text-carvao",
    cabecalho: "flex flex-col items-center text-center",
    icone:
      "mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-areia bg-papel text-carvao",
    iconeSucesso:
      "mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-musgo/40 bg-musgo-claro text-musgo",
    titulo: "font-display text-2xl font-semibold text-carvao",
    descricao: "mt-2 max-w-sm text-sm leading-relaxed text-carvao-suave",
    emailChip:
      "inline-block rounded-md border border-areia bg-papel px-1.5 py-0.5 font-semibold text-carvao [word-break:break-all]",
    alertaErro:
      "mb-4 flex items-center gap-2.5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700",
    alertaInfo:
      "mb-4 flex items-center gap-2.5 rounded-lg border border-musgo/40 bg-musgo-claro p-3 text-sm font-medium text-musgo",
    digitos: "my-5 flex justify-between gap-1.5 sm:gap-2",
    digito:
      "h-14 min-w-0 flex-1 rounded-xl border-2 bg-cru text-center font-display text-2xl font-semibold text-carvao outline-none transition [border-color:var(--color-areia)] focus:[border-color:var(--color-canela)] focus:ring-4 focus:ring-canela/15 disabled:opacity-60 sm:h-16",
    digitoPreenchido: "[border-color:var(--color-canela)] bg-papel",
    digitoErro: "[border-color:var(--color-danger)] bg-danger/10",
    botaoVerificar:
      "mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-canela py-3.5 text-sm font-bold text-cru transition hover:bg-canela-escura disabled:cursor-not-allowed disabled:bg-areia disabled:text-carvao-suave",
    reenvio:
      "mt-6 flex flex-col items-center gap-1.5 border-t-2 border-dashed border-areia pt-5 text-sm",
    reenvioAviso: "text-carvao-suave",
    reenvioContagem: "font-semibold text-carvao-suave/70",
    botaoReenviar:
      "flex items-center gap-1.5 rounded-lg p-1.5 font-bold text-canela transition hover:text-canela-escura disabled:opacity-60",
    sucessoCaixa: "flex flex-col items-center gap-3 py-6",
    sucessoTexto: "text-sm font-semibold text-musgo",
  };

  function estiloDigito(temValor: boolean) {
    if (erro) return `${styles.digito} ${styles.digitoErro}`;
    if (temValor) return `${styles.digito} ${styles.digitoPreenchido}`;
    return styles.digito;
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Confirmação de e-mail"
    >
      <div className={styles.cartao}>
        {onClose && !sucesso && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de confirmação"
            className={styles.botaoFechar}
          >
            <X size={18} />
          </button>
        )}

        <div className={styles.cabecalho}>
          <span className={sucesso ? styles.iconeSucesso : styles.icone}>
            {sucesso ? (
              <CheckCircle2 size={32} strokeWidth={2.2} />
            ) : (
              <Mail size={28} strokeWidth={2} />
            )}
          </span>

          <h2 className={styles.titulo}>
            {sucesso ? "E-mail confirmado!" : "Confirme seu e-mail"}
          </h2>

          <p className={styles.descricao}>
            {sucesso ? (
              "Sua conta foi ativada. Redirecionando para a tela de login…"
            ) : (
              <>
                Enviamos um código de 6 dígitos para{" "}
                <span className={styles.emailChip}>{email || "seu e-mail"}</span>
              </>
            )}
          </p>
        </div>

        <div className="mt-2">
          {!sucesso && (
            <>
              {erro && (
                <div className={styles.alertaErro} role="alert">
                  <AlertCircle size={18} className="shrink-0" />
                  {erro}
                </div>
              )}

              {infoReenvio && !erro && (
                <div className={styles.alertaInfo}>
                  <ShieldCheck size={18} className="shrink-0" />
                  {infoReenvio}
                </div>
              )}

              <div className={styles.digitos}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el: HTMLInputElement | null) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDigitChange(idx, e)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    autoComplete="one-time-code"
                    aria-label={`Dígito ${idx + 1} do código`}
                    className={estiloDigito(Boolean(digit))}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerificar}
                disabled={!codigoPreenchido || verificando}
                className={styles.botaoVerificar}
              >
                {verificando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Validando código…
                  </>
                ) : (
                  <>
                    Confirmar e ativar conta
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className={styles.reenvio}>
                <p className={styles.reenvioAviso}>Não recebeu o código?</p>

                {tempoRestante > 0 ? (
                  <p className={styles.reenvioContagem}>
                    Reenviar em <strong>{tempoRestante}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleReenviar}
                    disabled={reenviando}
                    className={styles.botaoReenviar}
                  >
                    {reenviando ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Reenviando…
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} />
                        Reenviar novo código
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}

          {sucesso && (
            <div className={styles.sucessoCaixa}>
              <Loader2 size={30} className="animate-spin text-musgo" />
              <p className={styles.sucessoTexto}>
                Ativação concluída. Encaminhando…
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
