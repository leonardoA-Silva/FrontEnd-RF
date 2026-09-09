import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { ArrowRight } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegisterType() {
  const navigate = useNavigate();
  const [tipoConta, setTipoConta] = useState<"empresa" | "pessoal">("empresa");

  const handleSalvarEContinuar = () => {
    if (tipoConta === "empresa") {
      navigate("/cadastro-empresa");
    } else {
      navigate("/cadastro-pessoal");
    }
  };

  const handleCancelar = () => {
    navigate("/");
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
        {/* Card Central */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 720,
            borderRadius: "24px",
            border: "1px solid #E7E4DA",
            bgcolor: "white",
            p: { xs: 3, sm: 5 },
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Indicador de etapa e progresso */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                  color: "#059669",
                  textTransform: "uppercase",
                }}
              >
                PASSO 1 DE 3: PERFIL
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                Próximo: Materiais Frequentes
              </Typography>
            </Box>

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
                  width: "33.3%",
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
              Escolha seu tipo de conta para cadastrar-se
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7670", mt: 0.8 }}>
              Registre sua fábrica ou uma conta pessoal para publicar resíduos regularmente.
            </Typography>
          </Box>

          {/* Cards de seleção do tipo de conta */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
              mt: 4,
            }}
          >
            {/* Opção Empresa */}
            <Box
              onClick={() => setTipoConta("empresa")}
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                border: "4px solid",
                borderColor: tipoConta === "empresa" ? "#10B981" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: tipoConta === "empresa" ? "scale(1.01)" : "scale(1)",
                boxShadow:
                  tipoConta === "empresa"
                    ? "0 6px 16px rgba(16, 185, 129, 0.2)"
                    : "none",
                "&:hover": {
                  opacity: 1,
                  borderColor: tipoConta === "empresa" ? "#10B981" : "#A7F3D0",
                },
              }}
            >
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80"
                alt="Aperto de mãos empresarial"
                sx={{
                  height: 176,
                  width: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <Box
                sx={{
                  bgcolor: "#0F3D2E",
                  py: 1.8,
                  textAlign: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                Empresa
              </Box>
            </Box>

            {/* Opção Pessoal */}
            <Box
              onClick={() => setTipoConta("pessoal")}
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                border: "4px solid",
                borderColor: tipoConta === "pessoal" ? "#10B981" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: tipoConta === "pessoal" ? "scale(1.01)" : "scale(1)",
                boxShadow:
                  tipoConta === "pessoal"
                    ? "0 6px 16px rgba(16, 185, 129, 0.2)"
                    : "none",
                "&:hover": {
                  opacity: 1,
                  borderColor: tipoConta === "pessoal" ? "#10B981" : "#A7F3D0",
                },
              }}
            >
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=600&q=80"
                alt="Profissional autônomo trabalhando"
                sx={{
                  height: 176,
                  width: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <Box
                sx={{
                  bgcolor: "#0F3D2E",
                  py: 1.8,
                  textAlign: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                Pessoal
              </Box>
            </Box>
          </Box>

          {/* Ações do Rodapé */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 5,
            }}
          >
            <Button
              onClick={handleCancelar}
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
              onClick={handleSalvarEContinuar}
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

      <Footer />
    </Box>
  );
}
