# Contexto completo para continuar o Reaproveita Franca

Atualizado em **03/11/2026**, após as correções autorizadas na API. Este é o ponto de entrada atual para uma nova IA. Não depende do histórico do chat. Código e Git atuais prevalecem sobre este documento quando houver mudanças posteriores.

## 1. Objetivo e histórico resumido

O Reaproveita Franca conecta empresas que oferecem sobras industriais para venda ou doação com compradores/artesãos interessados em reaproveitá-las. O trabalho principal do usuário é o **frontend web da parte do comprador**, integrado à API real.

Pedidos já tratados, em ordem:

1. Aproximar marketplace e fluxo de reserva do protótipo Figma e criar Sobre nós.
2. Integrar funcionalidades de comprador que existem na API, retirar produtos/fluxos puramente demonstrativos e testar.
3. Atualizar a API local para main e integrar reservas, localização, notificações, endereços, cartões existentes e mensagens reais.
4. Adicionar ViaCEP no endereço, prévia de foto no perfil e ocultar cadastro na página Sobre nós quando logado.
5. Incorporar a branch `new-ui` na branch do comprador e aplicar seu estilo a toda a área do comprador, preservando integrações reais.
6. Corrigir sincronização da foto nos cabeçalhos, conferir todos os campos do perfil e levantar conteúdo estático/pendências da API.
7. Commit/push do frontend, no padrão já usado pelo usuário.
8. Com autorização posterior explícita, corrigir na API a leitura da foto, o alias SQL de conversas e as permissões de itens de compra; integrar e testar no frontend.
9. Pedido mais recente: confirmar integração em funcionamento e preparar este contexto para outra IA continuar.

A entrega mais recente funciona **localmente** e foi testada. Não afirmar que as alterações locais da API já foram publicadas/deployadas.

## 2. Permissões e restrições atuais do usuário

- **Agora é permitido alterar a API**, por autorização explícita posterior às antigas instruções de frontend apenas.
- **Não implementar nem alterar LinkedIn ou pagamento por cartão.** O cadastro de cartões já está sendo feito em outra frente; não duplicar esse trabalho.
- Google não foi proibido, mas o usuário informou que não possui Client ID. A base da integração já existe e está indisponível sem configuração; os IDs não estão configurados no ambiente observado. Não inventar credenciais nem colocar Client Secret no frontend.
- Nenhum pedido atual para alterar o mobile.
- O commit/push anterior do frontend foi autorizado e concluído. **As correções mais recentes da API e sua integração no frontend NÃO foram commitadas nem enviadas.** Não interpretar o pedido anterior já atendido como autorização permanente para publicar novas mudanças ou commitar a API.
- Preserve alterações existentes; não usar reset/restore/clean para resolver diferenças sem examinar o que há.
- Nunca expor `.env`, senhas, JWTs, documentos, contatos, fotos ou endereços reais em logs, capturas, fixtures ou documentos.
- Não executar `src/mysql-init/RFScript.sql` no banco do projeto: contém DROP DATABASE. Não rotacionar chaves de documentos/segredos.
- Texto da interface em pt-BR. Sem dependências novas sem aprovação. Nada de resultados fictícios de pagamento/reserva/impacto.
- Leia `AGENTS.md` e `CLAUDE.md` de cada repositório relevante. A autorização mais recente do usuário para API é específica e prevalece sobre a antiga proibição de escrita no repositório irmão.

## 3. Repositórios e Git no último estado conferido

Ambiente: Windows, PowerShell, fuso America/Sao_Paulo.

| Projeto | Pasta | Branch e estado |
| --- | --- | --- |
| Web | `C:/Users/43824939860/Desktop/FrontEnd-RF` | `Rafael/Sprint2----Comprador`; HEAD `8996c1f`, já no origin, com alterações locais posteriores |
| API | `C:/Users/43824939860/Desktop/backend-RF` | `main`; HEAD `6543cd9`, com alterações locais posteriores |
| Mobile | repositório irmão Mobile-RF | Não foi modificado nesta entrega |

