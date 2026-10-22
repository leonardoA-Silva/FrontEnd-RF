# Integração do comprador — 22/10/2026

Status: **API-supported**. O frontend usa os contratos verificados no backend `main`, commit `83575fc`. As interações foram verificadas no navegador com respostas simuladas desses contratos. A API local não estava rodando na porta 5000; persistência, envio real de e-mail e provedores externos não foram exercitados. Nenhum dado real de conta foi alterado.

## Entrega e critérios observáveis

| Fluxo | Rota e comportamento |
| --- | --- |
| Catálogo e detalhes | `/marketplace` e `/marketplace/produto/:id`: GET de produtos/fotos, busca, categoria, venda/doação, disponibilidade, ordenação e paginação local. Carregamento, vazio, erro com tentativa e material inexistente. Sem fornecedor, distância ou data inventados. |
| Painel do comprador | `/dashboardUsuario`: catálogo real e navegação para perfil/segurança. Reservas e histórico informam indisponibilidade; não consultam logs de auditoria nem tratam produtos reservados por terceiros como reservas próprias. |
| Perfil | `?aba=perfil`: GET/PUT `/user/:id` do usuário autenticado; nome, celular de 11 dígitos, nascimento e upload `photo` multipart. Falhas preservam os campos; sucesso atualiza o nome da sessão. E-mail somente leitura. |
| Segurança | `?aba=seguranca`: PATCH `/user/password` com senha atual, nova e confirmação local. Senha atual incorreta não encerra a sessão; JWT rejeitado com `auth: false` encerra. |
| Primeiro acesso | `/primeiro-acesso`: obrigatório quando o login informa `mustChangePassword`; PATCH `/user/password/first-access` e atualização do estado local somente após sucesso. |
| Recuperação | `/recuperar-senha`: POST `/user/password/forgot`; mensagem genérica evita revelar se uma conta existe. |
| Redefinição | `/redefinir-senha`: token recebido pelo link é retirado da URL com substituição do histórico e mantido apenas em memória; POST `/user/password/reset`. Link inválido/expirado oferece nova solicitação. Recarregar exige reabrir o link. |
| Exclusão | Segurança → confirmação em diálogo nativo, ciência explícita da permanência, DELETE `/user/:id`. Conflito 409 mantém a sessão; sucesso encerra a sessão e confirma na tela de login. Cancelar não envia DELETE. |

O catálogo real e o único exemplo são separados. `?origem=exemplo` abre a demonstração existente; nenhum passo desse protótipo cria uma reserva, altera um produto ou confirma uma cobrança na API.

## Contratos e limites

- Fonte: `src/routes/modules/userRoutes.js`, `productRoutes.js`, `src/controllers/userController.js`, `productController.js`, `src/services/productService.js` e middleware `verifyJWT.js` do backend, consultados em modo de leitura.
- Fotos de produto chegam como base64 sem MIME. JPEG, PNG, WebP e GIF reconhecidos pela assinatura são exibidos; conteúdo não reconhecido recebe fallback. Não há SVG ou HTML de origem externa renderizado.
- O perfil aceita foto, mas GET/PUT não devolvem essa imagem. O front avisa sobre essa limitação e não simula avatar salvo. Upload limitado no cliente a 5 MB e tipos raster; validação do servidor continua necessária. A API não permite remover um nascimento já salvo nem editar endereço/documentos/e-mail nessa rota.
- Sessão conserva apenas os dados mínimos de navegação e o token no armazenamento já usado pelo projeto. E-mail lembrado e reservas legadas são removidos; senha, token de recuperação, telefone, nascimento e foto não são persistidos no navegador. Não foram adicionados logs de credenciais nem dependências.
- Cadastro e confirmação OTP existentes permanecem nas rotas anteriores; não foram feitas operações reais de cadastro/envio de código nesta verificação.
- Reservas, pagamentos, histórico de negociações, notificações e indicadores não possuem endpoints correspondentes. Mapa, chat, documentos e LinkedIn mantêm as pendências documentadas na [análise do backend](frontend-readiness-review.md). Não foram apresentados como integrações funcionais.

## Google

O usuário confirmou não possuir Client ID. O botão permanece desativado, com orientação para entrar por e-mail/senha; nenhum SDK do Google é carregado nessa condição. A integração opcional usa Google Identity Services, após clique explícito, e envia a credencial para `/user/login/google`.

Para ativação futura, configurar o ID **público** em `VITE_GOOGLE_CLIENT_ID`, o mesmo público-alvo em `GOOGLE_CLIENT_ID` no backend e as origens autorizadas no provedor; reiniciar o Vite. Nenhum Client Secret deve ir para `VITE_*`. Configuração de backend fica a cargo do proprietário desse repositório. Referências: [renderização do botão](https://developers.google.com/identity/gsi/web/guides/display-button) e [API JavaScript oficial](https://developers.google.com/identity/gsi/web/reference/js-reference). Login real do Google não foi validado.

## Verificação

- `npm run build`: aprovado; aviso de tamanho do bundle existente.
- ESLint direcionado a sessão, Axios, hooks, rotas, login, marketplace e novas telas do comprador: aprovado.
- `npm run lint`: 18 erros e 1 aviso preexistentes em verificação de e-mail, notificações, painel de empresa, chat legado e cadastro. Nenhum desses arquivos foi alterado nesta integração.
- `node .verification.local/verify-buyer.cjs`: verificação local com Playwright/Edge e API interceptada conforme os contratos. Exercita catálogo/filtros/fotos/paginação, perfil multipart e validação de upload, preservação após falha, troca de senha, primeiro acesso, exclusão/cancelamento/409, recuperação, link expirado, proteção e expiração da sessão, ausência de dados de contato no armazenamento e Google indisponível sem ID.
- Inspeção visual em 375, 768, 1280 e 1440 px; correções do tema do catálogo no painel, busca móvel e cabeçalho compacto. Nenhum erro de execução do navegador no roteiro. Os arquivos de verificação e imagens usam dados artificiais e ficam na pasta ignorada `.verification.local/`.

Não há suíte de testes configurada no repositório. Esta evidência não certifica integração ponta a ponta: ainda é necessário exercitar os mesmos fluxos com a API/banco/e-mail configurados e uma conta de desenvolvimento autorizada. Backend sem alterações locais; nenhum commit ou push realizado.
