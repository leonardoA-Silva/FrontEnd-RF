# Resumo para uma nova IA continuar o projeto

Atualizado em **29/10/2026**. Este documento é autocontido: leia-o antes de assumir qualquer contexto da conversa anterior. Depois confira o código e o Git, pois o ambiente pode ter mudado.

## 1. O projeto e o objetivo

**Reaproveita Franca** conecta empresas com sobras de materiais industriais a compradores/artesãos interessados no reaproveitamento. Há três repositórios independentes no Desktop: `FrontEnd-RF` (web), `backend-RF` (API) e `Mobile-RF` (mobile).

A tarefa em andamento é **somente a parte do comprador no frontend web**. A prioridade do usuário é usar funcionalidades reais da API e retirar telas/dados que apenas simulavam comportamento. Não recrie itens fictícios, reservas locais, pagamentos aprovados, QR, métricas ambientais ou mensagens falsas.

Somente empresas publicam anúncios. Anúncios são venda ou doação; doação não tem preço. O servidor controla estoque, permissões, aceite e totais. `ProtectedRoute` é navegação, não autorização de segurança.

## 2. Regras de trabalho

1. Trabalhe a partir da pasta `FrontEnd-RF`; leia `AGENTS.md`, `CLAUDE.md`, `docs/api-contract.md` e os guias relacionados à tarefa.
2. Não edite backend/mobile nesta tarefa. É permitido ler seus controllers/services/rotas. Pull da API foi autorizado e executado na tarefa anterior; não use isso como autorização permanente para editar/commitar outro repositório.
3. Preserve alterações existentes. Comece com `git status`, `git diff` e leitura dos arquivos relevantes. Há várias alterações não commitadas que fazem parte do trabalho entregue.
4. Não faça commit/push sem novo pedido explícito. O commit/push autorizado anteriormente já foi realizado, antes das integrações mais recentes.
5. Interface, validações, acessibilidade e mensagens em pt-BR. Siga componentes e tokens existentes; nada de dependências novas sem aprovação.
6. Nunca exponha `.env`, JWT, senhas, CPF/CNPJ, fotos ou contatos reais em logs, exemplos, capturas ou documentação. Não persista foto/endereço/senha no navegador. Não execute o SQL inicial destrutivo no banco do projeto.
7. Código executável da API prevalece sobre documentos antigos. Não invente endpoints ou declare sucesso antes da confirmação real.

## 3. Stack, execução e Git

- Web: React 19, TypeScript, Vite 8, React Router 7, Tailwind 4, MUI 9, Axios e lucide-react. Componentes usam objetos locais de classes, não CSS por componente. `package-lock.json` é do NPM.
- Frontend: `npm run dev`; a última porta observada foi `http://localhost:5173` (pode mudar se ocupada). `npm run build` faz TypeScript + bundle. Não existe `npm test` configurado.
- API: Node/CommonJS, Express 4, MySQL e Socket.IO; `npm start` dentro de `backend-RF`. Porta padrão 5000; precisa de `.env` e MySQL. Não leia/imprima segredos para diagnosticar.
- Axios: `src/axios/Axios.ts`, base `VITE_API_URL` ou `/api/reaproveitafranca`. Vite encaminha `/api` e `/socket.io` para `VITE_BACKEND_URL` ou `http://127.0.0.1:5000`; WebSocket habilitado no proxy.
- Front branch: `Rafael/Sprint2----Comprador`, remoto `leonardoA-Silva/FrontEnd-RF`. Último HEAD/push confirmado: `3125a99`, merge que inclui `7c56e65` (`feat(user): align marketplace and about with figma and integrate buyer api flows`). Histórico usa mensagens Conventional Commits em inglês.
- API: branch `main`, atualizada por fast-forward de `83575fc` para **`6543cd9`**, remoto `ViniciusPeroni/backend-RF`.
- Backend já tinha uma modificação local de outra tarefa: em `src/index.js`, `./db/testConnect` → `./db/testconnect`, corrigindo o nome real do arquivo. Foi preservada; não atribua essa modificação às novas integrações nem a descarte.
- As funcionalidades mais recentes descritas abaixo estão **locais e não commitadas**. Não restaure arquivos nem remova novos arquivos por considerá-los mudanças acidentais. Confirme sempre o estado atual.

