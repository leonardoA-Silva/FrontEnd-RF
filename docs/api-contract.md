# Contrato da API para o frontend

Snapshot verificado em 29/10/2026, backend `main` **`6543cd9`**. Fonte: rotas, controllers e services executáveis de `backend-RF`, não apenas schema/documentação. Prefixo: `/api/reaproveitafranca`. Evidências e limites: [comprador atualizado](buyer-api-update-2026-10-29.md).

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
| GET/PUT/DELETE `/user/:id` | JWT e titular/admin. GET/PUT não retornam foto. PUT multipart só aceita `name`, `cellphone`, `birthday`, `photo`; celular: 11 dígitos. Exclusão pode responder 409 por vínculos. |
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
| GET/POST `/conversation/`, GET/DELETE `/conversation/:id` | Criar/obter usa `{ otherUserId }` → `{ conversationId, created }`; detalhe verifica participação e retorna `{ conversationId, participants }`; DELETE sai da conversa. **Listagem está quebrada por alias SQL `other.id_user` em vez de `otherCp.id_user`.** |
| GET/POST `/localization/`, GET/PUT/DELETE `/localization/:id` | Próprias; POST requer `userId` igual ao JWT. Payload `zipCode`, `street`, `neighborhood`, `number`, `city`, `state`, opcionais `latitude`, `longitude`. GET usa `zip_code`. Coordenada `null` limpa; endereço vinculado a produto pode impedir DELETE com 409. |
| GET `/localization/product/:productId` | JWT opcional. `{ productId, city, neighborhood, latitude, longitude, addressFull }`. Sem aceite, coordenadas arredondadas. Dono ou comprador com shopping accepted/completed recebe também `street`, `number`, `zipCode`, `state`; front não eleva a permissão. |
| GET `/card/`, `/card/:id`; PUT/DELETE `/card/:id` | Próprios. Campos seguros: `id`, `holder_name`, `brand`, `last_digits`, `type`, `expiration_month`, `expiration_year`. Front edita titular/validade e remove; token nunca é retornado. |
| POST `/card/create` | Existe, mas depende de `payment_token` emitido pelo gateway, além dos metadados. Sem SDK/provedor, o front não coleta PAN/CVV/token nem simula criação ou cobrança. |

## Socket.IO

Cliente minificado servido pela própria API, sem dependência NPM adicional. Handshake usa `auth: { token }`; nunca token em query string. Bundle e conexão seguem a origem do Axios. A conexão termina na saída/troca da sessão e na expiração conhecida do JWT.

Eventos de mensagens com acknowledgement: `join_conversation` recebe string UUID; `load_messages` recebe `{ conversationId, limit, before? }` e retorna `{ messages }`; `mark_read` recebe `{ conversationId, upToMessageId? }`; `send_message` recebe `{ conversationId, type: 'texto', content }`; `edit_message` recebe `{ messageId, content }`; `delete_message` recebe `{ messageId }`. Falha/timeout não vira sucesso local. Não há retry automático de mutações.

Eventos recebidos: `new_message`, `message_edited`, `message_deleted`, `notification`, `notification_read`, `notifications_read_all`, `notification_deleted`. A autorização depende de JWT/participação no servidor; o cliente não usa salas como permissão. GET/Socket `load_conversations` compartilham o service SQL com a pendência citada acima.

## Fora do escopo e pendências

- Não há pagamento, avaliação, QR de retirada ou indicadores ambientais confirmados. Esses recursos não são simulados no comprador.
- Foto no perfil: a prévia local permanece após PUT confirmado, mas GET/PUT ainda não retornam a foto salva; recuperação entre visitas depende da API. Não persistir imagem no navegador.
- ViaCEP: não existe rota/service correspondente na API `6543cd9`. `src/services/cepService.ts` consulta diretamente o serviço externo, sem JWT/cookies/referrer, como a integração já presente nos cadastros. O endereço final é gravado pela rota autenticada de localização.
- `/shopping-product/*` não confere ownership; logs e documentos também têm lacunas. Não conectar a telas comuns para contornar verificações dos endpoints próprios.
- Publicação/edição de produto permanece fora desta tarefa, restrita ao escopo da empresa; autorização continua obrigação do servidor.
- Banco local observado ainda não tem coordenadas de localização nem `conversation_participant`. Migrações aditivas cabem ao proprietário da API; o schema inicial destrutivo não foi aplicado ao banco existente.
- Contratos novos foram exercitados com API/Socket.IO e MySQL reais em banco descartável isolado, não com dados do projeto nem serviços externos de SMTP/OAuth/gateway.
