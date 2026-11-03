# Pendências da API para o comprador — 03/11/2026

> Atualização posterior em 03/11/2026: o usuário autorizou alterações na API, exceto LinkedIn e pagamento por cartão. Leitura autenticada da foto, alias SQL das conversas e autorização dos itens de compra foram corrigidos localmente e verificados com API/MySQL/Socket.IO reais. A foto agora é recuperada após reload/novo login e a lista alternativa local de conversas foi removida. As descrições abaixo registram o diagnóstico anterior; consulte `api-contract.md` para o contrato atual. Sem commit/push destas novas alterações.


Diagnóstico somente leitura sobre o checkout local da API `6543cd9`. Este documento registra o que deve ser encaminhado ao responsável pelo backend. Nenhum arquivo da API ou registro/estrutura do banco foi alterado nesta tarefa.

## 1. Leitura da foto de perfil

- Fonte: `src/controllers/userController.js`, funções `updateUser` e `getUserById`.
- O PUT aceita e grava o upload `photo`, porém as consultas usadas nas respostas GET/PUT não selecionam a foto.
- Impacto: o frontend mostra a imagem confirmada enquanto navega no app, mas não consegue recuperá-la após reload/novo login.
- Correção necessária na API: disponibilizar leitura autenticada da imagem salva, autorizada para o titular/admin, e documentar formato/MIME. Pode ser uma resposta de perfil ou uma rota de imagem autenticada a definir pelo proprietário; nenhuma rota nova foi presumida pelo frontend.
- Critério de aceite: salvar uma imagem, recarregar e entrar novamente; o cliente recebe a imagem persistida sem guardar foto no armazenamento do navegador. Conta diferente não acessa a imagem sem permissão.

## 2. Erro SQL na lista de conversas

- Fonte: `src/services/conversationService.js`, função `listConversationsForUser`.
- O SELECT usa `BIN_TO_UUID(other.id_user) AS otherUserId`; o JOIN declara `otherCp`, não `other`.
- Correção pontual a revisar pelo responsável: usar a referência ao participante `otherCp.id_user` nesse SELECT.
- Impacto: GET `/conversation/` e o evento `load_conversations` podem falhar. A lista recente da sessão usada pelo frontend não substitui a listagem completa nem os contadores do servidor.
- Critério de aceite: listar conversas próprias por REST/Socket.IO, incluindo lista vazia e participantes válidos; conferir contadores e impedir acesso de não participantes.

## 3. Autorização das rotas de itens de compra

- Fontes: `src/routes/modules/shoppingProductRoutes.js`, `src/controllers/shoppingProductController.js` e seu service.
- Há verificação de JWT, mas os handlers consultam itens/compra sem aplicar identidade ou papel do solicitante ao escopo dos resultados.
- Correção necessária: o backend deve validar titularidade/participação ou permissão administrativa em cada consulta antes de retornar os itens.
- O comprador web não usa essas rotas como alternativa. Mantém as rotas próprias de shopping que verificam o comprador.
- Critério de aceite: testes negativos entre contas diferentes e testes de acesso permitido conforme a regra do produto.

## O que não deve ser confundido com erro pendente

- **Banco local:** consultas somente leitura em information_schema confirmaram `localization.latitude`, `localization.longitude` e `conversation_participant`. O relato histórico de ausência está desatualizado; não solicitar essas migrações com base naquele relato.
- **Nome/celular/nascimento:** persistência e releitura verificadas com a API real no teste de perfil. Não reproduziram o problema de recuperação da foto.
- **E-mail do perfil:** somente leitura por contrato, sem alteração permitida no PUT atual.
- **ViaCEP:** integração externa direta do frontend; endereço final é salvo na API. Não é necessário inventar uma rota ViaCEP no backend para o fluxo atual funcionar.

## Trabalho fora desta entrega

- **Google e LinkedIn:** não implementar por instrução do usuário.
- **Cadastro de cartões:** já está sendo desenvolvido em outra frente, conforme informado pelo usuário. Existe POST `/card/create`; não duplicar implementação nem confundir cadastro/tokenização com pagamento concluído.
- **Pagamento efetivo:** precisa de contrato operacional do gateway/cobrança e confirmação pelo servidor antes de integrar aprovação, Pix/cartão ou comprovante. Cadastro de cartão isoladamente não comprova esse fluxo. Registrar como capacidade futura, não como falha do formulário de perfil.
- **Avaliações, QR de retirada, mapas/distância e indicadores ambientais:** capacidades futuras não apresentadas como operacionais no comprador. Exigem definição de escopo/contrato antes de implementação; não simular seus resultados.

## Validação disponível

As correções de foto/cabeçalho foram verificadas com API, MySQL e Socket.IO reais em banco descartável separado, além de verificações de interface em 375/768/1280px. O banco descartável foi removido pelos testes; o banco do projeto não foi alterado. Build passou e lint focado passou. O lint global mantém 1 erro e 1 aviso preexistentes em Notification.tsx. Detalhes em `auditoria-perfil-integracoes.md`.
