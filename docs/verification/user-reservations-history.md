# Reservas e histórico do usuário — refinamento visual

As abas do painel do usuário usam cabeçalho compacto, resumo com valores derivados dos exemplos, busca por material e filtro por período. Reservas aparecem em cartões com status textual, quantidade, data e etapas ilustrativas; histórico usa linha do tempo mensal com detalhes em diálogo. A navegação entre seções volta ao topo, e alternar exemplos reinicia os filtros. Os exemplos são compartilhados com o resumo da página de exploração.

Os registros continuam exclusivamente demonstrativos, sem requisições de API, persistência, cancelamento de reserva, confirmação de retirada ou pagamento.

Verificação em Edge headless: reservas e histórico em 320, 390, 768 e 1440 px, sem transbordamento horizontal e com um h1 por tela. Exercitados filtros de situação/busca/período, limpar filtros, estado vazio, detalhes, Escape, restauração do foco, ocultar/mostrar exemplos e retorno à exploração. Nenhuma chamada de API ou erro JavaScript observado. Não há suíte de testes configurada; o script temporário de navegador foi removido.

Capturas: [reservas desktop](usuario-reservas-desktop.png), [reservas mobile](usuario-reservas-mobile.png), [histórico desktop](usuario-historico-desktop.png), [histórico mobile](usuario-historico-mobile.png).

`npm run lint` e `npm run build`: ambos concluídos com código 0 na versão final. Build mantém o aviso conhecido de chunks acima de 500 kB. `git diff --check`: sem erros. Alterações permanecem na new-ui; main intacta.

## Refinamento para uso diário

A organização anterior de cartões com etapas e linha do tempo foi substituída por uma lista operacional. Reservas e histórico de usuário agora têm título direto, aviso compacto de exemplos, busca, filtros e tabela comparável no desktop, com blocos compactos no celular. Etapas ilustrativas, slogans e métricas grandes foram removidos dessas seções. Negociações da empresa seguem a mesma organização, com datas sob um filtro expansível e detalhes em diálogo. O menu e o título da empresa usam a nomenclatura Negociações.

Verificação em Edge headless: 12 combinações de rota/largura em 320, 390, 768 e 1440 px, sem transbordamento horizontal. Filtros de situação, busca e período; período inválido; limpar filtros; detalhes, Escape e restauração do foco; exemplos ligados/desligados e estados vazios passaram. Nenhuma chamada de API ou erro JavaScript observado. A consulta real permanece indisponível nessas seções.

Capturas atualizadas: [reservas desktop](operacao-reservas-desktop.png), [reservas mobile](operacao-reservas-mobile.png), [histórico desktop](operacao-historico-desktop.png), [histórico mobile](operacao-historico-mobile.png), [negociações desktop](operacao-negociacoes-desktop.png) e [negociações mobile](operacao-negociacoes-mobile.png).

Validação final desta revisão: `npm run lint` e `npm run build` com código 0, além de `git diff --check` sem erros. O aviso de bundle grande permanece restrito ao chunk 3D já existente. Não há suíte de testes configurada; as verificações de navegador foram feitas com script temporário removido após a execução.
