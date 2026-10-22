import { useState, type FormEvent } from "react";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DashboardShell from "../../components/dashboard/DashboardShell";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { mensagemDeErroApi } from "../../utils/apiError";
import {
  criarLocalizacao,
  criarProduto,
  type EstadoConservacao,
  type ProdutoCategoria,
  type TipoNegociacao,
} from "./dashboardApi";

const CAMPOS_INICIAIS = {
  name: "",
  description: "",
  category: "madeira" as ProdutoCategoria,
  quantity: "1",
  weight: "",
  type_negotiation: "sale" as TipoNegociacao,
  price: "",
  conservation_state: "good" as EstadoConservacao,
  zipCode: "",
  street: "",
  neighborhood: "",
  number: "",
  city: "Franca",
  state: "SP",
};

const CATEGORIAS: { valor: ProdutoCategoria; rotulo: string }[] = [
  { valor: "madeira", rotulo: "Madeira" },
  { valor: "metal", rotulo: "Metal" },
  { valor: "plastico", rotulo: "Plástico" },
  { valor: "papel/papelao", rotulo: "Papel e papelão" },
  { valor: "vidro", rotulo: "Vidro" },
  { valor: "tecido", rotulo: "Tecido" },
  { valor: "borracha", rotulo: "Borracha" },
  { valor: "eletronicos", rotulo: "Eletrônicos" },
];

