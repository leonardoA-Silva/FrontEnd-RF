import { useCallback, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../axios/Axios";
import CompanyPage from "../../components/dashboard/CompanyPage";
import { companyStyles as styles } from "../../components/dashboard/companyStyles";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { useRemoteData } from "../../hooks/useRemoteData";
import { companyError } from "./companyApi";
import { readImage } from "./companyFiles";
import type { ProdutoApi } from "./dashboardApi";

type ProductDetail = ProdutoApi & { photos?: { id: string; photo: string | null }[] };

function ProductForm({ product }: { product: ProductDetail }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ ...product, price: product.price == null ? "" : String(product.price), weight: String(product.weight), quantity: String(product.quantity), description: product.description ?? "" });
  const [photos, setPhotos] = useState(() => (product.photos ?? []).filter(p => p.photo).map(p => `data:image/jpeg;base64,${p.photo}`));
  const [photosChanged, setPhotosChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  async function addImages(files: File[]) {
    setBusy(true); setError("");
    try {
      const additions = await Promise.all(files.map(readImage));
      setPhotos(previous => [...previous, ...additions]); setPhotosChanged(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível ler as imagens."); }
    finally { setBusy(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!values.name.trim() || !Number.isInteger(Number(values.quantity)) || Number(values.quantity) < 1 || !Number.isFinite(Number(values.weight)) || Number(values.weight) <= 0 || (values.type_negotiation === "sale" && (values.price.trim() === "" || !Number.isFinite(Number(values.price)) || Number(values.price) < 0))) { setError("Informe nome, quantidade inteira, peso maior que zero e preço válido para venda."); return; }
    setBusy(true);
    try {
      const body = new FormData();
      const fields = { name: values.name.trim(), description: values.description.trim(), price: values.type_negotiation === "donation" ? "" : values.price, priority: product.priority, quantity: values.quantity, weight: values.weight, status: values.status, category: values.category, type_negotiation: values.type_negotiation, conservation_state: values.conservation_state, id_localization: product.id_localization };
      Object.entries(fields).forEach(([key, value]) => body.append(key, String(value)));
      if (photosChanged) {
        if (photos.length === 0) body.append("photos", "");
        else photos.forEach((photo, index) => {
          const [header, encoded] = photo.split(",");
          const type = header.match(/^data:([^;]+);base64$/)?.[1] ?? "image/jpeg";
          const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
          body.append("photos", new Blob([bytes], { type }), `foto-${index + 1}`);
        });
      }
      await api.put(`/product/${product.id}`, body);
      navigate("/dashboardEmpresa/materiais");
    } catch (cause) { setError(companyError(cause)); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setError("");
    try { await api.delete(`/product/${product.id}`); navigate("/dashboardEmpresa/materiais"); }
    catch (cause) { setError(companyError(cause)); }
    finally { setBusy(false); }
  }
  const selects = [
    ["category", "Categoria", [["madeira", "Madeira"], ["metal", "Metal"], ["plastico", "Plástico"], ["papel/papelao", "Papel e papelão"], ["vidro", "Vidro"], ["tecido", "Tecido"], ["borracha", "Borracha"], ["eletronicos", "Eletrônicos"]]],
    ["conservation_state", "Conservação", [["new", "Novo"], ["good", "Bom estado"], ["regular", "Regular"], ["poor", "Com desgaste"]]],
    ["type_negotiation", "Negociação", [["sale", "Venda"], ["donation", "Doação"]]],
    ["status", "Situação do anúncio", [["available", "Disponível"], ["reserved", "Reservado"], ["unavailable", "Indisponível"]]],
  ] as const;
  return <>
    <form onSubmit={e => void save(e)} className={styles.panel}>
      <fieldset disabled={busy}>
        <legend className="text-xl font-semibold">Dados do material</legend>
        <label className="mt-4 block" htmlFor="material-name">Nome<input id="material-name" className={styles.input} value={values.name} required onChange={e => setValues(v => ({ ...v, name: e.target.value }))} /></label>
        <label className="mt-4 block" htmlFor="material-description">Descrição<textarea id="material-description" className={styles.input} rows={4} value={values.description} onChange={e => setValues(v => ({ ...v, description: e.target.value }))} /></label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">{selects.map(([key, label, options]) => <label key={key} htmlFor={`material-${key}`}>{label}<select id={`material-${key}`} className={styles.input} value={values[key]} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>)}
          <label htmlFor="material-quantity">Quantidade<input id="material-quantity" className={styles.input} type="number" min="1" step="1" required value={values.quantity} onChange={e => setValues(v => ({ ...v, quantity: e.target.value }))} /></label>
          <label htmlFor="material-weight">Peso por unidade (kg)<input id="material-weight" className={styles.input} type="number" min="0.001" step="any" required value={values.weight} onChange={e => setValues(v => ({ ...v, weight: e.target.value }))} /></label>
          {values.type_negotiation === "sale" && <label htmlFor="material-price">Preço por unidade (R$)<input id="material-price" className={styles.input} type="number" min="0" step="0.01" required value={values.price} onChange={e => setValues(v => ({ ...v, price: e.target.value }))} /></label>}
        </div>
        <h2 className="mt-7 text-xl font-semibold">Fotos do material</h2><p className="mt-2 text-sm">As alterações nas fotos só são aplicadas ao salvar o material. Até 5 MB por imagem.</p>
        <label className="mt-4 block" htmlFor="material-photos">Adicionar fotos<input id="material-photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className={styles.input} onChange={e => { void addImages(Array.from(e.target.files ?? [])); e.target.value = ""; }} /></label>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">{photos.map((photo, index) => <li key={`${index}-${photo.length}`}><img src={photo} alt={`Foto ${index + 1} do material`} className="h-40 w-full rounded-lg object-contain" /><button type="button" className={`${styles.secondary} mt-2`} onClick={() => { setPhotos(items => items.filter((_, i) => i !== index)); setPhotosChanged(true); }}>Remover foto {index + 1}</button></li>)}</ul>
        {photos.length === 0 && <p className="mt-4">Nenhuma foto selecionada.</p>}
        <p className="mt-3 text-sm text-tinta-suave">Para substituir uma foto, remova a antiga e adicione a nova antes de salvar.</p>
        <div className="mt-6 flex flex-wrap gap-3"><button type="submit" className={styles.button}>{busy ? "Salvando…" : "Salvar material"}</button><Link to="/dashboardEmpresa/materiais" className={styles.secondary}>Voltar sem salvar</Link></div>
      </fieldset>
    </form>
    {error && <p role="alert" className="mt-4">{error}</p>}
    <section className={styles.panel}><h2 className="text-xl font-semibold">Excluir anúncio</h2><p className="mt-2">A exclusão pode ser impedida caso o material esteja vinculado a uma negociação.</p>
      {!confirmDelete ? <button type="button" className={`${styles.secondary} mt-4`} disabled={busy} onClick={() => setConfirmDelete(true)}>Excluir material</button> : <div className="mt-4"><p>Excluir este material e suas fotos? Esta ação não pode ser desfeita.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" className={styles.button} disabled={busy} onClick={() => void remove()}>Confirmar exclusão</button><button type="button" className={styles.secondary} disabled={busy} onClick={() => setConfirmDelete(false)}>Manter material</button></div></div>}
    </section>
  </>;
}

export default function EditarMaterial() {
  const { id } = useParams();
  const { userId } = useLoggedUser();
  const load = useCallback((signal: AbortSignal) => api.get<ProductDetail>(`/product/${id}`, { signal }).then(r => r.data), [id]);
  const { data, loading, error, reload } = useRemoteData(load);
  const owns = !!userId && data?.id_user?.toLowerCase() === userId.toLowerCase();
  return <CompanyPage title="Editar material" description="Gerencie os dados e as fotos do anúncio da sua empresa." loading={loading} error={error || (data && !owns ? "Este material não pertence à sua empresa." : "")} reload={reload}>{data && owns && <ProductForm key={data.id} product={data} />}</CompanyPage>;
}
