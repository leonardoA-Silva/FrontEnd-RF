# Telas restantes da empresa

Objetivo: completar as quatro telas ausentes da referência na branch `leonardo/telas-empresa`, reutilizando DashboardShell e DESIGN.md. Preservar painel, materiais, publicação e mapa existentes. React, TypeScript, Tailwind e Lucide, sem novas dependências.

- [x] Criar rotas protegidas para indicadores, histórico e perfil; Sobre Nós pública, também acessível pelo painel. Ligar navegação desktop, móvel, menu da conta e atalhos do mapa.
- [x] Indicadores: cartões, evolução e distribuição acessíveis, com estado indisponível e demonstração opcional claramente identificada. Não calcular impacto ambiental a partir de estoque.
- [x] Histórico: filtros locais, estado vazio, tabela responsiva e detalhes de exemplos opcionais. GET /shopping retorna compras do próprio usuário, não vendas da empresa: não usar essa resposta como histórico de vendedor.
- [x] Perfil: GET /user/:id e PUT /user/:id, limitando edição a name e cellphone. Tratar carregamento, validação, sessão inválida, 403, 404, falha e nova tentativa; não persistir contato/documentos. Preferências sem API ficam indisponíveis, sem falsa confirmação.
- [x] Sobre Nós: missão, contexto local e chamada para conhecer materiais/cadastrar, usando imagem já existente no repositório.
- [x] Executar lint e build; verificar navegação, permissões, filtros e formulário em desktop e mobile quando disponível. Registrar limitações de integração e evidência em docs/verification.

Contratos consultados somente para leitura: backend-RF/src/routes/modules/userRoutes.js, controllers/userController.js, routes/modules/shoppingRoutes.js, services/shoppingService.js e routes/apiRoutes.js. Não há rota de métricas ambientais; listagem de negociações recebidas pela empresa requer trabalho no backend. A entrega dessas duas telas é UI-only; exemplos nunca representam dados da conta.
