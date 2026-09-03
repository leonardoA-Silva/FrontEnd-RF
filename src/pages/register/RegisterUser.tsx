import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function RegisterUser() {
  const navigate = useNavigate();

  // Estilos centralizados aqui dentro da função, seguindo o padrão da Home.
  const styles = {
    pagina: "min-h-screen flex flex-col justify-between bg-[#FAF9F5] text-[#1B4B3A]",
    conteudoCentral: "flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8",
    cartao: "w-full max-w-[700px] rounded-3xl border border-[#E7E4DA] bg-white p-8 shadow-sm sm:p-12",

    titulosContainer: "",
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
    botaoVoltar:
      "rounded-lg border border-[#D9D5C8] bg-white px-6 py-2.5 text-sm font-semibold text-[#1B4B3A] transition hover:bg-[#F3F1EA] cursor-pointer",
    botaoFinalizar:
      "rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 cursor-pointer",
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
    nomeOuRazao: "",
    cpfOuCnpj: "",
    tipoEntidade: "",
    localizacao: "",
  });

  const [materiaisInteresse, setMateriaisInteresse] = useState<string[]>([

  ]);

  const toggleMaterial = (material: string) => {
    setMateriaisInteresse((anteriores) =>
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
    console.log("Dados do comprador / artesão:", {
      ...formData,
      materiaisInteresse,
    });
  };

  const handleVoltar = () => {
    navigate("/cadastro");
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.conteudoCentral}>
        <div className={styles.cartao}>
          {/* Título e descrição */}
          <div className={styles.titulosContainer}>
            <h1 className={styles.tituloFormulario}>
              Cadastro de Comprador / Artesão
            </h1>
            <p className={styles.subtituloFormulario}>
              Artesãos, cooperativas, instituições de caridade e empresas criativas.
            </p>
          </div>

          {/* Formulário de cadastro */}
          <form onSubmit={handleSubmit} className={styles.formulario}>
            {/* Nome Completo ou Razão Social */}
            <div className={styles.campoGrupo}>
              <label htmlFor="nomeOuRazao" className={styles.rotulo}>
                Nome Completo ou Razão Social
              </label>
              <input
                id="nomeOuRazao"
                name="nomeOuRazao"
                type="text"
                value={formData.nomeOuRazao}
                onChange={handleChange}
                placeholder="Ex: Ateliê Reutiliza Franca"
                className={styles.campoInput}
              />
            </div>

            {/* CPF ou CNPJ e Tipo de Entidade */}
            <div className={styles.campoGrade2}>
              <div className={styles.campoGrupo}>
                <label htmlFor="cpfOuCnpj" className={styles.rotulo}>
                  CPF ou CNPJ
                </label>
                <input
                  id="cpfOuCnpj"
                  name="cpfOuCnpj"
                  type="text"
                  value={formData.cpfOuCnpj}
                  onChange={handleChange}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className={styles.campoInput}
                />
              </div>

              <div className={styles.campoGrupo}>
                <label htmlFor="tipoEntidade" className={styles.rotulo}>
                  Tipo de Entidade
                </label>
                <input
                  id="tipoEntidade"
                  name="tipoEntidade"
                  type="text"
                  value={formData.tipoEntidade}
                  onChange={handleChange}
                  placeholder="Ex: Artesão Autônomo"
                  className={styles.campoInput}
                />
              </div>
            </div>

            {/* Localização para cálculo de logística */}
            <div className={styles.campoGrupo}>
              <label htmlFor="localizacao" className={styles.rotulo}>
                Localização para cálculo de logística
              </label>
              <input
                id="localizacao"
                name="localizacao"
                type="text"
                value={formData.localizacao}
                onChange={handleChange}
                placeholder="Bairro, Franca - SP"
                className={styles.campoInput}
              />
            </div>

            {/* Materiais de Interesse */}
            <div className={styles.secaoMateriais}>
              <span className={styles.rotuloMateriais}>Materiais de Interesse</span>
              <div className={styles.gradeMateriais}>
                {listaMateriais.map((material) => {
                  const selecionado = materiaisInteresse.includes(material);
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
                onClick={handleVoltar}
                className={styles.botaoVoltar}
              >
                Voltar
              </button>

              <button type="submit" className={styles.botaoFinalizar}>
                Finalizar Cadastro
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
