import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { Check, ArrowRight } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegisterCompany() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    razaoSocial: "Calçados Franca Conectada Ltda",
    cnpj: "12.345.678/0001-90",
    setorIndustrial: "Calçadista (Componentes)",
    endereco: "Av. Dr. Hélio Palermo, 4200 - Jd. Paulista",
    responsavel: "Roberto de Oliveira",
    telefone: "(16) 98844-3232",
  });

  const [materiaisSelecionados, setMateriaisSelecionados] = useState<string[]>([
    "Couro",
    "Tecido",
    "EVA",
  ]);

  const listaMateriais = [
    "Couro",
    "Tecido",
    "EVA",
    "Borracha",
    "Espuma",
    "Pallets",
  ];

  const toggleMaterial = (material: string) => {
    setMateriaisSelecionados((anteriores) =>
      anteriores.includes(material)
        ? anteriores.filter((m) => m !== material)
        : [...anteriores, material]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados do cadastro da empresa:", {
      ...formData,
      materiais: materiaisSelecionados,
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
            sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
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

            {/* Materiais Disponíveis */}
            <Box sx={{ mt: 1 }}>
              <Typography sx={labelStyle}>Materiais disponíveis</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1 }}>
                {listaMateriais.map((material) => {
                  const selecionado = materiaisSelecionados.includes(material);
                  return (
                    <Box
                      key={material}
                      onClick={() => toggleMaterial(material)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: selecionado ? "#10B981" : "#D9D5C8",
                        bgcolor: selecionado ? "rgba(16, 185, 129, 0.08)" : "white",
                        color: selecionado ? "#047857" : "#6B7670",
                        px: 1.8,
                        py: 0.9,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        userSelect: "none",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: selecionado
                            ? "rgba(16, 185, 129, 0.14)"
                            : "#F9F8F5",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: selecionado ? "#10B981" : "white",
                          border: selecionado ? "none" : "1px solid #B8B4A8",
                          color: "white",
                        }}
                      >
                        {selecionado && <Check size={12} strokeWidth={3} />}
                      </Box>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        {material}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Ações do Formulário */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 4,
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
