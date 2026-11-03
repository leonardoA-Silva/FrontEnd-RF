# Google: login e criação de conta — 03/11/2026

## Estado atual

O código de login/cadastro Google foi revisado e testado. O novo Client ID público fornecido pelo usuário foi configurado em `.env.local` do web e `.env` da API (ambos ignorados pelo Git). **A última verificação com SDK oficial aceitou a origem: `/gsi/button` respondeu 200, sem erro de origem. Autenticação real com uma conta ainda não concluída.** Nenhum Client Secret foi solicitado, armazenado no web ou usado neste fluxo.

Foi aberta uma janela de Google Cloud que exigiu autenticação do proprietário; o usuário deve concluir o login. O controle de janelas do plugin apresentou incompatibilidade de runtime. A página de clientes também foi solicitada no painel do app. Não alegar que o cliente OAuth foi criado ou que origens foram salvas.

## O que foi corrigido no código

- GoogleSignIn mantém callback e preferência de lembrar sessão atualizados por refs; alterações no formulário não reconstroem o SDK a cada tecla. Inicialização considera o Client ID usado. Valida credencial vazia e trata indisponibilidade/erro/conflito sem mostrar internals.
- Login Google navega conforme o papel retornado pelo servidor e preserva primeiro acesso. Login por senha mantém a verificação do perfil escolhido. A interface Google está na aba Comprador/Artesão e no cadastro pessoal, não cria empresas sem os dados necessários.
- Novo `backend-RF/src/services/googleLoginService.js`, exclusivo do Google. Criação e vínculo transacionais; concorrência com retry limitado de duplicate/deadlock; contas existentes conservam papel; primeiro acesso continua obrigatório; contas inativas não são reativadas automaticamente; vínculo existente a outro Google não é sobrescrito.
- Vínculo automático por e-mail existente exige identidade de e-mail autoritativa do Google (Gmail ou Workspace verificado). E-mail de terceiro em conta local exige comprovação adicional, com orientação para login por senha; não vincular só por uma string de e-mail.
- Controller valida o tipo da credencial, usa verifyIdToken/audience do google-auth-library e email_verified booleano. Separa credencial inválida (401), configuração/indisponibilidade (503), conta/vínculo não permitido (403), conflito (409) e falha interna (500). Não registra tokens ou erro bruto do provedor.
- Vite usa porta 5174 com strictPort, COOP same-origin-allow-popups e Referrer-Policy de desenvolvimento. CLI de testes pode sobrescrever a porta. Vercel recebe os headers adequados para popup e referência em HTTPS; isso não comprova deploy nem configuração do domínio no Google.
- LinkedIn e pagamento por cartão não foram alterados. Foram preservadas as mudanças locais anteriores do usuário e das outras tarefas.

## Configuração externa necessária

1. Acessar `https://console.cloud.google.com/auth/clients` com a conta administradora e selecionar/criar o projeto correto do Reaproveita Franca. Não habilitar faturamento/serviços pagos para esse fluxo.
2. Configurar branding/tela de consentimento e audiência, com nome real do app e e-mail de suporte escolhido pelo proprietário. Não inventar contato, política de privacidade ou domínio. Se o projeto estiver em teste, configurar os usuários de teste necessários.
3. Criar ou selecionar um **cliente OAuth de aplicação Web**.
4. Adicionar origens JavaScript locais necessárias: `http://localhost`, `http://localhost:5174`. Se usar o endereço IP nos testes, incluir `http://127.0.0.1:5174`. Adicionar a origem HTTPS real de produção apenas quando o proprietário confirmar o domínio. Não colocar `/login` ou caminho em origem JavaScript.
5. O fluxo atual usa callback JavaScript e ID token; não inventar callback OAuth de redirecionamento nem scopes de Gmail/Drive.
6. Definir o MESMO Client ID público em `VITE_GOOGLE_CLIENT_ID` no `.env.local` do web e `GOOGLE_CLIENT_ID` no `.env` da API. Não gravar ID de teste como configuração real. Não colocar segredo em VITE_*.
7. Reiniciar os servidores após mudar ambiente e testar a conta real no botão oficial Google (login é feito pelo usuário). Conferir cadastro inicial, retorno à mesma conta, logout, sessão e acesso ao perfil. Não capturar credenciais/foto/contato reais nos registros de teste.

Se a ferramenta usada exigir confirmação na criação do cliente OAuth, preparar e mostrar projeto/tipo/origens para aprovação antes de finalizar. Não automatizar senha/2FA ou barreiras de segurança.

## Evidências já obtidas

- `node tests/google-login.integration.js` na API: passou com HTTP e MySQL reais em banco descartável, **verifyIdToken simulado só no processo de teste**. Limiter isolado nesse teste para permitir cenários sequenciais; não foi desativado em produção. Cobriu payload inválido, token inválido, e-mail não verificado, ausência de configuração, criação/retorno/vínculo, papel company preservado, firstLogin, conta inativa, conta aguardando confirmação, vínculo conflitante, e-mail terceiro sem prova e concorrência com uma conta criada. Nenhuma chamada OAuth real foi aprovada nesses testes. Banco descartável removido; original preservado.
- `.verification.local/verify-google-ui.cjs`: passou usando SDK e respostas HTTP Google simulados; controle lembrar sessão, cadastro durante rerender do formulário, troca de token pela API, erro 503/retry e destino por papel. Não é validação de OAuth real. Vite de teste usa cache separado para não interferir no servidor do usuário.
- `npm run build`: passou. `npm run lint`: mantém erro/aviso preexistentes em Notification.tsx. Lint focado nos arquivos Google/login/cadastro passou.
- Schema local conferido somente por metadados: google_id existe; password/cellphone aceitam NULL. Nenhuma migração aplicada no banco original.

