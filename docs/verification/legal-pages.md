# Public legal and transparency pages

## Scope

Public, lazy-loaded routes: `/termos`, `/privacidade`, `/direitos`, `/contato`, `/cookies`.

The five documents use the existing forest/ivory identity, an accessible document navigation, an in-page index and readable responsive sections. Every page explicitly identifies itself as a preliminary draft (version 0.1, 3 November 2026).

The owner confirmed that no responsible entity or institutional contact exists yet. These fields are visibly pending. There is no invented contact address, privacy request form, protocol, or simulated submission. No contractual acceptance checkbox or consent log was introduced. Registration links open in another tab to avoid losing form input.

Shared footer links are available on public pages, registration, login and both dashboard frames. Existing account/API behavior is unchanged.

## Content basis

- Current registration, login/session storage, company material restrictions and explicitly demonstrative buyer/reservation flows.
- IBGE and ViaCEP requests in the registration address hook; OpenStreetMap tiles in the map.
- No advertising or audience analytics integration identified in the reviewed frontend. This is not a complete audit of backend, hosting or third-party cookies; the text states that limitation. No optional cookie toggles/banner were fabricated.
- [ANPD: rights of data subjects](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares).
- [ANPD: cookie recommendations](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-emite-recomendacoes-para-adequacao-da-pratica-de-coleta-de-cookies-do-portal-gov.br).
- [Decree 7.962/2013, official legislative record](https://legislacao.presidencia.gov.br/atos/?ano=2013&ato=61ccXTE5ENVpWT68f&numero=7962&tipo=DEC).

The documents do not establish legal compliance or certify materials. The operator must define controller identity, channels, purposes/legal bases, retention, processors and applicable operational/consumer/environmental rules, then obtain legal review before using these as definitive public policies.

## Verification

- Edge: all five pages at 320, 390, 768 and 1440 px (20 views); no horizontal overflow, one main heading, visible draft notice and correct active document link.
- In-page targets, route links and a direct privacy section URL checked; malformed hash does not crash the page.
- Footer links exercised from login, registration and both dashboard previews. Both complete registration forms expose the two document links in new tabs.
- No forms on legal pages, no legal-page API requests and no runtime errors in those checks.
- `npm run lint` and `npm run build`: passed. Existing large home sculpture chunk warning remains.
- Screenshots: `legal-{termos,privacidade,direitos,contato,cookies}-{390,1440}.png`.

No commit or push in this step. Changes remain local on `new-ui`.
