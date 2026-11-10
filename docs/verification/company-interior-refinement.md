# Refinamento das telas internas da empresa

Alterações locais na `new-ui`, após o ponto de retorno `ee87a71` já enviado ao remoto. A `main` permanece no mesmo commit.

- Publicação e edição: seções numeradas, atalhos de navegação e prévia local do anúncio acompanhando nome, categoria, foto e tipo/valor.
- Detalhes: galeria com seleção de fotos, preço ou doação em destaque e quadro de quantidade/peso.
- Indicadores: destaque da métrica principal e superfícies mais definidas para os gráficos. Valores continuam explicitamente demonstrativos.
- Negociações: abas mais visíveis, ícones de materiais e acabamento da tabela, preservando a consulta prática.
- Mapa: busca com painel verde, contraste legível no campo e seleção mais clara das empresas de exemplo.
- Perfil: identidade em verde, formulário marfim e preferências visualmente agrupadas. Campos e integração existentes preservados.

## Evidências

- `npm run lint` e `npm run build`: código 0. Permanece o aviso conhecido de tamanho do chunk opcional de 3D.
- Edge headless: 32 combinações de tela/largura (320, 390, 768 e 1440 px), com um título principal, uma navegação e sem transbordamento horizontal da página. Mapa novamente conferido em celular e desktop após o ajuste de contraste.
- Fluxos exercitados: validação do formulário, prévia acompanhando nome/valor, doação removendo preço, seleção de duas fotos, publicação fictícia, troca da foto principal, cancelar e confirmar exclusão fictícia, situação/período inválido/detalhes das negociações, alternância dos indicadores, busca/vazio do mapa, validação e atualização fictícia do perfil e redirecionamento de visitante na rota protegida.
- Nenhuma chamada de API na prévia, nenhuma mutação real e nenhum erro JavaScript observado nos fluxos concluídos. Capturas usam dados demonstrativos e campos de contato vazios. Tiles do mapa bloqueados intencionalmente para conferir a apresentação sem cartografia carregada.
- Não há suíte de testes configurada. O script temporário de navegador foi removido. Backend autenticado real não exercitado.

## Capturas

| Tela | Desktop | Celular |
|---|---|---|
| Publicação | [Ver](company-refined-publicar-desktop.png) | [Ver](company-refined-publicar-mobile.png) |
| Edição | [Ver](company-refined-editar-desktop.png) | [Ver](company-refined-editar-mobile.png) |
| Detalhes | [Ver](company-refined-detalhes-desktop.png) | [Ver](company-refined-detalhes-mobile.png) |
| Mapa | [Ver](company-refined-mapa-desktop.png) | [Ver](company-refined-mapa-mobile.png) |
| Indicadores | [Ver](company-refined-impacto-desktop.png) | [Ver](company-refined-impacto-mobile.png) |
| Negociações | [Ver](company-refined-negociacoes-desktop.png) | [Ver](company-refined-negociacoes-mobile.png) |
| Perfil | [Ver](company-refined-perfil-desktop.png) | [Ver](company-refined-perfil-mobile.png) |
