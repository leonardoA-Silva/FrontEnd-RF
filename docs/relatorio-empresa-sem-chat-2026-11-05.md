# Relatório — Área da empresa, sem alterações no chat

Data: 05/11/2026. Branch: `leonardo/telas-empresa`, a partir de `fad0dab`.

## O que foi concluído

### Mapa com anúncios reais

A rota `/mapaEmpresas` agora consulta os anúncios disponíveis na API e suas localizações autorizadas. A lista permite buscar por material, categoria, cidade ou bairro. Os marcadores e os detalhes mostram dados dos anúncios, sem inventar nomes de empresas, distâncias ou disponibilidade.

- Somente anúncios disponíveis e com estoque positivo entram na consulta.
- Coordenadas ausentes não recebem posições fictícias; a interface informa quantos anúncios não puderam ser posicionados.
- Falhas em parte das consultas deixam claro que a lista está incompleta e permitem tentar novamente.
- As consultas de localização têm concorrência limitada e são canceladas ao sair da tela.
- O estado do mapa conserva apenas coordenadas aproximadas e região. Mesmo quando a API autoriza endereço completo ao proprietário, rua, número e CEP não são copiados para o estado do mapa.
- Os detalhes apresentam fotos, descrição, categoria, conservação, quantidade, peso e valor ou indicação de doação.
- A prévia de desenvolvimento mantém seus exemplos identificados, separados dos dados reais.

O fundo cartográfico permanece no OpenStreetMap, já utilizado pelo projeto. Não foram adicionados serviços de geocodificação ou dependências.

### Notificações vinculadas a disputas

Notificações com referência válida a `dispute` agora abrem a disputa correspondente em `/dashboardEmpresa/disputas?disputa=...`. A leitura é confirmada pela API antes da navegação.

O detalhe pode ser acessado diretamente ou recarregado. Fechá-lo remove somente o parâmetro da disputa. IDs inválidos, registros removidos e referências sem acesso mostram uma mensagem controlada e a opção de voltar à lista; não revelam dados de outras contas. A autorização continua sendo da API, cuja listagem limita os registros ao usuário autenticado.

### Validação com dados persistidos

Impacto ambiental e disputas foram conferidos com registros reais no banco local, além das validações anteriores com listas vazias. Isso comprova a consulta e apresentação dos registros, não um fluxo completo de pagamento, conclusão de negociação ou administração.

## Evidências

Verificação local com Edge/Playwright, API e MySQL reais, usando as contas sintéticas já existentes e autenticação com seus próprios perfis. Segredos e tokens ficaram em memória.

1. Foram criados dois endereços sintéticos e dois anúncios descartáveis: um com coordenadas e outro sem coordenadas.
2. O mapa mostrou o anúncio com localização, omitiu o outro e informou a ausência de coordenadas. A saída do serviço do frontend confirmou arredondamento e ausência dos campos de endereço completo.
3. Busca, detalhe do material e larguras de 1440 e 390 px foram exercitados.
4. Uma reserva descartável foi criada pela API com o comprador sintético e aceita pelo vendedor pela rota existente. O detalhe da reserva retornou **403** ao vendedor, e a listagem do vendedor não incluiu essa venda, confirmando o bloqueio descrito abaixo.
5. Uma disputa foi aberta pela API com o comprador. A notificação real da empresa abriu seu detalhe, registrou a leitura no banco e funcionou após recarregar.
6. Apenas a reserva descartável foi preparada diretamente no banco como concluída, para permitir criar um impacto por `regra_fixa` pela API. Não foi inventada uma conta administrativa nem implementada conclusão de reserva no frontend.
7. O painel de impacto exibiu o registro calculado pelo servidor. A disputa e o impacto foram inspecionados em desktop e celular.
8. Falhas HTTP 500 na lista de produtos e nas localizações foram simuladas separadamente para verificar erros seguros, lista incompleta e nova tentativa. Esses cenários não são apresentados como falhas reais do backend.
9. Não houve erro JavaScript nem rolagem horizontal nas verificações. A execução não fez requisições de chat/Socket.IO.
10. Os anúncios, endereços, reserva, disputa, impacto e notificações gerados para esta verificação foram removidos ao final. Nenhum dado de cliente real foi utilizado.

Capturas em `docs/verification/`: `company-map-real-*`, `company-impact-populated-real-*` e `company-dispute-populated-real-*`.

## O que permanece bloqueado pela API

| Pendência | Motivo confirmado | Ajuste necessário no backend |
|---|---|---|
| Publicar novos materiais | A criação exige JWT, mas não foi estabelecida a restrição exclusiva ao perfil de empresa | Aplicar a regra de perfil no servidor e manter validação de propriedade/localização |
| Consultar reservas recebidas | A listagem retorna compras feitas pela conta; o detalhe permite comprador/admin e retorna 403 ao vendedor | Disponibilizar consulta de reservas recebidas e detalhes com autorização do vendedor |
| Histórico real de vendas/negociações | Depende da mesma consulta autorizada de vendas recebidas | Retornar os registros e situações pertinentes ao vendedor |
| Abrir reservas pelas notificações | Falta um detalhe autorizado que a empresa possa consultar | Resolver o acesso do vendedor antes de habilitar o destino e as ações na interface |

Aceitar/recusar uma reserva de vendedor único já existe na API, mas isso, sozinho, não completa uma tela segura de reservas recebidas. Não foram usados privilégios administrativos, referências de notificações ou compras próprias da empresa como substituto da consulta ausente.

## Limites e entrega

Nenhum componente ou transporte de chat foi alterado. Mudanças na central de notificações tratam somente referências de disputas; o comportamento existente de mensagens foi preservado. API, mobile e outras branches não receberam alterações.

Verificações finais: `npm run lint` aprovado sem erros/avisos; `npm run build` aprovado, mantendo o aviso já existente de tamanho do chunk 3D; `git diff --check` aprovado. A prévia do mapa também foi exercitada em 390 px, sem chamadas à API do projeto nem rolagem horizontal. Não há uma suíte de testes configurada no frontend; a validação descrita foi executada por um roteiro local de integração.

Não foi solicitado commit ou push destas alterações nesta etapa.
