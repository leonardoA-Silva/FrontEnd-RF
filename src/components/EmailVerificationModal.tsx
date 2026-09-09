import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, CircularProgress, Backdrop } from "@mui/material";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, X, ArrowRight, ShieldCheck } from "lucide-react";
import { enviarCodigoOtp, verificarCodigoOtp } from "../axios/Axios";

interface EmailVerificationModalProps {
  open: boolean;
  userId: string;
  email: string;
  onSuccess: () => void;
  onClose?: () => void;
}

export default function EmailVerificationModal({
  open,
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

  useEffect(() => {
    if (!open) {
      setDigits(["", "", "", "", "", ""]);
      setErro(null);
      setSucesso(false);
      setInfoReenvio(null);
      setTempoRestante(30);
      return;
    }

    // Foco no primeiro input quando o modal abre
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);

    return () => clearTimeout(timer);
  }, [open]);

  // Contagem regressiva do reenvio
  useEffect(() => {
    if (!open || tempoRestante <= 0) return;

    const interval = setInterval(() => {
      setTempoRestante((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [open, tempoRestante]);

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
      let mensagem = "Código incorreto ou expirado. Tente novamente.";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as any).response?.data
      ) {
        mensagem =
          (err as any).response.data.error ||
          (err as any).response.data.message ||
          mensagem;
      }
      setErro(mensagem);
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
      let mensagem = "Não foi possível reenviar o código. Aguarde alguns instantes.";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as any).response?.data
      ) {
        mensagem =
          (err as any).response.data.error ||
          (err as any).response.data.message ||
          mensagem;
      }
      setErro(mensagem);
    } finally {
      setReenviando(false);
    }
  };

  if (!open) return null;

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: 9999,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          bgcolor: "white",
          borderRadius: "24px",
          border: "1px solid #E7E4DA",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          position: "relative",
          animation: "fadeInScale 0.25s ease-out",
          "@keyframes fadeInScale": {
            "0%": { opacity: 0, transform: "scale(0.95)" },
            "100%": { opacity: 1, transform: "scale(1)" },
          },
        }}
      >
        {/* Botão Fechar no Canto Superior */}
        {onClose && !sucesso && (
          <Box
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 18,
              right: 18,
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6B7670",
              bgcolor: "#F3F1EA",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#E5E1D5",
                color: "#1B4B3A",
              },
            }}
          >
            <X size={18} />
          </Box>
        )}

        {/* Cabeçalho com Ícone e Descrição */}
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            pb: 2,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Badge Ícone */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: sucesso ? "rgba(16, 185, 129, 0.12)" : "rgba(27, 75, 58, 0.08)",
              color: sucesso ? "#10B981" : "#1B4B3A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2.5,
              border: `2px solid ${sucesso ? "#10B981" : "#E7E4DA"}`,
              transition: "all 0.3s ease",
            }}
          >
            {sucesso ? (
              <CheckCircle2 size={38} strokeWidth={2.4} />
            ) : (
              <Mail size={34} strokeWidth={2.2} />
            )}
          </Box>

          <Typography
            sx={{
              fontSize: { xs: "1.35rem", sm: "1.5rem" },
              fontWeight: 800,
              color: "#1B4B3A",
              lineHeight: 1.2,
            }}
          >
            {sucesso ? "E-mail Confirmado!" : "Confirme seu E-mail"}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "#6B7670",
              mt: 1.2,
              lineHeight: 1.5,
              maxWidth: 380,
            }}
          >
            {sucesso ? (
              "Sua conta foi ativada com sucesso. Redirecionando para a tela de login..."
            ) : (
              <>
                Enviamos um código de verificação de 6 dígitos para o endereço:{" "}
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    fontWeight: 700,
                    color: "#1B4B3A",
                    bgcolor: "#FAF9F5",
                    px: 1,
                    py: 0.2,
                    borderRadius: "6px",
                    border: "1px solid #E7E4DA",
                    wordBreak: "break-all",
                  }}
                >
                  {email || "seu e-mail"}
                </Box>
              </>
            )}
          </Typography>
        </Box>

        {/* Conteúdo Central */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pb: { xs: 3, sm: 4 } }}>
          {!sucesso && (
            <>
              {/* Alertas de Erro ou Info de Reenvio */}
              {erro && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    p: 1.5,
                    mb: 2.5,
                    borderRadius: "10px",
                    bgcolor: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    color: "#DC2626",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "0.85rem", color: "#DC2626" }}>
                    {erro}
                  </Typography>
                </Box>
              )}

              {infoReenvio && !erro && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    p: 1.5,
                    mb: 2.5,
                    borderRadius: "10px",
                    bgcolor: "#ECFDF5",
                    border: "1px solid #6EE7B7",
                    color: "#059669",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "0.85rem", color: "#059669" }}>
                    {infoReenvio}
                  </Typography>
                </Box>
              )}

              {/* Caixas de Entrada dos 6 Dígitos */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: { xs: 1, sm: 1.5 },
                  my: 2,
                }}
              >
                {digits.map((digit, idx) => (
                  <Box
                    key={idx}
                    component="input"
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
                    sx={{
                      width: { xs: 42, sm: 54 },
                      height: { xs: 52, sm: 62 },
                      borderRadius: "14px",
                      border: "2px solid",
                      borderColor: erro
                        ? "#EF4444"
                        : digit
                        ? "#10B981"
                        : "#D9D5C8",
                      bgcolor: digit ? "#FAF9F5" : "white",
                      textAlign: "center",
                      fontSize: { xs: "1.4rem", sm: "1.75rem" },
                      fontWeight: 700,
                      color: "#1B4B3A",
                      outline: "none",
                      transition: "all 0.2s ease",
                      "&:focus": {
                        borderColor: erro ? "#EF4444" : "#10B981",
                        boxShadow: erro
                          ? "0 0 0 3px rgba(239, 68, 68, 0.15)"
                          : "0 0 0 3px rgba(16, 185, 129, 0.18)",
                        bgcolor: "white",
                      },
                    }}
                  />
                ))}
              </Box>

              {/* Botão de Confirmação */}
              <Button
                type="button"
                variant="contained"
                onClick={handleVerificar}
                disabled={!codigoPreenchido || verificando}
                endIcon={
                  verificando ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ArrowRight size={18} />
                  )
                }
                sx={{
                  width: "100%",
                  mt: 2.5,
                  py: 1.4,
                  borderRadius: "10px",
                  bgcolor: "#10B981",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#059669",
                    boxShadow: "none",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#D1D5DB",
                    color: "#9CA3AF",
                  },
                }}
              >
                {verificando ? "Validando Código..." : "Confirmar e Ativar Conta"}
              </Button>

              {/* Seção de Reenvio com Temporizador */}
              <Box
                sx={{
                  mt: 3,
                  pt: 2.5,
                  borderTop: "1px solid #E7E4DA",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: "0.85rem", color: "#6B7670" }}>
                  Não recebeu o código de confirmação?
                </Typography>

                {tempoRestante > 0 ? (
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#9CA3AF",
                    }}
                  >
                    Reenviar código em{" "}
                    <Box component="span" sx={{ color: "#1B4B3A", fontWeight: 700 }}>
                      {tempoRestante}s
                    </Box>
                  </Typography>
                ) : (
                  <Button
                    type="button"
                    onClick={handleReenviar}
                    disabled={reenviando}
                    startIcon={
                      reenviando ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <RefreshCw size={14} />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "#10B981",
                      p: 0.5,
                      "&:hover": {
                        bgcolor: "transparent",
                        color: "#059669",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {reenviando ? "Reenviando..." : "Reenviar novo código"}
                  </Button>
                )}
              </Box>
            </>
          )}

          {sucesso && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                py: 2,
              }}
            >
              <CircularProgress size={32} sx={{ color: "#10B981" }} />
              <Typography sx={{ fontSize: "0.9rem", color: "#059669", fontWeight: 600 }}>
                Ativação concluída. Encaminhando...
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Backdrop>
  );
}
