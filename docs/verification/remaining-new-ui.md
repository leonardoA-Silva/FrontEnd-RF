# Telas restantes no visual new-ui — 03/11/2026

## Entrega

- Estrutura autenticada comum com menu verde, fundo marfim, marca editorial, foco visível e menu horizontal rolável em telas estreitas. O item ativo fica visível ao navegar.
- Mapa: busca e lista com fotografias, legenda na paleta da marca, carregamento/falha dos tiles e nova tentativa. OpenStreetMap continua externo; empresas e posições seguem demonstrativas.
- Indicadores: métricas com hierarquia tipográfica e gráficos em tons de verde, sálvia e couro; exemplo opcional explicitamente identificado.
- Histórico: resumo, abas por situação, busca, datas, tabela e detalhes. Mantém exemplos opcionais, validação e estado vazio.
- Perfil: composição de identidade à esquerda e formulário à direita; mesmo GET/PUT protegido e mesmos campos name/cellphone. Notificações e troca de e-mail continuam indisponíveis.
- Sobre Nós: narrativa editorial com fotografia local, proposta e convite para cadastro; versões pública e autenticada.
- Usuário: galeria de materiais, categorias, busca, detalhes em diálogo, reservas e histórico demonstrativos. Exemplos ativados na prévia e opcionais no modo normal. Nenhuma reserva real é criada.
- Entradas duplicadas de materiais/publicação redirecionam para as telas existentes no novo visual, mantendo as restrições de produto em modo real.

Nenhuma dependência adicionada. Home, login, cadastro e contratos de API preservados. Apenas arquivos do frontend foram alterados, na branch new-ui.

## Verificação

- `npm run lint`: código 0.
- `npm run build`: código 0; aviso conhecido de chunks acima de 500 kB.
- `git diff --check`: sem erros.
- Edge headless: 28 combinações de rota/largura (320, 390, 768 e 1440 px), com um h1 e sem transbordamento horizontal da página.
- Exercitados: exemplos dos indicadores, abas/busca/detalhes/período inválido no histórico, busca/vazio do mapa, filtros e seções do usuário, abrir/fechar diálogo e restaurar foco, movimento reduzido, validação/foco/cancelamento do perfil, falha sanitizada e nova tentativa, redirecionamento de visitante sem sessão e exemplos opcionais no painel real de usuário.
- Erro dos tiles do mapa simulado por bloqueio das requisições externas: mensagem, nova tentativa e lista continuam disponíveis. A cartografia externa não foi considerada uma integração de dados reais de empresas.
- Nenhum erro JavaScript observado nos fluxos principais. APIs interceptadas com respostas efêmeras; nenhum envio de alteração foi realizado. Contatos vazios nas capturas. Backend autenticado real não exercitado.
- Não há suíte de testes configurada; as verificações de navegador foram executadas por scripts temporários removidos após o uso.

## Capturas

| Tela | Desktop | Celular |
|---|---|---|
| Mapa | [Ver](new-ui-mapa-desktop.png) | [Ver](new-ui-mapa-mobile.png) |
| Indicadores | [Ver](new-ui-impacto-desktop.png) | [Ver](new-ui-impacto-mobile.png) |
| Histórico | [Ver](new-ui-historico-desktop.png) | [Ver](new-ui-historico-mobile.png) |
| Perfil | [Ver](new-ui-perfil-desktop.png) | [Ver](new-ui-perfil-mobile.png) |
| Sobre Nós | [Ver](new-ui-sobre-desktop.png) | [Ver](new-ui-sobre-mobile.png) |
| Usuário | [Ver](new-ui-usuario-desktop.png) | [Ver](new-ui-usuario-mobile.png) |
