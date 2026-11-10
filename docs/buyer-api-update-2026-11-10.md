# Integração do comprador — 10/11/2026

API observada: `backend-RF` main `192bbaf`. Frontend de partida: `Rafael/Sprint2----Comprador`, `f1c7bcd`. Escopo: frontend do comprador; backend, empresa, LinkedIn e pagamento por cartão preservados. Nenhum commit/push realizado.

## Comportamento entregue

- Detalhe da reserva: pagamento Pix com confirmação antes de criar, código/QR retornados pela API, recuperação de checkout ao recarregar, consulta e solicitação de cancelamento pelas rotas atuais. Reservas gratuitas não oferecem cobrança. A situação aprovada depende da resposta do servidor; QR é ocultado em estado final ou análise. Ambientes de teste são identificados. Sem retry de criação após resposta incerta.
- Avaliações: seleção de compra concluída, fornecedor derivado dos itens reais da reserva, nota/comentário, criação/edição/exclusão próprias e visualização de avaliações recebidas. Nenhum UUID de fornecedor é digitado manualmente. A API aceita uma avaliação por avaliador/compra.
- Disputas: abertura ligada a reserva real, seis motivos aceitos pela API, acompanhamento de situação/resolução e edição de disputa própria aberta. Sem ações administrativas.
- Impacto ambiental: consulta de estimativas próprias e solicitação de cálculo por regra fixa para compras concluídas. Valores vêm da API; sem números estáticos, IA ou certificação ambiental alegada.
- Empresas: consulta autenticada, busca por empresa/cidade/bairro/categoria, link para mapa externo com coordenadas aproximadas e filtro do catálogo por fornecedor. Sem GPS, distância inventada ou endereço completo exposto.
- Endereços: ViaCEP preservado e coordenadas omitidas por padrão para permitir a geocodificação da API. O usuário pode optar por coordenadas manuais. A consulta do CEP ocorre ao sair do campo, evitando o uso do estado anterior do CEP.
- Notificações: filtros e navegação para pagamentos, avaliações e disputas; pagamento é resolvido na API para descobrir a reserva correta.

## Testes e evidências

`npm run lint` e `npm run build` executados no frontend. O build mantém aviso de tamanho de bundle, sem impedir a geração.

Verificação reproduzível local: `.verification.local/verify-buyer-api-update.cjs`, com config `.verification.local/buyer-update.vite.mts`. Esses arquivos são ignorados pelo Git. Backend real em processo separado; MySQL exclusivo `rf_buyer_update_*`, sem copiar usuários reais, com schema/migrações aplicados somente nesse banco descartável. O seed administrativo padrão do schema é excluído do teste. Banco do projeto e arquivos de ambiente preservados. Geocodificação desativada por NODE_ENV=test; ViaCEP externo interceptado; PAYMENT_PROVIDER=simulated e split_payment=false definidos somente no processo de teste. Não são usadas credenciais do Mercado Pago para cobranças.

Cenários exercitados:

1. Pix criado uma vez, recuperado após reload e identificado como simulado; nenhum total/cartão/vendedor enviado pelo navegador.
2. Reserva gratuita sem botão de pagamento.
3. Criação, edição e exclusão de avaliação contra HTTP/MySQL reais.
4. Disputa criada e editada sem controles de administração.
5. Impacto calculado pela API a partir do peso da fixture.
6. Empresas consultadas e catálogo filtrado por fornecedor; mapa externo usa coordenadas aproximadas.
7. Endereço salvo omitindo coordenadas, sem inserir ponto zero como substituto.
8. Notificações abrem pagamento, disputa e avaliação recebida; avaliação alheia não oferece edição.
9. Novas telas em 375, 768 e 1280 px, sem overflow horizontal ou erros JavaScript.
10. Criação Pix com falha de rede não é reenviada automaticamente; UI bloqueia nova criação enquanto a tentativa não foi esclarecida.
11. Erro 503 seguido de recuperação pelo botão de retry; erro 403 não gera estimativas fictícias.
12. Sincronização/cancelamento recusados pelo provedor simulated não geram sucesso local; aprovação pela API de teste é relida e remove o QR Pix. O aviso de pagamento confirmado gerado pela API também permanece na lista junto às demais notificações.
13. Uma reserva cancelada não exibe um QR pendente antigo nem oferece nova cobrança.

## Limites

Status: integrado com os contratos locais, com validação financeira externa pendente. Pix foi exercitado com o provedor simulado da própria API, sem dinheiro real. Sincronização/cancelamento reais dependem do Mercado Pago; a API não concilia o provedor simulated por essas rotas, portanto os testes verificam esse erro sem anunciar sucesso. Aprovação é exercitada pela rota de simulação somente no teste e depois relida no frontend, sem botão de simulação no produto.

As migrações/configurações necessárias à API local de uso do proprietário não foram aplicadas ou alteradas por esta tarefa. Se faltarem tabelas/configuração, a interface apresenta erro e retry; o frontend não pode completar essa preparação no backend. Nenhuma alegação de validação externa de Pix, OAuth, OpenStreetMap ou SMTP.

Inspeção final somente de metadados confirmou que o banco local configurado ainda não tem `payment_gateway`, `payment_distribution`, `payment_split` e `payment_seller_account`. Portanto, o Pix nessa API local depende das migrações `migration_payment_gateway.sql`, `migration_payment_distribution.sql`, `migration_payment_split.sql` e `migration_payment_account_disconnect.sql`, além da configuração do provedor, antes de uso real. Essas migrações foram exercitadas apenas no banco descartável do teste; não foram aplicadas ao banco do proprietário. Não substituir migrações pela execução do schema destrutivo de inicialização.

O endurecimento de notificações presente em outra branch não foi presumido integrado: a main local observada continua com lista em array e os filtros read/type. Não foram inventados parâmetros de paginação ou endpoints novos.