Remotos: web `https://github.com/leonardoA-Silva/FrontEnd-RF.git`; API `https://github.com/ViniciusPeroni/backend-RF.git`.

Commits importantes do web:

- `3b5c937 feat(buyer): integrate real buyer flows, viacep lookup, realtime chat and vercel spa configuration`.
- `abe2906`, referência de `origin/new-ui`: redesign público, cadastro e área de empresa.
- `4ab872a feat(ui): merge new-ui and align buyer workspace with editorial styling`, merge local posteriormente enviado com o push seguinte.
- `8996c1f fix(user): synchronize buyer profile photo across account headers`, último push confirmado.
- Backup do estado anterior à integração visual: branch local `codex/comprador-antes-new-ui`, apontando para `3b5c937`.

Padrão de mensagens: Conventional Commits em inglês, como `feat(user): ...`, `feat(buyer): ...`, `fix(user): ...`. Use o histórico atual antes de escolher nova mensagem.

**Modificação preexistente da API:** `src/index.js` troca require `./db/testConnect` por `./db/testconnect`, pois esse é o casing do arquivo real. Já existia antes das últimas correções; não apagar nem atribuir à nova correção de foto.

## 4. Execução local e configuração

Web: React 19, TypeScript, Vite 8, React Router 7, Tailwind 4, MUI 9, Axios, lucide-react. A integração solicitada da new-ui trouxe suas dependências GSAP, Three.js, React Three Fiber e Drei; não foram criadas novas dependências para as correções da API/foto.

API: Node/CommonJS, Express 4, MySQL 8/mysql2, JWT e Socket.IO. Sem build/typecheck global de backend.

```powershell
# Dentro do FrontEnd-RF
npm run dev -- --host localhost --port 5174
npm run lint
npm run build

# Dentro do backend-RF, com ambiente local configurado e MySQL disponível
npm start
node --test tests/buyer-read-access.test.js
```

Últimos serviços observados: web `http://localhost:5174`, API `http://127.0.0.1:5000`, MySQL porta 3306. A porta 5173 também pode estar ocupada; não encerrar processos aleatórios. Não assumir que continuarão ligados após reiniciar a máquina.

- Axios: `src/axios/Axios.ts`, base `VITE_API_URL` ou `/api/reaproveitafranca`.
- Vite: `/api` e `/socket.io` encaminhados para `VITE_BACKEND_URL` ou `http://127.0.0.1:5000`; proxy WebSocket habilitado.
- `.env` deve permanecer local/privado. Checar configuração sem imprimir valores.
- API CORS ainda fixa localhost:3000 em seu código; o desenvolvimento web observado funciona através do proxy de mesma origem. Não confundir com configuração de produção concluída.
- Existe configuração SPA para Vercel no web; isso não comprova deploy da API nem publicação das alterações locais.

Verificação local feita no último pedido: GET `/marketplace` pelo web = 200; GET `/api/reaproveitafranca/product` pelo proxy = 200; nova rota autenticada de foto reconhecida através do proxy. O teste de foto usou identidade sintética inexistente e confirmou a resposta segura esperada; não acessou foto real de usuário para o smoke check.

## 5. Estilo atual: new-ui, não retornar ao layout Figma antigo

A referência visual atual é `origin/new-ui` (`abe2906`), por escolha explícita posterior do usuário. O Figma anterior foi referência histórica: `https://www.figma.com/design/oKjqeMhVdtDDLqLOTxIVis/TCC---Senai`.

