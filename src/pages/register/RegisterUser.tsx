import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import EmailVerificationModal from "../../components/EmailVerificationModal";
import GoogleSignIn from "../login/GoogleSignIn";
import { saveSession } from "../../auth/session";
import { useRegistrationForm } from "./useRegistrationForm";
import { buyerStyles as s } from "../dashboard/comprador/buyerStyles";
import type { RegistrationData } from "./registrationData";

const fields: { key: keyof RegistrationData; label: string; type?: string; maxLength?: number; autoComplete?: string }[] = [
  { key: "name", label: "Nome completo", autoComplete: "name" }, { key: "cpf", label: "CPF", maxLength: 11 },
  { key: "email", label: "E-mail", type: "email", autoComplete: "email" }, { key: "birthday", label: "Data de nascimento", type: "date", autoComplete: "bday" },
  { key: "cellphone", label: "Celular com DDD", type: "tel", maxLength: 11, autoComplete: "tel-national" }, { key: "zip_code", label: "CEP", maxLength: 8, autoComplete: "postal-code" },
  { key: "street", label: "Rua / Logradouro", autoComplete: "address-line1" }, { key: "number", label: "Número", maxLength: 6 },
  { key: "neighborhood", label: "Bairro", autoComplete: "address-line2" }, { key: "password", label: "Senha", type: "password", autoComplete: "new-password" },
];
export default function RegisterUser() {
  const form = useRegistrationForm("personal");
  const navigate = useNavigate();
  const [googleError, setGoogleError] = useState("");
  return <div className="flex min-h-screen flex-col bg-canvas font-app text-ink"><Header /><main className="mx-auto w-full max-w-4xl flex-1 space-y-7 px-5 py-10 sm:px-8">
    <Link to="/cadastro" className="text-sm font-semibold text-primary underline">Voltar à escolha de perfil</Link><header className="space-y-3"><p className="text-sm font-bold text-accent">Comprador / Artesão</p><h1 className={s.title}>Crie seu perfil.</h1><p className={s.copy}>Encontre materiais para dar vida às suas próximas ideias.</p></header>
    <section className={`${s.panel} space-y-6`}><GoogleSignIn variant="criar" remember={false} onSuccess={data => {
      if (!data.token || !data.user?.id) throw new Error("Resposta inválida.");
      if (!["user", "admin"].includes(data.user.role)) { setGoogleError("Esta conta é de empresa. Entre pela aba Empresa Geradora no login."); return; }
      const mustChangePassword = data.mustChangePassword === true || data.user.status === "firstLogin";
      saveSession(data.token, { ...data.user, mustChangePassword }, false);
      navigate(mustChangePassword ? "/primeiro-acesso" : "/dashboardUsuario?aba=perfil", { replace: true });
    }} />{googleError && <p role="alert" className={s.error}>{googleError}</p>}<p className={s.copy}>Ou preencha os dados abaixo. Os campos com * são obrigatórios.</p>
      <form onSubmit={form.submit} noValidate className="space-y-6" aria-busy={form.busy}>
        {form.error && <div id="registration-error" tabIndex={-1} role="alert" className={s.error}>{form.error}{form.conflict && <Link to="/login" className="mt-3 block font-bold underline">Entrar na conta existente</Link>}</div>}
        {form.created && <div role="status" className={s.success}>Cadastro recebido. Confirme seu e-mail. <button id="reopen-verification" type="button" className="font-bold underline" onClick={() => form.setVerificationOpen(true)}>Confirmar meu e-mail</button></div>}
        <fieldset disabled={form.busy || !!form.created} className="grid gap-5 sm:grid-cols-2"><legend className="sr-only">Dados do cadastro pessoal</legend>
          <div className="sm:col-span-2"><label className={s.label}>Foto de perfil (opcional)<input type="file" accept="image/*" className={`${s.input} mt-2`} onChange={event => form.changePhoto(event.target.files?.[0] ?? null)} /></label>{form.photoUrl && <img src={form.photoUrl} alt="Prévia da foto selecionada" className="mt-3 h-20 w-20 rounded-full object-cover" />}{form.photoError && <p role="alert" className={s.error}>{form.photoError}</p>}</div>
          {fields.map(({ key, label, type, maxLength, autoComplete }) => <label key={key} className={s.label}>{label} *<input id={key} name={key} required type={type ?? "text"} maxLength={maxLength} autoComplete={autoComplete} value={form.data[key]} minLength={key === "password" ? 6 : undefined} inputMode={["cpf", "cellphone", "zip_code"].includes(key) ? "numeric" : undefined} onChange={event => form.setField(key, ["cpf", "cellphone", "zip_code"].includes(key) ? event.target.value.replace(/\D/g, "") : event.target.value)} onBlur={key === "zip_code" ? form.address.lookupZip : undefined} aria-invalid={!!form.errors[key]} aria-describedby={form.errors[key] ? `${key}-error` : undefined} className={s.input} />{form.errors[key] && <span id={`${key}-error`} className="mt-1 block text-xs text-danger">{form.errors[key]}</span>}</label>)}
          <label className={s.label}>Estado (UF) *{form.address.statesStatus === "ready" ? <select id="state" value={form.data.state} onChange={event => form.setField("state", event.target.value)} className={s.input} required><option value="">Selecione</option>{form.address.states.map(state => <option key={state.id} value={state.sigla}>{state.nome}</option>)}</select> : <input id="state" required maxLength={2} value={form.data.state} onChange={event => form.setField("state", event.target.value.toUpperCase())} className={s.input} />}{form.errors.state && <span className="block text-xs text-danger">{form.errors.state}</span>}</label>
          <label className={s.label}>Cidade *{form.address.cities.length ? <select id="city" value={form.data.city} onChange={event => form.setField("city", event.target.value)} className={s.input} required><option value="">Selecione</option>{form.address.cities.map(city => <option key={city.id} value={city.nome}>{city.nome}</option>)}</select> : <input id="city" required value={form.data.city} onChange={event => form.setField("city", event.target.value)} className={s.input} />}{form.errors.city && <span className="block text-xs text-danger">{form.errors.city}</span>}</label>
        </fieldset>
        {(form.address.zipBusy || form.address.zipNote) && <p role="status" className={s.notice}>{form.address.zipBusy ? "Consultando o CEP…" : form.address.zipNote}</p>}
        {!form.created && <button disabled={form.busy} className={s.button}>{form.busy ? "Criando conta…" : "Criar conta"}</button>}<Link to="/login" className="ml-4 text-sm font-bold text-primary underline">Já tenho uma conta</Link>
      </form>
    </section>
    {form.created && <EmailVerificationModal open={form.verificationOpen} userId={form.created.id} email={form.data.email} emailSent={form.created.emailSent} onClose={() => form.setVerificationOpen(false)} onSuccess={() => navigate("/login")} />}
  </main><Footer /></div>;
}
