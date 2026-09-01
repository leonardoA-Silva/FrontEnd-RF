import React from "react";
import { Repeat2, Sparkles, MapPin, BarChart3 } from "lucide-react";

const stats = [
  { value: "2.500+", label: "Toneladas desviadas de aterros" },
  { value: "340+", label: "Empresas parceiras conectadas" },
  { value: "1.200+", label: "Negociações concluídas com sucesso" },
];

const technologies = [
  {
    icon: Sparkles,
    title: "Classificação por IA",
    description: "Análise de qualidade de resíduos",
  },
  {
    icon: MapPin,
    title: "Mapa de Empresas",
    description: "Logística reversa simplificada",
  },
  {
    icon: BarChart3,
    title: "Indicadores Verdes",
    description: "Métricas reais de CO2 poupado",
  },
];

export default function ReaproveitaLanding() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1B4B3A]">
      {/* Header */}
      <header className="border-b border-[#E7E4DA] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Repeat2 className="h-6 w-6" strokeWidth={2.4} />
            </span>
            <div className="leading-tight">
              <p className="text-lg font-bold text-[#1B4B3A]">Reaproveita</p>
              <p className="text-sm font-bold tracking-wide text-orange-500">
                FRANCA
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <button className="rounded-lg border border-[#D9D5C8] px-5 py-2.5 text-sm font-semibold text-[#1B4B3A] transition hover:bg-[#F3F1EA]">
              Entrar
            </button>
            <button className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600">
              Cadastrar
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full border border-emerald-500 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-600">
              ECONOMIA CIRCULAR EM FRANCA
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-[#1B4B3A] sm:text-6xl">
              Transforme resíduos em oportunidades
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4B5A55]">
              Conectamos as grandes indústrias calçadistas de Franca a
              artesãos, cooperativas e microempresas locais. Dê um novo
              destino a retalhos de couro, tecidos, borrachas e muito mais.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-lg bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-600">
                Publicar Material
              </button>
              <button className="rounded-lg border-2 border-emerald-500 px-7 py-3.5 text-base font-semibold text-emerald-600 transition hover:bg-emerald-50">
                Explorar Materiais
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-lg">
            <img
              src="/hero-leather-scraps.jpg"
              alt="Retalhos de couro reaproveitados formando uma composição sobre madeira"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-[#0F3D2E]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-center sm:justify-center sm:gap-16 sm:px-10">
          {stats.map((stat, i) => (
            <div key={stat.value} className="flex items-center gap-4">
              {i > 0 && (
                <span className="hidden h-10 w-px bg-emerald-800 sm:block" />
              )}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-emerald-400 sm:text-4xl">
                  {stat.value}
                </span>
                <span className="max-w-[10rem] text-sm leading-snug text-emerald-50">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technologies + Testimonial */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold text-[#1B4B3A]">
              Nossas Tecnologias
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {technologies.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-[#E7E4DA] bg-white p-5"
                >
                  <Icon className="h-5 w-5 text-emerald-500" strokeWidth={2} />
                  <p className="mt-3 text-sm font-bold text-[#1B4B3A]">
                    {title}
                  </p>
                  <p className="mt-1 text-sm text-[#6B7670]">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#1B4B3A]">
              Depoimento em Destaque
            </h2>
            <blockquote className="mt-6 rounded-xl border border-orange-300 bg-amber-50 p-6">
              <p className="text-[15px] leading-relaxed text-[#3F4A45]">
                &ldquo;Os retalhos de couro que antes iriam para o lixo agora
                viram bolsas e carteiras exclusivas. O Reaproveita Franca
                impulsionou meu ateliê!&rdquo;
              </p>
              <footer className="mt-4 text-sm font-bold text-[#1B4B3A]">
                — Silvana M., Artesã local
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F3D2E] text-emerald-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-10">
          <div className="max-w-xs">
            <p className="text-base font-bold text-white">
              Reaproveita Franca
            </p>
            <p className="mt-2 text-sm leading-relaxed text-emerald-200">
              Conectando a indústria calçadista de Franca à economia circular
              e ao artesanato local.
            </p>
          </div>

          <nav className="flex gap-8 text-sm text-emerald-100">
            <a href="#" className="hover:text-white">
              Políticas de Privacidade
            </a>
            <a href="#" className="hover:text-white">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-white">
              Suporte
            </a>
          </nav>

          <p className="text-sm text-emerald-300">
            © 2026 Reaproveita Franca. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
