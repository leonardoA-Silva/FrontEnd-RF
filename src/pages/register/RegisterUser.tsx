import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { Camera, X, User } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegisterUser() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nomeOuRazao: "",
    cpfOuCnpj: "",
    tipoEntidade: "",
    localizacao: "",
  });

  const [foto, setFoto] = useState<string | null>(null);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverFoto = () => {
    setFoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados do comprador / artesão:", {
      ...formData,
      foto,
    });
  };

  const handleVoltar = () => {
    navigate("/cadastro");
  };

  // Estilos compartilhados no padrão MUI sx
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
            maxWidth: 700,
            borderRadius: "24px",
            border: "1px solid #E7E4DA",
            bgcolor: "white",
            p: { xs: 3, sm: 5 },
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Indicador de etapa e progresso */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: "bold",
                letterSpacing: "1px",
                color: "#059669",
                textTransform: "uppercase",
              }}
            >
              PASSO 2 DE 3: PERFIL DO COMPRADOR
            </Typography>
            <Box
              sx={{
                height: "6px",
                width: "100%",
                bgcolor: "#E5E7EB",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: "66.6%",
                  bgcolor: "#10B981",
                  borderRadius: "999px",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Box>

          {/* Título e descrição */}
          <Box sx={{ mt: 3.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#1B4B3A",
                fontSize: { xs: "1.5rem", sm: "1.75rem" },
              }}
            >
              Cadastro de Comprador / Artesão
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7670", mt: 0.8 }}>
              Artesãos, cooperativas, instituições de caridade e empresas criativas.
            </Typography>
          </Box>

          {/* Botões de Criar Conta com Google e LinkedIn */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 3,
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              {/* Botão Google */}
              <Button
                type="button"
                aria-label="Criar conta com o Google"
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

              {/* Botão LinkedIn */}
              <Button
                type="button"
                aria-label="Criar conta com o LinkedIn"
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

            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 2,
                mt: 2.5,
              }}
            >
              <Box sx={{ flex: 1, height: "1px", bgcolor: "#E7E4DA" }} />
              <Typography sx={{ fontSize: "0.8rem", color: "#9CA3AF" }}>
                ou preencha os dados
              </Typography>
              <Box sx={{ flex: 1, height: "1px", bgcolor: "#E7E4DA" }} />
            </Box>
          </Box>

          {/* Formulário de cadastro */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {/* Campo para adicionar foto de perfil */}
            <Box>
              <Typography sx={labelStyle}>Foto de Perfil</Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                  p: 2,
                  borderRadius: "12px",
                  border: "1px dashed #B8B4A8",
                  bgcolor: "#FAF9F5",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#10B981",
                    bgcolor: "rgba(16, 185, 129, 0.03)",
                  },
                }}
              >
                {/* Preview ou ícone placeholder */}
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1px solid #D9D5C8",
                    bgcolor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {foto ? (
                    <Box
                      component="img"
                      src={foto}
                      alt="Foto de perfil"
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <User size={32} color="#9CA3AF" />
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1B4B3A" }}
                  >
                    {foto ? "Foto selecionada" : "Adicionar foto de perfil"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7670", mt: 0.3 }}>
                    PNG, JPG ou WEBP de até 5MB
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                    <Button
                      type="button"
                      size="small"
                      variant="outlined"
                      onClick={() => fileInputRef.current?.click()}
                      startIcon={<Camera size={14} />}
                      sx={{
                        textTransform: "none",
                        fontSize: "0.75rem",
                        borderRadius: "6px",
                        borderColor: "#D9D5C8",
                        color: "#1B4B3A",
                        px: 1.5,
                        py: 0.5,
                        "&:hover": {
                          borderColor: "#10B981",
                          bgcolor: "#F3F1EA",
                        },
                      }}
                    >
                      {foto ? "Alterar foto" : "Escolher arquivo"}
                    </Button>

                    {foto && (
                      <Button
                        type="button"
                        size="small"
                        color="error"
                        onClick={handleRemoverFoto}
                        startIcon={<X size={14} />}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                          borderRadius: "6px",
                          px: 1.2,
                          py: 0.5,
                        }}
                      >
                        Remover
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Input escondido para upload de arquivo */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  style={{ display: "none" }}
                />
              </Box>
            </Box>

            {/* Nome Completo ou Razão Social */}
            <Box>
              <Typography component="label" htmlFor="nomeOuRazao" sx={labelStyle}>
                Nome Completo ou Razão Social
              </Typography>
              <Box
                component="input"
                id="nomeOuRazao"
                name="nomeOuRazao"
                type="text"
                value={formData.nomeOuRazao}
                onChange={handleChange}
                placeholder="Ex: Ateliê Reutiliza Franca"
                sx={inputStyle}
              />
            </Box>

            {/* CPF ou CNPJ e Tipo de Entidade */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography component="label" htmlFor="cpfOuCnpj" sx={labelStyle}>
                  CPF ou CNPJ
                </Typography>
                <Box
                  component="input"
                  id="cpfOuCnpj"
                  name="cpfOuCnpj"
                  type="text"
                  value={formData.cpfOuCnpj}
                  onChange={handleChange}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  sx={inputStyle}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="tipoEntidade" sx={labelStyle}>
                  Tipo de Entidade
                </Typography>
                <Box
                  component="input"
                  id="tipoEntidade"
                  name="tipoEntidade"
                  type="text"
                  value={formData.tipoEntidade}
                  onChange={handleChange}
                  placeholder="Ex: Artesão Autônomo"
                  sx={inputStyle}
                />
              </Box>
            </Box>

            {/* Localização para cálculo de logística */}
            <Box>
              <Typography component="label" htmlFor="localizacao" sx={labelStyle}>
                Localização para cálculo de logística
              </Typography>
              <Box
                component="input"
                id="localizacao"
                name="localizacao"
                type="text"
                value={formData.localizacao}
                onChange={handleChange}
                placeholder="Bairro, Franca - SP"
                sx={inputStyle}
              />
            </Box>

            {/* Ações do Formulário */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 3,
                pt: 1,
              }}
            >
              <Button
                type="button"
                onClick={handleVoltar}
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  borderColor: "#D9D5C8",
                  color: "#1B4B3A",
                  px: 3.5,
                  py: 1.2,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  "&:hover": {
                    bgcolor: "#F3F1EA",
                    borderColor: "#D9D5C8",
                  },
                }}
              >
                Voltar
              </Button>

              <Button
                type="submit"
                variant="contained"
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  bgcolor: "#10B981",
                  color: "white",
                  px: 3.5,
                  py: 1.2,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#059669",
                    boxShadow: "none",
                  },
                }}
              >
                Finalizar Cadastro
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
