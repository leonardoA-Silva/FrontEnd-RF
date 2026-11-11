# Vitrine compartilhada — empresa e comprador

A biblioteca da empresa e a seção Explorar do usuário agora renderizam o mesmo `MaterialStorefront`, incluindo banner, busca, atalhos de categorias, filtros, ordenação, cards, paginação e movimento. A prévia do comprador usa o mesmo catálogo fictício da prévia da empresa.

As ações de publicação, edição e exclusão permanecem exclusivas da gestão dos anúncios da empresa. O comprador abre os detalhes demonstrativos do material, com categoria, condição, valor ou doação, quantidade, peso e disponibilidade. Nenhuma compra, pagamento ou reserva real foi implementada. A consulta real do comprador continua explicitamente indisponível, com exemplos opcionais.

Validação no Edge: empresa e usuário em 320, 390, 768 e 1440 px, com movimento normal e reduzido (16 combinações). Conferidos: igualdade do conteúdo dos cards, ausência de ações de gestão no comprador, filtros móveis, busca sem resultado e limpeza, ordenação, filtro de doação, detalhes e fechamento, ocultação/reativação dos exemplos e ausência de transbordamento horizontal ou erros de execução. Sem animações ativas na preferência reduzida.

`npm run lint` e `npm run build`: aprovados. Aviso existente de tamanho do módulo 3D da home permanece.

Capturas: `dashboard-motion/vitrine-{empresa,usuario}-{390,1440}.png`.

Sem commit ou push nesta etapa; alterações locais na branch `new-ui`.
