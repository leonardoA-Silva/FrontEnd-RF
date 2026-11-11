# Contrato da API para o frontend

Contratos iniciais verificados em 29/10/2026 (`6543cd9`), atualizados para o comprador em 10/11/2026 contra a API local **`192bbaf`**. Fonte: rotas, controllers e services executáveis de `backend-RF`, não apenas schema/documentação. Prefixo: `/api/reaproveitafranca`. Evidências atuais: [integração do comprador](buyer-api-update-2026-11-10.md). Registros anteriores ficam como histórico quando divergirem desta atualização.

## Transporte e sessão

- Axios: `VITE_API_URL` ou `/api/reaproveitafranca`; interceptor anexa JWT de `token` no armazenamento já usado pelo projeto.
- Vite encaminha `/api` e `/socket.io` (incluindo WebSocket) para `VITE_BACKEND_URL` ou `http://127.0.0.1:5000`.
- Só 401 com `auth: false` encerra automaticamente a sessão; senha atual incorreta também usa 401, sem esse sinal.
- Login usa `{ email, password }` em `/user/login`, com resposta `{ token, user, mustChangePassword }`. Não há rota separada para empresa/comprador nem refresh token confirmado.
- Erros são sanitizados no front. Não exibir bodies SQL, stack traces, credenciais ou tokens.

## Cadastro e conta

| Método e caminho | Contrato observado |
| --- | --- |
| POST `/user/create`, `/user/create/empresa` | Multipart com `photo`; cadastro de pessoa requer nome, CPF, e-mail, senha, celular, nascimento e endereço. Empresa também exige CNPJ. Retorna `message`, `id`, `emailSent`. CPF/CNPJ não são armazenados no navegador. |
| POST `/otp/enviar`, `/otp/verificar` | Fluxo de OTP existente; verificação envia `{ id, code }`. Envio externo não foi exercitado nesta tarefa. |
| GET/PUT/DELETE `/user/:id` | JWT e titular/admin. A imagem é recuperada separadamente por GET `/user/:id/photo`. PUT multipart só aceita `name`, `cellphone`, `birthday`, `photo`; celular: 11 dígitos. Exclusão pode responder 409 por vínculos. |
| PATCH `/user/password`, `/user/password/first-access` | `{ currentPassword, newPassword }`; primeiro acesso só para `firstLogin`. Senha mínima de 6 caracteres; front confirma e diferencia da atual. |
| POST `/user/password/forgot`, `/user/password/reset` | `{ email }` com resposta genérica; redefinição `{ token, newPassword }`, inválido/expirado → 401. Token de recuperação só em memória após remoção da URL. |
| POST `/user/login/google` | ID token verificado com `GOOGLE_CLIENT_ID`; botão indisponível sem `VITE_GOOGLE_CLIENT_ID`. Não inventar Client ID/Secret. |
| GET `/user/login/linkedin`, GET/POST callback | Backend revisado ainda não verifica state e tem fallback de ID token não verificado. Front não ativa essa integração. |

## Recursos do comprador