- Fundo marfim #FAF9F5, verde floresta #0F3D2E, verde #1B4B3A, texto secundário #4B5A55, superfícies brancas e linhas #E7E4DA.
- Tipografia de sistema no corpo; Georgia/Times serif nos títulos editoriais.
- Navegação lateral escura no comprador em desktop; menu recolhível em telas menores que 900px. Filtros do catálogo recolhíveis no celular/tablet.
- Campos 48px, botões arredondados, painéis 24px, fotos reais do catálogo.
- `DESIGN_SYSTEM.md` é o guia atual. Tokens/primitivas compartilhados no `src/index.css`; `buyerStyles.ts` e `marketplaceStyles.ts` reutilizam classes semânticas.
- Home e a cena opcional 3D carregam sob demanda. Não é necessário usar 3D no comprador.
- A integração visual também trouxe telas públicas, cadastro e empresa da referência, mas preservou sessão e APIs reais do comprador, sem substituir seu painel por amostras.

## 6. Arquitetura do web e rotas

- `src/App.tsx`: rotas públicas, dashboard de comprador protegido, dashboard de empresa e prévia de empresa apenas em desenvolvimento.
- `src/components/Header.tsx` / `Footer.tsx`: shell público, links reais e ações conforme sessão; não mostrar cadastro para usuário logado onde já foi ajustado.
- `src/auth/session.ts`: token + usuário mínimo `{ id, role, name, status?, mustChangePassword? }`. Evento `rf-session-change` sincroniza hooks. Não adicionar foto, contato, endereço, nascimento ou token de pagamento ao objeto persistido.
- `useLoggedUser.ts` + `ProtectedRoute.tsx`: sessão, papéis, primeiro acesso e navegação. Autorização de verdade é na API.
- Login tem seleção de perfil, retorno seguro ao marketplace, primeiro acesso, recuperação e redefinição. 401 de JWT inválido encerra sessão; senha atual incorreta não deve ser confundida com JWT expirado.
- `/marketplace`: catálogo real.
- `/marketplace/produto/:productId`: detalhe/fotos/localização e iniciar conversa.
- `/marketplace/reserva/:productId`: solicitação autenticada. Não é pagamento.
- `/dashboardUsuario?aba=...`: explorar, reservas, historico, notificacoes, mensagens, enderecos, cartoes, perfil, seguranca.
- Componentes do comprador em `src/pages/dashboard/comprador/`; componentes de catálogo/detalhe/reserva em `src/pages/marketplace/`.

Funcionalidades atuais:

| Área | Implementação |
| --- | --- |
| Catálogo | Produtos/fotos reais; busca, categoria/modalidade/estado, ordenação e paginação locais; estados loading/error/empty e retry |
| Reservas | Criar com quantidade inteira; total/estoque controlados pelo servidor; listar/detalhar/cancelar pending; histórico |
| Localização do material | Região aproximada antes do aceite; endereço completo conforme autorização da API após aceite |
| Notificações | Lista/contador/filtros/leitura individual e em lote/exclusão, atualizações Socket.IO |
| Mensagens | Iniciar com fornecedor; listagem real; participação; carregar texto/paginar/ler/enviar/editar/excluir/sair, com acknowledgement |
| Endereços | CRUD próprio; CEP com ViaCEP; UF/coordenadas validadas; null limpa coordenadas, não zero |
| Cartões | Consultar e gerenciar metadados de cartões existentes; criação em outra frente; nenhum pagamento implementado nesta tarefa |
| Perfil | Nome/celular/nascimento/foto; e-mail somente leitura; upload e ícones sincronizados; imagem recuperada após reload |
| Segurança | Troca de senha, primeiro acesso e exclusão de conta com confirmação e tratamento de vínculos |

Cadastro usa IBGE para estados/municípios e ViaCEP externo. Endereço final vai para a API. Nenhum JWT da API deve ser enviado a provedores de CEP.

## 7. Correção atual da foto (API + web)

### API

- Nova GET `/api/reaproveitafranca/user/:id/photo`, em `src/routes/modules/userRoutes.js`, após verifyJWT.
- `getUserPhoto` em `src/controllers/userController.js`: titular ou admin; UUID inválido 400, outra conta 403, usuário ausente 404, sem foto 204, imagem suportada 200.
- Resposta binária; MIME identificado pela assinatura em `src/utils/imageType.js` (PNG/JPEG/GIF/WebP), `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`. Não criar URL pública ou token em query string.
- Formato armazenado não suportado retorna 415.
- PUT de perfil valida raster e até 5 MB, com 415/413. GET/PUT JSON de perfil mantêm os campos antigos; foto é buscada separadamente.

