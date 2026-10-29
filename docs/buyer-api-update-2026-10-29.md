# Comprador — API atualizada em 29/10/2026

Backend atualizado por `git pull --ff-only origin main`: `83575fc` → **`6543cd9`**. A alteração local anterior de `src/index.js` foi preservada. Nenhum código do backend foi editado, commitado ou enviado nesta tarefa. As integrações foram implementadas somente no frontend do comprador.

## Entrega observável

| Recurso | Comportamento |
| --- | --- |
| Solicitar reserva | `/marketplace/reserva/:productId`: consulta o anúncio, valida quantidade inteira e consentimento, envia apenas `items: [{ id_product, quantity }]` a POST `/shopping/create`. O total confirmado vem do servidor. Não envia preço, status ou campos sem persistência. |
| Reservas e histórico | Painel, abas Reservas/Histórico: GET `/shopping/` e `/shopping/:id`. Histórico mostra concluídas, recusadas e canceladas. Cancelamento pendente exige confirmação e usa PATCH `/shopping/:id/cancel`. Nenhuma chamada à rota de alteração de status do vendedor ou a `/shopping-product`, que não verifica ownership. |
| Notificações | Lista e contador próprios, filtros de leitura/tipo, leitura individual/em lote, exclusão confirmada e links para reserva/conversa. Eventos Socket.IO atualizam a listagem. Não há avisos fictícios criados pelo front. |
| Conversas | Contato no anúncio cria/obtém conversa com o fornecedor. GET valida participação; Socket.IO autentica via `auth.token`, carrega mensagens com paginação, marca leitura e envia/edita/exclui texto com confirmação. Há saída da conversa. Sem upload de anexos. |
| Endereços próprios | CRUD autenticado; valida CEP/UF/coordenadas. Coordenadas vazias são `null`, sem inventar geolocalização. Dados não vão para URL/armazenamento do navegador. |
| Localização do anúncio | GET `/localization/product/:id`; cidade/bairro e aviso de aproximação. Rua/número/CEP só aparecem quando a API devolve `addressFull: true`. Sem mapa externo, coleta automática ou distância inventada. |
| Cartões existentes | Consulta, edição de titular/validade e remoção confirmada de cartões já tokenizados. Não solicita número completo, CVV ou token de gateway. |

Removidos: item fictício, “Ver exemplo”, reserva só em memória, campos sem contrato, modais legados, QR de retirada, checkout/Pix/cartão ilustrativos e confirmação simulada de pagamento. Links antigos do exemplo voltam ao catálogo; links reais antigos apontam para detalhes/solicitação atuais. `/pagamento/*` não simula uma transação.

**Pagamento e tokenização continuam indisponíveis.** Criar cartão exige `payment_token` do provedor, mas não há gateway/SDK integrado. Não há formulário que invente esse token ou uma cobrança. Avaliações, QR de retirada e indicadores também continuam sem contrato. Google mantém sua dependência de configuração, sem Client ID inventado.

## Segurança e estados

- Carregamento, vazio, erro sanitizado e tentativa em listagens/detalhes; tratamento de autenticação, permissão, registro inexistente e conflito. Formulários preservam dados após falhas recuperáveis.
- Criação de reserva com resposta perdida/falha ambígua bloqueia reenvio imediato e orienta consultar Minhas Reservas. Não há idempotência na API: resposta perdida não prova ausência de gravação.
- Ações destrutivas exigem diálogo, impedem duplicação, aceitam Escape quando livres e restauram foco. Sucesso só após resposta do servidor.
- Troca/saída da conta desmonta dados privados. Socket encerra ao sair e no prazo de expiração informado pelo JWT; nenhum JWT na URL.
- Cliente Socket.IO vem do bundle minificado da própria API em `/socket.io/socket.io.min.js`, carregado sob demanda, sem nova dependência NPM. Vite encaminha HTTP/WebSocket em `/socket.io`. Referências: [cliente oficial](https://socket.io/docs/v4/client-installation/) e [opções de autenticação](https://socket.io/docs/v4/client-options/).

## Pendências do backend/ambiente

1. **Listagem de conversas retorna 500 na main:** `src/services/conversationService.js`, `listConversationsForUser`, seleciona `BIN_TO_UUID(other.id_user)` sem declarar alias `other`; o JOIN usa `otherCp`. A API precisa corrigir essa referência. A interface trata a falha; conversas abertas diretamente pelo anúncio/notificação usam os endpoints de participação/mensagens que passaram no teste real.
2. **Banco local anterior ao schema:** faltam `localization.latitude`/`longitude` e `conversation_participant`. O proprietário da API precisa aplicar migração aditiva preservando dados. Não foi executado o schema destrutivo nesse banco nem alterado seu conteúdo para mascarar a pendência.
3. **Pagamento/tokenização:** CRUD de cartão não confirma cobrança nem substitui um provedor. Esses fluxos permanecem indisponíveis.

## Verificação e limites

- `npm run build`: aprovado; aviso existente de bundle acima de 500 kB.
- ESLint direcionado aos arquivos do comprador, hooks, Axios, Socket e rotas: aprovado.
- `npm run lint`: 17 erros e 1 aviso preexistentes em cadastro, verificação de e-mail, notificações legadas e painel de empresa, fora desta alteração.
- `node .verification.local/verify-live-buyer.cjs`: **API, MySQL e Socket.IO reais** em banco exclusivo descartável `rf_web_buyer_verify_*`, servidores isolados e dados artificiais. Cobriu login, catálogo/fotos, criação/cancelamento/estoque, doação de valor zero, aceite pelo vendedor, mascaramento/liberação do endereço, notificações/leitura/exclusão, endereço CRUD/limpeza de coordenadas, cartão existente e chat com envio/edição/exclusão/saída. Confirmou a falha SQL conhecida da listagem. Banco descartável e servidores removidos ao final; banco do projeto preservado.
- `node .verification.local/verify-buyer-failures.cjs`: contratos simulados para validação/estoque, resposta perdida sem duplicação, erro/vazio/retry, cancelamento concorrente/403, endereço 409/preservação, Escape/foco, cartões/notificações vazios, chat negado, expiração e retirada das rotas de pagamento/exemplo.
- `node .verification.local/verify-buyer.cjs`: regressão de catálogo, perfil/upload, senhas, primeiro acesso, exclusão da conta e sessão com contratos interceptados.
- `node .verification.local/verify-about.cjs`: página institucional, ativos/fontes originais, navegação, modal/Escape/foco e texto atualizado do funcionamento, sem exemplo estático; 375/768/1280/1600 px.
- Navegador em 375/768/1280 px; reservas inspecionadas em celular/desktop. Sem erros de execução nos roteiros. Não houve SMTP/OAuth/gateway reais ou pagamento.

Não há suíte completa configurada no frontend. Roteiros e capturas ficam ignorados em `.verification.local/`; os limites acima impedem declarar a API inteira pronta para produção.