| Método e caminho | Contrato observado e limites |
| --- | --- |
| GET `/product`, `/product/:id` | Lista/single; UUID inválido 400, ausente 404. Fotos `[{ id, photo }]`, base64 sem MIME. Front reconhece JPEG/PNG/GIF/WebP; nada de SVG ou fotos inventadas para registros reais. |
| POST `/shopping/create` | JWT; `{ items: [{ id_product, quantity }] }`, quantidade inteira positiva. Servidor verifica estoque/dono, calcula preço × quantidade (doação = 0), baixa estoque em transação. Retorna 201 `{ message, shopping: { id, value, status: 'pending', items } }`. Não há idempotency key. |
| GET `/shopping/` | JWT; lista compras próprias, admin lista geral. Campos `id`, `datetime`, `value`, `status`, `id_user`, `user_name`, `total_items`. |
| GET `/shopping/:id` | JWT e comprador/admin; inclui `items` com `id_product`, `product_name`, `quantity`, `subtotal`, `seller_id`. Não guardar os campos extras de contato retornados pelo backend. |
| PATCH `/shopping/:id/cancel` | Comprador/admin, apenas pending; restaura estoque sob lock e retorna `{ message, shopping }`. Não usar PATCH `/shopping/:id/status` no comprador: é transição do vendedor/admin. |
| GET `/notification/`, `/notification/unread/count` | Próprias; filtros `read=sim|nao`, `type`; contador `{ total }`. Campos incluem `read`, `created_in`, referência para shopping/conversation. |
| PATCH `/notification/:id/read`, `/notification/read-all`; DELETE `/notification/:id` | Operações próprias, leitura individual/em lote e exclusão. Notificação de outro usuário/inexistente → 404. Não gerar avisos fictícios. |
| GET/POST `/conversation/`, GET/DELETE `/conversation/:id` | Criar/obter usa `{ otherUserId }` → `{ conversationId, created }`; detalhe verifica participação e retorna `{ conversationId, participants }`; DELETE sai da conversa. Listagem corrigida: usa `otherCp.id_user` e mantém participação/contadores do servidor. |
| GET/POST `/localization/`, GET/PUT/DELETE `/localization/:id` | Próprias; POST requer `userId` igual ao JWT. Payload `zipCode`, `street`, `neighborhood`, `number`, `city`, `state`, opcionais `latitude`, `longitude`. GET usa `zip_code`. Coordenada `null` limpa; endereço vinculado a produto pode impedir DELETE com 409. |
| GET `/localization/product/:productId` | JWT opcional. `{ productId, city, neighborhood, latitude, longitude, addressFull }`. Sem aceite, coordenadas arredondadas. Dono ou comprador com shopping accepted/completed recebe também `street`, `number`, `zipCode`, `state`; front não eleva a permissão. |
| GET `/card/`, `/card/:id`; PUT/DELETE `/card/:id` | Próprios. Campos seguros: `id`, `holder_name`, `brand`, `last_digits`, `type`, `expiration_month`, `expiration_year`. Front edita titular/validade e remove; token nunca é retornado. |
| POST `/card/create` | Existe, mas depende de `payment_token` emitido pelo gateway, além dos metadados. Sem SDK/provedor, o front não coleta PAN/CVV/token nem simula criação ou cobrança. |

## Socket.IO

Cliente minificado servido pela própria API, sem dependência NPM adicional. Handshake usa `auth: { token }`; nunca token em query string. Bundle e conexão seguem a origem do Axios. A conexão termina na saída/troca da sessão e na expiração conhecida do JWT.

Eventos de mensagens com acknowledgement: `join_conversation` recebe string UUID; `load_messages` recebe `{ conversationId, limit, before? }` e retorna `{ messages }`; `mark_read` recebe `{ conversationId, upToMessageId? }`; `send_message` recebe `{ conversationId, type: 'texto', content }`; `edit_message` recebe `{ messageId, content }`; `delete_message` recebe `{ messageId }`. Falha/timeout não vira sucesso local. Não há retry automático de mutações.

Eventos recebidos: `new_message`, `message_edited`, `message_deleted`, `notification`, `notification_read`, `notifications_read_all`, `notification_deleted`. A autorização depende de JWT/participação no servidor; o cliente não usa salas como permissão. GET/Socket `load_conversations` compartilham o service SQL corrigido. O frontend não usa mais lista alternativa local.

## Fora do escopo e pendências

- Pix, avaliações, disputas, empresas geolocalizadas e estimativas ambientais foram integrados ao comprador conforme a atualização de 10/11 abaixo. Não há QR de retirada nem pagamento por cartão implementados nesta etapa. QR Pix recebido da API não é comprovante de pagamento.
- Foto no perfil: GET `/user/:id/photo` autenticado devolve os bytes da imagem com MIME identificado, `private, no-store` e `nosniff`; 204 sem foto, 403 outra conta e 404 usuário ausente. O frontend recupera a imagem após reload/novo login, compartilha URL em memória e a libera no logout. PUT aceita raster de até 5 MB. Não persistir foto no navegador.
- ViaCEP: não existe rota/service correspondente na API `6543cd9`. `src/services/cepService.ts` consulta diretamente o serviço externo, sem JWT/cookies/referrer, como a integração já presente nos cadastros. O endereço final é gravado pela rota autenticada de localização.
- `/shopping-product/*` agora aplica escopo do comprador dono ou admin, alinhado ao detalhe de shopping. Item de outra conta retorna 404, listas são filtradas e filtros UUID inválidos retornam 400. Logs/documentos continuam fora desta correção.
- Publicação/edição de produto permanece fora desta tarefa, restrita ao escopo da empresa; autorização continua obrigação do servidor.
- Verificação somente leitura em 03/11/2026: o banco local já possui `localization.latitude`, `localization.longitude` e `conversation_participant`. A ausência descrita em registros anteriores foi resolvida no ambiente. Nenhuma migração ou alteração de banco foi realizada nesta tarefa.
- Contratos novos foram exercitados com API/Socket.IO e MySQL reais em banco descartável isolado, não com dados do projeto nem serviços externos de SMTP/OAuth/gateway.

