import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { Eye, EyeOff, Repeat2 } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { loginEmpresa, loginUsuario } from "../../axios/Axios";
import { NotificationContainer } from "../../components/Notification";
import { useNotification } from "../../hooks/useNotification";

export default function Login() {
  const navigate = useNavigate();
  const [tipoConta, setTipoConta] = useState<"empresa" | "pessoal">("empresa");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const { notifications, removeNotification, notify } = useNotification();

  const [formData, setFormData] = useState({
    cnpj: "",
    cpf: "",
    senha: "",
  });

  // Permite estritamente apenas números e limita o tamanho máximo de caracteres
  const handleNumerosChange = (campo: string, maxLen: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const apenasNumeros = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    setFormData((prev) => ({ ...prev, [campo]: apenasNumeros }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      if (tipoConta === "empresa") {
        await loginEmpresa({
          cnpj: formData.cnpj,
          cpfResponsavel: formData.cpf,
          senha: formData.senha,
        });
      } else {
        await loginUsuario({
          cpf: formData.cpf,
          senha: formData.senha,
        });
      }
      notify.success("Login realizado!", "Bem-vindo de volta. Redirecionando...");
      setTimeout(() => navigate("/"), 1500);
    } catch (error: unknown) {
      console.error("Erro ao realizar login:", error);
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as any).response
      ) {
        const status = (error as any).response.status;
        const data = (error as any).response.data as { message?: string };
        if (status === 401 || status === 403) {
          notify.error(
            "Credenciais inválidas",
            data?.message || "CNPJ/CPF ou senha incorretos."
          );
        } else {
          notify.error(
            "Erro ao entrar",
            data?.message || "Não foi possível realizar o login."
          );
        }
      } else {
        notify.error(
          "Sem conexão",
          "Não foi possível conectar ao servidor. Verifique sua conexão."
        );
      }
    } finally {
      setCarregando(false);
    }
  };

  const inputStyle = {
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #D9D5C8",
    bgcolor: "white",
    px: 2,
    py: 1.3,
    fontSize: "0.875rem",
    color: "#1B4B3A",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "all 0.2s ease",
    "&::placeholder": { color: "#9CA3AF" },
    "&:focus": {
      borderColor: "#10B981",
      boxShadow: "0 0 0 1px #10B981",
    },
  };

  const labelStyle = {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#2C3E35",
    mb: 0.75,
    display: "block",
  };

  const socialBtnStyle = {
    width: 56,
    height: 56,
    minWidth: 56,
    p: 0,
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    bgcolor: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    "&:hover": {
      bgcolor: "#F9F8F5",
      borderColor: "#10B981",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.06)",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "#FAF9F5",
        color: "#1B4B3A",
      }}
    >
      <Header />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 4, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 460,
            borderRadius: "28px",
            border: "1px solid #E7E4DA",
            bgcolor: "white",
            p: { xs: 3.5, sm: 5 },
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Logo Central */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#10B981",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(16,185,129,0.25)",
              }}
            >
              <Repeat2 size={34} strokeWidth={2.4} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#0F3D2E",
                  lineHeight: 1.1,
                }}
              >
                Reaproveita
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  color: "#F97316",
                }}
              >
                FRANCA
              </Typography>
            </Box>
          </Box>

          {/* Seletor de Tipo (Tabs: Empresa / Comprador ou Artesão) */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              bgcolor: "#EBEAE5",
              p: 0.6,
              borderRadius: "14px",
              mb: 3,
            }}
          >
            <Button
              type="button"
              onClick={() => {
                setTipoConta("empresa");
                setFormData({ cnpj: "", cpf: "", senha: "" });
              }}
              sx={{
                flex: 1,
                py: 1.1,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: tipoConta === "empresa" ? "#0F3D2E" : "#6B7670",
                bgcolor: tipoConta === "empresa" ? "white" : "transparent",
                boxShadow:
                  tipoConta === "empresa"
                    ? "0 2px 8px rgba(0,0,0,0.08)"
                    : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: tipoConta === "empresa" ? "white" : "rgba(0,0,0,0.03)",
                },
              }}
            >
              Empresa
            </Button>

            <Button
              type="button"
              onClick={() => {
                setTipoConta("pessoal");
                setFormData({ cnpj: "", cpf: "", senha: "" });
              }}
              sx={{
                flex: 1,
                py: 1.1,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                color: tipoConta === "pessoal" ? "#0F3D2E" : "#6B7670",
                bgcolor: tipoConta === "pessoal" ? "white" : "transparent",
                boxShadow:
                  tipoConta === "pessoal"
                    ? "0 2px 8px rgba(0,0,0,0.08)"
                    : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: tipoConta === "pessoal" ? "white" : "rgba(0,0,0,0.03)",
                },
              }}
            >
              Comprador/Artesão
            </Button>
          </Box>

          {/* Botões Sociais (Google e LinkedIn) */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            {/* Google */}
            <Button
              type="button"
              aria-label="Entrar com o Google"
              sx={socialBtnStyle}
            >
              <svg width="26" height="26" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </Button>

            {/* LinkedIn */}
            <Button
              type="button"
              aria-label="Entrar com o LinkedIn"
              sx={socialBtnStyle}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#0A66C2" />
                <path
                  d="M7.12 9.5H4.88V17H7.12V9.5ZM6 8.38C6.72 8.38 7.29 7.8 7.29 7.08C7.29 6.36 6.72 5.78 6 5.78C5.28 5.78 4.71 6.36 4.71 7.08C4.71 7.8 5.28 8.38 6 8.38ZM17.12 17H19.36V12.78C19.36 10.53 18.15 9.48 16.54 9.48C15.24 9.48 14.65 10.2 14.33 10.7V9.5H12.09C12.12 10.14 12.09 17 12.09 17H14.33V12.81C14.33 12.58 14.35 12.35 14.42 12.18C14.61 11.7 15.03 11.2 15.77 11.2C16.74 11.2 17.12 11.94 17.12 13.03V17Z"
                  fill="white"
                />
              </svg>
            </Button>
          </Box>

          {/* Formulário */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Se for Empresa: exibe CNPJ E CPF (campos separados) */}
            {tipoConta === "empresa" && (
              <>
                {/* CNPJ da Empresa */}
                <Box>
                  <Typography component="label" htmlFor="cnpj" sx={labelStyle}>
                    CNPJ da Empresa
                  </Typography>
                  <Box
                    component="input"
                    id="cnpj"
                    name="cnpj"
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    value={formData.cnpj}
                    onChange={handleNumerosChange("cnpj", 14)}
                    placeholder="Apenas números (14 dígitos)"
                    sx={inputStyle}
                  />
                </Box>

                {/* CPF do Responsável */}
                <Box>
                  <Typography component="label" htmlFor="cpf" sx={labelStyle}>
                    CPF do Responsável
                  </Typography>
                  <Box
                    component="input"
                    id="cpf"
                    name="cpf"
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    value={formData.cpf}
                    onChange={handleNumerosChange("cpf", 11)}
                    placeholder="Apenas números (11 dígitos)"
                    sx={inputStyle}
                  />
                </Box>
              </>
            )}

            {/* Se for Pessoal: exibe APENAS CPF (sem CNPJ) */}
            {tipoConta === "pessoal" && (
              <Box>
                <Typography component="label" htmlFor="cpf" sx={labelStyle}>
                  CPF
                </Typography>
                <Box
                  component="input"
                  id="cpf"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={formData.cpf}
                  onChange={handleNumerosChange("cpf", 11)}
                  placeholder="Apenas números (11 dígitos)"
                  sx={inputStyle}
                />
              </Box>
            )}

            {/* Senha (de uma ponta à outra) */}
            <Box>
              <Typography component="label" htmlFor="senha" sx={labelStyle}>
                Senha
              </Typography>
              <Box sx={{ position: "relative", width: "100%" }}>
                <Box
                  component="input"
                  id="senha"
                  name="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  sx={{
                    ...inputStyle,
                    pr: 5,
                    width: "100%",
                  }}
                />
                <Box
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  sx={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    color: "#6B7670",
                    "&:hover": { color: "#1B4B3A" },
                  }}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </Box>
              </Box>
            </Box>

            {/* Botão Entrar */}
            <Button
              type="submit"
              variant="contained"
              disabled={carregando}
              sx={{
                width: "100%",
                borderRadius: "10px",
                bgcolor: "#10B981",
                color: "white",
                py: 1.5,
                mt: 1.5,
                fontWeight: 700,
                fontSize: "0.95rem",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#059669",
                  boxShadow: "none",
                },
                "&.Mui-disabled": {
                  bgcolor: "#6EE7B7",
                  color: "white",
                },
              }}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </Button>

            {/* Link Esqueceu a senha */}
            <Box sx={{ textAlign: "center", mt: 1 }}>
              <Typography
                component="a"
                href="#"
                sx={{
                  fontSize: "0.875rem",
                  color: "#059669",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Esqueceu a senha?
              </Typography>
            </Box>

            {/* Link Criar conta */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography sx={{ fontSize: "0.875rem", color: "#6B7670" }}>
                Não tem uma conta?{" "}
                <Typography
                  component={Link}
                  to="/cadastro"
                  sx={{
                    color: "#0F3D2E",
                    fontWeight: 700,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Criar conta
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Footer />

      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </Box>
  );
}