## 4. Referência visual

O usuário forneceu [Figma TCC — Senai](https://www.figma.com/design/oKjqeMhVdtDDLqLOTxIVis/TCC---Senai). Manter o estilo compacto, verde e claro existente. A página Sobre Nós usa os ativos originais e fontes OFL locais em `public/about` e `public/fonts`.

`DESIGN_SYSTEM.md` documenta tokens e exceções. As seções antigas sobre demonstração são históricas; as extensões de 29/10 são atuais. Para nova implementação a partir do Figma, carregue a skill obrigatória de design-to-code antes de usar ferramentas de contexto do Figma.

## 5. Arquitetura e capacidades atuais

### Sessão e conta

- `src/auth/session.ts`: sessão mínima `{ id, role, name, status?, mustChangePassword? }` e token nas chaves existentes `user`/`token` em localStorage ou sessionStorage. Não ampliar os dados persistidos. Evento `rf-session-change` sincroniza hooks na mesma aba.
- `useLoggedUser.ts` e `ProtectedRoute.tsx`: papel, logout, estado de sessão, redirecionamento para login e primeiro acesso. 401 com `auth: false` limpa sessão; senha atual incorreta também usa 401, sem esse indicador.
- Login e recuperação: `src/pages/login`; `/login`, `/recuperar-senha`, `/redefinir-senha`, `/primeiro-acesso`. Token de redefinição é retirado da URL e mantido só em memória. SMTP/OAuth reais não foram testados.
- Google: integração opcional preparada, mas usuário **não tem Client ID**. Botão desativado sem `VITE_GOOGLE_CLIENT_ID`. Nunca pedir Client Secret para colocar no front. LinkedIn não foi ativado por problemas de verificação no callback da API.

### Painel e recursos do comprador

`src/pages/dashboard/DashboardUsuario.tsx`, protegido para `role: user`, usa `?aba=` para navegar. Componentes em `src/pages/dashboard/comprador`:

| Aba | Componente e fluxo |
| --- | --- |
| explorar | `ProductCatalog`: catálogo/fotos reais, busca, filtros, ordenação e paginação local. |
| reservas / historico | `BuyerReservations`: GET próprias, detalhes e cancelamento pendente confirmado. Histórico filtra concluídas, recusadas e canceladas. |
| notificacoes | `BuyerNotifications`: lista, contador, filtros, leitura individual/em lote, exclusão e referências; atualização por eventos. |
| mensagens | `BuyerConversations` + `ConversationMessages`: conversa com fornecedor, participação, texto com paginação, leitura, envio/edição/exclusão e saída. Ver pendência da listagem abaixo. |
| enderecos | `BuyerAddresses`: CRUD próprio, CEP/UF/coordenadas, consulta ViaCEP descrita abaixo. |
| cartoes | `BuyerCards`: consulta, edição de titular/validade e remoção dos cartões existentes. Não há cadastro real novo sem provedor. |
| perfil | `BuyerProfile`: GET/PUT multipart de nome, celular, nascimento e foto; prévia local descrita abaixo. E-mail somente leitura. |
| seguranca | `BuyerSecurity` / `PasswordForm`: troca de senha e exclusão da própria conta com confirmação/409. |

`useApiResource.ts` centraliza carregamento, erro e cancelamento de leitura. `RequestState`, `ConfirmAction`, `buyerStyles` e `buyerPresentation` compartilham apresentação. Dados privados são desmontados ao trocar a conta. Confirmações restauram foco/Escape e bloqueiam duplicação enquanto pendentes.

### Marketplace, reserva e localização

- `/marketplace`: `MarketplaceLayout` + `ProductCatalog`, sem alternância de exemplo.
- `/marketplace/produto/:productId`: `LiveProductDetails`; galeria real, estoque, preço, localização e contato.
- `/marketplace/reserva/:productId`: `LiveReservationRequest`, protegido. POST `/shopping/create` envia somente `items: [{ id_product, quantity }]`. Quantidade inteira; servidor calcula total e baixa estoque. Doação = zero. Resposta ambígua bloqueia reenvio imediato para evitar duplicidade.
- Sucesso abre `/dashboardUsuario?aba=reservas&reserva=<uuid>`. O comprador cancela somente por PATCH `/shopping/:id/cancel`; **não usar** a rota de status do vendedor/admin.
- `ProductLocation`: consulta `/localization/product/:id`, mostra somente a informação liberada. Endereço completo só com `addressFull: true`; sem mapa externo ou distância inventada.
- `PaginaMaterial` redireciona URLs antigas reais; identificadores de exemplo voltam ao catálogo. Rotas de pagamento/checkout e os componentes demonstrativos foram removidos.

### Socket.IO

`src/realtime/buyerSocket.ts` + `useBuyerSocket.ts` carregam o bundle minificado servido pela própria API, `/socket.io/socket.io.min.js`, sem nova dependência NPM. JWT é enviado em `auth.token`, **nunca na URL**. A conexão encerra na saída/troca da sessão ou na expiração conhecida.

Eventos de mensagens: `join_conversation`, `load_messages`, `mark_read`, `send_message`, `edit_message`, `delete_message`. Mutações usam acknowledgement e não são repetidas automaticamente. Eventos recebidos atualizam o conteúdo. Notificações usam `notification`, `notification_read`, `notifications_read_all` e `notification_deleted`. Não inventar histórico local ou sucesso de envio.

## 6. Últimas alterações solicitadas pelo usuário

### Foto de perfil visível após atualizar

`BuyerProfile` agora cria uma **URL de objeto em memória** para a imagem selecionada. Mostra “Prévia” antes de salvar; só identifica como “Foto de perfil enviada” após PUT confirmado. Falha de envio preserva a seleção sem alegar sucesso. Validam-se formato raster/tamanho de 5 MB e erro de exibição. URLs são revogadas ao substituir/sair; nenhuma foto/base64 vai para localStorage/sessionStorage.

**Limitação real da API:** GET `/user/:id` e resposta do PUT não incluem `photo`, embora o backend grave o upload. A foto fica visível na visita atual ao perfil, inclusive após salvar; não pode ser recuperada ao recarregar/voltar. Para persistência visual entre visitas, o proprietário da API deve fornecer leitura autenticada da foto. Não invente endpoint, não use armazenamento do navegador para contornar e não edite o backend sem autorização.

### ViaCEP ao adicionar endereço

O usuário acreditava que havia serviço ViaCEP na API. Foi feita busca no backend local e `origin/main`; em `6543cd9` **não existe rota/service ViaCEP**. Os cadastros `RegisterUser`/`RegisterCompany` já consultavam o ViaCEP diretamente.

Criado `src/services/cepService.ts`, sem usar o Axios autenticado. Consulta `https://viacep.com.br/ws/<8-dígitos>/json/`, sem JWT/cookies/referrer. O CEP é enviado ao sair do campo ou clicar Buscar CEP. Preenche rua/bairro/cidade/UF; número continua manual; coordenadas não são inventadas. Tratamento de inválido, inexistente, resposta parcial, offline/timeout e nova tentativa; entrada manual continua disponível. Cancela requisições antigas e preserva edições feitas durante a consulta. O POST final continua usando o contrato real de `/localization/`.

Referência do contrato externo: [ViaCEP oficial](https://viacep.com.br/). Não registre CEPs reais ou respostas de endereços em logs/capturas.

### Sobre Nós com sessão

`src/pages/about/About.tsx` usa `useLoggedUser().isLoggedIn`. “Cadastre-se Gratuitamente” aparece apenas para visitantes. A seção institucional e os demais links permanecem. Logout faz o convite reaparecer.

## 7. Pendências confirmadas — não ocultar

1. **SQL da listagem de conversas:** `backend-RF/src/services/conversationService.js`, `listConversationsForUser`, seleciona `other.id_user` sem declarar `other`; o JOIN usa `otherCp`. GET `/conversation/` retorna 500. Front trata e permite tentativa; conversa aberta diretamente pelo anúncio/notificação funciona com participação e mensagens. A correção pertence à API.
2. **Banco local anterior ao schema:** faltam `localization.latitude`/`longitude` e a tabela `conversation_participant`. Precisa de migração aditiva pelo proprietário. O SQL inicial contém DROP DATABASE: não o execute no banco atual. Testes usaram outro banco descartável.
3. **Foto não retornada pela API:** impede recuperar a foto ao recarregar; ver seção 6.
4. **Sem pagamento/gateway/tokenização:** API tem CRUD de cartão, mas criar exige `payment_token`. Não coletar PAN/CVV ou pedir que usuário invente um token. Não há Pix real, cobrança, aprovação, avaliação, QR de retirada ou indicadores ambientais confirmados.
5. **Rotas inseguras para UI comum:** `/shopping-product/*` não verifica ownership; logs/documentos têm lacunas. Não usar para contornar os endpoints próprios do comprador.
6. **Lint global:** 17 erros e 1 aviso preexistentes em cadastro, verificação de e-mail, notificações legadas e painel de empresa. Não confundir com falhas introduzidas nas telas do comprador; não fazer limpeza fora de escopo sem pedido.

## 8. Verificação executada e como repetir

Sempre rodar no frontend:

```powershell
npm run lint
npm run build
```

Build aprovado, com aviso de bundle acima de 500 kB. ESLint dos arquivos alterados passou; lint global mantém o baseline acima. Conferir mudanças atuais antes de reutilizar esses resultados.

Roteiros locais em `.verification.local/` (pasta ignorada, não publicados no Git):

| Comando | Evidência |
| --- | --- |
| `node .verification.local/verify-live-buyer.cjs` | API/MySQL/Socket.IO reais em banco `rf_web_buyer_verify_*` exclusivamente criado para teste, servidores isolados; login, reservas/estoque/cancelamento/doação/aceite, endereço privado, notificações, endereços, cartões, chat e upload real de foto. Remove banco e processos ao final. ViaCEP interceptado, sem SMTP/OAuth/gateway reais. |
| `node .verification.local/verify-buyer-failures.cjs` | Contratos interceptados: perda de resposta sem duplicação, estoque, 403/409, vazio/retry, preservação e foco, expiração, remoção de exemplos/pagamento. |
| `node .verification.local/verify-buyer.cjs` | Regressão de catálogo, perfil/upload, senhas, primeiro acesso, exclusão e sessão; contratos interceptados. |
| `node .verification.local/verify-about.cjs` | Institucional, ativos/fontes, navegação, modal/Escape e telas de visitante/conta. |
| `node .verification.local/verify-profile-cep-about.cjs` | Prévia e foto após envio confirmado/erro/arquivo inválido, revogação de URLs e ausência de armazenamento; ViaCEP sem autenticação, respostas antigas/edições manuais/falhas/parcial; CTA por sessão; 375/768/1280 px. Usa mocks da API e ViaCEP. |

Os roteiros Playwright usam o Edge e o runtime já existente no computador; não são uma suíte configurada no `package.json` e podem precisar de ajuste de caminho/porta em outro ambiente. Leia o roteiro antes de rodá-lo. Não capture dados reais nem execute fixtures contra produção. O teste de banco valida nome exclusivo e nunca aplica o schema destrutivo ao banco original.

## 9. Leituras úteis

- `docs/api-contract.md`: contrato atual observado; conferir no código da API antes de alterar.
- `docs/buyer-api-update-2026-10-29.md`: entrega e testes das integrações de 29/10.
- `DESIGN_SYSTEM.md`: direção visual; extensões mais recentes prevalecem.
- `docs/buyer-api-integration.md`, `docs/marketplace-prototype.md` e `docs/frontend-readiness-review.md`: histórico. Não tratar conteúdo antigo de demonstração como estado atual.

## 10. Instrução inicial para a próxima IA

> Você está continuando o frontend web Reaproveita Franca, escopo comprador. Leia este arquivo, AGENTS.md e CLAUDE.md, depois confira Git e código atual. Preserve todo o trabalho local. Use só contratos implementados na API, sem dados/pagamentos/reservas simulados. Não edite backend/mobile nem faça commit/push sem autorização. As pendências reais estão na seção 7. Antes de declarar conclusão, verifique o cenário alterado no navegador e rode lint/build, informando limites e o baseline existente. Pergunte apenas por decisões que realmente bloqueiem a tarefa.
