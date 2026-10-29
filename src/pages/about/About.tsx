import { useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLoggedUser } from "../../hooks/useLoggedUser";

const styles = {
  page: "flex min-h-screen flex-col bg-[#fbfbf9] text-[#064e3b] font-['RF_About_Manrope',sans-serif] [&_:is(a,button):focus-visible]:outline-2 [&_:is(a,button):focus-visible]:outline-offset-4 [&_:is(a,button):focus-visible]:outline-[#064e3b]",
  hero: "grid items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8333fr)] lg:gap-16 lg:px-16 lg:py-20",
  title: "font-['RF_About_Instrument_Serif',serif] text-5xl leading-[1.1] font-normal sm:text-[64px]",
  description: "text-base leading-[1.6] text-[#4b5563] sm:text-lg",
  primary: "inline-flex min-h-12 items-center justify-center rounded-lg bg-[#10b981] px-7 py-3.5 text-center text-[15px] font-bold text-white transition-colors hover:bg-[#006c4a] active:bg-[#064e3b]",
  secondary: "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-[#064e3b] px-7 py-3.5 text-center text-[15px] font-bold text-[#064e3b] transition-colors hover:bg-[#ecfdf5] active:bg-emerald-100",
  cta: "relative isolate flex min-h-[379px] flex-col items-center justify-center gap-8 overflow-hidden bg-[#064e3b] px-5 py-12 text-center sm:px-8 lg:px-16 lg:py-6",
  ctaTitle: "max-w-[800px] font-['RF_About_Instrument_Serif',serif] text-[40px] leading-[1.2] font-normal text-white sm:text-[56px]",
  signup: "inline-flex min-h-14 items-center justify-center rounded-lg bg-[#d97706] px-9 py-4 text-base font-bold text-white transition-colors hover:bg-amber-700 active:bg-amber-800 focus-visible:outline-white!",
  dialog: "fixed inset-0 m-auto max-h-[90svh] w-[calc(100%_-_32px)] max-w-xl overflow-y-auto rounded-2xl border border-[#e5e7eb] bg-[#fbfbf9] p-6 text-[#064e3b] shadow-xl backdrop:bg-black/40 sm:p-8",
};

export default function About() {
  const dialog = useRef<HTMLDialogElement>(null);
  const { isLoggedIn } = useLoggedUser();

  return (
    <div className={styles.page}>
      <a href="#sobre-nos" className="sr-only z-50 bg-white p-3 focus:not-sr-only focus:absolute">
        Pular para o conteúdo
      </a>
      <Header variant="about" />
      <main id="sobre-nos" className="flex-1">
        <section aria-labelledby="missao-titulo" className={styles.hero}>
          <div className="flex min-w-0 flex-col items-start gap-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-[#d97706] uppercase">Quem Somos</p>
              <h1 id="missao-titulo" className={styles.title}>Nossa Missão</h1>
            </div>
            <p className={styles.description}>
              Conectar a expressiva força industrial calçadista de Franca, SP, ao
              talento de artesãos locais por meio da economia circular.
              Facilitamos o reaproveitamento inteligente de resíduos como retalhos
              de couro premium, promovendo a sustentabilidade ecológica e gerando
              oportunidades econômicas para a comunidade.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/marketplace" className={styles.primary}>Explorar Materiais</Link>
              <button type="button" onClick={() => dialog.current?.showModal()} className={styles.secondary}>
                Como Funciona
              </button>
            </div>
          </div>
          <img
            src="/about/artesao-couro.png"
            alt="Artesão trabalhando com couro em uma oficina iluminada por grandes janelas"
            width={640}
            height={400}
            fetchPriority="high"
            className="aspect-[1.6] w-full rounded-3xl object-cover"
          />
        </section>

        <section aria-labelledby="participar-titulo" className={styles.cta}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <img src="/about/economia-circular.png" alt="" width={1600} height={379} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#064e3b]/92" />
          </div>
          <h2 id="participar-titulo" className={styles.ctaTitle}>
            Faça Parte da Economia Circular de Franca
          </h2>
          <p className="max-w-[600px] text-base leading-normal text-[#ecfdf5]/90 sm:text-lg">
            Seja você uma indústria de calçados querendo reduzir seu impacto, ou
            um artesão local em busca de couro de alta qualidade para suas criações.
          </p>
          {!isLoggedIn && <Link to="/cadastro" className={styles.signup}>Cadastre-se Gratuitamente</Link>}
        </section>
      </main>
      <Footer variant="about" />

      <dialog ref={dialog} aria-labelledby="como-funciona-titulo" className={styles.dialog}>
        <div className="flex items-start justify-between gap-4">
          <h2 id="como-funciona-titulo" className="text-2xl font-bold">Como Funciona</h2>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Fechar explicação" className="cursor-pointer rounded-lg p-2 hover:bg-emerald-50">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <ol className="my-6 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-[#4b5563]">
          <li>Cadastre-se como pessoa ou empresa para participar da comunidade.</li>
          <li>Explore o catálogo de materiais e conheça as opções de venda ou doação.</li>
          <li>Veja os detalhes do material, solicite uma reserva e acompanhe a resposta do fornecedor.</li>
        </ol>
        <p className="mb-6 rounded-lg bg-[#ecfdf5] p-4 text-sm leading-relaxed">
          As solicitações de reserva são registradas e aguardam aceite do fornecedor.
          Pagamentos ainda não estão disponíveis nesta versão.
        </p>
        <Link to="/marketplace" className={styles.primary}>Explorar Materiais</Link>
      </dialog>
    </div>
  );
}
