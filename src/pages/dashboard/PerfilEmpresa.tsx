import { useCallback, useState, type FormEvent } from "react";
import axios from "axios";
import api from "../../axios/Axios";
import CompanyPage from "../../components/dashboard/CompanyPage";
import { companyStyles as styles } from "../../components/dashboard/companyStyles";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { useRemoteData } from "../../hooks/useRemoteData";
import { companyError } from "./companyApi";
import CompanyAccountSettings from "./CompanyAccountSettings";

interface Profile { id: string; name: string; cellphone: string }
interface Location { id: string; zip_code: string; street: string; neighborhood: string; number: string; city: string; state: string }
const loadLocations = (signal: AbortSignal) => api.get<Location[]>("/localization", { signal }).then(r => r.data);

function ProfileForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.cellphone ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (!name.trim() || (phone && !/^\d{11}$/.test(phone))) { setError("Informe o nome e um celular com 11 dígitos, incluindo o DDD."); return; }
    setBusy(true);
    try {
      await api.put(`/user/${profile.id}`, { name: name.trim(), ...(phone ? { cellphone: phone } : {}) });
      setMessage("Dados atualizados. O nome no menu será atualizado ao entrar novamente.");
    } catch (cause) { setError(companyError(cause)); }
    finally { setBusy(false); }
  }
  return <form className={`${styles.panel} max-w-2xl`} onSubmit={e => void save(e)}>
    <h2 className="text-xl font-semibold">Dados da empresa</h2>
    <label className="mt-4 block" htmlFor="company-name">Nome<input id="company-name" className={styles.input} value={name} onChange={e => setName(e.target.value)} required disabled={busy} autoComplete="organization" /></label>
    <label className="mt-4 block" htmlFor="company-phone">Celular com DDD<input id="company-phone" className={styles.input} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} pattern="[0-9]{11}" inputMode="tel" autoComplete="tel-national" disabled={busy} /></label>
    <p className="mt-2 text-sm text-tinta-suave">Deixe o celular em branco para manter o contato atual.</p>
    {error && <p role="alert" className="mt-4">{error}</p>}{message && <p role="status" className="mt-4">{message}</p>}
    <button type="submit" className={`${styles.button} mt-5`} disabled={busy}>{busy ? "Salvando…" : "Salvar dados"}</button>
  </form>;
}

function LocationForm({ location, userId, onSaved }: { location: Location; userId: string; onSaved: () => void }) {
  const [values, setValues] = useState(location);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  async function remove() {
    setBusy(true); setError("");
    try { await api.delete(`/localization/${location.id}`); onSaved(); }
    catch (cause) { setError(axios.isAxiosError(cause) && cause.response?.status === 409 ? "Este endereço está vinculado a anúncios e não pode ser excluído." : companyError(cause)); }
    finally { setBusy(false); }
  }
  const fields = [
    ["zip_code", "CEP", 8], ["street", "Rua", 150], ["neighborhood", "Bairro", 80],
    ["number", "Número", 6], ["city", "Cidade", 100], ["state", "UF", 2],
  ] as const;
  async function save(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (!/^\d{8}$/.test(values.zip_code) || !/^[A-Za-z]{2}$/.test(values.state) || fields.some(([key]) => !values[key].trim())) { setError("Preencha todos os campos, com CEP de 8 dígitos e UF de 2 letras."); return; }
    setBusy(true);
    try {
      const payload = Object.fromEntries(fields.map(([key]) => [key, values[key].trim()]));
      if (location.id) await api.put(`/localization/${location.id}`, payload);
      else { await api.post("/localization", { ...payload, zipCode: values.zip_code.trim(), userId }); onSaved(); }
      setMessage("Endereço salvo. A posição no mapa depende da disponibilidade da busca de coordenadas do serviço.");
    } catch (cause) { setError(companyError(cause)); }
    finally { setBusy(false); }
  }
  return <form className={`${styles.panel} max-w-2xl`} onSubmit={e => void save(e)}>
    <h3 className="text-lg font-semibold">{location.id ? "Endereço cadastrado" : "Novo endereço"}</h3>
    <div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label, max]) => <label key={key} className="mt-3 block" htmlFor={`${location.id}-${key}`}>{label}<input id={`${location.id}-${key}`} className={styles.input} value={values[key]} required maxLength={max} disabled={busy} onChange={e => setValues(previous => ({ ...previous, [key]: key === "zip_code" ? e.target.value.replace(/\D/g, "") : key === "state" ? e.target.value.toUpperCase() : e.target.value }))} /></label>)}</div>
    {error && <p role="alert" className="mt-4">{error}</p>}{message && <p role="status" className="mt-4">{message}</p>}
    <button type="submit" className={`${styles.button} mt-5`} disabled={busy}>{busy ? "Salvando…" : "Salvar endereço"}</button>
    {location.id && (!confirmDelete ? <button type="button" className={`${styles.secondary} ml-3 mt-5`} disabled={busy} onClick={() => setConfirmDelete(true)}>Excluir endereço</button> : <div className="mt-5 rounded-lg bg-bruma p-4"><p>Excluir este endereço? A API pode impedir a exclusão se houver anúncios vinculados.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" className={styles.button} disabled={busy} onClick={() => void remove()}>Confirmar exclusão</button><button type="button" className={styles.secondary} disabled={busy} onClick={() => setConfirmDelete(false)}>Manter endereço</button></div></div>)}
  </form>;
}

export default function PerfilEmpresa() {
  const { userId } = useLoggedUser();
  const [newLocation, setNewLocation] = useState(false);
  const loadProfile = useCallback((signal: AbortSignal) => {
    if (!userId) return Promise.reject(new Error("Missing session"));
    return api.get<Profile>(`/user/${userId}`, { signal }).then(r => r.data);
  }, [userId]);
  const profile = useRemoteData(loadProfile);
  const locations = useRemoteData(loadLocations);
  return <CompanyPage title="Perfil da empresa" description="Atualize contato, endereços, foto e senha da sua conta. Documentos e e-mail não são alterados nesta tela." loading={profile.loading} error={profile.error} reload={() => { profile.reload(); locations.reload(); }}>
    {profile.data && <ProfileForm key={profile.data.name} profile={profile.data} />}
    <section className="mt-8" aria-labelledby="company-locations"><h2 id="company-locations" className="text-xl font-semibold">Localizações</h2>
      {locations.loading && <p role="status" className="mt-4">Carregando endereços…</p>}
      {locations.error && <p role="alert" className="mt-4">{locations.error}</p>}
      {locations.data?.length === 0 && <p className={styles.panel}>Nenhum endereço cadastrado para esta conta.</p>}
      {userId && locations.data?.map(location => <LocationForm key={location.id} location={location} userId={userId} onSaved={locations.reload} />)}
      {userId && !locations.loading && !locations.error && <><button type="button" className={`${styles.secondary} mt-4`} onClick={() => setNewLocation(value => !value)}>{newLocation ? "Cancelar novo endereço" : "Adicionar endereço"}</button>{newLocation && <LocationForm location={{ id: "", zip_code: "", street: "", neighborhood: "", number: "", city: "", state: "" }} userId={userId} onSaved={() => { setNewLocation(false); locations.reload(); }} />}</>}
    </section>
    {userId && <CompanyAccountSettings userId={userId} />}
  </CompanyPage>;
}
