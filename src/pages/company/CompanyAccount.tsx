import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Building2, LoaderCircle, Save } from "lucide-react";
import { useCompany } from "./CompanyContext";
import { loadCompanyAccount, saveCompanyAccount } from "./companyApi";
import type { CompanyIdentity } from "./companyTypes";
import { CompanyMessage } from "./CompanyUi";
import { accountError } from "../../components/account/accountError";

export default function CompanyAccount() {
  const { preview, identity, updateIdentity, setNotice } = useCompany();
  const identityId = identity?.id;
  const [profile, setProfile] = useState<CompanyIdentity | null>(preview ? identity : null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (preview || !identityId) return;
    const controller = new AbortController();
    loadCompanyAccount(identityId, controller.signal).then(result => { if (!controller.signal.aborted) setProfile(result); }).catch(failure => { if (!controller.signal.aborted) setError(accountError(failure, "Não foi possível carregar os dados da sua empresa.")); });
    return () => controller.abort();
  }, [preview, identityId, version]);
  if (!identity) return <CompanyMessage title="Entre novamente" text="Não foi possível identificar sua conta para carregar as informações." />;
  if (error) return <CompanyMessage title="Sua conta não carregou" text={error} retry={() => { setError(""); setVersion(value => value + 1); }} />;
  if (!profile) return <div className="company-state" role="status"><LoaderCircle className="account-spinner" size={25} /><p>Carregando sua conta…</p></div>;
  return <><div className="company-page-heading"><div><p className="home-eyebrow">Seu espaço na rede</p><h1>Conta da empresa.</h1><p>Mantenha as informações de contato atualizadas.</p></div><span className="company-account-symbol"><Building2 size={32} strokeWidth={1.2} /></span></div><AccountForm key={profile.id} profile={profile} preview={preview} onSave={result => { setProfile(result); updateIdentity(result); setNotice(preview ? "Conta atualizada apenas nesta prévia. Nada foi enviado à API." : "As informações da conta foram atualizadas."); }} /></>;
}
function AccountForm({ profile, preview, onSave }: { profile: CompanyIdentity; preview: boolean; onSave: (profile: CompanyIdentity) => void }) {
  const [name, setName] = useState(profile.name);
  const [cellphone, setCellphone] = useState(profile.cellphone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [validation, setValidation] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!name.trim()) { setValidation("Informe o nome da empresa."); document.getElementById("company-name")?.focus(); return; }
    if ((!preview || cellphone) && !/^\d{11}$/.test(cellphone)) { setValidation("Informe o celular com DDD e 11 dígitos."); document.getElementById("company-cellphone")?.focus(); return; }
    setValidation(""); setError(""); setBusy(true);
    try { onSave(preview ? { ...profile, name: name.trim(), cellphone } : await saveCompanyAccount(profile.id, name.trim(), cellphone)); }
    catch (failure) { setError(accountError(failure, "Não foi possível salvar agora. Seus dados continuam no formulário.")); }
    finally { setBusy(false); }
  }
  return <div className="company-account-grid"><form noValidate onSubmit={submit} className="company-form-section" aria-busy={busy}><div className="company-section-heading"><span>01</span><div><h2>Informações da conta</h2><p>O nome e o celular podem ser atualizados aqui.</p></div></div>{error && <p className="company-form-error" role="alert">{error}</p>}{validation && <p id="account-validation" className="company-field-error" role="alert">{validation}</p>}<fieldset disabled={busy} className="company-account-fields"><div className="company-field"><label htmlFor="company-name">Nome da empresa *</label><input id="company-name" autoComplete="organization" value={name} onChange={event => setName(event.target.value)} required aria-describedby={validation ? "account-validation" : undefined} /></div><div className="company-field"><label htmlFor="company-email">E-mail de acesso</label><input id="company-email" value={profile.email} placeholder={preview ? "Não utilizado nesta prévia" : "Não informado"} readOnly autoComplete="email" /><p className="company-small-note">O e-mail de acesso não pode ser alterado por esta tela.</p></div><div className="company-field"><label htmlFor="company-cellphone">Celular com DDD{!preview && " *"}</label><input id="company-cellphone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={11} value={cellphone} onChange={event => setCellphone(event.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="DDD e número, apenas dígitos" aria-describedby={validation ? "account-validation" : undefined} /></div><button type="submit" className="company-button" disabled={busy}>{busy ? <LoaderCircle className="account-spinner" size={16} /> : <Save size={16} />}{busy ? "Salvando…" : preview ? "Simular atualização" : "Salvar informações"}</button></fieldset></form><aside className="company-account-note"><Building2 size={27} strokeWidth={1.3} /><h2>Uma empresa.<br /><em>Novas conexões.</em></h2><p>As informações de contato ajudam a identificar sua empresa na rede.</p><div><h3>Documentos e endereço</h3><p>CPF, CNPJ e endereço não são editáveis por esta tela. Nenhum documento é exibido na prévia.</p></div>{preview && <p className="company-small-note">Você está em uma simulação. Não use dados pessoais reais para experimentar.</p>}</aside></div>;
}
