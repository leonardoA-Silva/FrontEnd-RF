# Auditoria do perfil e das integrações — 03/11/2026

> Atualização posterior em 03/11/2026: o usuário autorizou alterações na API, exceto LinkedIn e pagamento por cartão. Leitura autenticada da foto, alias SQL das conversas e autorização dos itens de compra foram corrigidos localmente e verificados com API/MySQL/Socket.IO reais. A foto agora é recuperada após reload/novo login e a lista alternativa local de conversas foi removida. As descrições abaixo registram o diagnóstico anterior; consulte `api-contract.md` para o contrato atual. Sem commit/push destas novas alterações.


## Correções do frontend

- Controle de foto com botão de câmera sobre o avatar e seletor visual “Escolher foto”. Mantém input de arquivo acessível, limite de 5 MB e validação de JPG/PNG/WebP/GIF.
- `src/auth/profilePhoto.ts` compartilha a foto confirmada em memória entre o perfil e os cabeçalhos (`AccountAvatar`). A foto pendente não altera o cabeçalho antes do PUT bem-sucedido. Falhas mantêm o avatar anteriormente confirmado.
- Foto vinculada ao usuário e ao token da sessão atual. Sem gravação de imagem ou URL em localStorage/sessionStorage. URLs temporárias são liberadas na substituição e no logout. Nenhuma imagem de outra sessão é exibida.
- Navegar entre abas e rotas do app mantém a foto. Recarregar o documento ou entrar novamente ainda perde a imagem em memória, pois a API não fornece sua leitura.
- Resposta atrasada de atualização não altera nome/foto de uma sessão que mudou durante a requisição.
- A validação de remoção da data de nascimento considera também uma data gravada nesta visita ao perfil.

## Verificação dos campos

| Campo | Origem/leitura | Atualização e resultado |
| --- | --- | --- |
| Nome | GET autenticado `/user/:id` | PUT multipart; resposta atualiza o campo e o nome da sessão/cabeçalho. Persistência e releitura confirmadas. |
| Celular | GET autenticado `/user/:id` | PUT com 11 dígitos; persistência e releitura confirmadas. Não é persistido no armazenamento do navegador. |
| Nascimento | GET autenticado `/user/:id` | PUT com data; persistência e releitura confirmadas. Remoção não é suportada pelo fluxo atual. |
| E-mail | GET autenticado `/user/:id` | Somente leitura. O controller ignora alterações de e-mail nesta rota. Não é falha de sincronização. |
| Foto | Upload multipart `photo` | O arquivo é gravado no MySQL. GET e resposta do PUT não incluem `photo`. Sincronização visual corrigida em memória; recuperação após reload depende de alteração na API. |
| Endereços | Rotas autenticadas `/localization/` | CRUD separado da página de perfil. CEP usa serviço externo ViaCEP; não é preenchimento fictício. |

Fontes verificadas: `backend-RF/src/controllers/userController.js`, funções `updateUser` e `getUserById`, e rotas `src/routes/modules/userRoutes.js`. Ambas as consultas de resposta selecionam nome/e-mail/celular/nascimento/status, mas não foto. Não há uma rota existente de leitura de foto identificada nesse módulo. Nenhum arquivo do backend foi alterado.

## O que permanece estático

| Conteúdo | Situação |
| --- | --- |
| Home e Sobre nós | Textos institucionais, etapas, imagens ilustrativas e apresentação/escultura 3D são recursos locais; não vêm de um CMS/API. Não representam estoque ou indicadores reais. |
| Navegação, rótulos, opções e mensagens | Definições normais da interface, não registros de usuário simulados. As categorias do catálogo são derivadas dos produtos recebidos. |
| Prévia da empresa | `/previa/dashboard/empresa/*`, somente em desenvolvimento, usa materiais e alterações temporárias de `companyDemo`. Não é o catálogo real do comprador. |
| Catálogo, reservas e histórico do comprador | Usam respostas reais da API. Nenhum material de exemplo ou reserva local foi reintroduzido. |
| Conversas recentes quando a API falha | Alternativa já existente em sessionStorage. Nome/horário refletem acesso local; o contador alternativo é zero, não uma contagem real da API. A troca de mensagens continua usando Socket.IO real. |
| Avatar após upload confirmado | Imagem realmente enviada ao servidor, compartilhada temporariamente em memória. Não é uma foto fictícia nem leitura da imagem armazenada na API. |

