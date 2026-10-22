# Frontend — análise após o pull do backend

Data: 22/10/2026. Backend: `main`, commit `83575fc` (`feat(database): add coordinates to localization`). Este documento registra a análise feita antes da segunda ordem. As integrações do comprador foram implementadas posteriormente no frontend; o estado atual e as evidências estão em [integração do comprador](buyer-api-integration.md). Nenhuma operação real de conta, documento ou pagamento foi executada nesta verificação.

## Possibilidades para a próxima ordem

| Frente | Suporte encontrado | O que falta no frontend / ressalvas |
| --- | --- | --- |
| Catálogo real com fotos | `GET /product`, `GET /product/:id` retornam `photos: [{ id, photo }]`, com imagem em base64. | Adaptar tipos, galeria e estados de carregamento/erro/vazio; substituir o exemplo sem inventar fornecedor/distância. Confirmar formato MIME das imagens. |
| Publicação e edição com fotos | Criação/edição de produto aceitam multipart `photos`; há adição, substituição e remoção de fotos. | Adaptar envio/galeria. A API usa JWT, mas os handlers revisados não restringem publicação a empresas nem verificam propriedade do produto: corrigir isso no backend antes de declarar a função pronta. |
| Consulta/edição do próprio perfil | `GET /user/:id` e `PUT /user/:id`, com JWT e checagem de titular/admin. Campos editáveis: `name`, `cellphone`, `birthday`, `photo`. | Trocar os helpers atuais que chamam `/user/me` e `/user/profile`, inexistentes nesta versão. Endereço/CPF/CNPJ não são editáveis nessa rota. A consulta não retorna foto, apesar do upload existir. |
| Recuperação e troca de senha | `POST /user/password/forgot`, `POST /user/password/reset`, `PATCH /user/password`, `PATCH /user/password/first-access`. | Criar telas, validação e retorno de falhas. O login retorna `mustChangePassword`. O e-mail aponta para `/redefinir-senha`; conferir configuração de URL/e-mail. Não registrar ou persistir tokens de recuperação/senhas. |
| Login com Google | `POST /user/login/google` verifica ID token com `GOOGLE_CLIENT_ID`. | Integrar botão após confirmar configuração do provedor e migração do banco. A rota não prova integração em execução. |
| Login com LinkedIn | URL de autorização e callback GET/POST implementados. | Exige configuração externa. O backend gera `state`, mas o callback revisado não o verifica; também há fallback que apenas decodifica ID token. Corrigir/verificar antes de integração real. |
| Exclusão da própria conta | `DELETE /user/:id`, autenticado e limitado ao titular/admin. | Tela de confirmação, falhas por vínculos e encerramento da sessão; aguardar decisão sobre a funcionalidade. |

## Ainda não suportado pelo fluxo completo

- **Reservas, pagamentos e histórico de negociações:** continuam sem rotas no router principal. Permanecem demonstração no marketplace.
- **Mapa/distância real:** latitude/longitude foram adicionadas ao schema, mas o serviço de localização revisado não recebe/salva esses campos nem oferece leitura pública. A presença das colunas não habilita um mapa funcional.
- **Chat:** o handler Socket.IO apenas permite entrar em sala; não implementa autenticação nem envio/recebimento de mensagens. CORS do socket permanece limitado a `http://localhost:3000`.
- **Documentos:** as rotas autenticadas de consulta/criação revisadas não checam titularidade. Não conectar a telas normais antes de revisão/correção no backend.
- **Notificações e indicadores ambientais:** nenhuma rota correspondente foi encontrada no router principal.

## Evidências e limites

Arquivos revisados no backend: router principal, rotas de usuário/produto/documento/localização, respectivos controllers, serviços de produto/localização, `chatSocket.js` e schema SQL. No frontend: helpers Axios, login e dashboard.

O pull foi `--ff-only`. Antes de restaurar os três arquivos locais do backend, foi guardado um patch recuperável em `.verification.local/backend-before-pull.patch` no frontend, ignorado pelo Git. Backend sem alterações locais após o pull. Nenhum commit ou push foi realizado.

Após a segunda ordem, catálogo/fotos, perfil, senhas, primeiro acesso e exclusão foram conectados no frontend. Google foi preparado e permanece indisponível sem configuração. A análise histórica da tabela não substitui o [relatório atual](buyer-api-integration.md).
