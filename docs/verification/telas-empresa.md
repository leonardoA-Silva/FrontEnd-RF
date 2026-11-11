# Telas da empresa — 03/11/2026

Branch: `leonardo/telas-empresa`.

## Entrega

- `/dashboardEmpresa/indicadores`: cartões, gráfico de evolução, distribuição por material e valores acessíveis em texto. Sem métricas reais disponíveis; demonstração opcional e identificada.
- `/dashboardEmpresa/negociacoes`: filtros por material, situação e período, validação do período, estado vazio e detalhes. Interface demonstrativa opcional; não representa compras ou vendas reais.
- `/dashboardEmpresa/perfil`: consulta e edição de nome/celular pelas rotas GET e PUT `/user/:id`, com validação e mensagens seguras. Nome do cabeçalho acompanha atualização; contato não é adicionado ao armazenamento da sessão.
- `/sobre`: missão, participação e chamada para cadastro; acessível sem sessão e pelo painel da empresa.
- Navegação desktop, menu móvel, menu da conta e atalhos do mapa ligados às novas telas. Cabeçalhos ajustados para evitar transbordamento em 320 e 1024 px.

## Evidências

`npm run lint` e `npm run build`: ambos concluídos com código 0 após as alterações finais. `git diff --check`: sem erros. Dependências restauradas com `npm ci --ignore-scripts`, sem mudanças no package.json ou lockfile. Nenhuma dependência nova adicionada.

Inspeção em Chromium local com Vite em 127.0.0.1:5173: larguras de 390, 768 e 1440 px nas quatro telas; verificações adicionais do cabeçalho em 320, 1024 e 1280 px. Sem transbordamento horizontal da página. Tabela de histórico usa rolagem horizontal interna em telas estreitas.

Interações verificadas: entrar/sair da demonstração, filtro de concluídas (duas linhas), detalhes de material, busca sem resultados, período inválido, limpar filtros e navegação pelo menu móvel. Perfil: carregamento, foco no campo inválido, envio com somente name/cellphone, confirmação, botão desabilitado após salvar e atualização do nome na sessão. Respostas simuladas 400/401/403/404/500 sem exposição da mensagem interna; nova tentativa recupera o formulário. Rota privada redireciona visitante sem sessão para login. Sem erros de JavaScript observados nas verificações iniciais.

Não há suíte de testes configurada. As verificações do perfil usaram interceptação de rede no navegador e dados efêmeros, sem acessar ou modificar contas reais. Integração com servidor real autenticado permanece não validada.

Capturas sem dados pessoais, com campos de contato ocultados:

| Tela | Desktop | Celular |
|---|---|---|
| Indicadores | [Captura](empresa-indicadores-desktop.png) | [Captura](empresa-indicadores-mobile.png) |
| Histórico | [Captura](empresa-historico-desktop.png) | [Captura](empresa-historico-mobile.png) |
| Perfil | [Captura](empresa-perfil-desktop.png) | [Captura](empresa-perfil-mobile.png) |
| Sobre Nós | [Captura](empresa-sobre-desktop.png) | [Captura](empresa-sobre-mobile.png) |

## Limitações e dependências

Indicadores e histórico de vendedor: UI-only. A API inspecionada não expõe métricas ambientais nem listagem de negociações recebidas pela empresa. GET `/shopping` filtra compras pelo comprador; não foi usado como histórico de vendedor. Preferências de notificações, edição de e-mail e documentos não têm integração nesta entrega. Somente arquivos deste frontend foram editados.

As telas seguem a estrutura da referência com os componentes e tokens existentes na branch; não são uma reprodução visual exata das imagens fornecidas.

## Prévia sem backend

Execute `npm run previa:empresa` e abra `http://127.0.0.1:5187/dashboardEmpresa`. O script compila o frontend com a base de API local e serve uma demonstração isolada, com sessão fictícia e respostas locais para materiais e perfil. Não altera a autenticação do aplicativo publicado. Dados e alterações ficam apenas na memória do processo; não informe dados pessoais. Indicadores e histórico oferecem o botão “Visualizar exemplo”.

Painel, listagem, publicação, indicadores, histórico, perfil e Sobre Nós foram abertos nessa prévia em Chromium sem login real. As requisições de API observadas usaram somente a origem local da prévia.
