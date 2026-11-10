import { useEffect, useRef, useState } from "react";
import { consultarFotoPerfil, salvarFotoPerfil } from "../dashboard/perfilApi";
import { resourceError } from "./companyResourceApi";

export default function CompanyProfilePhoto({ id, preview }: { id: string; preview: boolean }) {
  const [current, setCurrent] = useState<Blob | null>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState(!preview);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  useEffect(() => {
    if (preview) return;
    const controller = new AbortController();
    consultarFotoPerfil(id, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setCurrent(data); setLoading(false);
    }).catch(cause => { if (!controller.signal.aborted) { setError(resourceError(cause)); setLoading(false); } });
    return () => controller.abort();
  }, [id, preview, attempt]);
  const blob = selected ?? current;
  useEffect(() => {
    if (!blob) return;
    const next = URL.createObjectURL(blob);
    if (photoRef.current) photoRef.current.src = next;
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  async function save() {
    if (!selected || lock.current) return;
    lock.current = true; setBusy(true); setError(""); setNotice("");
    try {
      if (!preview) await salvarFotoPerfil(id, selected);
      setCurrent(selected); setSelected(null); setNotice(preview ? "Foto alterada somente nesta prévia." : "Foto atualizada com sucesso.");
    } catch (cause) { setError(resourceError(cause)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section className="mb-5 rounded-2xl border border-linha bg-white/60 p-6" aria-labelledby="profile-photo-title"><h2 id="profile-photo-title" className="font-semibold">Foto da empresa</h2><p className="mt-2 text-sm text-tinta-suave">PNG, JPEG, GIF ou WebP de até 5 MB.</p>{blob && <img ref={photoRef} alt="Foto da empresa" className="my-4 h-24 w-24 rounded-2xl object-cover" />}{loading && <p role="status" className="mt-3">Carregando foto…</p>}<input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" aria-label="Selecionar foto da empresa" disabled={busy || loading} onChange={e => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setNotice("");
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Selecione uma imagem PNG, JPEG, GIF ou WebP de até 5 MB."); return; }
    setError(""); setSelected(file);
  }} /><div className="mt-4 flex flex-wrap gap-3"><button type="button" className="company-button is-secondary" disabled={busy || loading} onClick={() => input.current?.click()}>Selecionar foto</button>{selected && <><button type="button" className="company-button" disabled={busy} onClick={() => void save()}>{busy ? "Salvando…" : "Salvar foto"}</button><button type="button" className="company-inline-link" disabled={busy} onClick={() => setSelected(null)}>Cancelar</button></>}{!preview && error && !selected && <button type="button" className="company-inline-link" disabled={busy || loading} onClick={() => { setLoading(true); setError(""); setAttempt(value => value + 1); }}>Tentar carregar novamente</button>}</div>{error && <p role="alert" className="company-field-error mt-3">{error}</p>}{notice && <p role="status" className="mt-3 text-sm text-verde">{notice}</p>}</section>;
}
