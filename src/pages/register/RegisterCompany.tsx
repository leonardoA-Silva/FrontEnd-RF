import React, { useCallback, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Camera, X, Building2, Eye, EyeOff } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { cadastrarEmpresa } from "../../axios/Axios";
import { mensagemDeErroApi } from "../../utils/apiError";
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

  // Carrega as cidades do estado informado — chamado ao trocar a UF no
  // select ou quando o CEP traz uma UF diferente (sem setState em effect).
  const carregarCidades = useCallback(async (uf: string) => {
    setCarregandoCidades(true);
    try {
      const res = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
      );
      const data: CidadeIBGE[] = await res.json();
      setCidades(data);
    } catch (err) {
      console.error("Erro ao carregar cidades do IBGE:", err);
    } finally {
      setCarregandoCidades(false);
    }
  }, []);

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state,
      city: "",
    }));
    setCidades([]);
    if (state) carregarCidades(state);
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
          // Se o CEP trouxe uma UF diferente, recarrega as cidades dela.
          if (data.uf && data.uf !== formData.state) {
            carregarCidades(data.uf);
          }
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
      const mensagem = mensagemDeErroApi(
        error,
        "Não foi possível realizar o cadastro da empresa. Tente novamente."
      );
      notify.error("Erro no cadastro", mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const handleCancel = () => {
    navigate("/cadastro");
  };

  const styles = {
    pagina: "flex min-h-screen flex-col bg-papel text-carvao",
    area: "flex flex-1 items-start justify-center px-5 py-10 sm:px-8",
    cartao: "w-full max-w-2xl rounded-2xl border border-areia bg-cru p-6 sm:p-10",

    indicadorEtapa: "flex flex-col gap-3",
    etapaRotulo: "flex items-baseline justify-between gap-3",
    etapaAtual: "text-sm font-semibold text-canela-escura",
    etapaProxima: "text-xs text-carvao-suave/70",
    etapaBarra: "flex gap-1.5",
    etapaSegmentoPreenchido: "h-1.5 flex-1 rounded-full bg-canela",
    etapaSegmentoVazio: "h-1.5 flex-1 rounded-full bg-areia",

    cabecalho: "mt-8",
    titulo: "font-display text-2xl font-semibold tracking-tight sm:text-3xl",
    descricao: "mt-2 text-[15px] text-carvao-suave",

    formulario: "mt-8 flex flex-col gap-8",
    secao: "flex flex-col gap-4",
    secaoTitulo: "font-display text-lg font-semibold text-carvao",
    campoGrupo: "flex flex-col gap-2",
    rotulo: "text-sm font-semibold text-carvao-suave",
    gradeDois: "grid gap-4 sm:grid-cols-2",
    input:
      "w-full rounded-xl border border-areia bg-cru px-4 py-3 text-[15px] text-carvao outline-none transition placeholder:text-carvao-suave/50 focus:border-canela focus:outline-none focus:ring-4 focus:ring-canela/15 disabled:opacity-60",
    select:
      "w-full cursor-pointer appearance-none rounded-xl border border-areia bg-cru bg-no-repeat py-3 pl-4 pr-10 text-[15px] text-carvao outline-none transition focus:border-canela focus:outline-none focus:ring-4 focus:ring-canela/15 disabled:opacity-60",

    logoCaixa:
      "flex items-center gap-4 rounded-2xl border-2 border-dashed border-areia bg-papel p-4 transition hover:border-canela/60",
    logoPreview:
      "flex h-[72px] w-[72px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-areia bg-cru",
    logoPreviewImagem: "h-full w-full object-cover",
    logoTitulo: "text-sm font-semibold text-carvao",
    logoDica: "mt-0.5 text-xs text-carvao-suave/80",
    logoBotoes: "mt-2.5 flex gap-2",
    botaoFoto:
      "flex items-center gap-1.5 rounded-lg border border-areia bg-cru px-2.5 py-1.5 text-xs font-semibold text-carvao transition hover:border-canela hover:bg-areia-clara",
    botaoRemoverFoto:
      "flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50",

    senhaWrapper: "relative",
    inputSenha: "pr-12",
    botaoOlho:
      "absolute right-4 top-1/2 -translate-y-1/2 text-carvao-suave/70 transition hover:text-carvao",

    acoes: "mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-areia pt-6",
    botaoVoltar:
      "rounded-xl border border-areia px-5 py-3 text-sm font-semibold text-carvao transition hover:border-carvao-suave hover:bg-areia-clara",
    botaoEnviar:
      "flex items-center gap-2 rounded-xl bg-canela px-6 py-3 text-sm font-bold text-cru transition hover:bg-canela-escura disabled:cursor-not-allowed disabled:opacity-70",
  };

  // Seta customizada dos selects (sem CSS externo).
  const setaSelect = {
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234A4239' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundSize: "1em",
    backgroundPosition: "right 1rem center",
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.area}>
        <div className={styles.cartao}>
          {/* Indicador de etapa */}
          <div className={styles.indicadorEtapa}>
            <div className={styles.etapaRotulo}>
              <p className={styles.etapaAtual}>Etapa 2 de 3 · Perfil da empresa</p>
              <p className={styles.etapaProxima}>Depois: confirmação por e-mail</p>
            </div>
            <div className={styles.etapaBarra}>
              <span className={styles.etapaSegmentoPreenchido} />
              <span className={styles.etapaSegmentoPreenchido} />
              <span className={styles.etapaSegmentoVazio} />
            </div>
          </div>

          {/* Título */}
          <div className={styles.cabecalho}>
            <h1 className={styles.titulo}>Cadastro de empresa geradora</h1>
            <p className={styles.descricao}>
              Registre sua fábrica ou curtume para publicar resíduos
              regularmente.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className={styles.formulario} noValidate>
            {/* Logotipo */}
            <section className={styles.secao}>
              <h2 className={styles.secaoTitulo}>Logotipo da empresa</h2>
              <div className={styles.logoCaixa}>
                <span
                  className={styles.logoPreview}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {foto ? (
                    <img
                      src={foto}
                      alt="Logo da empresa"
                      className={styles.logoPreviewImagem}
                    />
                  ) : (
                    <Building2 size={30} className="text-carvao-suave/50" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className={styles.logoTitulo}>
                    {foto ? "Logotipo selecionado" : "Adicionar logotipo"}
                  </p>
                  <p className={styles.logoDica}>PNG, JPG ou WEBP de até 5MB</p>

                  <div className={styles.logoBotoes}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={styles.botaoFoto}
                    >
                      <Camera size={14} />
                      {foto ? "Alterar foto" : "Escolher arquivo"}
                    </button>

                    {foto && (
                      <button
                        type="button"
                        onClick={handleRemoverFoto}
                        className={styles.botaoRemoverFoto}
                      >
                        <X size={14} />
                        Remover
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
            </section>

            {/* A empresa */}
            <section className={styles.secao}>
              <h2 className={styles.secaoTitulo}>A empresa</h2>
              <div className={styles.campoGrupo}>
                <label htmlFor="name" className={styles.rotulo}>
                  Nome / razão social
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Indústria de Calçados Franca Ltda"
                  className={styles.input}
                />
              </div>

              <div className={styles.gradeDois}>
                <div className={styles.campoGrupo}>
                  <label htmlFor="cnpj" className={styles.rotulo}>
                    CNPJ da empresa
                  </label>
                  <input
                    id="cnpj"
                    name="cnpj"
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    value={formData.cnpj}
                    onChange={handleNumerosChange("cnpj", 14)}
                    placeholder="Apenas números (14 dígitos)"
                    className={styles.input}
                  />
                </div>

                <div className={styles.campoGrupo}>
                  <label htmlFor="cpf" className={styles.rotulo}>
                    CPF do responsável legal
                  </label>
                  <input
                    id="cpf"
                    name="cpf"
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    value={formData.cpf}
                    onChange={handleNumerosChange("cpf", 11)}
                    placeholder="Apenas números (11 dígitos)"
                    className={styles.input}
                  />
                </div>
              </div>
            </section>

            {/* Contato */}
            <section className={styles.secao}>
              <h2 className={styles.secaoTitulo}>Contato</h2>
              <div className={styles.gradeDois}>
                <div className={styles.campoGrupo}>
                  <label htmlFor="email" className={styles.rotulo}>
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contato@empresa.com"
                    className={styles.input}
                  />
                </div>

                <div className={styles.campoGrupo}>
                  <label htmlFor="cellphone" className={styles.rotulo}>
                    Celular / telefone
                  </label>
                  <input
                    id="cellphone"
                    name="cellphone"
                    type="text"
                    value={formData.cellphone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className={styles.input}
                  />
                </div>
              </div>
            </section>

            {/* Endereço */}
            <section className={styles.secao}>
              <h2 className={styles.secaoTitulo}>Endereço</h2>
              <div className={styles.gradeDois}>
                <div className={styles.campoGrupo}>
                  <label htmlFor="zip_code" className={styles.rotulo}>
                    CEP {carregandoCep && "(Buscando…)"}
                  </label>
                  <input
                    id="zip_code"
                    name="zip_code"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={formData.zip_code}
                    onChange={handleNumerosChange("zip_code", 8)}
                    onBlur={handleCepBlur}
                    placeholder="00000000 (8 dígitos)"
                    className={styles.input}
                  />
                </div>

                <div className={styles.campoGrupo}>
                  <label htmlFor="number" className={styles.rotulo}>
                    Número
                  </label>
                  <input
                    id="number"
                    name="number"
                    type="text"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="Ex: 123"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.gradeDois}>
                <div className={styles.campoGrupo}>
                  <label htmlFor="street" className={styles.rotulo}>
                    Rua / logradouro
                  </label>
                  <input
                    id="street"
                    name="street"
                    type="text"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Ex: Av. Dr. Hélio Palermo"
                    className={styles.input}
                  />
                </div>

                <div className={styles.campoGrupo}>
                  <label htmlFor="neighborhood" className={styles.rotulo}>
                    Bairro
                  </label>
                  <input
                    id="neighborhood"
                    name="neighborhood"
                    type="text"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    placeholder="Ex: Centro"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.gradeDois}>
                <div className={styles.campoGrupo}>
                  <label htmlFor="state" className={styles.rotulo}>
                    Estado (UF)
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleEstadoChange}
                    className={styles.select}
                    style={setaSelect}
                  >
                    <option value="">Selecione o estado</option>
                    {estados.map((uf) => (
                      <option key={uf.id} value={uf.sigla}>
                        {uf.nome} ({uf.sigla})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.campoGrupo}>
                  <label htmlFor="city" className={styles.rotulo}>
                    Cidade
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    disabled={!formData.state || carregandoCidades}
                    onChange={handleCidadeChange}
                    className={styles.select}
                    style={setaSelect}
                  >
                    <option value="">
                      {carregandoCidades
                        ? "Carregando cidades…"
                        : formData.state
                          ? "Selecione a cidade"
                          : "Selecione o estado primeiro"}
                    </option>
                    {cidades.map((cid) => (
                      <option key={cid.id} value={cid.nome}>
                        {cid.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Acesso */}
            <section className={styles.secao}>
              <h2 className={styles.secaoTitulo}>Acesso</h2>
              <div className={styles.campoGrupo}>
                <label htmlFor="password" className={styles.rotulo}>
                  Senha
                </label>
                <div className={styles.senhaWrapper}>
                  <input
                    id="password"
                    name="password"
                    type={mostrarSenha ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Crie uma senha segura"
                    className={`${styles.input} ${styles.inputSenha}`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    className={styles.botaoOlho}
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </section>

            {/* Ações */}
            <div className={styles.acoes}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={carregando}
                className={styles.botaoVoltar}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={carregando}
                className={styles.botaoEnviar}
              >
                {carregando ? "Cadastrando…" : "Salvar e continuar"}
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />

      {modalAberto && (
        <EmailVerificationModal
          userId={userIdCriado}
          email={formData.email}
          onSuccess={() => {
            notify.success("Conta ativada!", "Faça login com seu CNPJ/CPF e senha.");
            navigate("/login");
          }}
          onClose={() => setModalAberto(false)}
        />
      )}

      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  );
}