## Atualização do comprador — API 192bbaf

| Recurso | Contrato atual utilizado |
| --- | --- |
| Pix | `GET /payment/shopping/:shoppingId`, `GET /payment/:id/checkout`, `POST /payment/create` com `{ id_shopping, method: "pix" }`, `POST /payment/:id/sync` e `/cancel`. Criação exige compra **pending** com valor positivo e titularidade. Não usar o antigo `/payment/checkout` nem exigir accepted para criar. O servidor define valor, destinatário e situação. Resposta de criação/checkout/sync/cancel contém `{ payment, checkout }`. |
| Avaliações | `GET /review/` é público e retorna lista; interface mostra apenas registros enviados/recebidos pelo usuário atual. `POST /review/` recebe nota inteira de 1 a 5, comentário até 1000 caracteres, compra e fornecedor participante. Apenas compra completed. `PUT /review/:id` atualiza nota/comentário; `DELETE` exclui. UI só oferece mutações ao autor; API mantém autorização. |
| Disputas | `GET/POST /dispute/` e `PUT /dispute/:id`. Criação recebe `id_shopping`, `type`, `description`; tipos são os seis enums do controller. Lista é escopada na API. O comprador pode editar disputa própria apenas aberta; não envia status nem usa resolve/reject administrativos. |
| Impacto | `GET /environmental-impact/` e `POST /environmental-impact/` com `{ id_shopping, calculation_method: "regra_fixa" }`. Apenas compra completed sem registro existente. Peso/CO₂/água/energia são fornecidos pelo servidor e apresentados como estimativas. IA não é oferecida. |
| Empresas | `GET /localization/companies`, autenticado, retorna nome, bairro/cidade/UF, companyId, categorias, anúncios e coordenadas arredondadas. Links abrem somente coordenadas aproximadas no OpenStreetMap; a UI não calcula distância nem expõe endereço completo. Catálogo filtra pelo id_user do anúncio. |
| Endereços | Latitude/longitude podem ser omitidas para a geocodificação da API. No update, coordenadas omitidas preservam ou permitem recalcular conforme mudança do endereço; null explícito limpa. Front não envia coordenadas antigas sem escolha manual. ViaCEP continua no frontend, sem JWT. |
| Notificações | Novos filtros nova_review/disputa_aberta/disputa_resolvida/pagamento_confirmado. Referências review/dispute abrem as telas correspondentes. Referência payment é resolvida por `GET /payment/:id` antes de abrir a reserva. |

Nenhuma rota de vinculação de vendedor, comissão administrativa, reembolso, simulação ou pagamento por cartão foi adicionada à UI. A rota simulate é usada exclusivamente pelo teste isolado para confirmar que a interface segue a aprovação da API. Falha incerta na criação não dispara retry automático nem nova cobrança. QR/code Pix ficam em memória, sem armazenamento persistente ou logs.
# Atualização de autenticação — 10/11/2026

- Login com senha: HTTP 403 com `code: EMAIL_VERIFICATION_REQUIRED` e `verification: { id, email }` habilita retomar o modal OTP. Outros 403 não habilitam confirmação. Após confirmar, a pessoa tenta entrar novamente; o código não é uma sessão.
- Cadastro empresarial com Google: `POST /user/create/empresa/google` multipart com `idToken`, nome, CPF, CNPJ, celular, endereço e foto opcional. Não envia senha nem e-mail digitado. A API determina e-mail e papel, valida a identidade e devolve o formato `LoginResponse` em HTTP 201. Conta pessoal existente não é convertida.
- Login empresarial com Google envia `accountType: company` em `/user/login/google`, recusando conta pessoal e identidade ainda não cadastrada como empresa.
- O token Google só permanece em memória durante a requisição; documentos e códigos não são persistidos pelo frontend. A verificação automatizada usa Google/SMTP controlados, sem comprovar autorização externa ou entrega real.
This newer source inspection supersedes the earlier statements above about missing profile routes and product-photo support. The backend has changed since that snapshot.

