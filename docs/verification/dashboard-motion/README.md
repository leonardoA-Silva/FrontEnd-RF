# Movimento nas telas da empresa

Implementação local na `new-ui`, preservando o ponto de retorno `ee87a71` enviado ao GitHub. Nenhum novo commit ou push nesta etapa.

## Leitura do pedido e aplicação das skills

Refinamento de movimento em telas de trabalho já aprovadas, sem nova direção visual. `design-taste-frontend` aplicada pelo capítulo de aplicações; `frontend-design` aplicada à preservação de marca, respostas e desempenho, respeitando a exclusão que a própria skill faz de dashboards. `emil-design-eng` orienta duração, interrupção e frequência. Não houve sorteio de outra composição, troca de fonte, nova paleta ou imagem nova. A direção existente é verde-floresta/marfim, com Manrope e Georgia. Intensidade de movimento moderada e deslocamentos curtos, adequados ao uso frequente.

O inventário preservado é: materiais próprios da empresa; fotografias cadastradas ou ausência explícita de foto; venda ou doação; quantidade em unidades; peso em kg; valor do anúncio; situação do material; edição/publicação; perfil; mapa de exemplos; indicadores demonstrativos; negociações demonstrativas. Os totais da biblioteca continuam calculados dos materiais, sem dados novos ou contadores inventados.

Cada tela continua respondendo à sua pergunta: quais materiais estão cadastrados; como cadastrar/editar um anúncio; quais são as características de um material; onde explorar as empresas de exemplo; como visualizar os indicadores demonstrativos; qual é a situação de uma negociação; quais dados do perfil podem ser atualizados.

## Decisões de movimento

| Before | After | Why |
|---|---|---|
| Grade muda de posição imediatamente | Deslocamento dos cards sobreviventes em 190 ms, com cancelamento e retomada do movimento em curso | Preservar a relação entre materiais ao filtrar |
| Todos os resultados reapareceriam a cada busca | Apenas cards novos recebem uma entrada curta; digitação e ações frequentes por teclado permanecem imediatas | Evitar flashes e repetição |
| Gráficos estáticos | Máscara revela a série original em até 500 ms quando visível; segmentos do anel recuperam opacidade | Mostrar a atualização sem alterar a geometria ou os valores |
| Campo de preço e período surgem sem feedback | Aparição de 160 ms usando opacidade e transformação | Indicar a mudança de estado, sem atrasar a atualização do formulário |
| Diálogos e menus com duração padrão | MUI com entrada/saída curtas e duração zero sob movimento reduzido | Manter foco, Escape e retorno ao acionador |
| Textos secundários menores que 11 px na biblioteca | Piso de 11 px e contraste reforçado nos textos identificados | Melhorar leitura, mantendo a identidade |

Não foram adicionados pacotes. O movimento usa CSS, Web Animations nativo e o GSAP já instalado. Entradas e deslocamentos usam transformação e opacidade; o gráfico usa transformação de uma máscara, sem deformar os dados. As respostas de hover também preservam as transições curtas de cor dos controles. Contextos GSAP, observadores e animações da coleção possuem limpeza e respeitam mudanças de preferência. Dados e ações continuam disponíveis durante o movimento. Não foram adicionados loops, parallax ou 3D ao dashboard.

## Verificação executada

- `npm run lint`: código 0.
- `npm run build`: código 0; aviso conhecido do chunk opcional da cena 3D.
- `git diff --check`: sem erros.
- Edge: oito telas em quatro larguras (320, 390, 768 e 1440 px), com e sem movimento reduzido: **64 combinações** sem transbordamento horizontal e com um título principal.
- A instrumentação observou 52 animações de cards no cenário normal de entrada/filtros rápidos e zero no cenário reduzido; os movimentos terminam e os cards ficam opacos. A busca por digitação não dispara animações de cards.
- Revelação do gráfico observada no modo normal e série estática no modo reduzido. Valores permaneceram iguais. Mudança de preferência durante o uso restaura a visualização completa.
- Conferidos: filtros rápidos, busca, preço condicionado a venda/doação, menu, confirmação de exclusão, detalhes de negociação, Escape e rotas repetidas. Nenhum erro JavaScript, aviso GSAP ou chamada de API na prévia. Resultado em [browser-checks.json](browser-checks.json).
- Não há suíte de testes configurada; a verificação usou script temporário de navegador removido após o uso. Backend autenticado real não foi exercitado.

## Auditoria visual e exceções de marca

A inspeção inicial sem exceções encontrou cinco falhas e cinco avisos. Foram corrigidos o piso de leitura, contrastes secundários e a quebra do banner no celular. O inspector final passou em 1440, 768 e 390 px: **0 FAIL e 1 WARN**, com exceções explícitas para escolhas já aprovadas e fora do pedido de movimento:

- `micro-label`, `mixed-font-headline`, `palette-cream`, `app-title-size`: marca, rótulos e títulos editoriais existentes foram preservados.
- `icon-chips`: atalhos de categorias já aprovados, sem novos indicadores decorativos.
- `edge-text`: navegação horizontal intencional em trilhos com rolagem própria no celular.
- `below-fold`: catálogo completo de materiais, solicitado como vitrine, em vez de um resumo com poucas linhas.

O aviso restante indica predominância de texto abaixo de 13 px. Os metadados foram mantidos compactos, com piso de 11 px; uma alteração geral de densidade fica fora desta camada de movimento. O lint da skill também termina sem falhas, com avisos sobre rótulos e numeração das seções que já existiam.

Relatórios e capturas: [antes](before/report.json), [depois](after/report.json). As seis capturas finais foram inspecionadas visualmente: primeiro quadro e página completa em desktop, tablet e celular.

## Crítica do resultado

1. A vitrine, o material e a publicação continuam reconhecíveis, com seus controles funcionando durante as transições. O movimento reforça alterações de estado.
2. A grade mantém alinhamento e espaçamento; nenhum card permanece deslocado ou transparente ao fim. O banner do celular agora cabe em duas linhas.
3. Cor, marca, fotografias e fontes preservam a identidade aprovada. Não foi criada uma estética de animação separada da aplicação.
4. Totais, preços e unidades não foram animados nem recalculados por esta camada. Exemplos continuam identificados como tais.
5. Valores ausentes, estados vazios e doações continuam distintos. Nenhum zero foi convertido em resultado fictício.
6. A máscara mantém a série original e os rótulos acessíveis. O anel mantém os mesmos valores e cores de cada segmento.
7. O celular mantém rolagem própria nos atalhos, filtros operáveis e conteúdo visível. Movimento reduzido produz uma tela estática completa. A densidade de metadados continua sendo a principal limitação visual identificada.

Nenhuma fotografia foi adicionada: os arquivos locais já utilizados e os exemplos existentes continuam os mesmos.
