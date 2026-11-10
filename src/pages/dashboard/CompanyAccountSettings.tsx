import { useState, type FormEvent } from "react";
import axios from "axios";
import api from "../../axios/Axios";
import { companyStyles as styles } from "../../components/dashboard/companyStyles";
import { companyError } from "./companyApi";
import { readImage } from "./companyFiles";

export default function CompanyAccountSettings({ userId }: { userId: string }) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmation: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function selectPhoto(file?: File) {
    setError(""); setPhoto(null); setPreview("");
    if (!file) return;
    setBusy(true);
    try { setPreview(await readImage(file)); setPhoto(file); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Imagem inválida."); }
    finally { setBusy(false); }
  }
  async function savePhoto(event: FormEvent) {
    event.preventDefault(); if (!photo) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const body = new FormData(); body.append("photo", photo);
      await api.put(`/user/${userId}`, body); setPhoto(null); setPreview("");
      setNotice("Foto atualizada. Ela aparecerá no menu ao entrar novamente.");
    } catch (cause) { setError(companyError(cause)); }
    finally { setBusy(false); }
  }
  async function savePassword(event: FormEvent) {
    event.preventDefault(); setError(""); setNotice("");
    if (passwords.newPassword.length < 6 || passwords.newPassword !== passwords.confirmation || passwords.newPassword === passwords.currentPassword) { setError("A nova senha deve ter pelo menos 6 caracteres, ser diferente da atual e coincidir com a confirmação."); return; }
    setBusy(true);
    try {
      await api.patch("/user/password", { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: "", newPassword: "", confirmation: "" }); setNotice("Senha atualizada.");
    } catch (cause) { setError(axios.isAxiosError(cause) && cause.response?.status === 401 ? "Confira a senha atual. Se sua sessão expirou, entre novamente." : companyError(cause)); }
    finally { setBusy(false); }
  }
  return <section className="mt-8" aria-labelledby="company-account"><h2 id="company-account" className="text-xl font-semibold">Foto e segurança</h2>
    {error && <p role="alert" className="mt-4">{error}</p>}{notice && <p role="status" className="mt-4">{notice}</p>}
    <form className={`${styles.panel} max-w-2xl`} onSubmit={e => void savePhoto(e)}><h3 className="text-lg font-semibold">Foto do perfil</h3><label className="mt-4 block" htmlFor="company-photo">Escolher imagem (até 5 MB)<input id="company-photo" className={styles.input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={e => { void selectPhoto(e.target.files?.[0]); e.target.value = ""; }} /></label>{preview && <img src={preview} alt="Prévia da nova foto do perfil" className="mt-4 h-28 w-28 rounded-lg object-cover" />}<button type="submit" className={`${styles.button} mt-4`} disabled={busy || !photo}>Salvar foto</button></form>
    <form className={`${styles.panel} max-w-2xl`} onSubmit={e => void savePassword(e)}><h3 className="text-lg font-semibold">Alterar senha</h3>{([['currentPassword', 'Senha atual', 'current-password'], ['newPassword', 'Nova senha', 'new-password'], ['confirmation', 'Confirmar nova senha', 'new-password']] as const).map(([key, label, autoComplete]) => <label key={key} htmlFor={`company-${key}`} className="mt-4 block">{label}<input id={`company-${key}`} type="password" autoComplete={autoComplete} className={styles.input} required minLength={key === "currentPassword" ? undefined : 6} disabled={busy} value={passwords[key]} onChange={e => setPasswords(previous => ({ ...previous, [key]: e.target.value }))} /></label>)}<button type="submit" className={`${styles.button} mt-5`} disabled={busy}>{busy ? "Aguarde…" : "Atualizar senha"}</button></form>
  </section>;
}
