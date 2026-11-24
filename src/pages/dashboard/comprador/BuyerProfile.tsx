import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Camera, CheckCircle2, LoaderCircle, MapPin, Palette, ShieldCheck, UserRound } from "lucide-react";
import { atualizarPerfilUsuario, obterPerfilUsuario, type UsuarioPerfil } from "../../../api/services";
import { apiError } from "../../../axios/apiError";
import { readSession, updateSessionUser } from "../../../auth/session";
import { loadProfilePhoto, saveProfilePhoto, useProfilePhotoError } from "../../../auth/profilePhoto";
import { useLoggedUser } from "../../../hooks/useLoggedUser";
import { companyStyles as styles } from "../companyStyles";
import ThemeSelector from "../../../components/theme/ThemeSelector";

export default function BuyerProfile({ userId }: { userId: string }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ profile: UsuarioPerfil | null; error: string; loading: boolean }>({
    profile: null,
    error: "",
    loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    obterPerfilUsuario(userId, controller.signal)
      .then(({ data }) => {
        if (!data || data.id !== userId || typeof data.name !== "string") throw new Error("Perfil inválido.");
        if (!controller.signal.aborted) setState({ profile: data, loading: false, error: "" });
      })
      .catch(error => {
        if (!controller.signal.aborted) setState({ profile: null, loading: false, error: apiError(error, "Não foi possível consultar seu perfil.") });
      });
    return () => controller.abort();
  }, [userId, attempt]);

  function retry() {
    setState({ profile: null, loading: true, error: "" });
    setAttempt(v => v + 1);
  }

  return (
    <div className="company-profile-page">
      <header className="workspace-heading">
        <div>
          <p className="company-eyebrow">Minha conta</p>
          <h1>O perfil <em>do seu cadastro.</em></h1>
          <p className="workspace-description">Mantenha seu nome e as informações de contato atualizados na rede.</p>
        </div>
        <span className="workspace-heading-symbol">
          <UserRound size={30} strokeWidth={1.3} aria-hidden="true" />
        </span>
      </header>

      {!userId ? (
        <div role="alert" className={`${styles.card} mt-6`}>
          <p>Não conseguimos identificar sua conta nesta sessão.</p>
          <Link to="/login" className={`${styles.button} mt-4`}>Entrar novamente</Link>
        </div>
      ) : state.loading ? (
        <div role="status" className={`${styles.card} mt-6 flex items-center gap-3 text-sm text-tinta-suave`}>
          <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
          Carregando dados da sua conta…
        </div>
      ) : state.error || !state.profile ? (
        <div role="alert" className={`${styles.card} mt-6`}>
          <p className="text-sm text-danger">{state.error || "Perfil não encontrado."}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={retry} className={styles.button}>Tentar novamente</button>
            <Link to="/login" className={styles.secondary}>Entrar novamente</Link>
          </div>
        </div>
      ) : (
        <BuyerProfileContent profile={state.profile} />
      )}
    </div>
  );
}

