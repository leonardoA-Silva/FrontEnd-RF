# Painel do usuário — coerência visual e movimento

Escopo: Explorar, Reservas e Histórico disponíveis na branch `new-ui`.

- Cards, busca, categorias, filtros, tabelas e títulos seguem os padrões existentes do painel da empresa, preservando verde, marfim e as imagens locais.
- O mesmo hook de movimento da biblioteca anima a entrada e a reorganização dos materiais e registros. Busca por teclado continua imediata.
- Cabeçalhos têm entrada curta; botões respondem ao toque; os dois diálogos usam as mesmas durações dos diálogos de empresa. Redução de movimento desativa essas transições e o zoom das imagens.
- Navegação inferior no celular preservada. Dados continuam explicitamente demonstrativos; nenhuma integração ou ação de reserva foi adicionada.

Verificação no Edge: 24 combinações (3 seções × 4 larguras: 320, 390, 768 e 1440 px × movimento normal/reduzido). Busca sem resultado, limpeza de filtros, categoria, abertura dos dois tipos de detalhes, fechamento por Escape e ausência de transbordamento horizontal e erros de execução foram conferidos. Nenhuma animação ativa no modo reduzido.

`npm run lint` e `npm run build`: aprovados. Mantém-se o aviso existente de tamanho do módulo 3D da home.

Capturas em `dashboard-motion/usuario-{explorar,reservas,historico}-{390,1440}.png`.

Alterações locais, sem commit ou push nesta etapa.