export default function NovoMaterial() {
  const navigate = useNavigate();
  const { userId } = useLoggedUser({ fallbackName: "Minha Empresa" });
  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [localizacaoId, setLocalizacaoId] = useState("");

  function atualizar<K extends keyof typeof CAMPOS_INICIAIS>(
    campo: K,
    valor: (typeof CAMPOS_INICIAIS)[K]
  ) {
    setCampos((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!userId) {
      setErro("Não foi possível identificar sua empresa nesta sessão. Entre novamente.");
      return;
    }

    const peso = Number(campos.weight);
    const quantidade = Number(campos.quantity);
    const preco = campos.type_negotiation === "sale" ? Number(campos.price) : null;
    if (!Number.isFinite(peso) || peso <= 0 || !Number.isInteger(quantidade) || quantidade < 1) {
      setErro("Informe um peso maior que zero e uma quantidade inteira de pelo menos uma unidade.");
      return;
    }
    if (campos.type_negotiation === "sale" && (!Number.isFinite(preco) || preco! < 0)) {
      setErro("Informe um valor válido para o material à venda.");
      return;
    }

    setEnviando(true);
    try {
      let idLocalizacao = localizacaoId;
      if (!idLocalizacao) {
        idLocalizacao = await criarLocalizacao({
          userId,
          zipCode: campos.zipCode.replace(/\D/g, ""),
          street: campos.street.trim(),
          neighborhood: campos.neighborhood.trim(),
          number: campos.number.trim(),
          city: campos.city.trim(),
          state: campos.state.trim().toUpperCase(),
        });
        setLocalizacaoId(idLocalizacao);
      }

      await criarProduto({
        name: campos.name.trim(),
        description: campos.description.trim(),
        price: preco,
        priority: 0,
        quantity: quantidade,
        status: "available",
        category: campos.category,
        type_negotiation: campos.type_negotiation,
        weight: peso,
        conservation_state: campos.conservation_state,
        id_localization: idLocalizacao,
      });
      navigate("/dashboardEmpresa/materiais");
    } catch (error) {
      setErro(
        mensagemDeErroApi(
          error,
          "Não foi possível cadastrar o material. Confira os dados e tente novamente."
        )
      );
    } finally {
      setEnviando(false);
    }
  }

  const styles = {
    titulo: "text-[26px] font-bold leading-tight tracking-tight text-verde-escuro sm:text-[30px]",
    descricao: "mt-2 max-w-2xl text-sm leading-relaxed text-tinta-suave",
    voltar: "inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-verde-escuro hover:text-verde",
    painel: "mt-6 rounded-xl border border-linha bg-white p-5 sm:p-7",
    secaoTitulo: "text-lg font-bold text-tinta",
    secaoDescricao: "mt-1 text-sm leading-relaxed text-tinta-suave",
    grade: "mt-5 grid gap-5 sm:grid-cols-2",
    campo: "min-w-0",
    label: "mb-2 block text-sm font-semibold text-tinta",
    input: "h-11 w-full rounded-lg border border-linha bg-white px-3.5 text-sm text-tinta placeholder:text-tinta-clara focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/20",
    textarea: "min-h-28 w-full resize-y rounded-lg border border-linha bg-white px-3.5 py-3 text-sm text-tinta placeholder:text-tinta-clara focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/20",
    select: "h-11 w-full rounded-lg border border-linha bg-white px-3.5 text-sm text-tinta focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/20",
    ajuda: "mt-1.5 text-xs leading-relaxed text-tinta-suave",
    escolha: "flex min-h-[72px] cursor-pointer items-start gap-3 rounded-lg border border-linha p-4 transition-colors has-[:checked]:border-verde has-[:checked]:bg-verde-claro/60",
    acao: "mt-6 flex flex-col-reverse gap-3 border-t border-linha pt-5 sm:flex-row sm:justify-end",
    botaoSecundario: "inline-flex min-h-11 items-center justify-center rounded-lg border border-linha px-5 text-sm font-semibold text-tinta hover:bg-bruma",
    botaoPrimario: "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-verde px-5 text-sm font-semibold text-white transition-colors hover:bg-verde-escuro disabled:cursor-wait disabled:opacity-70",
  };

  return (
    <DashboardShell active="publicar" onSoon={() => undefined}>
      <Link to="/dashboardEmpresa/materiais" className={styles.voltar}>
        <ArrowLeft size={17} aria-hidden="true" />
        Voltar para meus materiais
      </Link>
      <div className="mt-4">
        <h1 className={styles.titulo}>Cadastrar material</h1>
        <p className={styles.descricao}>
          Informe os detalhes do lote para disponibilizá-lo para venda ou doação.
        </p>
      </div>

      <form onSubmit={(event) => void enviar(event)}>
        <section className={styles.painel} aria-labelledby="titulo-detalhes">
          <h2 id="titulo-detalhes" className={styles.secaoTitulo}>Detalhes do material</h2>
          <p className={styles.secaoDescricao}>Descreva o material e a quantidade disponível.</p>
          <div className={styles.grade}>
            <div className={`${styles.campo} sm:col-span-2`}>
              <label className={styles.label} htmlFor="nome-material">Nome do material <span aria-hidden="true">*</span></label>
              <input id="nome-material" className={styles.input} value={campos.name} onChange={(event) => atualizar("name", event.target.value)} maxLength={120} required placeholder="Ex.: Retalhos de couro bovino" />
            </div>
            <div className={`${styles.campo} sm:col-span-2`}>
              <label className={styles.label} htmlFor="descricao-material">Descrição</label>
              <textarea id="descricao-material" className={styles.textarea} value={campos.description} onChange={(event) => atualizar("description", event.target.value)} maxLength={1000} placeholder="Conte detalhes importantes sobre o lote, uso ou retirada." />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="categoria-material">Categoria <span aria-hidden="true">*</span></label>
              <select id="categoria-material" className={styles.select} value={campos.category} onChange={(event) => atualizar("category", event.target.value as ProdutoCategoria)}>
                {CATEGORIAS.map((categoria) => <option key={categoria.valor} value={categoria.valor}>{categoria.rotulo}</option>)}
              </select>
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="conservacao">Estado de conservação <span aria-hidden="true">*</span></label>
              <select id="conservacao" className={styles.select} value={campos.conservation_state} onChange={(event) => atualizar("conservation_state", event.target.value as EstadoConservacao)}>
                <option value="new">Novo</option>
                <option value="good">Bom estado</option>
                <option value="regular">Estado regular</option>
                <option value="poor">Com desgaste</option>
              </select>
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="quantidade">Quantidade de lotes <span aria-hidden="true">*</span></label>
              <input id="quantidade" className={styles.input} type="number" min="1" step="1" inputMode="numeric" value={campos.quantity} onChange={(event) => atualizar("quantity", event.target.value)} required />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="peso">Peso por lote (kg) <span aria-hidden="true">*</span></label>
              <input id="peso" className={styles.input} type="number" min="0.01" step="0.01" inputMode="decimal" value={campos.weight} onChange={(event) => atualizar("weight", event.target.value)} required placeholder="Ex.: 25" />
            </div>
          </div>
        </section>

        <section className={styles.painel} aria-labelledby="titulo-negociacao">
          <h2 id="titulo-negociacao" className={styles.secaoTitulo}>Tipo de anúncio</h2>
          <p className={styles.secaoDescricao}>Escolha como este material ficará disponível.</p>
          <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Forma de disponibilização</legend>
            <label className={styles.escolha}>
              <input type="radio" name="negociacao" value="sale" checked={campos.type_negotiation === "sale"} onChange={() => atualizar("type_negotiation", "sale")} className="mt-1 accent-verde" />
              <span><span className="block text-sm font-semibold text-tinta">À venda</span><span className="mt-1 block text-xs leading-relaxed text-tinta-suave">Defina o valor por lote.</span></span>
            </label>
            <label className={styles.escolha}>
              <input type="radio" name="negociacao" value="donation" checked={campos.type_negotiation === "donation"} onChange={() => atualizar("type_negotiation", "donation")} className="mt-1 accent-verde" />
              <span><span className="block text-sm font-semibold text-tinta">Para doação</span><span className="mt-1 block text-xs leading-relaxed text-tinta-suave">Sem cobrança pelo material.</span></span>
            </label>
          </fieldset>
          {campos.type_negotiation === "sale" ? (
            <div className="mt-5 max-w-sm">
              <label className={styles.label} htmlFor="preco">Valor por lote (R$) <span aria-hidden="true">*</span></label>
              <input id="preco" className={styles.input} type="number" min="0" step="0.01" inputMode="decimal" value={campos.price} onChange={(event) => atualizar("price", event.target.value)} required placeholder="0,00" />
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-verde-claro px-4 py-3 text-sm leading-relaxed text-verde-escuro">Materiais para doação são publicados sem valor.</p>
          )}
        </section>

        <section className={styles.painel} aria-labelledby="titulo-local-retirada">
          <h2 id="titulo-local-retirada" className={styles.secaoTitulo}>Local de retirada</h2>
          <p className={styles.secaoDescricao}>Informe o endereço onde o material poderá ser retirado.</p>
          <div className={styles.grade}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="cep">CEP <span aria-hidden="true">*</span></label>
              <input id="cep" className={styles.input} value={campos.zipCode} onChange={(event) => atualizar("zipCode", event.target.value)} inputMode="numeric" autoComplete="postal-code" maxLength={9} required placeholder="00000-000" />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="numero">Número <span aria-hidden="true">*</span></label>
              <input id="numero" className={styles.input} value={campos.number} onChange={(event) => atualizar("number", event.target.value)} autoComplete="address-line2" maxLength={6} required />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="rua">Rua ou avenida <span aria-hidden="true">*</span></label>
              <input id="rua" className={styles.input} value={campos.street} onChange={(event) => atualizar("street", event.target.value)} autoComplete="street-address" maxLength={150} required />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="bairro">Bairro <span aria-hidden="true">*</span></label>
              <input id="bairro" className={styles.input} value={campos.neighborhood} onChange={(event) => atualizar("neighborhood", event.target.value)} autoComplete="address-level3" maxLength={80} required />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="cidade">Cidade <span aria-hidden="true">*</span></label>
              <input id="cidade" className={styles.input} value={campos.city} onChange={(event) => atualizar("city", event.target.value)} autoComplete="address-level2" maxLength={100} required />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="estado">Estado (UF) <span aria-hidden="true">*</span></label>
              <input id="estado" className={styles.input} value={campos.state} onChange={(event) => atualizar("state", event.target.value.toUpperCase().slice(0, 2))} autoComplete="address-level1" minLength={2} maxLength={2} required />
            </div>
          </div>
          <p className={styles.ajuda}>O endereço informado será usado como referência para retirada do lote.</p>
        </section>

        {erro && <p className="mt-5 rounded-lg bg-danger/10 px-4 py-3 text-sm leading-relaxed text-danger" role="alert">{erro}</p>}

        <div className={styles.acao}>
          <Link to="/dashboardEmpresa/materiais" className={styles.botaoSecundario}>Cancelar</Link>
          <button type="submit" className={styles.botaoPrimario} disabled={enviando}>
            {enviando ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
            {enviando ? "Cadastrando…" : "Publicar material"}
          </button>
        </div>
      </form>
    </DashboardShell>
  );
}