## Recursos sem dados ou integração completa

1. **Foto persistida:** falta resposta autenticada que disponibilize a imagem salva e documente seu formato. A API deve fornecer essa leitura para o frontend conseguir hidratar os avatares após reload/novo login; não criar endpoint fictício ou persistir foto no navegador como substituto.
2. **Pagamentos e novos cartões:** o frontend gerencia metadados de cartões existentes. Não há integração completa de tokenização/cobrança, aprovação de Pix/cartão ou comprovante. A reserva não confirma pagamento.
3. **Lista geral de conversas:** erro SQL confirmado no alias `other.id_user` em `conversationService.listConversationsForUser`. A alternativa de recentes da sessão não equivale à lista completa nem aos contadores do servidor.
4. **Google/LinkedIn:** Google depende do Client ID público/configuração; sem ele o botão fica indisponível. LinkedIn permanece indisponível no frontend. Existem rotas no backend, mas isso não comprova OAuth configurado e operacional.
5. **Mapas, distância e avaliações:** não há fluxo operacional correspondente apresentado como concluído no comprador. A localização textual dos materiais recebe dados da API, com endereço completo condicionado ao aceite da reserva.
6. **Serviços externos legítimos:** ViaCEP e as listas de estados/municípios do cadastro (IBGE) consultam seus provedores públicos diretamente, não a API do projeto. O endereço final é salvo pela API autenticada.
7. **Empresa fora do escopo do comprador:** a prévia aceita alterações em memória; os formulários de anúncios em produção ainda preservam as restrições/read-only da branch `new-ui`. Não foram convertidos em publicação integrada nesta tarefa.

## Evidências de validação

- `npm run build`: passou; permanece aviso de chunks maiores que 500 kB.
- `npm run lint`: permanece 1 erro e 1 aviso em `src/components/Notification.tsx`, arquivo não alterado nesta tarefa.
- ESLint focado em auth, hook, avatar, cabeçalhos e perfil: passou.
- Playwright local `verify-profile-avatar.cjs`: câmera abre seletor; foto pendente/confirmada; ambos os cabeçalhos; troca de abas/rotas; atualização/releitura dos campos; upload falho; mudança de sessão; privacidade; liberação de URLs no logout; larguras 375/768/1280. API simulada conforme contrato, sem dados pessoais reais.
- `verify-live-profile-avatar.cjs`: API, MySQL e Socket.IO reais com banco descartável exclusivamente criado para a verificação. Confirmou foto persistida no MySQL, nome/celular/nascimento gravados e relidos, nome/avatar sincronizados, imagem compartilhada entre rotas e ausência dela após reload. Também passaram reservas/cancelamento/estoque/doação, notificações, endereços, cartões e envio/edição/exclusão de mensagens. Banco descartável removido; banco original preservado.
- Captura do controle de foto em 375px inspecionada. Nenhuma dependência nova. Commit e push das correções foram autorizados posteriormente pelo usuário em 03/11/2026. Não há suíte npm de testes configurada; os scripts citados são verificações locais ignoradas pelo Git.

## Atualização de escopo autorizada

Google e LinkedIn não devem ser implementados nesta tarefa. O cadastro de cartões já está sendo desenvolvido por outra frente; não duplicar esse trabalho. A API permanece somente para leitura/diagnóstico. A conferência de metadados do banco em 03/11/2026 confirmou que latitude, longitude e conversation_participant já existem. Consulte `pendencias-api-comprador.md` para a lista atual.
