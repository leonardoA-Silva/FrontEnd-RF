import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { ArrowRight, Camera, X, Building2 } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegisterCompany() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    razaoSocial: "",
    cnpj: "",
    setorIndustrial: "",
    endereco: "",
    responsavel: "",
    telefone: "",
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
    console.log("Dados do cadastro da empresa:", {
      ...formData,
      foto,
    });
  };

  const handleCancel = () => {
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
              PASSO 2 DE 3: PERFIL DA EMPRESA
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
              Cadastro de Empresa Geradora
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7670", mt: 0.8 }}>
              Registre sua fábrica ou curtume para publicar resíduos regularmente.
            </Typography>
          </Box>

         

          {/* Formulário de cadastro */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {/* Campo para adicionar foto / logotipo da empresa */}
            <Box>
              <Typography sx={labelStyle}>Logotipo da Empresa</Typography>
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
                    borderRadius: "12px",
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
                      alt="Logo da empresa"
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Building2 size={32} color="#9CA3AF" />
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1B4B3A" }}
                  >
                    {foto ? "Logotipo selecionado" : "Adicionar logotipo"}
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

            {/* Razão Social */}
            <Box>
              <Typography component="label" htmlFor="razaoSocial" sx={labelStyle}>
                Razão Social
              </Typography>
              <Box
                component="input"
                id="razaoSocial"
                name="razaoSocial"
                type="text"
                value={formData.razaoSocial}
                onChange={handleChange}
                placeholder="Ex: Calçados Franca Conectada Ltda"
                sx={inputStyle}
              />
            </Box>

            {/* CNPJ e Setor Industrial */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography component="label" htmlFor="cnpj" sx={labelStyle}>
                  CNPJ
                </Typography>
                <Box
                  component="input"
                  id="cnpj"
                  name="cnpj"
                  type="text"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                  sx={inputStyle}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="setorIndustrial" sx={labelStyle}>
                  Setor Industrial
                </Typography>
                <Box
                  component="input"
                  id="setorIndustrial"
                  name="setorIndustrial"
                  type="text"
                  value={formData.setorIndustrial}
                  onChange={handleChange}
                  placeholder="Ex: Calçadista (Componentes)"
                  sx={inputStyle}
                />
              </Box>
            </Box>

            {/* Endereço da Unidade */}
            <Box>
              <Typography component="label" htmlFor="endereco" sx={labelStyle}>
                Endereço da Unidade (Franca/SP)
              </Typography>
              <Box
                component="input"
                id="endereco"
                name="endereco"
                type="text"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Ex: Av. Dr. Hélio Palermo, 4200 - Jd. Paulista"
                sx={inputStyle}
              />
            </Box>

            {/* Responsável e Telefone / WhatsApp */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography component="label" htmlFor="responsavel" sx={labelStyle}>
                  Responsável
                </Typography>
                <Box
                  component="input"
                  id="responsavel"
                  name="responsavel"
                  type="text"
                  value={formData.responsavel}
                  onChange={handleChange}
                  placeholder="Nome do responsável"
                  sx={inputStyle}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="telefone" sx={labelStyle}>
                  Telefone / WhatsApp
                </Typography>
                <Box
                  component="input"
                  id="telefone"
                  name="telefone"
                  type="text"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  sx={inputStyle}
                />
              </Box>
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
                onClick={handleCancel}
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
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="contained"
                endIcon={<ArrowRight size={18} />}
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
                Salvar e Continuar
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
