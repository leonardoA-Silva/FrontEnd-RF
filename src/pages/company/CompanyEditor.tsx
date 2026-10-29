import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Camera, LoaderCircle, X } from "lucide-react";
import { useCompany } from "./CompanyContext";
import { categories, conditions, statuses } from "./companyTypes";
import type { CompanyProduct } from "./companyTypes";
import { CompanyLoading, CompanyMessage, MutationNote } from "./CompanyUi";

function FormField({ label, error, children, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; children?: ReactNode }) {
  return <div className="company-field"><label htmlFor={props.id}>{label}</label>{children ?? <input {...props} aria-invalid={!!error} aria-describedby={error ? `${props.id}-error` : undefined} />}{error && <p id={`${props.id}-error`} className="company-field-error">{error}</p>}</div>;
}
export default function CompanyEditor() {
  const { id } = useParams();
  const { products, loading, error, reload } = useCompany();
  if (id && loading) return <CompanyLoading />;
  if (id && error) return <CompanyMessage title="Não foi possível abrir o material" text={error} retry={reload} />;
  const product = products.find(item => item.id === id);
  if (id && !product) return <CompanyMessage title="Material não encontrado" text="O anúncio não está disponível para edição na sua biblioteca." />;
  return <EditorForm key={id || "new"} product={product} />;
}
function EditorForm({ product }: { product?: CompanyProduct }) {
  const { preview, base, saveDemo } = useCompany();
  const navigate = useNavigate();
  const [data, setData] = useState({ name: product?.name ?? "", description: product?.description ?? "", category: product?.category ?? "", type: product?.type ?? "donation", quantity: product ? String(product.quantity) : "", weight: product ? String(product.weight) : "", price: product?.price != null ? String(product.price) : "", condition: product?.condition ?? "", status: product?.status ?? "available" });
  const [images, setImages] = useState(product?.images ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  useEffect(() => () => { generation.current += 1; }, []);
  const set = (key: keyof typeof data, value: string) => { setData(previous => ({ ...previous, [key]: value, ...(key === "type" && value === "donation" ? { price: "" } : {}) })); setErrors(previous => ({ ...previous, [key]: "" })); };
  const input = (key: keyof typeof data) => ({ id: `material-${key}`, value: data[key], onChange: (event: ChangeEvent<HTMLInputElement>) => set(key, event.target.value), error: errors[key] });
  async function chooseImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setPhotoError("");
    if (files.some(file => !file.type.startsWith("image/"))) { setPhotoError("Selecione apenas arquivos de imagem."); return; }
    setPhotoBusy(true);
    const current = ++generation.current;
    try {
      const result = await Promise.all(files.map(file => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(); reader.onerror = reject; reader.readAsDataURL(file); })));
      if (generation.current === current) setImages(previous => [...previous, ...result]);
    } catch { if (generation.current === current) setPhotoError("Não foi possível abrir as imagens. Tente outros arquivos."); }
    finally { if (generation.current === current) setPhotoBusy(false); }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!preview || photoBusy) return;
    const next: Record<string, string> = {};
    if (!data.name.trim() || data.name.length > 100) next.name = "Informe um nome com até 100 caracteres.";
    if (!(data.category in categories)) next.category = "Selecione a categoria do material.";
    if (!(data.condition in conditions)) next.condition = "Selecione o estado de conservação.";
    if (!Number.isInteger(Number(data.quantity)) || Number(data.quantity) <= 0) next.quantity = "Informe uma quantidade inteira maior que zero.";
    if (!data.weight.trim() || !Number.isFinite(Number(data.weight)) || Number(data.weight) <= 0) next.weight = "Informe um peso maior que zero.";
    if (data.type === "sale" && (!data.price.trim() || !Number.isFinite(Number(data.price)) || Number(data.price) <= 0)) next.price = "Informe um preço maior que zero para a venda.";
    setErrors(next);
    if (Object.keys(next).length) { document.getElementById(`material-${Object.keys(next)[0]}`)?.focus(); return; }
    const id = product?.id ?? crypto.randomUUID();
    saveDemo({ id, name: data.name.trim(), description: data.description.trim(), category: data.category, type: data.type, quantity: Number(data.quantity), weight: Number(data.weight), price: data.type === "sale" ? Number(data.price) : null, condition: data.condition, status: data.status, images });
    navigate(`${base}/materiais/${encodeURIComponent(id)}`);
  }
  return <>
    <Link to={base} className="company-inline-link company-back"><ArrowLeft size={15} /> Biblioteca de materiais</Link>
    <div className="company-page-heading"><div><p className="home-eyebrow">{product ? "Uma nova versão do seu anúncio" : "Da indústria para novas possibilidades"}</p><h1>{product ? "Editar material." : "Publicar um material."}</h1><p>Informações claras ajudam o material a encontrar um novo destino.</p></div></div>
    <MutationNote />
    <form noValidate onSubmit={submit} className="company-editor"><div className="company-form-main">
      <section className="company-form-section"><div className="company-section-heading"><span>01</span><div><h2>O material</h2><p>Conte o que você está disponibilizando.</p></div></div>
        <FormField {...input("name")} label="Nome do material *" maxLength={100} required placeholder="Como você quer apresentar este material?" />
        <FormField id="material-description" label="Descrição"><textarea id="material-description" value={data.description} onChange={event => set("description", event.target.value)} rows={4} placeholder="Descreva as características, medidas e possibilidades de uso." /></FormField>
        <div className="company-form-grid"><FormField id="material-category" label="Categoria *" error={errors.category}><select id="material-category" value={data.category} onChange={event => set("category", event.target.value)} required aria-invalid={!!errors.category} aria-describedby={errors.category ? "material-category-error" : undefined}><option value="">Selecione uma categoria</option>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormField><FormField id="material-condition" label="Conservação *" error={errors.condition}><select id="material-condition" value={data.condition} onChange={event => set("condition", event.target.value)} required aria-invalid={!!errors.condition} aria-describedby={errors.condition ? "material-condition-error" : undefined}><option value="">Selecione a condição</option>{Object.entries(conditions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormField><FormField {...input("quantity")} label="Quantidade (unidades) *" type="number" min="1" step="1" required /><FormField {...input("weight")} label="Peso total (kg) *" type="number" min="0.01" step="0.01" required /></div>
      </section>
      <section className="company-form-section"><div className="company-section-heading"><span>02</span><div><h2>Imagens e detalhes</h2><p>As fotos ajudam a apresentar as características do material.</p></div></div><input type="file" accept="image/*" multiple ref={fileInput} onChange={event => void chooseImages(event)} hidden aria-label="Adicionar fotos do material" /><button type="button" className="company-photo-upload" disabled={photoBusy} onClick={() => fileInput.current?.click()}><Camera size={26} strokeWidth={1.3} /><strong>{photoBusy ? "Preparando imagens…" : "Adicionar fotos"}</strong><span>Selecione imagens para apresentar o material.</span></button>{photoError && <p role="alert" className="company-field-error">{photoError}</p>}{images.length > 0 && <div className="company-upload-previews">{images.map((src, index) => <div key={`${src.slice(0, 50)}-${index}`}><img src={src} alt={`Foto ${index + 1} do material`} /><button type="button" aria-label={`Remover foto ${index + 1}`} onClick={() => setImages(previous => previous.filter((_, position) => position !== index))}><X size={13} /></button></div>)}</div>}
        {product && <FormField id="material-status" label="Situação do anúncio"><select id="material-status" value={data.status} onChange={event => set("status", event.target.value)}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormField>}
      </section>
    </div><aside className="company-form-side"><section className="company-form-section"><div className="company-section-heading"><span>03</span><div><h2>Venda ou doação?</h2><p>Escolha como o material será disponibilizado.</p></div></div><fieldset className="company-type-options"><legend className="sr-only">Tipo de negociação</legend>{[{ value: "donation", label: "Doação", text: "Sem cobrança pelo material." }, { value: "sale", label: "Venda", text: "Informe o valor do anúncio." }].map(option => <label key={option.value} className={data.type === option.value ? "is-selected" : ""}><input type="radio" name="negotiation" value={option.value} checked={data.type === option.value} onChange={() => set("type", option.value)} /><span><strong>{option.label}</strong><small>{option.text}</small></span></label>)}</fieldset>{data.type === "sale" ? <FormField {...input("price")} label="Valor do anúncio (R$) *" type="number" min="0.01" step="0.01" required /> : <p className="company-small-note">Doações não têm preço.</p>}</section><div className="company-form-tip"><h3>Antes de continuar</h3><p>Confira a descrição, a quantidade e as condições. Não inclua documentos ou dados pessoais nas fotos.</p>{preview && <p>Esta simulação não cria um anúncio real e será descartada ao recarregar a página.</p>}</div><div className="company-editor-actions"><button type="submit" className="company-button" disabled={!preview || photoBusy}>{photoBusy ? <LoaderCircle size={17} className="account-spinner" /> : <ArrowUpRight size={17} />}{preview ? product ? "Simular alterações" : "Simular publicação" : product ? "Salvar alterações" : "Publicar material"}</button><Link to={base} className="company-button is-secondary">Cancelar</Link></div></aside></form>
  </>;
}
