import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bell, CheckCircle2, LoaderCircle, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import CompanyPage from "./CompanyPage";
import { companyStyles as styles } from "./companyStyles";
import { consultarPerfil, erroPerfil, salvarPerfil, type PerfilEmpresa as Perfil } from "./perfilApi";

export default function PerfilEmpresa() {
  const { userId } = useLoggedUser();
  const [profile, setProfile] = useState<Perfil | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    consultarPerfil(userId, controller.signal)
      .then(data => {
        if (controller.signal.aborted) return;
        setProfile(data);
        setName(data.name);
        setPhone(data.cellphone);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(erroPerfil(cause));
        setLoading(false);
      });
    return () => controller.abort();
  }, [userId, attempt]);

  const nameError = !name.trim() ? "Informe o nome da empresa." : "";
  const phoneError = !/^\d{11}$/.test(phone.replace(/\D/g, "")) ? "Informe 11 dígitos, incluindo o DDD." : "";
  const changed = profile && (name !== profile.name || phone !== profile.cellphone);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSubmitted(true);
    setSuccess(false);
    setError("");
    if (nameError || phoneError) {
      (nameError ? nameRef : phoneRef).current?.focus();
      return;
    }
    if (!userId) return;
    setSaving(true);
    try {
      const updated = await salvarPerfil(userId, { name: name.trim(), cellphone: phone.replace(/\D/g, "") });
      if (!mounted.current) return;
      setProfile(updated);
      setName(updated.name);
      setPhone(updated.cellphone);
      setSuccess(true);
      setSubmitted(false);
    } catch (cause) {
      if (mounted.current) setError(erroPerfil(cause));
    } finally {
      if (mounted.current) setSaving(false);
    }
  }

  function retry() { setError(""); setLoading(true); setAttempt(attempt + 1); }

  return <CompanyPage profile>
    <h1 className={styles.title}>Dados da Conta</h1>
    <p className={styles.description}>Mantenha as informações da sua empresa atualizadas.</p>
    {!userId ? <div role="alert" className={`${styles.card} mt-6`}><p>Não conseguimos identificar sua conta nesta sessão.</p><Link to="/login" className={`${styles.button} mt-4`}>Entrar novamente</Link></div> : loading ? <div role="status" className={`${styles.card} mt-6 flex items-center gap-3 text-sm text-tinta-suave`}><LoaderCircle size={20} className="animate-spin" aria-hidden="true" />Carregando dados da conta…</div> : !profile ? <div role="alert" className={`${styles.card} mt-6`}><p className="text-sm text-danger">{error}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={retry} className={styles.button}>Tentar novamente</button><Link to="/login" className={styles.secondary}>Entrar novamente</Link></div></div> : <>
      <form onSubmit={submit} noValidate aria-busy={saving} className={`${styles.card} mt-6`}>
        <div className="mb-7 flex items-center gap-4 border-b border-linha pb-6"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-verde-claro text-verde"><UserRound size={28} aria-hidden="true" /></span><div><h2 className="font-bold text-verde-escuro">Informações da empresa</h2><p className="mt-1 text-sm text-tinta-suave">Edite o nome e o celular de contato.</p></div></div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold text-tinta" htmlFor="perfil-nome">Nome da empresa <span className="font-normal text-tinta-suave">(obrigatório)</span><input ref={nameRef} id="perfil-nome" autoComplete="organization" required disabled={saving} maxLength={255} value={name} onChange={e => { setName(e.target.value); setSuccess(false); }} aria-invalid={submitted && Boolean(nameError)} aria-describedby={submitted && nameError ? "erro-nome" : undefined} className={styles.input} />{submitted && nameError && <span id="erro-nome" className="mt-2 block text-xs font-normal text-danger">{nameError}</span>}</label>
          <label className="text-sm font-semibold text-tinta" htmlFor="perfil-email">E-mail<input id="perfil-email" type="email" value={profile.email} disabled className={styles.input} aria-describedby="ajuda-email" /><span id="ajuda-email" className="mt-2 block text-xs font-normal text-tinta-suave">A alteração de e-mail ainda não está disponível.</span></label>
          <label className="text-sm font-semibold text-tinta" htmlFor="perfil-celular">Celular de contato <span className="font-normal text-tinta-suave">(obrigatório)</span><input ref={phoneRef} id="perfil-celular" type="tel" inputMode="tel" autoComplete="tel-national" required disabled={saving} maxLength={20} value={phone} onChange={e => { setPhone(e.target.value); setSuccess(false); }} aria-invalid={submitted && Boolean(phoneError)} aria-describedby={submitted && phoneError ? "erro-celular" : "ajuda-celular"} className={styles.input} /><span id="ajuda-celular" className="mt-2 block text-xs font-normal text-tinta-suave">DDD e número do celular.</span>{submitted && phoneError && <span id="erro-celular" className="mt-2 block text-xs font-normal text-danger">{phoneError}</span>}</label>
          <div className="flex items-start gap-3 rounded-lg bg-bruma p-4"><ShieldCheck size={21} className="shrink-0 text-verde" aria-hidden="true" /><p className="text-xs leading-relaxed text-tinta-suave">Documentos e dados de acesso não são exibidos nem alterados por este formulário.</p></div>
        </div>
        {error && <p role="alert" className="mt-5 rounded-lg bg-ambar-fundo p-3 text-sm text-danger">{error}</p>}
        {success && <p role="status" className="mt-5 flex items-center gap-2 rounded-lg bg-verde-claro p-3 text-sm text-verde-escuro"><CheckCircle2 size={18} aria-hidden="true" />Dados da conta atualizados com sucesso.</p>}
        <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-linha pt-5"><button type="button" disabled={saving || !changed} onClick={() => { setName(profile.name); setPhone(profile.cellphone); setError(""); setSuccess(false); setSubmitted(false); }} className={styles.secondary}>Cancelar</button><button type="submit" disabled={saving || !changed} className={styles.button}>{saving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}{saving ? "Salvando…" : "Salvar alterações"}</button></div>
      </form>
      <section className={`${styles.card} mt-5`} aria-labelledby="preferencias-titulo"><div className="flex items-center gap-2"><Bell size={19} className="text-verde" aria-hidden="true" /><h2 id="preferencias-titulo" className="font-bold text-verde-escuro">Notificações e avisos</h2></div><p className="mt-2 text-sm text-tinta-suave">As preferências de notificações ainda não estão disponíveis para alteração.</p><div className="mt-5 space-y-4">{["Novas propostas de negociação", "Novidades sobre a plataforma"].map(label => <label key={label} className="flex items-center justify-between gap-4 border-t border-linha pt-4 text-sm text-tinta-suave">{label}<input type="checkbox" disabled className="h-5 w-5 accent-verde" /></label>)}</div></section>
    </>}
  </CompanyPage>;
}
