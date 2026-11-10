import { useEffect } from "react";
import { ArrowLeft, ArrowUpRight, Cookie, FileText, Fingerprint, Info, Landmark } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { legalDocuments, type LegalKind } from "./legalContent";

const icons = { termos: FileText, privacidade: Fingerprint, direitos: Landmark, contato: Info, cookies: Cookie };

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const document = legalDocuments[kind];
  const Icon = icons[kind];
  const { hash } = useLocation();
  useEffect(() => {
    const previousTitle = window.document.title;
    window.document.title = `${document.label} — Reaproveita Franca`;
    let sectionId = hash.slice(1);
    try { sectionId = decodeURIComponent(sectionId); } catch { /* Invalid URL encoding has no matching section. */ }
    const section = sectionId ? window.document.getElementById(sectionId) : null;
    if (section) section.scrollIntoView({ behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
    return () => { window.document.title = previousTitle; };
  }, [document, hash]);

  return <div className="legal-page"><Header />
    <main id="conteudo" className="home-container legal-main" tabIndex={-1}>
      <Link to="/" className="legal-back"><ArrowLeft size={15} aria-hidden="true" />Voltar ao início</Link>
      <header className="legal-heading"><div><p className="legal-eyebrow">Transparência · Reaproveita Franca</p><h1>{document.title}</h1><p>{document.description}</p></div><Icon size={50} strokeWidth={1.2} aria-hidden="true" /></header>
      <div className="legal-draft" role="note"><Info size={19} aria-hidden="true" /><div><strong>Versão preliminar</strong><p>Conteúdo baseado na versão atual do projeto. A identificação do responsável, os canais institucionais e a revisão jurídica estão pendentes. Estes documentos ainda não são uma versão legal definitiva.</p></div><span>Minuta 0.1<br /><time dateTime="2026-11-03">03 nov. 2026</time></span></div>
      <nav className="legal-document-nav" aria-label="Documentos e contato">{Object.values(legalDocuments).map(item => <NavLink key={item.path} to={item.path}>{item.label}</NavLink>)}</nav>
      <div className="legal-body">
        <aside className="legal-index"><nav aria-label="Nesta página"><p>Nesta página</p><ol>{document.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a></li>)}</ol></nav><Link to="/contato" className="legal-contact-link">Identificação e contato<ArrowUpRight size={15} aria-hidden="true" /></Link></aside>
        <article className="legal-article" aria-label={document.label}>{document.sections.map((section, index) => <section id={section.id} key={`${kind}-${section.id}`} aria-labelledby={`heading-${section.id}`}><p className="legal-section-number">{String(index + 1).padStart(2, "0")}</p><h2 id={`heading-${section.id}`}>{section.title}</h2>{section.content}</section>)}<p className="legal-endnote">Minuta informativa do projeto. Alterações no funcionamento da plataforma exigem a atualização destes documentos.</p></article>
      </div>
    </main><Footer />
  </div>;
}