### Web

- `src/auth/profilePhoto.ts`: estado compartilhado somente em memória, vinculado a usuário e token; GET autenticado com responseType blob, valida MIME, deduplica carregamento, cancela requisição anterior, descarta respostas antigas, expõe erro/retry e encerra sessão em 401.
- `AccountAvatar.tsx`: círculo de foto de 36px nos cabeçalhos público e de comprador; fallback neutro quando não há imagem ou ela falha.
- `BuyerProfile.tsx`: círculo 112px com câmera de 44px e opção “Escolher foto”; prévia pendente não altera ícones antes do PUT confirmado. Upload com erro conserva foto confirmada e campos.
- Após sucesso, nome atualiza sessão/cabeçalhos; celular e nascimento seguem a resposta real. E-mail não é editável por esse endpoint.
- Foto volta após reload/novo login pela rota nova. Não persistir imagem/blob URL no navegador. Logout/substituição libera URL.
- Resposta atrasada de PUT não atualiza outra sessão que tenha entrado no meio da requisição.

## 8. Outras correções atuais da API

### Conversas

`src/services/conversationService.js`, `listConversationsForUser`: `BIN_TO_UUID(other.id_user)` foi corrigido para `BIN_TO_UUID(otherCp.id_user)`, alias real do JOIN. REST e Socket.IO usam o mesmo service. Listagem/contadores reais testados.

O web removeu a lista alternativa `rf_recent_conversations` e seus registros locais de acesso (`BuyerConversations.tsx`, `LiveProductDetails.tsx`); agora falhas reais aparecem com retry. Logout limpa a chave antiga se ainda existir.

### Itens de compra

`shoppingProductController.js` passa identidade/papel para `shoppingProductService.js`. A consulta aplica `s.id_user` para não administradores, alinhada à regra já existente no detalhe de shopping:

- Comprador dono ou admin pode consultar.
- Item individual alheio/inexistente retorna 404.
- Listas são filtradas; compra alheia não devolve itens.
- Filtro UUID inválido retorna 400 em vez de ser ignorado e virar lista geral.
- Service exige identidade válida, inclusive em chamadas internas.
- Não dar ao vendedor acesso amplo às compras alheias nem usar este endpoint para transição de status.

Banco local já possui `localization.latitude`, `localization.longitude` e `conversation_participant`; conferido por metadados somente leitura. Nenhuma migração aplicada nesta entrega. Relatos antigos de ausência dessas estruturas estão desatualizados.

## 9. Contratos que não devem ser inventados

- POST `/shopping/create`: `{ items: [{ id_product, quantity }] }`, servidor calcula valor e gera pending. Cliente não define preço/status/purpose/data.
- PATCH `/shopping/:id/cancel`: cancelamento do comprador quando pending. PATCH `/shopping/:id/status` é fluxo vendedor/admin, não comprador.
- GET `/shopping/` e `/shopping/:id`: reservas próprias e itens, com autorização.
- `/notification/`, `/notification/unread/count`, leitura e exclusão: recursos próprios.
- `/conversation/`: GET lista, POST inicia com `{ otherUserId }`; GET/DELETE `/:id`: detalhe/saída.
- `/localization/`: CRUD próprio. POST/PUT usam `zipCode`; leitura usa `zip_code`. Coordenadas opcionais/null.
- `/card/create` existe e depende de tokenização/metadados. Cadastro de cartão não significa pagamento concluído. Não coletar PAN/CVV/token manual no web para simular provedor.
- Socket handshake: `auth: { token }`, nunca token na URL. Eventos com ack para mensagens; sem retry automático de mutações que possa duplicar.
- Reserva após resposta de rede incerta fica bloqueada para reenvio e orienta consultar Minhas reservas; não remover a proteção contra duplicidade sem idempotência do servidor.
- Doação não tem preço; apenas empresas publicam; autorização e estoque devem continuar no backend.

