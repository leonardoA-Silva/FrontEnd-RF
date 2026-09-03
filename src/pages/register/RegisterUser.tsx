import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { Check } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegisterUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nomeOuRazao: "Ateliê Reutiliza Franca",
    cpfOuCnpj: "123.456.789-00",
    tipoEntidade: "Artesão Autônomo",
    localizacao: "Estação, Franca - SP",
  });

  const [materiaisInteresse, setMateriaisInteresse] = useState<string[]>([
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
    setMateriaisInteresse((anteriores) =>
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
    console.log("Dados do comprador / artesão:", {
      ...formData,
      materiaisInteresse,
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
          {/* Título e descrição */}
          <Box>
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

          {/* Formulário de cadastro */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
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

            {/* Materiais de Interesse */}
            <Box sx={{ mt: 1 }}>
              <Typography sx={labelStyle}>Materiais de Interesse</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1 }}>
                {listaMateriais.map((material) => {
                  const selecionado = materiaisInteresse.includes(material);
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
