import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegisterCompany() {
  const navigate = useNavigate();
  // Estilos centralizados aqui dentro da função (sem arquivo .css), seguindo o padrão da Home.
  // Cada chave tem um nome semântico e guarda as classes Tailwind correspondentes.
  const styles = {
    pagina: "min-h-screen flex flex-col justify-between bg-[#FAF9F5] text-[#1B4B3A]",
    conteudoCentral: "flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8",
    cartao: "w-full max-w-[700px] rounded-3xl border border-[#E7E4DA] bg-white p-8 shadow-sm sm:p-12",

    cabecalhoEtapa: "flex flex-col gap-3",
    textoEtapa: "text-xs font-bold tracking-wider text-emerald-600 uppercase",
    trilhaProgresso: "h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]",
    barraProgresso: "h-full w-2/3 rounded-full bg-emerald-500 transition-all duration-300",

    titulosContainer: "mt-7",
    tituloFormulario: "text-2xl font-bold tracking-tight text-[#1B4B3A] sm:text-3xl",
    subtituloFormulario: "mt-1.5 text-sm leading-relaxed text-[#6B7670]",

    formulario: "mt-8 flex flex-col gap-5",
    campoGrupo: "flex flex-col gap-1.5",
    campoGrade2: "grid grid-cols-1 gap-5 sm:grid-cols-2",
    rotulo: "text-sm font-semibold text-[#2C3E35]",
    campoInput:
      "w-full rounded-lg border border-[#D9D5C8] bg-white px-4 py-2.5 text-sm text-[#1B4B3A] placeholder-[#9CA3AF] transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500",

    secaoMateriais: "mt-2 flex flex-col gap-2.5",
    rotuloMateriais: "text-sm font-semibold text-[#2C3E35]",
    gradeMateriais: "flex flex-wrap gap-2.5",
    botaoMaterial: (selecionado: boolean) =>
      `flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition cursor-pointer select-none ${
        selecionado
          ? "border-emerald-500 bg-emerald-50/50 text-emerald-700"
          : "border-[#D9D5C8] bg-white text-[#6B7670] hover:bg-[#F9F8F5]"
      }`,
    caixaSelecao: (selecionado: boolean) =>
      `flex h-4 w-4 items-center justify-center rounded transition ${
        selecionado ? "bg-emerald-500 text-white" : "border border-[#B8B4A8] bg-white"
      }`,

    rodapeBotoes: "mt-8 flex items-center justify-between",
    botaoCancelar:
      "rounded-lg border border-[#D9D5C8] bg-white px-6 py-2.5 text-sm font-semibold text-[#1B4B3A] transition hover:bg-[#F3F1EA] cursor-pointer",
    botaoSalvar:
      "flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 cursor-pointer",
  };

  const listaMateriais = [
    "Couro",
    "Tecido",
    "EVA",
    "Borracha",
    "Espuma",
    "Pallets",
  ];

  const [formData, setFormData] = useState({
    razaoSocial: "",
    cnpj: "",
    setorIndustrial: "",
    endereco: "",
    responsavel: "",
    telefone: "",
  });

  const [materiaisSelecionados, setMateriaisSelecionados] = useState<string[]>([

  ]);

  const toggleMaterial = (material: string) => {
    setMateriaisSelecionados((anteriores) =>
      anteriores.includes(material)
        ? anteriores.filter((m) => m !== material)
        : [...anteriores, material]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados do cadastro da empresa:", {
      ...formData,
      materiais: materiaisSelecionados,
    });
  };

  const handleCancel = () => {
    navigate("/cadastro");
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.conteudoCentral}>
        <div className={styles.cartao}>
          {/* Indicador de etapa e progresso */}
          <div className={styles.cabecalhoEtapa}>
            <span className={styles.textoEtapa}>
              PASSO 2 DE 3: PERFIL DA EMPRESA
            </span>
            <div className={styles.trilhaProgresso}>
              <div className={styles.barraProgresso} />
            </div>
          </div>

          {/* Título e descrição */}
          <div className={styles.titulosContainer}>
            <h1 className={styles.tituloFormulario}>
              Cadastro de Empresa Geradora
            </h1>
            <p className={styles.subtituloFormulario}>
              Registre sua fábrica ou curtume para publicar resíduos regularmente.
            </p>
          </div>

          {/* Formulário de cadastro */}
          <form onSubmit={handleSubmit} className={styles.formulario}>
            {/* Razão Social */}
            <div className={styles.campoGrupo}>
              <label htmlFor="razaoSocial" className={styles.rotulo}>
                Razão Social
              </label>
              <input
                id="razaoSocial"
                name="razaoSocial"
                type="text"
                value={formData.razaoSocial}
                onChange={handleChange}
                placeholder="Ex: Calçados Franca Conectada Ltda"
                className={styles.campoInput}
              />
            </div>

            {/* CNPJ e Setor Industrial */}
            <div className={styles.campoGrade2}>
              <div className={styles.campoGrupo}>
                <label htmlFor="cnpj" className={styles.rotulo}>
                  CNPJ
                </label>
                <input
                  id="cnpj"
                  name="cnpj"
                  type="text"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                  className={styles.campoInput}
                />
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="setorIndustrial" className={styles.rotulo}>
                  Setor Industrial
                </label>
                <input
                  id="setorIndustrial"
                  name="setorIndustrial"
                  type="text"
                  value={formData.setorIndustrial}
                  onChange={handleChange}
                  placeholder="Ex: Calçadista (Componentes)"
                  className={styles.campoInput}
                />
              </div>
            </div>

            {/* Endereço da Unidade */}
            <div className={styles.campoGrupo}>
              <label htmlFor="endereco" className={styles.rotulo}>
                Endereço da Unidade (Franca/SP)
              </label>
              <input
                id="endereco"
                name="endereco"
                type="text"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Ex: Av. Dr. Hélio Palermo, 4200 - Jd. Paulista"
                className={styles.campoInput}
              />
            </div>

            {/* Responsável e Telefone / WhatsApp */}
            <div className={styles.campoGrade2}>
              <div className={styles.campoGrupo}>
                <label htmlFor="responsavel" className={styles.rotulo}>
                  Responsável
                </label>
                <input
                  id="responsavel"
                  name="responsavel"
                  type="text"
                  value={formData.responsavel}
                  onChange={handleChange}
                  placeholder="Nome do responsável"
                  className={styles.campoInput}
                />
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="telefone" className={styles.rotulo}>
                  Telefone / WhatsApp
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="text"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className={styles.campoInput}
                />
              </div>
            </div>

            {/* Materiais Disponíveis */}
            <div className={styles.secaoMateriais}>
              <span className={styles.rotuloMateriais}>Materiais disponíveis</span>
              <div className={styles.gradeMateriais}>
                {listaMateriais.map((material) => {
                  const selecionado = materiaisSelecionados.includes(material);
                  return (
                    <button
                      key={material}
                      type="button"
                      onClick={() => toggleMaterial(material)}
                      className={styles.botaoMaterial(selecionado)}
                    >
                      <span className={styles.caixaSelecao(selecionado)}>
                        {selecionado && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span>{material}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ações do Formulário */}
            <div className={styles.rodapeBotoes}>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.botaoCancelar}
              >
                Cancelar
              </button>

              <button type="submit" className={styles.botaoSalvar}>
                Salvar e Continuar
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
