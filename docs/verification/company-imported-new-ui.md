# Telas de telas-empresa na new-ui

Escopo: materiais, publicação, mapa, indicadores ambientais, negociações e perfil importados de `origin/leonardo/telas-empresa`. Mantidos o menu verde, fundo marfim, tipografia, fotografias locais e listas operacionais já adotados na `new-ui`.

A prévia em `/previa/dashboard/empresa` agora permite navegar por todas essas seções sem sessão ou API. Mapa, impacto, negociações e perfil usam os mesmos componentes das rotas autenticadas. Os aliases de materiais, publicação e conta direcionam às respectivas telas atuais. As alterações de materiais e do nome fictício do perfil permanecem em memória ao navegar; recarregar restaura os exemplos. O celular pode ficar vazio na simulação. Rotas reais mantêm autenticação, contratos existentes e restrições de publicação.

## Evidências

- `npm run lint`: código 0.
- `npm run build`: código 0; permanece o aviso de tamanho do chunk opcional da cena 3D.
- Edge headless: 32 combinações de tela/largura (320, 390, 768 e 1440 px), um título principal e uma estrutura de navegação por tela, sem transbordamento horizontal da página.
- Navegação ativa; filtros, vazio, período inválido e detalhes das negociações; busca/vazio do mapa; alternância dos indicadores; validação e atualização fictícia do perfil; persistência dos exemplos de perfil/material ao navegar; aliases de conta, materiais e publicação.
- Nenhuma chamada de API, nenhum erro JavaScript e nenhum dado salvo no armazenamento do navegador durante a prévia. Tiles externos bloqueados deliberadamente para verificar o estado de falha do mapa; a lista permanece utilizável.
- Rotas autenticadas verificadas com respostas efêmeras interceptadas: oito combinações de rota/largura, redirecionamento de visitante para login, falha de carregamento do perfil e nova tentativa. Confirmado que o perfil real mantém o botão de salvar, sem controles de simulação.
- Não há suíte de testes configurada. Verificação executada com script temporário de navegador; nenhum backend autenticado real foi exercitado.

## Capturas da prévia

| Tela | Desktop | Celular |
|---|---|---|
| Mapa, com falha de tiles simulada | [Ver](company-imported-explorar-desktop.png) | [Ver](company-imported-explorar-mobile.png) |
| Indicadores | [Ver](company-imported-indicadores-desktop.png) | [Ver](company-imported-indicadores-mobile.png) |
| Negociações | [Ver](company-imported-negociacoes-desktop.png) | [Ver](company-imported-negociacoes-mobile.png) |
| Perfil | [Ver](company-imported-perfil-desktop.png) | [Ver](company-imported-perfil-mobile.png) |
