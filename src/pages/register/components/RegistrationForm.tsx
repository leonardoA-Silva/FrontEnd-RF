import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ArrowLeft, ArrowUpRight, Camera, Eye, EyeOff, LoaderCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import AccountField from "../../../components/account/AccountField";
import type { RegistrationData, RegistrationKind } from "../registrationData";
import type { useRegistrationForm } from "../useRegistrationForm";

type FormState = ReturnType<typeof useRegistrationForm>;

export default function RegistrationForm({ kind, form }: { kind: RegistrationKind; form: FormState }) {
  const { data, errors, busy, created, address } = form;
  const [showPassword, setShowPassword] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const company = kind === "company";
  const change = (key: keyof RegistrationData, digits?: number) => (event: ChangeEvent<HTMLInputElement>) => form.setField(key, digits ? event.target.value.replace(/\D/g, "").slice(0, digits) : event.target.value);
  const shared = (key: keyof RegistrationData) => ({ id: key, name: key, value: data[key], onChange: change(key), error: errors[key], required: true });
  return (
    <form noValidate onSubmit={form.submit} className="account-registration-form" aria-busy={busy}>
      {form.error && <p className="account-alert account-alert-error" role="alert">{form.error}</p>}
      {created && <div className="account-alert account-alert-success" role="status"><strong>Cadastro recebido.</strong><p>{created.emailSent ? "Confirme seu e-mail para ativar a conta." : "O e-mail não foi enviado. Abra a confirmação e solicite um novo código."}</p><button id="reopen-verification" type="button" onClick={() => form.setVerificationOpen(true)}>Confirmar meu e-mail <ArrowUpRight size={15} /></button></div>}
      {!!Object.keys(errors).filter(key => errors[key as keyof RegistrationData]).length && <p role="alert" className="account-validation-summary">Confira os campos destacados antes de continuar.</p>}
      <fieldset className="account-form-fields" disabled={busy || !!created}>
        <legend className="sr-only">Dados para o cadastro</legend>
        <div className="account-photo-row">
          <div className={`account-photo-preview ${company ? "account-photo-company" : ""}`}>{form.photoUrl ? <img src={form.photoUrl} alt={company ? "Prévia do logotipo selecionado" : "Prévia da foto selecionada"} /> : <Camera size={25} strokeWidth={1.3} />}</div>
          <div><p className="account-photo-title">{company ? "Logo da empresa" : "Sua foto"} <span>Opcional</span></p><p className="account-field-hint">Uma imagem para identificar seu perfil.</p><div className="account-photo-actions"><button type="button" onClick={() => fileRef.current?.click()}>{form.photoUrl ? "Trocar imagem" : "Escolher imagem"}</button>{form.photoUrl && <button type="button" onClick={() => { form.changePhoto(null); if (fileRef.current) fileRef.current.value = ""; }}><X size={13} /> Remover</button>}</div></div>
          <input ref={fileRef} type="file" accept="image/*" aria-label={company ? "Selecionar logo da empresa" : "Selecionar foto de perfil"} hidden onChange={event => { form.changePhoto(event.target.files?.[0] ?? null); event.target.value = ""; }} />
        </div>
        {form.photoError && <p className="account-field-error" role="alert">{form.photoError}</p>}
        <div className="account-section-title"><span>01</span><div><h2>{company ? "Dados da empresa" : "Vamos nos conhecer"}</h2><p>Os campos com * são obrigatórios.</p></div></div>
        <div className="account-fields-grid">
          <AccountField {...shared("name")} label={company ? "Razão social / Nome da empresa" : "Nome completo"} autoComplete={company ? "organization" : "name"} wide />
          {company && <AccountField {...shared("cnpj")} label="CNPJ" inputMode="numeric" maxLength={14} onChange={change("cnpj", 14)} hint="Apenas os 14 dígitos." />}
          <AccountField {...shared("cpf")} label={company ? "CPF do responsável legal" : "CPF"} inputMode="numeric" maxLength={11} onChange={change("cpf", 11)} hint="Apenas os 11 dígitos." />
          {!company && <AccountField {...shared("birthday")} label="Data de nascimento" type="date" autoComplete="bday" />}
          <AccountField {...shared("email")} label={company ? "E-mail da empresa" : "E-mail"} type="email" autoComplete="email" />
          <AccountField {...shared("cellphone")} label="Celular com DDD" type="tel" inputMode="numeric" maxLength={11} onChange={change("cellphone", 11)} autoComplete="tel-national" hint="DDD e número, com 11 dígitos." />
        </div>
        <div className="account-section-title"><span>02</span><div><h2>Seu endereço</h2><p>Consulte pelo CEP ou preencha manualmente.</p></div></div>
        <div className="account-fields-grid">
          <AccountField {...shared("zip_code")} label="CEP" inputMode="numeric" maxLength={8} onChange={change("zip_code", 8)} onBlur={address.lookupZip} autoComplete="postal-code" hint="Apenas os 8 dígitos." />
          <AccountField {...shared("number")} label="Número" maxLength={6} />
          {(address.zipBusy || address.zipNote) && <p className="account-location-note account-field-wide" role="status">{address.zipBusy ? "Consultando o CEP…" : address.zipNote}</p>}
          <AccountField {...shared("street")} label="Rua / Logradouro" autoComplete="address-line1" />
          <AccountField {...shared("neighborhood")} label="Bairro" autoComplete="address-line2" />
          <AccountField id="state" label="Estado (UF)" error={errors.state} required>
            {address.statesStatus === "ready" && address.states.length ? <select id="state" name="state" value={data.state} onChange={event => form.setField("state", event.target.value)} required className="account-input" aria-invalid={!!errors.state} aria-describedby={errors.state ? "state-error" : undefined}><option value="">Selecione o estado</option>{address.states.map(state => <option key={state.id} value={state.sigla}>{state.nome} ({state.sigla})</option>)}</select> : <input id="state" name="state" value={data.state} onChange={event => form.setField("state", event.target.value.replace(/[^a-z]/gi, "").toUpperCase())} required maxLength={2} className="account-input" placeholder={address.statesStatus === "loading" ? "Carregando lista… ou digite a UF" : "Digite a sigla do estado"} aria-invalid={!!errors.state} aria-describedby={errors.state ? "state-error" : undefined} />}
          </AccountField>
          <AccountField id="city" label="Cidade" error={errors.city} required>
            {data.state && !address.citiesBusy && !address.citiesError && address.cities.length ? <select id="city" name="city" value={data.city} onChange={event => form.setField("city", event.target.value)} required className="account-input" aria-invalid={!!errors.city} aria-describedby={errors.city ? "city-error" : undefined}><option value="">Selecione a cidade</option>{address.cities.map(city => <option key={city.id} value={city.nome}>{city.nome}</option>)}</select> : <input id="city" name="city" value={data.city} onChange={event => form.setField("city", event.target.value)} autoComplete="address-level2" required className="account-input" placeholder={address.citiesBusy ? "Carregando lista… ou digite a cidade" : "Nome da cidade"} aria-invalid={!!errors.city} aria-describedby={errors.city ? "city-error" : undefined} />}
          </AccountField>
          {address.statesStatus === "error" && <p role="status" className="account-location-note account-field-wide">A lista de estados não ficou disponível. Você pode digitar a sigla. <button type="button" onClick={address.retryStates}>Tentar carregar novamente</button></p>}
          {address.citiesError && <p role="status" className="account-location-note account-field-wide">A lista de cidades não ficou disponível. Você pode digitar o nome. <button type="button" onClick={address.retryCities}>Tentar carregar novamente</button></p>}
        </div>
        <div className="account-section-title"><span>03</span><div><h2>Seu acesso</h2><p>Escolha uma senha para entrar na plataforma.</p></div></div>
        <AccountField id="password" label="Senha" error={errors.password} hint="Use pelo menos 6 caracteres." required>
          <div className="account-password"><input id="password" name="password" type={showPassword ? "text" : "password"} value={data.password} onChange={change("password")} autoComplete="new-password" required minLength={6} className="account-input" aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : "password-hint"} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
        </AccountField>
      </fieldset>
      {!created && <><p className="account-data-note">Seus dados serão enviados para criar a conta. Na próxima etapa, você confirma seu e-mail.</p><div className="account-form-actions"><Link to="/cadastro" className="account-back" aria-disabled={busy} onClick={event => { if (busy) event.preventDefault(); }}><ArrowLeft size={16} /> Alterar perfil</Link><button type="submit" className="home-button" disabled={busy}>{busy ? <><LoaderCircle className="account-spinner" size={17} /> Criando conta…</> : <>Criar conta <ArrowUpRight size={17} /></>}</button></div></>}
    </form>
  );
}
