import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Camera, ImagePlus, UserRound } from "lucide-react";
import { atualizarPerfilUsuario, obterPerfilUsuario, type UsuarioPerfil } from "../../../axios/Axios";
import { apiError } from "../../../axios/apiError";
import { readSession, updateSessionUser } from "../../../auth/session";
import { loadProfilePhoto, saveProfilePhoto, useProfilePhotoError } from "../../../auth/profilePhoto";
import { useLoggedUser } from "../../../hooks/useLoggedUser";
import { buyerStyles as s } from "./buyerStyles";

export default function BuyerProfile({ userId }: { userId: string }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ profile: UsuarioPerfil | null; error: string; loading: boolean }>({ profile: null, error: "", loading: true });
  useEffect(() => {
    const controller = new AbortController();
    obterPerfilUsuario(userId, controller.signal).then(({ data }) => {
      if (!data || data.id !== userId || typeof data.name !== "string") throw new Error("Perfil inválido.");
      if (!controller.signal.aborted) setState({ profile: data, loading: false, error: "" });
    }).catch(error => { if (!controller.signal.aborted) setState({ profile: null, loading: false, error: apiError(error, "Não foi possível consultar seu perfil.") }); });
    return () => controller.abort();
  }, [userId, attempt]);
  return <section className="space-y-6"><h1 className={s.title}>Meu Perfil</h1>{state.loading ? <p role="status">Carregando perfil...</p> : state.error ? <div role="alert" className={s.error}><p>{state.error}</p><div className="mt-4 flex flex-wrap gap-3"><button className={s.secondary} onClick={() => { setState({ profile: null, loading: true, error: "" }); setAttempt(v => v + 1); }}>Tentar novamente</button><Link to="/login" className={s.secondary}>Entrar novamente</Link></div></div> : state.profile && <ProfileForm profile={state.profile} />}</section>;
}

