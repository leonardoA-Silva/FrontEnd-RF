import { useState, type ReactNode } from "react";
import { Dialog, useMediaQuery } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, ImageOff, Leaf, LoaderCircle, Tag, Trash2 } from "lucide-react";
import { deleteCompanyProduct } from "./companyApi";
import { resourceError } from "./companyResourceApi";
import { useCompany } from "./CompanyContext";
import type { CompanyProduct } from "./companyTypes";

export function MaterialImage({ product, large = false, placeholder }: { product: CompanyProduct; large?: boolean; placeholder?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  return <div className={`company-material-image ${large ? "is-large" : ""}`}>{product.images[0] && !failed ? <img src={product.images[0]} alt={product.name} onError={() => setFailed(true)} /> : <span>{placeholder ?? <><ImageOff size={large ? 42 : 20} strokeWidth={1.2} />{large && <small>Sem foto disponível</small>}</>}</span>}</div>;
}
export function TypeBadge({ type }: { type: CompanyProduct["type"] }) {
  return <span className={`company-badge ${type === "sale" ? "is-sale" : ""}`}>{type === "sale" ? <Tag size={14} /> : <Leaf size={14} />}{type === "sale" ? "Venda" : "Doação"}</span>;
}
export function CompanyMessage({ title, text, retry }: { title: string; text: string; retry?: () => void }) {
  const { base } = useCompany();
  return <div className="company-state"><AlertCircle size={30} strokeWidth={1.3} /><h1>{title}</h1><p>{text}</p><div>{retry && <button type="button" onClick={retry} className="company-button">Tentar novamente</button>}<Link to={base} className="company-inline-link"><ArrowLeft size={15} /> Voltar aos materiais</Link></div></div>;
}
export function CompanyLoading() { return <div className="company-state" role="status"><LoaderCircle className="account-spinner" size={27} /><p>Carregando seus materiais…</p></div>; }
export function DeleteMaterialDialog({ product, close }: { product: CompanyProduct | null; close: () => void }) {
  const { preview, base, deleteDemo, reload, setNotice } = useCompany();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  async function remove() {
    if (!product || busy) return;
    setBusy(true); setFailure("");
    try {
      if (preview) deleteDemo(product.id);
      else { await deleteCompanyProduct(product.id); reload(); setNotice("Material excluído com sucesso."); }
      close(); navigate(base);
    } catch (cause) { setFailure(resourceError(cause)); }
    finally { setBusy(false); }
  }
  return <Dialog transitionDuration={reducedMotion ? 0 : { enter: 180, exit: 120 }} open={!!product} onClose={() => { if (!busy) { setFailure(""); close(); } }} aria-labelledby="delete-material-title" aria-describedby="delete-material-description" maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "16px", bgcolor: "var(--color-bruma)", p: 3 } } }}><div className="company-delete-icon"><Trash2 size={23} /></div><h2 id="delete-material-title" className="company-dialog-title">Excluir este material?</h2><p id="delete-material-description" className="company-dialog-copy">{preview ? <>“{product?.name}” será removido apenas desta prévia. Nenhum anúncio real será excluído.</> : "O anúncio será excluído da sua conta. Esta ação não pode ser desfeita."}</p>{failure && <p role="alert" className="company-field-error">{failure}</p>}<div className="company-dialog-actions"><button type="button" className="company-button is-secondary" disabled={busy} onClick={() => { setFailure(""); close(); }} autoFocus>Cancelar</button><button type="button" className="company-button is-danger" disabled={busy} onClick={() => void remove()}>{busy ? "Excluindo…" : preview ? "Excluir da prévia" : "Excluir material"}</button></div></Dialog>;
}