function BuyerProfileContent({ profile: initialProfile }: { profile: UsuarioPerfil }) {
  const { photoSrc, token } = useLoggedUser();
  const photoError = useProfilePhotoError(initialProfile.id, token);
  const savedPhoto = photoSrc ?? "";

  const [profile, setProfile] = useState<UsuarioPerfil>(initialProfile);
  const [name, setName] = useState(initialProfile.name);
  const [phone, setPhone] = useState(initialProfile.cellphone ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState("");
  const [unreadablePhoto, setUnreadablePhoto] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const previewUrls = useRef(new Set<string>());
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const urls = previewUrls.current;
    return () => { urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  function releasePreview(url: string) {
    if (url) { URL.revokeObjectURL(url); previewUrls.current.delete(url); }
  }

  function selectPhoto(next: File | null) {
    if (pendingPhoto && pendingPhoto !== savedPhoto) releasePreview(pendingPhoto);
    setFile(next);
    setPendingPhoto("");
    setUnreadablePhoto("");
    setSuccess("");
    setError("");
    if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(next.type) || next.size > 5 * 1024 * 1024) {
      setError("Escolha uma imagem JPG, PNG, WebP ou GIF de até 5 MB.");
      return;
    }
    const url = URL.createObjectURL(next);
    previewUrls.current.add(url);
    setPendingPhoto(url);
  }

  const nameError = !name.trim() ? "Informe seu nome completo." : name.trim().length > 100 ? "Use até 100 caracteres para o nome." : "";
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneError = phoneDigits.length === 11 ? "" : "Informe 11 dígitos, incluindo o DDD.";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setError("");
    setSuccess("");

    if (nameError || phoneError) {
      (nameError ? nameRef : phoneRef).current?.focus();
      return;
    }

    if (file && unreadablePhoto === pendingPhoto) {
      setError("Não foi possível exibir esta imagem. Escolha outra foto antes de salvar.");
      return;
    }

    const session = readSession();
    if (session.user?.id !== profile.id || !session.token) {
      setError("Sua sessão expirou ou mudou. Entre novamente para atualizar o perfil.");
      return;
    }

    setBusy(true);
    try {
      const data = new FormData();
      data.append("name", name.trim());
      data.append("cellphone", phoneDigits);
      if (file) data.append("photo", file);

      const response = await atualizarPerfilUsuario(profile.id, data);
      if (!response.data.user || response.data.user.id !== profile.id) throw new Error("Resposta inválida da API.");

      const user = response.data.user;
      if (typeof user.name !== "string") throw new Error("Resposta inválida da API.");

      if (file && pendingPhoto) {
        saveProfilePhoto(profile.id, session.token, file);
        releasePreview(pendingPhoto);
        setPendingPhoto("");
      }

      if (mounted.current) {
        setProfile(user);
        setName(user.name);
        setPhone(user.cellphone ?? "");
        setFile(null);
        if (photoInput.current) photoInput.current.value = "";
        updateSessionUser({ name: user.name });
        setSuccess(file ? "Perfil e foto atualizados com sucesso." : "Dados da conta atualizados com sucesso.");
        setSubmitted(false);
      }
    } catch (cause) {
      if (mounted.current) setError(apiError(cause, "Não foi possível salvar seu perfil. Seus campos foram preservados."));
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  const initial = profile.name.trim().charAt(0).toUpperCase() || "U";
  const displayPhoto = pendingPhoto || savedPhoto;

  return (
    <div className="profile-layout">
      {/* Coluna da Esquerda: Identidade do Comprador / Monograma editorial */}
      <aside className="profile-identity">
        <span className="profile-monogram" aria-hidden="true">
          {initial}<i>.</i>
        </span>
        <p className="company-eyebrow">Meu cadastro</p>
        <h2>{profile.name}</h2>
        <p>É com esse nome que suas ideias, projetos e pedidos fazem parte da rede de reaproveitamento.</p>
        <span className="profile-identity-rule" />
        <ShieldCheck size={24} strokeWidth={1.3} aria-hidden="true" />
        <small>Seus dados de acesso e transações permanecem seguros e protegidos.</small>
      </aside>

      {/* Coluna da Direita: Foto + Ações + Formulário + Tema */}
      <div>
        {/* Seção da Foto de Perfil */}
        <section className="mb-5 rounded-2xl border border-linha bg-white/60 p-6 workspace-sheet" aria-labelledby="profile-photo-title">
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-linha bg-[var(--buyer-soft)] text-verde">
                {displayPhoto && unreadablePhoto !== displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={pendingPhoto ? "Prévia da foto de perfil" : "Foto do perfil"}
                    className="h-full w-full object-cover"
                    onError={() => setUnreadablePhoto(displayPhoto)}
                  />
                ) : (
                  <UserRound size={42} aria-hidden="true" />
                )}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => photoInput.current?.click()}
                aria-label="Adicionar ou alterar foto de perfil"
                className="absolute -right-2 -bottom-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-verde text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Camera size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 id="profile-photo-title" className="font-semibold text-verde-escuro">Foto de perfil</h2>
              <p className="mt-1 text-sm text-tinta-suave">
                {pendingPhoto
                  ? "Prévia da nova foto. Clique em Salvar alterações abaixo para confirmar."
                  : savedPhoto
                  ? "Foto salva no seu perfil."
                  : "Adicione uma foto (JPG, PNG, WebP de até 5 MB)."}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input
                  ref={photoInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  disabled={busy}
                  onChange={e => selectPhoto(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  className="company-button is-secondary text-xs"
                  disabled={busy}
                  onClick={() => photoInput.current?.click()}
                >
                  {displayPhoto ? "Alterar foto" : "Selecionar foto"}
                </button>
                {pendingPhoto && (
                  <button
                    type="button"
                    className="company-inline-link text-xs"
                    disabled={busy}
                    onClick={() => {
                      if (pendingPhoto) releasePreview(pendingPhoto);
                      setFile(null);
                      setPendingPhoto("");
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
          {unreadablePhoto && <p role="alert" className="mt-3 text-xs text-danger">Não foi possível exibir esta imagem. Escolha outra foto.</p>}
          {photoError && (
            <div role="alert" className="mt-3 flex items-center gap-2 text-xs text-danger">
              <span>{photoError}</span>
              <button
                type="button"
                className="underline"
                onClick={() => { if (token) void loadProfilePhoto(profile.id, token, true); }}
              >
                Recarregar
              </button>
            </div>
          )}
        </section>

        {/* Link para gerenciar endereços */}
        <Link to="/dashboardUsuario?tab=enderecos" className="company-button is-secondary mb-5 inline-flex items-center gap-2">
          <MapPin size={16} aria-hidden="true" />
          Gerenciar endereços
        </Link>

        {/* Formulário de Perfil */}
        <form onSubmit={submit} noValidate aria-busy={busy} className={`${styles.card} profile-form`}>
          <div className="mb-7 flex items-center gap-4 border-b border-linha pb-6">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-verde-claro text-verde">
              <UserRound size={28} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold text-verde-escuro">Informações da conta</h2>
              <p className="mt-1 text-sm text-tinta-suave">Edite seu nome e o celular de contato.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold text-tinta" htmlFor="perfil-nome">
              Nome completo <span className="font-normal text-tinta-suave">(obrigatório)</span>
              <input
                ref={nameRef}
                id="perfil-nome"
                autoComplete="name"
                required
                disabled={busy}
                maxLength={100}
                value={name}
                onChange={e => { setName(e.target.value); setSuccess(""); }}
                aria-invalid={submitted && Boolean(nameError)}
                aria-describedby={submitted && nameError ? "erro-nome" : undefined}
                className={styles.input}
              />
              {submitted && nameError && <span id="erro-nome" className="mt-2 block text-xs font-normal text-danger">{nameError}</span>}
            </label>

            <label className="text-sm font-semibold text-tinta" htmlFor="perfil-email">
              E-mail
              <input
                id="perfil-email"
                type="email"
                value={profile.email ?? ""}
                disabled
                className={styles.input}
                aria-describedby="ajuda-email"
              />
              <span id="ajuda-email" className="mt-2 block text-xs font-normal text-tinta-suave">A alteração de e-mail ainda não está disponível.</span>
            </label>

            <label className="text-sm font-semibold text-tinta" htmlFor="perfil-celular">
              Celular de contato <span className="font-normal text-tinta-suave">(obrigatório)</span>
              <input
                ref={phoneRef}
                id="perfil-celular"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                required
                disabled={busy}
                maxLength={20}
                value={phone}
                onChange={e => { setPhone(e.target.value); setSuccess(""); }}
                aria-invalid={submitted && Boolean(phoneError)}
                aria-describedby={submitted && phoneError ? "erro-celular" : "ajuda-celular"}
                className={styles.input}
              />
              <span id="ajuda-celular" className="mt-2 block text-xs font-normal text-tinta-suave">DDD e número do celular (11 dígitos).</span>
              {submitted && phoneError && <span id="erro-celular" className="mt-2 block text-xs font-normal text-danger">{phoneError}</span>}
            </label>

            <div className="flex items-start gap-3 rounded-lg bg-bruma p-4">
              <ShieldCheck size={21} className="shrink-0 text-verde" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-tinta-suave">
                Documentos e senhas de acesso não são exibidos nem alterados por este formulário.
              </p>
            </div>
          </div>

          {error && <p role="alert" className="mt-5 rounded-lg bg-ambar-fundo p-3 text-sm text-danger">{error}</p>}
          {success && (
            <p role="status" className="mt-5 flex items-center gap-2 rounded-lg bg-verde-claro p-3 text-sm text-verde-escuro">
              <CheckCircle2 size={18} aria-hidden="true" />
              {success}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-linha pt-6">
            <button disabled={busy} type="submit" className={styles.button}>
              {busy ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
                  Salvando alterações…
                </span>
              ) : (
                "Salvar alterações"
              )}
            </button>
            <Link to="/dashboardUsuario?tab=seguranca" className="text-xs font-semibold text-verde hover:underline">
              Gerenciar segurança e senha &rarr;
            </Link>
          </div>
        </form>

        {/* Card do Seletor de Tema (Aparência) */}
        <div className={`${styles.card} mt-6 profile-form`}>
          <div className="mb-5 flex items-center gap-4 border-b border-linha pb-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-verde-claro text-verde">
              <Palette size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold text-verde-escuro">Aparência da interface</h2>
              <p className="mt-1 text-sm text-tinta-suave">Escolha entre Claro, Escuro ou Retrô com sincronização em tempo real.</p>
            </div>
          </div>
          <ThemeSelector />
        </div>
      </div>
    </div>
  );
}
