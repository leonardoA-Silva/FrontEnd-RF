import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { atualizarPerfilUsuario, obterPerfilUsuario, type UsuarioPerfil } from "../../../axios/Axios";
import { apiError } from "../../../axios/apiError";
import { updateSessionUser } from "../../../auth/session";
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
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.cellphone ?? "");
  const [birthday, setBirthday] = useState(profile.birthday?.slice(0, 10) ?? "");
  const [file, setFile] = useState<File | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [today] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError(""); setSuccess("");
    if (profile.birthday && !birthday) { setError("Informe uma data de nascimento. A remoção de uma data já cadastrada ainda não está disponível."); return; }
    const digits = phone.replace(/\D/g, "");
    if (!name.trim() || digits.length !== 11 || (birthday && birthday > today)) { setError("Informe seu nome, um celular com DDD e 11 dígitos e uma data de nascimento válida."); return; }
    if (file && (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024)) { setError("Escolha uma imagem JPG, PNG, WebP ou GIF de até 5 MB."); return; }
    const data = new FormData(); data.append("name", name.trim()); data.append("cellphone", digits);
    if (birthday) data.append("birthday", birthday);
    if (file) data.append("photo", file);
    setBusy(true);
    try {
      const response = await atualizarPerfilUsuario(profile.id, data);
      if (!response.data.user || response.data.user.id !== profile.id) throw new Error("Resposta inválida.");
      const user = response.data.user;
      setName(user.name); setPhone(user.cellphone ?? ""); setBirthday(user.birthday?.slice(0,10) ?? ""); setFile(null);
      if (photoInput.current) photoInput.current.value = "";
      updateSessionUser({ name: user.name });
      setSuccess(file ? "Perfil e foto enviados com sucesso. A exibição da foto no perfil ainda não está disponível." : "Perfil atualizado com sucesso.");
    } catch (cause) { setError(apiError(cause, "Não foi possível salvar seu perfil. Seus campos foram preservados.")); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className={`${s.panel} max-w-3xl space-y-6`}>
    <p className={s.copy}>Atualize os dados da sua conta de comprador.</p>
    <fieldset disabled={busy} className="space-y-5">
      <legend className="sr-only">Dados do perfil</legend>
      <label className={s.label}>Nome completo *<input required maxLength={100} autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={s.input} /></label>
      <label className={s.label}>E-mail<input readOnly type="email" value={profile.email ?? ""} className={`${s.input} bg-gray-50`} /><span className="mt-1 block text-xs font-normal text-gray-600">A alteração de e-mail não está disponível por esta tela.</span></label>
      <label className={s.label}>Celular com DDD *<input required type="tel" autoComplete="tel-national" maxLength={20} value={phone} onChange={e => setPhone(e.target.value)} className={s.input} /></label>
      <label className={s.label}>Data de nascimento<input type="date" max={today} value={birthday} onChange={e => setBirthday(e.target.value)} className={s.input} /></label>
      <label className={s.label}>Enviar foto de perfil<input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => { setFile(e.target.files?.[0] ?? null); setSuccess(""); }} className={`${s.input} text-xs`} aria-describedby="profile-photo-help" /><span id="profile-photo-help" className="mt-2 block text-xs font-normal leading-relaxed text-gray-600">Até 5 MB. A foto enviada será salva, mas sua exibição no perfil ainda não está disponível. Endereço e documentos não estão disponíveis para edição.</span></label>
    </fieldset>
    {error && <p role="alert" className={s.error}>{error}</p>}{success && <p role="status" className={s.success}>{success}</p>}
    <button disabled={busy} type="submit" className={s.button}>{busy ? "Salvando..." : "Salvar alterações"}</button>
  </form>;
}
