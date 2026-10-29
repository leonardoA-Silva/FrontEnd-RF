import { useState } from "react";
import { Dialog } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, ImageOff, Leaf, LoaderCircle, Tag, Trash2 } from "lucide-react";
import { useCompany } from "./CompanyContext";
import type { CompanyProduct } from "./companyTypes";

export function MaterialImage({ product, large = false }: { product: CompanyProduct; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className={`company-material-image ${large ? "is-large" : ""}`}>{product.images[0] && !failed ? <img src={product.images[0]} alt={product.name} onError={() => setFailed(true)} /> : <span><ImageOff size={large ? 42 : 20} strokeWidth={1.2} />{large && <small>Sem foto disponível</small>}</span>}</div>;
}
export function TypeBadge({ type }: { type: CompanyProduct["type"] }) {
  return <span className={`company-badge ${type === "sale" ? "is-sale" : ""}`}>{type === "sale" ? <Tag size={14} /> : <Leaf size={14} />}{type === "sale" ? "Venda" : "Doação"}</span>;
}
export function CompanyMessage({ title, text, retry }: { title: string; text: string; retry?: () => void }) {
  const { base } = useCompany();
  return <div className="company-state"><AlertCircle size={30} strokeWidth={1.3} /><h1>{title}</h1><p>{text}</p><div>{retry && <button type="button" onClick={retry} className="company-button">Tentar novamente</button>}<Link to={base} className="company-inline-link"><ArrowLeft size={15} /> Voltar aos materiais</Link></div></div>;
}
export function CompanyLoading() { return <div className="company-state" role="status"><LoaderCircle className="account-spinner" size={27} /><p>Carregando seus materiais…</p></div>; }
export function MutationNote() {
  const { preview } = useCompany();
  return !preview ? <p className="company-integration-note" role="note">As alterações de materiais ainda não estão disponíveis nesta versão. Você pode consultar o formulário, mas ele não envia mudanças.</p> : null;
}
export function DeleteMaterialDialog({ product, close }: { product: CompanyProduct | null; close: () => void }) {
  const { preview, base, deleteDemo } = useCompany();
  const navigate = useNavigate();
  return <Dialog open={!!product} onClose={close} aria-labelledby="delete-material-title" aria-describedby="delete-material-description" maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "16px", bgcolor: "#FAF9F5", p: 3 } } }}><div className="company-delete-icon"><Trash2 size={23} /></div><h2 id="delete-material-title" className="company-dialog-title">Excluir este material?</h2><p id="delete-material-description" className="company-dialog-copy">{preview ? <>“{product?.name}” será removido apenas desta prévia. Nenhum anúncio real será excluído.</> : "A exclusão de anúncios ainda não está disponível nesta versão."}</p><div className="company-dialog-actions"><button type="button" className="company-button is-secondary" onClick={close} autoFocus>Cancelar</button><button type="button" className="company-button is-danger" disabled={!preview} onClick={() => { if (product && preview) { deleteDemo(product.id); close(); navigate(base); } }}>Excluir da prévia</button></div></Dialog>;
}