- `productRoutes.js` now accepts multipart `photos` for POST `/product/create` and PUT `/product/:id`; photo add/update/delete routes also exist. GET product responses include `{ id, photo }` objects with base64 image bytes.
- Product schema category values are `madeira`, `metal`, `plastico`, `papel/papelao`, `vidro`, `tecido`, `borracha`, `eletronicos`. Negotiation is `sale`/`donation`; condition is `new`/`good`/`regular`/`poor`; status is `available`/`reserved`/`unavailable`. No separate couro or EVA enum was invented by this frontend. Quantity is integer units and weight is separate.
- User routes now include GET `/user/:id` and PUT `/user/:id`. Controllers enforce own-user/admin authorization. Update accepts `name`, `cellphone`, optional birthday/photo, and returns `{ message, user }`; email, role and status are not editable through this route. The company account view uses name/cellphone only.
- Product create/update/delete routes apply JWT verification but the inspected controller/service does **not** enforce company-only creation or product ownership on updates/deletes. The frontend cannot supply that server security boundary. Company workspace product mutation controls therefore remain unavailable in real mode; local preview simulates changes only in memory.
- Product creation requires `id_localization`, but no verified safe current-address listing/selection contract was established for the company workspace. The frontend does not ask users to enter raw UUIDs or silently create duplicate locations.

Required backend-owner follow-up: enforce company-role creation and own-product/admin authorization for update/delete/photo mutations; expose/confirm a safe location selection contract. No backend files were modified. Other newly present routes were outside this change's verification scope and are not claimed delivered.

## Company communication reinspection — 2026-11-05

The current backend now mounts `/notification` and `/conversation` under the API prefix. This supersedes earlier missing-notification assumptions for these inspected routes.

- `GET /notification/`: JWT required; array of the current user's notifications. Fields consumed by the frontend: UUID `id`, `type`, `title`, nullable `content`, `read` (`sim`/`nao`), `created_in`. Ownership derives from `req.userId`, not a frontend user parameter.
- `PATCH /notification/:id/read`: owner-scoped service; response `{ message, notification }`. The frontend confirms matching id and `read: sim` before updating its read state.
- `PATCH /notification/read-all`: owner-scoped service; response `{ message, updated }`. The frontend waits for a successful valid response before updating the loaded list. No notification creation or deletion UI is introduced.
- Notification types verified in `notificationService`: `reserva_solicitada`, `reserva_aceita`, `reserva_recusada`, `pagamento_confirmado`, `nova_mensagem`, `nova_review`, `disputa_aberta`, `disputa_resolvida`, `sistema`. Generic server content is displayed as text; references are not converted into arbitrary links or unimplemented reservation actions.
- The notification page loads on entry and explicit refresh. No Socket.IO connection, polling, background push or read-receipt subscription is claimed. Header/sidebar counts reflect the list loaded in the current company workspace, not a guaranteed live count across all routes.
- Chat message loading/sending/marking read currently use Socket.IO (`load_messages`, `send_message`, `mark_read`, `join_conversation`), with server authentication and participant checks. The frontend has no installed Socket.IO client. No transport or new endpoint was invented.
- `conversationService.listConversationsForUser` currently selects `other.id_user` / `otherUserId` through an undefined `other` alias, while the joined participant alias is `otherCp`. This requires a backend-owner correction and integration verification before connecting the conversation list.

New company routes `/dashboardEmpresa/mensagens` and `/dashboardEmpresa/notificacoes` retain the existing company role guard. Both have development-only preview equivalents under `/previa/dashboard/empresa/`. Chat is explicitly local and illustrative in preview and unavailable for real sends. The real notification contract was checked with browser-intercepted responses, not a live authenticated server/database session. No backend files or dependencies were modified.

## Live integration after API pull — 2026-11-05

This section supersedes the preceding chat limitation. At the owner's request, the backend `main` was fast-forwarded from `cf23b5d` to `a8611b4`; that revision fixes the conversation query's participant alias. Its SQL already defines `conversation_participant`; the old local database had not applied that schema.

After explicit approval to replace the local database, an encrypted external backup was created and decryption verified by hash. The API's current `RFScript.sql` recreated the configured local database with 19 tables. Two synthetic accounts without documents, phone or address records were inserted solely for integration checks. Passwords were generated in process memory and only their bcrypt hashes stored. No real credentials or person records were added to the repository.

The owner explicitly approved `socket.io-client`. The frontend uses authenticated Socket.IO WebSocket connections through Vite's `/socket.io` proxy; JWTs travel in the handshake `auth` object, not URLs. `GET /conversation/` supplies the list; verified `join_conversation`, `load_messages` (latest 100), `mark_read` and `send_message` events supply the thread. Messages are deduplicated by server id; outgoing success requires server acknowledgement and does not automatically retry an uncertain send. Disconnect/retry/error states retain drafts. Actual message data has no product association, so the material context bar remains preview-only.

