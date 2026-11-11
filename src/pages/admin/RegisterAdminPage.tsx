import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  Camera, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { cadastrarAdmin, atualizarFotoUsuario, type AdminCreatePayload } from "../../api/services";
import { consultarCep } from "../../services/cepService";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";

export default function RegisterAdminPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dados do formulário
  const [formData, setFormData] = useState<AdminCreatePayload>({
    name: "",
    email: "",
    cpf: "",
    cellphone: "",
    birthday: "",
    zip_code: "",
    street: "",
    number: "",
    neighborhood: "",
    state: "",
    city: "",
  });

  // Foto opcional
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Estados e Cidades do IBGE
  const [states, setStates] = useState<Array<{ id: number; sigla: string; nome: string }>>([]);
  const [cities, setCities] = useState<Array<{ id: number; nome: string }>>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((res) => res.json())
      .then((data) => setStates(data))
      .catch((err) => console.error("Erro ao carregar estados:", err));
  }, []);

  useEffect(() => {
    if (!formData.state) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.state}/municipios?orderBy=nome`)
      .then((res) => res.json())
      .then((data) => setCities(data))
      .catch((err) => console.error("Erro ao carregar cidades:", err))
      .finally(() => setLoadingCities(false));
  }, [formData.state]);

  function handleChange(field: keyof AdminCreatePayload, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  async function handleCepBlur() {
    const clean = formData.zip_code.replace(/\D/g, "");
    if (clean.length !== 8) return;
    try {
      const controller = new AbortController();
      const address = await consultarCep(clean, controller.signal);
      setFormData((prev) => ({
        ...prev,
        street: address.street || prev.street,
        neighborhood: address.neighborhood || prev.neighborhood,
        city: address.city || prev.city,
        state: address.state || prev.state,
      }));
    } catch {
      // Ignora erro silenciosamente
    }
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.cpf.trim() ||
      !formData.cellphone.trim() ||
      !formData.birthday.trim()
    ) {
      setError("Preencha todos os campos obrigatórios do Passo 1.");
      return;
    }
    setError("");
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !formData.zip_code.trim() ||
      !formData.street.trim() ||
      !formData.number.trim() ||
      !formData.neighborhood.trim() ||
      !formData.state ||
      !formData.city
    ) {
      setError("Preencha o endereço completo do novo administrador.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const cleanCpf = formData.cpf.replace(/\D/g, "");
      const cleanPhone = formData.cellphone.replace(/\D/g, "");
      const cleanZip = formData.zip_code.replace(/\D/g, "");

      const payload: AdminCreatePayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        cpf: cleanCpf,
        cellphone: cleanPhone,
        birthday: formData.birthday.trim(),
        zip_code: cleanZip,
        street: formData.street.trim(),
        number: formData.number.trim(),
        neighborhood: formData.neighborhood.trim(),
        state: formData.state,
        city: formData.city,
      };

      const res = await cadastrarAdmin(payload);
      const newAdminId = res.data?.id;

      // Se selecionou foto, envia como FormData
      if (newAdminId && photoFile) {
        try {
          const photoData = new FormData();
          photoData.append("photo", photoFile);
          await atualizarFotoUsuario(newAdminId, photoData);
        } catch (photoErr) {
          console.warn("Aviso: foto não pôde ser salva:", photoErr);
        }
      }

      setSuccess("Administrador cadastrado com sucesso! As credenciais foram enviadas por e-mail.");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      setError(msg || "Não foi possível cadastrar o administrador. Verifique os dados inseridos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div>
        <Link
          to="/dashboardUsuario"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 hover:text-emerald-950 transition-colors mb-2"
        >
          <ArrowLeft size={16} /> Voltar ao Painel
        </Link>
        <h1 className={s.title}>Cadastrar Administrador</h1>
        <p className={s.copy}>
          Crie um novo perfil de administrador. A senha de primeiro acesso será gerada e enviada diretamente para o e-mail cadastrado.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-tinta-suave">
          <span>Passo {step} de 2: {step === 1 ? "Dados Pessoais" : "Endereço"}</span>
          <span>{step === 1 ? "50%" : "100%"}</span>
        </div>
        <div className="h-2 w-full bg-papel-suave rounded-full overflow-hidden border border-cinza-linha">
          <div
            className="h-full bg-emerald-800 transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className={`${s.panel} text-center py-12 space-y-4`}>
          <CheckCircle2 size={52} className="mx-auto text-emerald-700" />
          <h2 className="text-2xl font-semibold text-tinta">Tudo pronto!</h2>
          <p className="text-sm text-tinta-suave max-w-md mx-auto">
            {success}
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link to="/admin/usuarios" className={s.button}>
              Ver Lista de Usuários
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccess("");
                setStep(1);
                setFormData({
                  name: "",
                  email: "",
                  cpf: "",
                  cellphone: "",
                  birthday: "",
                  zip_code: "",
                  street: "",
                  number: "",
                  neighborhood: "",
                  state: "",
                  city: "",
                });
                setPhotoFile(null);
                setPhotoPreview(null);
              }}
              className={s.secondary}
            >
              Cadastrar Outro
            </button>
          </div>
        </div>
      ) : (
        <div className={s.panel}>
          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-cinza-linha">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Prévia" className="w-full h-full object-cover" />
                    ) : (
                      <User size={36} className="text-emerald-800" />
                    )}
                  </div>
                  <label
                    htmlFor="admin-photo"
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-800 text-white cursor-pointer hover:bg-emerald-900 transition-colors shadow-xs"
                    title="Adicionar foto"
                  >
                    <Camera size={14} />
                    <input
                      id="admin-photo"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-tinta">Foto de Perfil (Opcional)</h3>
                  <p className="text-xs text-tinta-suave">
                    Formatos JPG, PNG ou WebP.
                  </p>
                </div>
              </div>

              <div>
                <label className={s.label}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do administrador"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={s.input}
                />
              </div>

              <div>
                <label className={s.label}>E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@exemplo.com.br"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={s.input}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={s.label}>CPF (somente números) *</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    className={s.input}
                  />
                </div>

                <div>
                  <label className={s.label}>Telefone Celular *</label>
                  <input
                    type="tel"
                    required
                    maxLength={15}
                    placeholder="(16) 99999-9999"
                    value={formData.cellphone}
                    onChange={(e) => handleChange("cellphone", e.target.value)}
                    className={s.input}
                  />
                </div>
              </div>

              <div>
                <label className={s.label}>Data de Nascimento *</label>
                <input
                  type="date"
                  required
                  value={formData.birthday}
                  onChange={(e) => handleChange("birthday", e.target.value)}
                  className={s.input}
                />
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className={`${s.button} flex items-center gap-2`}>
                  Avançar para Endereço
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 text-emerald-800 font-semibold text-sm">
                <MapPin size={18} />
                <span>Localização e Endereço</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={s.label}>CEP *</label>
                  <input
                    type="text"
                    required
                    maxLength={9}
                    placeholder="14400-000"
                    value={formData.zip_code}
                    onBlur={handleCepBlur}
                    onChange={(e) => handleChange("zip_code", e.target.value)}
                    className={s.input}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={s.label}>Logradouro / Rua *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rua, Avenida..."
                    value={formData.street}
                    onChange={(e) => handleChange("street", e.target.value)}
                    className={s.input}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={s.label}>Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={formData.number}
                    onChange={(e) => handleChange("number", e.target.value)}
                    className={s.input}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={s.label}>Bairro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do bairro"
                    value={formData.neighborhood}
                    onChange={(e) => handleChange("neighborhood", e.target.value)}
                    className={s.input}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={s.label}>Estado (UF) *</label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => {
                      handleChange("state", e.target.value);
                      handleChange("city", "");
                    }}
                    className={s.input}
                  >
                    <option value="">Selecione o Estado</option>
                    {states.map((st) => (
                      <option key={st.id} value={st.sigla}>
                        {st.nome} ({st.sigla})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={s.label}>Cidade *</label>
                  <select
                    required
                    disabled={!formData.state || loadingCities}
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className={s.input}
                  >
                    <option value="">
                      {loadingCities ? "Carregando municípios..." : "Selecione a Cidade"}
                    </option>
                    {cities.map((ct) => (
                      <option key={ct.id} value={ct.nome}>
                        {ct.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-cinza-linha">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className={s.secondary}
                >
                  Voltar ao Passo 1
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`${s.button} flex items-center gap-2`}
                >
                  <ShieldCheck size={18} />
                  {loading ? "Cadastrando Admin..." : "Concluir Cadastro"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
