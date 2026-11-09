'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { useLocale, type Locale } from '@/lib/i18n';
import { termsContent } from '@/messages/terms';
import { privacyContent } from '@/messages/privacy';

/* /terms and /privacy: the legal text from messages/*, in English or Portuguese,
   with a contents list. Only the presentation is shared; the wording is not
   touched here. Rendered inside PublicPage (.vsite). */

type Section = { id: string; title: string; content: string[]; bullets?: string[][] };
type Doc = { pageTitle: string; lastUpdated: string; effectiveDate: string; intro: string; sections: Section[] };
const sources: Record<'terms' | 'privacy', Record<Locale, Doc>> = { terms: termsContent, privacy: privacyContent };

export default function LegalDocument({ kind }: { kind: 'terms' | 'privacy' }) {
  const { locale, setLocale } = useLocale();
  const [activeId, setActiveId] = useState<string | null>(null);
  const doc = sources[kind][locale] ?? sources[kind].en;
  const pt = locale === 'pt';

  return (
    <>
      <section className="band band-mist" aria-labelledby="legal-title">
        <div className="wrap">
          <nav className="crumbs crumbs-dark" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">{doc.pageTitle}</span>
          </nav>
          <div className="legal-head-row">
            <div>
              <p className="t-label">Legal</p>
              <h1 id="legal-title" className="t-display">{doc.pageTitle}</h1>
              <p className="legal-dates">{doc.lastUpdated} · {doc.effectiveDate}</p>
            </div>
            <div className="legal-lang" role="group" aria-label={pt ? 'Idioma' : 'Language'}>
              {(['en', 'pt'] as Locale[]).map(lang => (
                <button key={lang} type="button" aria-pressed={locale === lang} onClick={() => setLocale(lang)}>{lang.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <p className="callout mt-2">{doc.intro}</p>
        </div>
      </section>

      <section className="band" aria-label={doc.pageTitle}>
        <div className="wrap legal-grid">
          <nav className="legal-toc" aria-label={pt ? 'Índice' : 'Contents'}>
            <p className="t-label">{pt ? 'Índice' : 'Contents'}</p>
            <ol>
              {doc.sections.map(section => (
                <li key={section.id}>
                  <a href={`#${section.id}`} aria-current={activeId === section.id ? 'location' : undefined}
                    onClick={() => setActiveId(section.id)}>{section.title}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="legal-body">
            {doc.sections.map(section => (
              <section key={section.id} id={section.id} className="legal-section" aria-labelledby={`${section.id}-title`}>
                <h2 id={`${section.id}-title`} className="t-item">{section.title}</h2>
                {section.content.map((para, index) => {
                  if (para.includes('\n')) {   // contact block, one fact per line
                    return (
                      <p key={index} className="callout">
                        {para.split('\n').map((line, li, lines) => (
                          <Fragment key={li}>{line}{li < lines.length - 1 && <br />}</Fragment>
                        ))}
                      </p>
                    );
                  }
                  if (para === para.toUpperCase() && para.length > 60) {   // disclaimers written in capitals
                    return <p key={index} className="legal-caps">{para}</p>;
                  }
                  return <p key={index}>{para}</p>;
                })}
                {section.bullets?.map((group, gi) => (
                  <div key={gi} className="legal-group">
                    {group[0] && <p className="t-label">{group[0]}</p>}
                    <ul className="ruled">{group.slice(1).map((item, ii) => <li key={ii}>{item}</li>)}</ul>
                  </div>
                ))}
              </section>
            ))}

            <div className="legal-help">
              <p className="t-item">{pt ? 'Alguma dúvida?' : 'Have questions?'}</p>
              <p className="t-lead mt-1">{pt ? 'Nossa equipe de suporte está pronta para ajudar.' : 'Our support team is ready to help.'}</p>
              <a className="btn btn-outline mt-2" href="mailto:support@verliks.com">support@verliks.com</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