**Important:** `leave_conversation` removes the participant from the database, rather than merely leaving a socket room. The frontend never emits it for navigation/cleanup; it disconnects its socket on leaving the chat page. It listens for new, edited and deleted message events without introducing edit/delete controls.

Verified against the actual local API and MySQL: login through the browser, buyer-to-company delivery, company-to-buyer delivery, reply received without reload, persistence of three messages, preservation of both conversation participants after navigation, notification generation and persisted individual/all-read actions. No HTTP or WebSocket mocking was used for this live verification. Deployment still needs a same-origin `/socket.io` reverse proxy; Vite's proxy is development configuration.

## Company account and material integration — 2026-11-05

This reinspection supersedes the previous blanket restriction on product update/delete and the absence of a location listing contract. Publication remains disabled in the web UI: POST `/product/create` still has no verified company-role enforcement. No backend source was changed.

- PUT `/product/:id` and DELETE `/product/:id` scope their SQL mutations to `id_user = req.userId`. Update requires the complete product payload, including location. The web editor preserves `priority` and lets the company select from its own locations; the API remains responsible for final authorization/validation. JSON `photos` replaces the complete photo collection; `[]` removes all photos. Separate photo mutation routes were not enabled because their owner authorization is not established. Zero stock is accepted for existing materials.
- GET `/localization/` returns the authenticated user's locations. POST requires `{ userId, zipCode, street, neighborhood, number, city, state }`; `userId` must match the JWT. PUT updates only supplied editable fields, preserving omitted coordinates. DELETE is owner-scoped and returns 409 for locations linked to announcements. No geocoding or third-party address requests were added.
- GET `/user/:id/photo` requires own-user/admin authorization, returns an image blob or 204, and is fetched using the Axios bearer interceptor. PUT `/user/:id` accepts multipart `photo`; image signature and 5 MB limit are checked on the server. Photo data remains in component memory/object URLs and is not copied to browser storage. The profile parser accommodates null cellphone on synthetic test accounts without exposing other account fields.
- GET `/environmental-impact/` supplies estimates for purchases in which the account is a buyer or seller. The screen displays returned records and their sums, not invented categories, measured outcomes, or platform-wide statistics.
- GET `/dispute/` supplies disputes authorized for the account as buyer/seller. The web page supports consultation, situation filter, descriptions and recorded resolution. Administrative resolution/rejection and opening/editing disputes were not introduced.
- Reservations received remain blocked: `/shopping/` lists buyer-owned purchases, and GET `/shopping/:id` restricts detail to buyer/admin. Seller acceptance/refusal exists but does not complete a seller consultation workflow. No workaround using another account or administrator credentials was added.

Evidence and scope limits: [company-functional-integration.md](verification/company-functional-integration.md).

## Company map and dispute notification follow-up — 2026-11-05

- Authenticated `/mapaEmpresas` now consumes GET `/product/` and GET `/localization/product/:productId`. It shows product listings rather than fabricated seller names. Missing coordinates are counted/omitted; partial failures remain visible with retry. Coordinate lookups are bounded to six concurrent calls and abort on navigation. The map retains only approximate coordinates and area labels, discarding authorized exact-address fields.
- The development map preview remains illustrative and network-free with respect to the project API. OpenStreetMap basemap requests are the existing external service, not a new geocoder.
- Notification references with `reference_table = dispute` and a valid UUID navigate to the account-authorized dispute list/detail using `?disputa=` after confirmed read acknowledgement. Unavailable/unowned/invalid IDs show a controlled unavailable state. Arbitrary reference URLs are never followed.
- Reconfirmed actual seller reservation gap: GET `/shopping/:id` returns 403 to its seller, and GET `/shopping/` excludes that received sale. Accept/refuse support does not supply the missing seller consultation. Publication remains disabled pending server company-role enforcement.
- Real persisted impact and dispute records, map data, read acknowledgement and deep-link reload were verified locally with disposable fixtures. The completed-shopping state required for impact calculation was test data prepared directly in MySQL; no completed-sale or payment UI is claimed.

Portuguese implementation report, evidence and backend handoff: [relatorio-empresa-sem-chat-2026-11-05.md](relatorio-empresa-sem-chat-2026-11-05.md).