## 10. O que ainda é estático ou não está pronto

- Home/Sobre nós: textos institucionais, imagens e composição 3D locais, sem CMS. São apresentação, não estoque/estatísticas reais.
- Navegação, rótulos, enumerações e mensagens da interface são definições estáticas normais.
- Prévia `/previa/dashboard/empresa/*` só em desenvolvimento usa amostras/estado em memória; não é catálogo real do comprador.
- Publicação/edição de anúncios da empresa conserva as restrições/read-only da referência new-ui em produção; não foi implementada como parte das correções do comprador.
- Não há produto fictício, reserva local, confirmação falsa de Pix/cartão ou QR de pagamento no comprador.
- Google: integração básica existe, mas faltam `VITE_GOOGLE_CLIENT_ID` no web e `GOOGLE_CLIENT_ID` no backend; booleanos de configuração conferidos sem imprimir valores. Precisa do projeto/configuração externa do proprietário. OAuth real não testado.
- LinkedIn: não implementar por instrução explícita.
- Pagamento por cartão: não implementar por instrução explícita. Cadastro de cartões está em outra frente.
- Cobranças/Pix/comprovantes, avaliações, QR de retirada, mapas/distância e métricas ambientais não são capacidades operacionais confirmadas desta entrega. Não simular.
- Outros riscos antigos de autorização, como documentos/logs/propriedade de produtos, não foram todos auditados/corrigidos nesta tarefa. Consultar guia de segurança antes de ampliar integração.
- SMTP real, OAuth real e gateway não foram exercitados. Não dizer que emails/pagamentos externos foram validados.

## 11. Testes e resultados reais

### Frontend

- `npm run build`: passou após últimas mudanças; permanece aviso de chunks >500 kB (inclui cena 3D opcional).
- `npm run lint`: mantém **1 erro e 1 aviso preexistentes** em `src/components/Notification.tsx`, declaração/dependências de handleClose. Arquivo não alterado. Não dizer que lint global passou.
- ESLint focado em auth/perfil/conversas/detalhe afetados: passou.
- Não existe suíte `npm test` configurada.

### Backend

- `node --check` em controllers de usuário/itens, services de itens/conversas, rota de usuário e helper imageType: passou.
- `node --test tests/buyer-read-access.test.js`: **5 testes passaram**, sem conexão ao banco. Cobrem identidade, escopo comprador/admin, filtros inválidos e assinaturas raster/HTML/SVG.
- Existem scripts `test:notification` e `test:card` do projeto com exigências próprias de MySQL/RF_TEST_ALLOW_DB; não relatar execução deles se não foram rodados nesta tarefa.

### Ponta a ponta

Scripts locais ignorados no web em `.verification.local/`, sem dependência npm nova. Principal atual: **`verify-api-buyer-fixes.cjs`**. Scripts antigos têm expectativas ultrapassadas de foto ausente/erro SQL/lista local; não executar e interpretar falha de expectativa antiga como regressão automaticamente.

O script atual cria banco exclusivo `rf_web_buyer_verify_...`, verifica nome/ausência e separação do banco do projeto, adapta o schema somente para esse banco, cria dados/credenciais sintéticos em memória, sobe API real na 5101 e Vite na 5176 e usa Playwright/Edge. Não roda SQL inicial destrutivo no banco original. Limpa processos e banco descartável no finally.

Passou em:

