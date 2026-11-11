import { useEffect, useRef, useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogTitle, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import { MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCompany } from "./CompanyContext";
import { deleteLocation, loadLocations, resourceError, saveLocation, type CompanyLocation, type LocationFields } from "./companyResourceApi";

const empty: LocationFields = { zipCode: "", street: "", neighborhood: "", number: "", city: "", state: "" };
const fields: { key: keyof LocationFields; label: string; max: number }[] = [
  { key: "zipCode", label: "CEP", max: 8 }, { key: "street", label: "Rua", max: 150 },
  { key: "number", label: "Número", max: 6 }, { key: "neighborhood", label: "Bairro", max: 80 },
  { key: "city", label: "Cidade", max: 100 }, { key: "state", label: "UF", max: 2 },
];
export default function CompanyAddresses() {
  const { identity, preview, base } = useCompany();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [rows, setRows] = useState<CompanyLocation[]>([]);
  const [loading, setLoading] = useState(!preview);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState<CompanyLocation | "new" | null>(null);
  const [removing, setRemoving] = useState<CompanyLocation | null>(null);
  const [data, setData] = useState(empty);
  const [validation, setValidation] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (preview) return;
    const controller = new AbortController();
    loadLocations(controller.signal).then(result => { if (!controller.signal.aborted) { setRows(result); setLoading(false); } }).catch(cause => { if (!controller.signal.aborted) { setError(resourceError(cause)); setLoading(false); } });
    return () => controller.abort();
  }, [preview, attempt]);
  function open(row: CompanyLocation | "new") { setEditing(row); setData(row === "new" ? empty : row); setValidation({}); setActionError(""); }
  function close() { if (!lock.current) { setEditing(null); setRemoving(null); setActionError(""); } }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current || !editing || (!preview && !identity)) return;
    const next: Record<string, string> = {};
    for (const field of fields) if (!data[field.key].trim() || data[field.key].length > field.max) next[field.key] = "Preencha este campo dentro do limite indicado.";
    if (!/^\d{8}$/.test(data.zipCode)) next.zipCode = "Informe os 8 dígitos do CEP.";
    if (!/^[A-Za-z]{2}$/.test(data.state)) next.state = "Informe a sigla do estado com 2 letras.";
    setValidation(next);
    if (Object.keys(next).length) { document.getElementById(`address-${Object.keys(next)[0]}`)?.focus(); return; }
    lock.current = true; setBusy(true); setActionError(""); setNotice("");
    const normalized = Object.fromEntries(Object.entries(data).filter(([key]) => key in empty).map(([key, value]) => [key, key === "state" ? value.trim().toUpperCase() : value.trim()])) as LocationFields;
    try {
      const result = preview ? { ...normalized, id: editing === "new" ? crypto.randomUUID() : editing.id } : await saveLocation(normalized, identity!.id, editing === "new" ? undefined : editing.id);
      setRows(current => editing === "new" ? [...current, result] : current.map(item => item.id === result.id ? result : item));
      setEditing(null); setNotice(preview ? "Endereço salvo somente nesta prévia." : "Endereço salvo com sucesso.");
    } catch (cause) { setActionError(resourceError(cause)); }
    finally { lock.current = false; setBusy(false); }
  }
  async function remove() {
    if (!removing || lock.current) return;
    lock.current = true; setBusy(true); setActionError(""); setNotice("");
    try {
      if (!preview) await deleteLocation(removing.id);
      setRows(current => current.filter(row => row.id !== removing.id)); setRemoving(null);
      setNotice(preview ? "Endereço removido somente desta prévia." : "Endereço excluído com sucesso.");
    } catch (cause) { setActionError(resourceError(cause)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section>
    <Link to={`${base}/perfil`} className="company-inline-link">Voltar à conta</Link>
    <header className="company-page-heading"><div><p className="company-eyebrow">Minha empresa</p><h1>Meus endereços</h1><p>Gerencie os locais vinculados à sua conta.</p></div><button type="button" className="company-button" disabled={loading || !!error || (!preview && !identity)} onClick={() => open("new")}><Plus size={17} />Adicionar endereço</button></header>
    {preview && <p className="company-notice">Prévia local. Os endereços não são enviados ao servidor.</p>}
    {notice && <p role="status" className="company-notice">{notice}</p>}
    {loading ? <p role="status">Carregando endereços…</p> : error ? <div role="alert" className="company-notice"><p>{error}</p><button type="button" onClick={() => { setError(""); setLoading(true); setAttempt(v => v + 1); }}>Tentar novamente</button><Link to="/login">Entrar novamente</Link></div> : rows.length ? <ul className="grid gap-5 md:grid-cols-2">{rows.map(row => <li key={row.id} className="rounded-2xl border border-linha bg-white/60 p-6"><MapPin className="mb-4 text-verde" aria-hidden="true" /><h2 className="font-semibold">{row.street}, {row.number}</h2><p className="mt-2 text-sm text-tinta-suave">{row.neighborhood} · {row.city}/{row.state}</p><p className="mt-1 text-sm text-tinta-suave">CEP {row.zipCode}</p><div className="mt-5 flex flex-wrap gap-4"><button type="button" className="company-inline-link" aria-label={`Editar endereço em ${row.street}`} onClick={() => open(row)}><Pencil size={15} />Editar</button><button type="button" className="company-delete-link" aria-label={`Excluir endereço em ${row.street}`} onClick={() => { setRemoving(row); setActionError(""); }}><Trash2 size={15} />Excluir</button></div></li>)}</ul> : <div className="company-empty"><MapPin size={30} /><h2>Nenhum endereço cadastrado</h2><p>Adicione um endereço para organizar os locais da sua empresa.</p></div>}
    <Dialog transitionDuration={reducedMotion ? 0 : { enter: 180, exit: 120 }} open={!!editing || !!removing} onClose={close} maxWidth="sm" fullWidth aria-labelledby="address-title"><DialogTitle className="flex items-center justify-between"><span id="address-title">{removing ? "Excluir endereço?" : editing === "new" ? "Adicionar endereço" : editing ? "Editar endereço" : ""}</span><button type="button" onClick={close} disabled={busy} aria-label="Fechar"><X size={20} /></button></DialogTitle><DialogContent>
      {removing ? <><p className="mb-5">Este endereço será excluído. Endereços vinculados a anúncios não podem ser removidos.</p>{actionError && <p role="alert" className="company-field-error">{actionError}</p>}<div className="company-dialog-actions"><button type="button" className="company-button is-secondary" disabled={busy} onClick={close}>Cancelar</button><button type="button" className="company-button is-danger" disabled={busy} onClick={() => void remove()}>{busy ? "Excluindo…" : "Excluir endereço"}</button></div></> : editing ? <form onSubmit={submit} noValidate aria-busy={busy}><fieldset disabled={busy}><div className="grid gap-4 py-2 sm:grid-cols-2">{fields.map(field => <div className="company-field" key={field.key}><label htmlFor={`address-${field.key}`}>{field.label} *</label><input id={`address-${field.key}`} required maxLength={field.max} inputMode={field.key === "zipCode" ? "numeric" : undefined} value={data[field.key]} onChange={e => setData(current => ({ ...current, [field.key]: e.target.value }))} aria-invalid={!!validation[field.key]} aria-describedby={validation[field.key] ? `address-${field.key}-error` : undefined} />{validation[field.key] && <p id={`address-${field.key}-error`} className="company-field-error">{validation[field.key]}</p>}</div>)}</div>{actionError && <p role="alert" className="company-field-error">{actionError}</p>}<div className="company-dialog-actions"><button type="button" className="company-button is-secondary" onClick={close}>Cancelar</button><button type="submit" className="company-button">{busy ? "Salvando…" : "Salvar endereço"}</button></div></fieldset></form> : null}
    </DialogContent></Dialog>
  </section>;
}