## Fontes oficiais consultadas

- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- https://developers.google.com/identity/gsi/web/reference/js-reference

Sem commit/push nesta etapa. Client ID real configurado e origem aceita pelo Google; falta o usuário concluir o acesso na interface oficial. Os registros abaixo são histórico; o estado atual acima e a última atualização prevalecem.

## Acesso ao console confirmado pelo usuário

O usuário informou que já entrou no Google Cloud em outro navegador. A tentativa de anexar automação a janelas existentes encontrou falhas de resolução de runtime e, ao localizar outro runtime instalado, rejeição de confiança do RPC (`@oai/sky/service`). Não contornar a restrição com protocolo próprio ou copiar credenciais/perfis de navegador. A página do console foi solicitada no painel do app, mas a configuração externa não foi concluída. Foi solicitado informar se já existe cliente OAuth Web e enviar apenas seu Client ID público; a resposta está pendente. Não repetir pedido de login como se o usuário ainda não tivesse entrado. Registrar e verificar origens no cliente real antes de afirmar OAuth funcionando.

## Verificação após receber o Client ID

Client ID real configurado no web/API, demais valores locais preservados e API reiniciada na porta 5000. Teste no endereço real http://localhost:5174/login: botão habilitado, biblioteca oficial Google carregou, iframe oficial renderizou, nenhum erro JavaScript do app, API rejeitou token propositalmente inválido com 401 (não 503 de ausência de configuração). Porém o Google registrou rejeição da origem atual. Foi solicitado adicionar e salvar http://localhost e http://localhost:5174 em Origens JavaScript autorizadas do cliente OAuth. Aguardar confirmação e repetir o teste antes de declarar OAuth funcionando. Não confundir essas origens com URIs de redirecionamento. A conta real ainda não entrou nem foi criada pelo provedor neste teste. Não commitar arquivos de ambiente.

## Origens confirmadas e conflito de Referrer-Policy corrigido

O usuário criou outro cliente OAuth e confirmou as duas origens salvas. Web e API usam o novo Client ID. A inspeção do navegador encontrou um conflito adicional: `index.html` continha `<meta name="referrer" content="no-referrer">`, que suprimia o Referer mesmo com o header correto do Vite. A meta foi removida: desenvolvimento segue o header `no-referrer-when-downgrade` e Vercel segue `strict-origin-when-cross-origin`. Outras hospedagens precisam aplicar os headers equivalentes; esta alteração não comprova deploy.

Verificação antes/depois com navegador isolado e SDK real: Referer ausente antes; origem `http://localhost:5174` enviada depois. Novo Client ID confirmado no iframe oficial; nenhum erro JavaScript do aplicativo. Ainda houve rejeição de origem pelo Google após essa correção. Não afirmar que a causa restante é propagação confirmada: o Google documenta prazo de 5 minutos a algumas horas, mas as configurações autenticadas do console não foram inspecionadas pela ferramenta. Não pedir novamente que o usuário salve as mesmas origens sem nova evidência.

API real respondeu 401 para credencial propositalmente inválida; isso verifica disponibilidade/configuração local, não autenticação bem-sucedida. Nenhuma conta real foi criada por automação. Não repetir nem armazenar o segredo enviado acidentalmente; este fluxo de ID token não o utiliza.

Referência do prazo de propagação: https://support.google.com/cloud/answer/15549257?hl=en . A política de referência para localhost está na documentação oficial de setup citada acima.

## Erro real informado pelo usuário

O usuário tentou autenticar e recebeu `401 invalid_client` com `no registered origin` na página do Google. Não registrar identidade/e-mail da conta usada. Nova inspeção confirmou que o botão usa o novo Client ID e envia Referer da origem `http://localhost:5174`. A falha ocorre no provedor antes de existir credencial para trocar com a API; não corrigir desativando validação de token nem adicionando segredo ao web. É necessário comparar a configuração do cliente OAuth exato (tipo Web, ID novo e origens JavaScript) com a requisição observada. O proprietário já confirmou origens salvas: não presumir que não salvou nem atribuir conclusivamente à propagação sem inspecionar o cliente.

## Origem aceita pelo Google

Após a última confirmação do usuário, nova verificação em navegador isolado recebeu HTTP 200 de /gsi/client, /gsi/style e /gsi/button, sem erro de origem. Confirmados novo Client ID e Referer da origem http://localhost:5174. O bloqueio de origem não se reproduziu. Falta o usuário concluir a escolha/consentimento da conta e verificar a sessão no aplicativo; carregar o botão oficial não comprova login/cadastro completo.