- Catálogo/fotos/localização mascarada, login real e reserva com total/estoque/cancelamento/reposição.
- Doação sem cobrança, aceite do vendedor e endereço completo autorizado.
- Notificações REST/realtime, endereços CRUD/null e regressão de metadados de cartões existentes.
- Foto multipart persistida no MySQL, foto protegida com bytes/MIME/cache corretos, usuário dono/admin/outra conta/anônimo, 204/400/404, SVG rejeitado.
- Nome/celular/nascimento persistidos e relidos; nome/avatar sincronizados; foto após reload.
- Itens próprios/admin acessíveis; outra conta/anônimo sem acesso; filtros inválidos 400.
- Conversas listadas sem erro SQL e mensagens reais enviadas/editadas/excluídas; saída e participação.
- Layouts 375/768/1280px sem overflow nem erros JavaScript; sem foto/contato de perfil persistidos no storage e sem endpoints de vendedor usados pelo comprador.

Banco descartável removido e banco do projeto preservado após cada execução. Capturas usaram somente conteúdo sintético. Os scripts Playwright locais usam um caminho absoluto de runtime portátil que pode não existir em outra máquina; localizar runtime instalado em vez de instalar dependência sem necessidade/aprovação.

## 12. Arquivos locais ainda não commitados

Web (confirmar de novo com git status):

- `src/auth/profilePhoto.ts`, `src/auth/session.ts`.
- `src/pages/dashboard/comprador/BuyerConversations.tsx`, `BuyerProfile.tsx`.
- `src/pages/marketplace/LiveProductDetails.tsx`.
- `DESIGN_SYSTEM.md`, `docs/api-contract.md`, esta continuidade e documentos de auditoria/pendências atualizados.

API:

- `src/controllers/userController.js`, `shoppingProductController.js`.
- `src/routes/modules/userRoutes.js`.
- `src/services/conversationService.js`, `shoppingProductService.js`.
- Novos `src/utils/imageType.js`, `tests/buyer-read-access.test.js`, `docs/buyer-fixes-2026-11-03.md`.
- `AGENTS.md` e docs de contrato/segurança atualizados para refletir a autorização de itens corrigida, sem relaxar regras de publicação.
- `src/index.js`: diferença preexistente de casing, preservada.

Essas mudanças dependem umas das outras: frontend atual usa a nova rota de foto e a listagem de conversas corrigida. Publicar apenas o frontend sem atualizar a API pode gerar erro de carregamento da foto. Não commitar somente parte sem revisão e coordenação.

## 13. Próxima IA: como continuar

1. Leia este documento, AGENTS/CLAUDE de cada repositório envolvido e faça git status/diff/log antes de editar.
2. Verifique se a nova API e o frontend continuam disponíveis localmente; não assumir processos ligados.
3. Não refaça as correções já implementadas e testadas, não recoloque mock de comprador nem lista de conversas local, e não volte ao Figma antigo sem novo pedido.
4. Preserve as mudanças não commitadas. Se o usuário pedir commit/push, trate cada repositório separadamente, siga o padrão existente e confirme o destino; sem force-push para contornar divergência.
5. Para Google, será necessária configuração externa/Client ID público. LinkedIn e pagamento por cartão continuam proibidos; não duplicar cadastro de cartões.
6. Ao alterar UI/API, teste sucesso/erro/autorização/isolamento com dados sintéticos. Nunca usar banco real do usuário para executar o schema inicial.
7. Informe resultado e limites honestamente: build passou, lint global tem falha antiga, APIs externas não foram validadas.

Documentos complementares: `DESIGN_SYSTEM.md`, `docs/api-contract.md`, `docs/auditoria-perfil-integracoes.md`, `docs/pendencias-api-comprador.md` no web e `docs/buyer-fixes-2026-11-03.md`, `docs/security-privacy.md` na API. Auditorias antigas são histórico; o contrato e este contexto atualizado prevalecem quando descrevem correções posteriores.

## Google — atualização posterior em 03/11/2026