function ProfileForm({ profile }: { profile: UsuarioPerfil }) {
  const { photoSrc, token } = useLoggedUser();
  const photoError = useProfilePhotoError(profile.id, token);
  const savedPhoto = photoSrc ?? "";
  const photoInputId = useId();
  const savedBirthday = useRef(profile.birthday?.slice(0, 10) ?? "");
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.cellphone ?? "");
  const [birthday, setBirthday] = useState(profile.birthday?.slice(0, 10) ?? "");
  const [file, setFile] = useState<File | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const previewUrls = useRef(new Set<string>());
  const [pendingPhoto, setPendingPhoto] = useState("");
  const [unreadablePhoto, setUnreadablePhoto] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dismissPendingNote, setDismissPendingNote] = useState(false);
  const needsCompletion = (!profile.cellphone || !profile.birthday) && !dismissPendingNote;
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 6000);
    return () => clearTimeout(t);
  }, [error]);
  const [today] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; });
  useEffect(() => {
    const urls = previewUrls.current;
    return () => { urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);
  function releasePreview(url: string) {
    if (url) { URL.revokeObjectURL(url); previewUrls.current.delete(url); }
  }
  function selectPhoto(next: File | null) {
    if (pendingPhoto && pendingPhoto !== savedPhoto) releasePreview(pendingPhoto);
    setFile(next); setPendingPhoto(""); setUnreadablePhoto(""); setSuccess(""); setError("");
    if (!next) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(next.type) || next.size > 5 * 1024 * 1024) { setError("Escolha uma imagem JPG, PNG, WebP ou GIF de até 5 MB."); return; }
    const url = URL.createObjectURL(next);
    previewUrls.current.add(url); setPendingPhoto(url);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError(""); setSuccess("");
    if (savedBirthday.current && !birthday) { setError("Informe uma data de nascimento. A remoção de uma data já cadastrada ainda não está disponível."); return; }
    const digits = phone.replace(/\D/g, "");
    if (!name.trim() || digits.length !== 11 || (birthday && birthday > today)) { setError("Informe seu nome, um celular com DDD e 11 dígitos e uma data de nascimento válida."); return; }
    if (file && (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024)) { setError("Escolha uma imagem JPG, PNG, WebP ou GIF de até 5 MB."); return; }
    if (file && unreadablePhoto === pendingPhoto) { setError("Não foi possível exibir esta imagem. Escolha outra foto antes de salvar."); return; }
    const data = new FormData(); data.append("name", name.trim()); data.append("cellphone", digits);
    if (birthday) data.append("birthday", birthday);
    if (file) data.append("photo", file);
    const session = readSession();
    if (session.user?.id !== profile.id || !session.token) { setError("Sua sessão mudou. Entre novamente para atualizar o perfil."); return; }
    setBusy(true);
    try {
      const response = await atualizarPerfilUsuario(profile.id, data);
      if (!response.data.user || response.data.user.id !== profile.id) throw new Error("Resposta inválida.");
      const current = readSession();
      if (current.user?.id !== profile.id || current.token !== session.token) return;
      const user = response.data.user;
      if (typeof user.name !== "string") throw new Error("Resposta inválida.");
      if (file && pendingPhoto) { saveProfilePhoto(profile.id, session.token, file); releasePreview(pendingPhoto); setPendingPhoto(""); }
      savedBirthday.current = user.birthday?.slice(0, 10) ?? "";
      setName(user.name); setPhone(user.cellphone ?? ""); setBirthday(user.birthday?.slice(0,10) ?? ""); setFile(null);
      if (photoInput.current) photoInput.current.value = "";
      updateSessionUser({ name: user.name });
      setSuccess(file ? "Perfil e foto enviados com sucesso." : "Perfil atualizado com sucesso.");
    } catch (cause) { setError(apiError(cause, "Não foi possível salvar seu perfil. Seus campos foram preservados.")); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className={`${s.panel} max-w-3xl space-y-6`}>
    {needsCompletion && (
      <div role="status" className={`${s.notice} flex items-start justify-between gap-3`}>
        <div>
          <strong className="block font-semibold">Complete seus dados cadastrais</strong>
          <p className="mt-1 text-sm">
            Para sua segurança e privacidade, o Google não fornece telefone nem data de nascimento. Complete esses campos abaixo para finalizar seu perfil.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissPendingNote(true)}
          className="text-xs font-semibold text-gray-600 hover:text-black"
        >
          Dispensar
        </button>
      </div>
    )}
    <p className={s.copy}>Atualize os dados da sua conta de comprador.</p>
    <section aria-label="Foto de perfil" className="flex flex-wrap items-center gap-5">
      <div className="relative shrink-0"><div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-canvas text-primary">
        {(pendingPhoto || savedPhoto) && unreadablePhoto !== (pendingPhoto || savedPhoto) ? <img src={pendingPhoto || savedPhoto} alt={pendingPhoto ? "Prévia da foto de perfil" : "Foto de perfil enviada"} width={112} height={112} onError={() => setUnreadablePhoto(pendingPhoto || savedPhoto)} className="h-full w-full object-cover" /> : <UserRound size={44} aria-hidden="true" />}
      </div><button type="button" disabled={busy} onClick={() => photoInput.current?.click()} aria-label="Adicionar ou alterar foto de perfil" className="absolute -right-2 -bottom-1 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-primary text-white hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"><Camera size={20} aria-hidden="true" /></button></div>
      <div className="max-w-md space-y-2"><h2 className={s.subtitle}>Sua foto</h2><p className={s.copy}>{pendingPhoto ? "Prévia da foto selecionada. Salve as alterações para enviar." : savedPhoto ? "Foto salva na sua conta." : "Selecione uma foto para visualizar como ela ficará no perfil."}</p>{unreadablePhoto && <p role="alert" className="text-sm text-red-800">Não foi possível exibir esta imagem. Escolha outra foto.</p>}</div>
    </section>
    {photoError && <div role="alert" className={s.error}><p>{photoError}</p><button type="button" className={`${s.secondary} mt-3`} onClick={() => { if (token) void loadProfilePhoto(profile.id, token, true); }}>Tentar carregar foto novamente</button></div>}
    <fieldset disabled={busy} className="space-y-5">
      <legend className="sr-only">Dados do perfil</legend>
      <label className={s.label}>Nome completo *<input required maxLength={100} autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={s.input} /></label>
      <label className={s.label}>E-mail<input readOnly type="email" value={profile.email ?? ""} className={`${s.input} bg-gray-50`} /><span className="mt-1 block text-xs font-normal text-gray-600">A alteração de e-mail não está disponível por esta tela.</span></label>
      <label className={s.label}>Celular com DDD *<input required type="tel" autoComplete="tel-national" maxLength={20} value={phone} onChange={e => setPhone(e.target.value)} className={s.input} /></label>
      <label className={s.label}>Data de nascimento<input type="date" max={today} value={birthday} onChange={e => setBirthday(e.target.value)} className={s.input} /></label>
      <div><p className={s.label}>Foto de perfil</p><input id={photoInputId} ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => selectPhoto(e.target.files?.[0] ?? null)} className="sr-only" aria-label="Enviar foto de perfil" aria-describedby="profile-photo-help" /><label htmlFor={photoInputId} className={`${s.secondary} mt-2 cursor-pointer`}><ImagePlus size={18} aria-hidden="true" />Escolher foto</label>{file && <p className="mt-2 break-all text-sm text-muted">{file.name}</p>}<p id="profile-photo-help" className="mt-2 text-xs leading-relaxed text-gray-600">JPG, PNG, WebP ou GIF de até 5 MB. A foto salva aparece no perfil e no cabeçalho e é recuperada ao recarregar ou entrar novamente.</p></div>
    </fieldset>
    {error && <p role="alert" className={s.error}>{error}</p>}{success && <p role="status" className={s.success}>{success}</p>}
    <button disabled={busy} type="submit" className={s.button}>{busy ? "Salvando..." : "Salvar alterações"}</button>
  </form>;
}
