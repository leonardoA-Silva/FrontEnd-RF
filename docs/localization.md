# Brazilian Portuguese (pt-BR) Content Guidelines

The web product is for Brazilian users. New user-facing strings must be natural, concise Brazilian Portuguese, including validation, empty/error/loading messages, accessible names, and confirmation dialogs.

## Writing

- Prefer plain language and familiar terms; avoid internal API field names and technical errors.
- Explain what happened and what the user can do next. Do not blame the user or expose stack traces.
- Keep labels and action verbs consistent across a flow (for example, “Entrar”, “Cadastrar”, “Salvar”, “Cancelar”).
- Use inclusive, respectful wording. Do not infer gender, income, or organization type unnecessarily.
- Distinguish “reserva solicitada” from “reserva confirmada”, and “pagamento iniciado” from “pagamento aprovado”. Never imply a server-confirmed state that was not returned by the API.
- Accessible labels and screen-reader-only text are user-facing copy and must also be pt-BR.

## Formatting

- Use Brazilian formats when displaying values: decimal comma (`R$ 1.234,56`), date `dd/MM/yyyy`, and Brazilian phone/CEP formatting where appropriate.
- Use `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` for currency display rather than hand-built separators.
- Keep API-bound canonical values separate from display formatting. Send the format expected by the verified API contract; do not send localized currency strings as numeric payloads.
- Do not guess time zone or date semantics; confirm whether backend timestamps are UTC and format intentionally.
- CPF/CNPJ formatting is presentational only. Never rely on masking/formatting as validation or authorization.

## Implementation notes

There is no translation framework currently configured. Follow the existing page's string conventions rather than introducing i18n infrastructure for a one-off change. If additional locales become a requirement, propose a shared localization design and migration path before scattering ad hoc dictionaries.