Foi autorizada a resolução de login/criação com Google e configuração do provedor, preservando a proibição de LinkedIn/pagamento por cartão. Código revisado: callback estável no web, navegação por papel real, tratamento de erros, transação/vínculo seguro e concorrência na API (`googleLoginService.js`), headers para popup e porta dev 5174 fixa. Testes simulando o verificador Google passaram com HTTP/MySQL reais em banco descartável, além de UI com SDK simulado. **OAuth real ainda não foi validado: falta concluir login no Google Cloud e criar/selecionar/configurar Client ID real.** Nenhum ID/segredo inventado ou configuração externa alegada como concluída. Consulte `docs/google-login-setup.md`; não reportar “Google funcionando” só pelos testes simulados. Mudanças desta etapa e das correções anteriores da API continuam sem commit/push.

O usuário confirmou login no Google Cloud em outro navegador. O runtime de automação não conseguiu anexar-se à sessão (pacote de controle rejeitado por confiança de RPC). Foi solicitado verificar existência de cliente OAuth Web e fornecer somente Client ID público. Configuração externa e autenticação real ainda pendentes; não afirmar conclusão e não pedir senha/Client Secret.

## Client ID Google recebido e configurado

O usuário forneceu o Client ID público real. Foi salvo em `.env.local` do web e `.env` da API, ambos ignorados pelo Git, e a API foi reiniciada. Teste com SDK oficial no localhost:5174 confirmou botão ativo/iframe carregado/API configurada, mas o Google rejeitou a origem atual. Falta o usuário salvar http://localhost e http://localhost:5174 em Origens JavaScript autorizadas desse cliente no Google Cloud; confirmação solicitada e pendente. Não repetir pedido de Client ID e não afirmar OAuth real concluído. Depois de salvar, repetir verificação e pedir que o usuário escolha/confirme a conta no Google. LinkedIn e pagamento por cartão continuam fora do escopo.

## Estado mais recente do Google — origens confirmadas

O parágrafo anterior é histórico: o usuário criou um novo cliente, o novo Client ID foi configurado no web/API e ele confirmou as origens `http://localhost` e `http://localhost:5174` salvas. Não solicitar novamente a mesma configuração. Encontrado e removido em `index.html` um meta referrer `no-referrer` que anulava o header esperado: antes a requisição do botão Google não tinha Referer, depois passou a enviar a origem localhost:5174 correta. Vite e Vercel conservam as políticas de headers específicas de desenvolvimento/HTTPS.

Mesmo após a correção, a última checagem com SDK oficial ainda recebeu rejeição de origem do Google. Pode haver propagação (documentação oficial informa 5 minutos a algumas horas), mas isso não foi comprovado e o console autenticado do usuário não está acessível à automação. Não declarar login/cadastro real concluído. Biblioteca/iframe carregam, Client ID é o novo, app não gera erro JavaScript e API real rejeita credencial inválida com 401. Falta origem aceita e login real manual do proprietário. Consultar `docs/google-login-setup.md` para evidências e limites. Não armazenar nem repetir Client Secret; esse fluxo não o usa.

As instruções atuais deste checkout limitam novas escritas ao frontend; não fazer novas alterações no repositório da API sob as regras atuais. Preservar alterações locais anteriores nos dois repositórios. Sem novo commit/push.

## Google: bloqueio de origem deixou de reproduzir

Última verificação com SDK real: /gsi/client, /gsi/style e /gsi/button responderam 200; nenhum erro de origem. Referer localhost:5174 e novo Client ID confirmados. Não repetir pedido de adicionar origens nem considerar esse bloqueio ainda ativo. Próxima validação: proprietário conclui autenticação no botão oficial e confirma sessão/cadastro no app. Login real ainda não validado; sem novos ajustes de código/API nesta verificação.

## Consolidação na main autorizada

O usuário solicitou commit na main da API e do frontend, seguindo o histórico de cada projeto. Consolidar as correções locais descritas neste documento e preservar os commits anteriores da branch de comprador por avanço direto da main, sem reescrever histórico. A autorização atual é para commits locais; push não foi solicitado nesta etapa. Manter arquivos de ambiente e verificações locais ignorados fora do versionamento. Google passou na verificação de origem, mas login completo com conta real ainda depende de confirmação. LinkedIn e pagamento por cartão permanecem fora do escopo.
