# Biblioteca de materiais em formato de vitrine

A biblioteca da empresa substitui a tabela por cards com fotografia, categoria, conservação, valor ou doação, quantidade, peso e situação. Mantém publicação, detalhes, edição e confirmação de exclusão. Busca, categorias, venda/doação, situação e ordenação funcionam sobre os mesmos materiais já carregados. Não altera contratos de API, permissões ou restrições das mutações reais.

## Verificação

- `npm run lint` e `npm run build`: código 0; aviso conhecido do chunk opcional de 3D no build.
- Edge headless em 320, 390, 768 e 1440 px: grade responsiva, um título principal, sem transbordamento horizontal da página.
- Busca, resultados vazios, limpar filtros, categorias, venda/doação, ordenação de valores, anúncios com fotografia primeiro, filtros móveis, detalhes, edição e cancelamento da confirmação de exclusão.
- Rotas reais exercitadas com respostas interceptadas: erro e nova tentativa, inventário vazio, 13 anúncios com paginação de 12 itens, filtro de situação, ausência de foto e preço desconhecido.
- Nenhuma chamada de API na prévia, nenhuma mutação real e nenhum erro JavaScript observado. Sem dependências novas. Nenhum backend autenticado real foi exercitado.
- Não existe suíte de testes configurada; verificações de navegador executadas por script temporário removido após o uso.

[Desktop](library-market-desktop.png) · [Celular](library-market-mobile.png)
