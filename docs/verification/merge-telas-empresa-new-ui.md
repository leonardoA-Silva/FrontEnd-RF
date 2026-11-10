# Integração de telas-empresa na new-ui — 03/11/2026

Origem: `origin/leonardo/telas-empresa`, commit `18f6edd`. Destino: `new-ui`.

Merge com preservação da home, login, cadastro e workspace da new-ui. Importadas as telas de mapa, gestão de materiais, indicadores, histórico, perfil e Sobre Nós, seus componentes e a prévia local. O hook de usuário mantém previewName e incorpora userId/atualização de perfil. Dependências combinam o conjunto existente da new-ui com Leaflet e seus tipos já usados na origem.

A rota de publicação importada redireciona para o formulário existente da new-ui, preservando as restrições de mutação em modo real registradas em docs/api-contract.md. Indicadores, histórico e posições do mapa continuam demonstrativos; não representam integração nova com a API. A prévia local usa identificadores efêmeros compatíveis com o parser do workspace.

Validação nesta integração:

- `npm ci --ignore-scripts --no-audit --no-fund`: concluído após liberar o servidor Vite que bloqueava um binário no Windows.
- `npm run lint`: código 0.
- `npm run build`: código 0, com aviso de chunks acima de 500 kB.
- `git diff --cached --check`: sem erros.
- Navegador Microsoft Edge headless, larguras 390 e 1440 px: home, login, seleção de cadastro, dashboard, gestão de materiais, redirecionamento de publicação, indicadores, histórico, perfil, mapa, Sobre Nós e prévia da empresa. Todas renderizaram um h1 e sem transbordamento horizontal da página; nenhum erro JavaScript observado.
- APIs interceptadas com dados efêmeros e contatos vazios. Nenhuma conta real foi acessada ou alterada. Não há suíte de testes configurada; integração autenticada com backend real não foi exercitada.

A main local permaneceu no commit `f688c30`.
