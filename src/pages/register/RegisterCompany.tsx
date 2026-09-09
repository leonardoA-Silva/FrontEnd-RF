import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { ArrowRight, Camera, X, Building2, Eye, EyeOff } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { cadastrarEmpresa } from "../../axios/Axios";
import { NotificationContainer } from "../../components/Notification";
import { useNotification } from "../../hooks/useNotification";
import EmailVerificationModal from "../../components/EmailVerificationModal";

interface EstadoIBGE {
  id: number;
  sigla: string;
  nome: string;
}

interface CidadeIBGE {
  id: number;
  nome: string;
}

export default function RegisterCompany() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notifications, removeNotification, notify } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    cpf: "",
    email: "",
    cellphone: "",
    zip_code: "",
    street: "",
    neighborhood: "",
    number: "",
    city: "",
    state: "",
    password: "",
  });

  const [estados, setEstados] = useState<EstadoIBGE[]>([]);
  const [cidades, setCidades] = useState<CidadeIBGE[]>([]);
  const [carregandoCidades, setCarregandoCidades] = useState(false);
  const [carregandoCep, setCarregandoCep] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [userIdCriado, setUserIdCriado] = useState("");

  // Carrega todos os estados do Brasil via API do IBGE
  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((res) => res.json())
      .then((data: EstadoIBGE[]) => setEstados(data))
      .catch((err) => console.error("Erro ao carregar estados do IBGE:", err));
  }, []);

  // Carrega as cidades do estado selecionado
  useEffect(() => {
    if (!formData.state) {
      setCidades([]);
      return;
    }

    setCarregandoCidades(true);
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.state}/municipios?orderBy=nome`
    )
      .then((res) => res.json())
      .then((data: CidadeIBGE[]) => {
        setCidades(data);
        setCarregandoCidades(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar cidades do IBGE:", err);
        setCarregandoCidades(false);
      });
  }, [formData.state]);

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state,
      city: "",
    }));
  };

  const handleCidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setFormData((prev) => ({
      ...prev,
      city,
    }));
  };

  const handleCepBlur = async () => {
    const cleanCep = formData.zip_code.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      setCarregandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            state: data.uf || prev.state,
            city: data.localidade || prev.city,
          }));
        }
      } catch (e) {
        console.error("Erro ao buscar CEP:", e);
      } finally {
        setCarregandoCep(false);
      }
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverFoto = () => {
    setFoto(null);
    setFotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Permite estritamente apenas números e limita a quantidade de dígitos
  const handleNumerosChange = (campo: string, maxLen: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const apenasNumeros = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    setFormData((prev) => ({ ...prev, [campo]: apenasNumeros }));
  };

  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCnpj = formData.cnpj.replace(/\D/g, "");
    const cleanCpf = formData.cpf.replace(/\D/g, "");
    const cleanCellphone = formData.cellphone.replace(/\D/g, "");
    const cleanZipCode = formData.zip_code.replace(/\D/g, "");

    // Validações locais antes de enviar
    if (!formData.name.trim()) {
      notify.error("Campo obrigatório", "Informe a razão social ou nome da empresa.");
      return;
    }
    if (cleanCnpj.length !== 14) {
      notify.error("CNPJ inválido", "O CNPJ deve conter exatamente 14 dígitos numéricos.");
      return;
    }
    if (cleanCpf.length !== 11) {
      notify.error("CPF inválido", "O CPF do responsável legal deve conter 11 dígitos numéricos.");
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      notify.error("E-mail inválido", "Informe um endereço de e-mail corporativo válido.");
      return;
    }
    if (cleanCellphone.length !== 11) {
      notify.error("Celular inválido", "Informe 11 dígitos numéricos com DDD (ex: 16999999999).");
      return;
    }
    if (cleanZipCode.length !== 8) {
      notify.error("CEP inválido", "O CEP deve conter 8 dígitos numéricos.");
      return;
    }
    if (!formData.number.trim()) {
      notify.error("Campo obrigatório", "Informe o número do endereço.");
      return;
    }
    if (!formData.street.trim() || !formData.neighborhood.trim()) {
      notify.error("Endereço incompleto", "Informe a rua e o bairro.");
      return;
    }
    if (!formData.state || !formData.city) {
      notify.error("Localização incompleta", "Selecione o estado e a cidade.");
      return;
    }
    if (formData.password.length < 6) {
      notify.error("Senha muito curta", "A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    setCarregando(true);

    try {
      const response = await cadastrarEmpresa(
        {
          name: formData.name.trim(),
          cnpj: cleanCnpj,
          cpf: cleanCpf,
          email: formData.email.trim(),
          password: formData.password,
          cellphone: cleanCellphone,
          zip_code: cleanZipCode,
          street: formData.street.trim(),
          neighborhood: formData.neighborhood.trim(),
          number: formData.number.trim().slice(0, 6),
          city: formData.city.trim(),
          state: formData.state.trim().toUpperCase(),
        },
        fotoFile
      );

      const data = response.data;
      setUserIdCriado(data.id);
      setModalAberto(true);

      if (data.emailSent === false) {
        notify.warning(
          "Conta criada",
          "Empresa cadastrada, mas o envio do e-mail falhou. Clique em 'Reenviar código' no modal."
        );
      } else {
        notify.success(
          "Cadastro realizado!",
          "Verifique o e-mail corporativo informado e confirme o código de ativação."
        );
      }
    } catch (error: unknown) {
      console.error("Erro ao cadastrar empresa:", error);
      let mensagem = "Não foi possível realizar o cadastro da empresa. Tente novamente.";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as any).response?.data
      ) {
        mensagem =
          (error as any).response.data.error ||
          (error as any).response.data.message ||
          mensagem;
      }
      notify.error("Erro no cadastro", mensagem);
    } finally {
      setCarregando(false);
    }
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

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7670' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 1rem center",
    backgroundSize: "1em",
    pr: 4,
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

            {/* Nome / Razão Social */}
            <Box>
              <Typography component="label" htmlFor="name" sx={labelStyle}>
                Nome / Razão Social
              </Typography>
              <Box
                component="input"
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Indústria de Calçados Franca Ltda"
                sx={inputStyle}
              />
            </Box>

            {/* CNPJ e CPF do Responsável */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2.5,
              }}
            >
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

              <Box>
                <Typography component="label" htmlFor="cpf" sx={labelStyle}>
                  CPF do Responsável Legal
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
            </Box>

            {/* Email e Celular / Telefone */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography component="label" htmlFor="email" sx={labelStyle}>
                  E-mail
                </Typography>
                <Box
                  component="input"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contato@empresa.com"
                  sx={inputStyle}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="cellphone" sx={labelStyle}>
                  Celular / Telefone
                </Typography>
                <Box
                  component="input"
                  id="cellphone"
                  name="cellphone"
                  type="text"
                  value={formData.cellphone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  sx={inputStyle}
                />
              </Box>
            </Box>

            {/* CEP e Número */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography component="label" htmlFor="zip_code" sx={labelStyle}>
                  CEP {carregandoCep && "(Buscando...)"}
                </Typography>
                <Box
                  component="input"
                  id="zip_code"
                  name="zip_code"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={formData.zip_code}
                  onChange={handleNumerosChange("zip_code", 8)}
                  onBlur={handleCepBlur}
                  placeholder="00000000 (8 dígitos)"
                  sx={inputStyle}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="number" sx={labelStyle}>
                  Número
                </Typography>
                <Box
                  component="input"
                  id="number"
                  name="number"
                  type="text"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="Ex: 123"
                  sx={inputStyle}
                />
              </Box>
            </Box>

            {/* Logradouro / Rua e Bairro */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography component="label" htmlFor="street" sx={labelStyle}>
                  Rua / Logradouro
                </Typography>
                <Box
                  component="input"
                  id="street"
                  name="street"
                  type="text"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Ex: Av. Dr. Hélio Palermo"
                  sx={inputStyle}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="neighborhood" sx={labelStyle}>
                  Bairro
                </Typography>
                <Box
                  component="input"
                  id="neighborhood"
                  name="neighborhood"
                  type="text"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  placeholder="Ex: Centro"
                  sx={inputStyle}
                />
              </Box>
            </Box>

            {/* Estado e Cidade */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography component="label" htmlFor="state" sx={labelStyle}>
                  Estado (UF)
                </Typography>
                <Box
                  component="select"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleEstadoChange}
                  sx={selectStyle}
                >
                  <option value="">Selecione o Estado</option>
                  {estados.map((uf) => (
                    <option key={uf.id} value={uf.sigla}>
                      {uf.nome} ({uf.sigla})
                    </option>
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography component="label" htmlFor="city" sx={labelStyle}>
                  Cidade
                </Typography>
                <Box
                  component="select"
                  id="city"
                  name="city"
                  value={formData.city}
                  disabled={!formData.state || carregandoCidades}
                  onChange={handleCidadeChange}
                  sx={{
                    ...selectStyle,
                    opacity: !formData.state ? 0.6 : 1,
                    cursor: !formData.state ? "not-allowed" : "pointer",
                  }}
                >
                  <option value="">
                    {carregandoCidades
                      ? "Carregando cidades..."
                      : formData.state
                      ? "Selecione a Cidade"
                      : "Selecione o estado primeiro"}
                  </option>
                  {cidades.map((cid) => (
                    <option key={cid.id} value={cid.nome}>
                      {cid.nome}
                    </option>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Senha (largura total) */}
            <Box>
              <Typography component="label" htmlFor="password" sx={labelStyle}>
                Senha
              </Typography>
              <Box sx={{ position: "relative", width: "100%" }}>
                <Box
                  component="input"
                  id="password"
                  name="password"
                  type={mostrarSenha ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Crie uma senha segura"
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
                disabled={carregando}
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
                disabled={carregando}
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
                  "&.Mui-disabled": {
                    bgcolor: "#6EE7B7",
                    color: "white",
                  },
                }}
              >
                {carregando ? "Cadastrando..." : "Salvar e Continuar"}
              </Button>
            </Box>
          </Box>

        </Box>
      </Box>

      <Footer />

      <EmailVerificationModal
        open={modalAberto}
        userId={userIdCriado}
        email={formData.email}
        onSuccess={() => {
          notify.success("Conta ativada!", "Faça login com seu CNPJ/CPF e senha.");
          navigate("/login");
        }}
        onClose={() => setModalAberto(false)}
      />

      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </Box>
  );
}
