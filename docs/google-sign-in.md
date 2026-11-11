# Acesso com Google

O frontend usa Google Identity Services. O ID token é enviado à API, que valida assinatura, validade e audience. O frontend não usa Client Secret nem persiste a credencial Google em URL ou armazenamento.

## Configuração persistente

- `VITE_GOOGLE_CLIENT_ID`: Client ID público OAuth de Aplicativo da Web, em `.env.local` e no projeto `reaproveita_franca` da Vercel. A variável da Vercel é persistente entre deploys.
- `GOOGLE_CLIENT_ID`: o responsável pelo backend precisa configurar o mesmo Client ID na API e reiniciá-la. Configurar somente a Vercel não configura a API externa.
- Autorize no Google Cloud as origens `http://localhost:5174`, `http://127.0.0.1:5174` e `https://reaproveitafranca.vercel.app`. Em previews ou outras origens, o botão conduz ao domínio oficial antes de iniciar o Google; não é necessário cadastrar cada URL temporária.
- O popup usa callback JavaScript; este fluxo não precisa de URI de redirecionamento.

[Referência oficial do Google](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

## Fluxos e recuperação

`POST /user/login/google` faz login e cria compradores quando necessário. Empresas novas selecionam sua conta Google e completam documentos, contato e endereço antes de `POST /user/create/empresa/google`. Uma identidade Google não converte o tipo de uma conta existente.

Fechar o popup não bloqueia o formulário. Falhas de rede/API liberam novas tentativas em `finally`. A espera só impede duplicação durante uma requisição em andamento. Se o SDK não carregar, há uma ação para tentar novamente; e-mail e senha continuam disponíveis. O token usado no cadastro empresarial fica apenas em memória e sua expiração exige nova seleção da conta, preservando os demais dados.

## Validação

Os contratos verificam expiração e preenchimento de claims, além dos campos obrigatórios da empresa. A integração usa API e MySQL locais em banco descartável, simulando exclusivamente a verificação Google naquele processo. Esses testes não substituem o teste de consentimento real com as origens autorizadas, Client ID válido e backend configurado.

## Erro 400 origin_mismatch

Esse erro é uma recusa do Google antes da autenticação da API: a origem do navegador não foi autorizada no Client ID utilizado. No cliente OAuth correto, salve as três origens acima, sem caminhos e sem barra final. Não coloque `/login`, o endereço do backend nem curingas. As alterações podem demorar para propagar. O responsável precisa ter acesso ao projeto Google Cloud; se houver exigência de MFA, deve concluí-la. A aplicação não pode ignorar essa verificação do Google.

## Erro 503 da API

`Login Google não configurado.` indica falta de `GOOGLE_CLIENT_ID` ou da configuração de assinatura no processo da API. A variável `VITE_GOOGLE_CLIENT_ID` do frontend não configura o backend. O responsável deve definir o mesmo Client ID público em `GOOGLE_CLIENT_ID` na API e reiniciá-la, preservando os demais valores da `.env`. `Google temporariamente indisponível.` é outra resposta 503, relacionada à comunicação da API com o Google.

O frontend distingue essas respostas e o limite de tentativas 429, libera o formulário após a falha e não exibe botão adicional de recarregar o Google. O botão oficial continua disponível para uma nova tentativa. Bloqueios de chamadas de log do Google pelo navegador são distintos dessas respostas da API.
