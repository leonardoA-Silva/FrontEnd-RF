import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Camera, LoaderCircle, Package, X } from "lucide-react";
import { createCompanyProduct, updateCompanyProduct } from "./companyApi";
import { loadLocations, resourceError, type CompanyLocation } from "./companyResourceApi";
import { useCompany } from "./CompanyContext";
import { categories, categoryLabel, conditions, money, statuses } from "./companyTypes";
import type { CompanyProduct } from "./companyTypes";
import { CompanyLoading, CompanyMessage } from "./CompanyUi";

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
  const { preview, base, saveDemo, reload, setNotice } = useCompany();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState("");
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [locationId, setLocationId] = useState(product?.localizationId ?? "");
  const [locationFailure, setLocationFailure] = useState("");
  const [locationAttempt, setLocationAttempt] = useState(0);
  useEffect(() => {
    if (preview) return;
    const controller = new AbortController();
    loadLocations(controller.signal).then(rows => {
      if (!controller.signal.aborted) {
        setLocations(rows);
        setLocationId(current => current || rows[0]?.id || "");
      }
    }).catch(cause => { if (!controller.signal.aborted) setLocationFailure(resourceError(cause)); });
    return () => controller.abort();
  }, [preview, locationAttempt]);
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
    if (files.some(file => !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024)) { setPhotoError("Selecione imagens PNG, JPEG, GIF ou WebP de até 5 MB cada."); return; }
    setPhotoBusy(true);
    const current = ++generation.current;
    try {
      const result = await Promise.all(files.map(file => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(); reader.onerror = reject; reader.readAsDataURL(file); })));
      if (generation.current === current) setImages(result.slice(0, 1));
    } catch { if (generation.current === current) setPhotoError("Não foi possível abrir as imagens. Tente outros arquivos."); }
    finally { if (generation.current === current) setPhotoBusy(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (photoBusy || saving) return;
    const next: Record<string, string> = {};
    if (!data.name.trim() || data.name.length > 100) next.name = "Informe um nome com até 100 caracteres.";
    if (!(data.category in categories)) next.category = "Selecione a categoria do material.";
    if (!(data.condition in conditions)) next.condition = "Selecione o estado de conservação.";
    if (!data.quantity.trim() || !Number.isInteger(Number(data.quantity)) || Number(data.quantity) < (product ? 0 : 1)) next.quantity = product ? "Informe uma quantidade inteira igual ou maior que zero." : "Informe uma quantidade inteira maior que zero.";
    if (!data.weight.trim() || !Number.isFinite(Number(data.weight)) || Number(data.weight) <= 0) next.weight = "Informe um peso maior que zero.";
    else if (Number(data.weight) > 99999999.99 || Number(Number(data.weight).toFixed(2)) !== Number(data.weight)) next.weight = "Use até duas casas decimais e no máximo 99.999.999,99 kg.";
    if (data.type === "sale" && (!data.price.trim() || !Number.isFinite(Number(data.price)) || Number(data.price) <= 0)) next.price = "Informe um preço maior que zero para a venda.";
    else if (data.type === "sale" && (Number(data.price) > 999999.99 || Number(Number(data.price).toFixed(2)) !== Number(data.price))) next.price = "Use até duas casas decimais e no máximo R$ 999.999,99.";
    if (!preview && !locations.some(item => item.id === locationId)) next.location = "Selecione um endereço da sua empresa.";
    setErrors(next);
    if (Object.keys(next).length) { document.getElementById(`material-${Object.keys(next)[0]}`)?.focus(); return; }
    setFailure("");
    setSaving(true);
    try {
      if (preview) {
        const id = product?.id ?? crypto.randomUUID();
        const updated = { ...product, id, name: data.name.trim(), description: data.description.trim(), category: data.category, type: data.type, quantity: Number(data.quantity), weight: Number(data.weight), price: data.type === "sale" ? Number(data.price) : null, condition: data.condition, status: data.status, images, localizationId: locationId };
        saveDemo(updated);
        navigate(`${base}/materiais/${encodeURIComponent(id)}`);
      } else if (product) {
        const updated = { ...product, id: product.id, name: data.name.trim(), description: data.description.trim(), category: data.category, type: data.type, quantity: Number(data.quantity), weight: Number(data.weight), price: data.type === "sale" ? Number(data.price) : null, condition: data.condition, status: data.status, images, localizationId: locationId };
        await updateCompanyProduct(updated);
        reload();
        setNotice("Material atualizado com sucesso.");
        navigate(`${base}/materiais/${encodeURIComponent(product.id)}`);
      } else {
        const createdId = await createCompanyProduct({
          name: data.name.trim(), description: data.description.trim(), category: data.category, type: data.type,
          quantity: Number(data.quantity), weight: Number(data.weight), price: data.type === "sale" ? Number(data.price) : null,
          condition: data.condition, status: data.status, images, localizationId: locationId, priority: 0
        });
        reload();
        setNotice("Material publicado com sucesso.");
        navigate(`${base}/materiais/${encodeURIComponent(createdId)}`);
      }
    } catch (cause) { setFailure(resourceError(cause)); }
    finally { setSaving(false); }
  }
  return <div className="company-editor-page">
    <Link to={base} className="company-inline-link company-back"><ArrowLeft size={15} /> Biblioteca de materiais</Link>
    <div className="company-page-heading"><div><p className="home-eyebrow">{product ? "Uma nova versão do seu anúncio" : "Da indústria para novas possibilidades"}</p><h1>{product ? "Editar material." : "Publicar um material."}</h1><p>Informações claras ajudam o material a encontrar um novo destino.</p></div></div>
    <nav className="company-editor-sections" aria-label="Seções do anúncio"><a href="#material-dados"><span>01</span>O material</a><a href="#material-imagens"><span>02</span>Fotos e detalhes</a><a href="#material-condicoes"><span>03</span>Venda ou doação</a></nav>
    <form noValidate onSubmit={submit} aria-busy={saving} className="company-editor"><fieldset disabled={saving} className="contents"><div className="company-form-main">
      <section id="material-dados" className="company-form-section"><div className="company-section-heading"><span>01</span><div><h2>O material</h2><p>Conte o que você está disponibilizando.</p></div></div>
        <FormField {...input("name")} label="Nome do material *" maxLength={100} required placeholder="Como você quer apresentar este material?" />
        <FormField id="material-description" label="Descrição"><textarea id="material-description" value={data.description} onChange={event => set("description", event.target.value)} rows={4} placeholder="Descreva as características, medidas e possibilidades de uso." /></FormField>
        <div className="company-form-grid"><FormField id="material-category" label="Categoria *" error={errors.category}><select id="material-category" value={data.category} onChange={event => set("category", event.target.value)} required aria-invalid={!!errors.category} aria-describedby={errors.category ? "material-category-error" : undefined}><option value="">Selecione uma categoria</option>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormField><FormField id="material-condition" label="Conservação *" error={errors.condition}><select id="material-condition" value={data.condition} onChange={event => set("condition", event.target.value)} required aria-invalid={!!errors.condition} aria-describedby={errors.condition ? "material-condition-error" : undefined}><option value="">Selecione a condição</option>{Object.entries(conditions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormField><FormField {...input("quantity")} label="Quantidade (unidades) *" type="number" min={product ? 0 : 1} step="1" required /><FormField {...input("weight")} label="Peso total (kg) *" type="number" min="0.01" step="0.01" required /></div>
      </section>
      <section id="material-imagens" className="company-form-section"><div className="company-section-heading"><span>02</span><div><h2>Imagens e detalhes</h2><p>As fotos ajudam a apresentar as características do material.</p></div></div>{!product && <><input type="file" accept="image/*" ref={fileInput} onChange={event => void chooseImages(event)} hidden aria-label="Adicionar fotos do material" /><button type="button" className="company-photo-upload" disabled={photoBusy} onClick={() => fileInput.current?.click()}><Camera size={26} strokeWidth={1.3} /><strong>{photoBusy ? "Preparando imagens…" : "Adicionar fotos"}</strong><span>Selecione imagens para apresentar o material.</span></button>{photoError && <p role="alert" className="company-field-error">{photoError}</p>}{images.length > 0 && <div className="company-upload-previews">{images.map((src, index) => <div key={`${src.slice(0, 50)}-${index}`}><img src={src} alt={`Foto ${index + 1} do material`} /><button type="button" aria-label={`Remover foto ${index + 1}`} onClick={() => setImages(previous => previous.filter((_, position) => position !== index))}><X size={13} /></button></div>)}</div>}
        </>}{product && <FormField id="material-status" label="Situação do anúncio"><select id="material-status" value={data.status} onChange={event => set("status", event.target.value)}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormField>}
      </section>
    </div><aside className="company-form-side"><section id="material-condicoes" className="company-form-section"><div className="company-section-heading"><span>03</span><div><h2>Venda ou doação?</h2><p>Escolha como o material será disponibilizado.</p></div></div><fieldset className="company-type-options"><legend className="sr-only">Tipo de negociação</legend>{[{ value: "donation", label: "Doação", text: "Sem cobrança pelo material." }, { value: "sale", label: "Venda", text: "Informe o valor do anúncio." }].map(option => <label key={option.value} className={data.type === option.value ? "is-selected" : ""}><input type="radio" name="negotiation" value={option.value} checked={data.type === option.value} onChange={() => set("type", option.value)} /><span><strong>{option.label}</strong><small>{option.text}</small></span></label>)}</fieldset>{data.type === "sale" ? <div className="company-price-field"><FormField {...input("price")} label="Valor do anúncio (R$) *" type="number" min="0.01" step="0.01" required /></div> : <p className="company-small-note">Doações não têm preço.</p>}</section><section className="company-listing-preview" aria-labelledby="listing-preview-title"><p id="listing-preview-title" className="company-eyebrow">Prévia do anúncio</p><div className="company-listing-preview-photo">{images[0] ? <img src={images[0]} alt="Primeira foto selecionada para o anúncio" /> : <Package size={40} strokeWidth={1.1} aria-hidden="true" />}</div><span>{data.category ? categoryLabel(data.category) : "Categoria do material"}</span><h2>{data.name.trim() || "O nome do seu material"}</h2><strong>{data.type === "donation" ? "Doação" : data.price && Number.isFinite(Number(data.price)) && Number(data.price) > 0 ? money(Number(data.price)) : "Informe o valor"}</strong><small>{data.type === "donation" ? "Sem custo pelo material" : "Valor do anúncio"}</small><p>Visualização do formulário. Ainda não é um anúncio publicado.</p></section><div className="company-form-tip"><h3>Antes de continuar</h3><p>Confira a descrição, a quantidade e as condições. Não inclua documentos ou dados pessoais nas fotos.</p>{preview && <p>Esta simulação não cria um anúncio real e será descartada ao recarregar a página.</p>}</div>{!preview && <div className="company-field"><label htmlFor="material-location">Endereço do material *</label><select id="material-location" value={locationId} onChange={e => setLocationId(e.target.value)} aria-invalid={!!errors.location} aria-describedby={errors.location ? "material-location-error" : undefined}><option value="">Selecione um endereço</option>{locations.map(item => <option key={item.id} value={item.id}>{item.street}, {item.number} · {item.city}/{item.state}</option>)}</select>{errors.location && <p id="material-location-error" className="company-field-error">{errors.location}</p>}{locationFailure && <p role="alert">{locationFailure}<button type="button" onClick={() => { setLocationFailure(""); setLocationAttempt(v => v + 1); }}>Tentar novamente</button></p>}<Link to={`${base}/enderecos`} className="company-inline-link">Gerenciar endereços</Link></div>}{failure && <p role="alert" className="company-field-error">{failure}</p>}<div className="company-editor-actions"><button type="submit" className="company-button" disabled={photoBusy || saving}>{photoBusy || saving ? <LoaderCircle size={17} className="account-spinner" /> : <ArrowUpRight size={17} />}{saving ? "Salvando…" : preview ? product ? "Simular alterações" : "Simular publicação" : product ? "Salvar alterações" : "Publicar material"}</button><Link to={base} className="company-button is-secondary">Cancelar</Link></div></aside></fieldset></form>
  </div>;
}
