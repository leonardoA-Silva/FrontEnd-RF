# Integração da área empresarial

- [x] Conferir contratos de vinculação Mercado Pago no backend (somente leitura).
- [x] Implementar Recebimentos com consulta, vinculação e confirmação de desvinculação.
- [x] Adicionar rota protegida e acesso no menu empresarial.
- [x] Implementar notificações com leitura e contador; indicadores por negociação; consultas de disputas e avaliações recebidas.
- [x] Completar ações autorizadas: excluir notificações com confirmação, editar/excluir avaliações feitas pela conta e editar descrição de disputas próprias abertas. Verificados payloads, restrições de autoria/status e preservação do rascunho em conflito no navegador.
- [x] Implementar consulta/edição de perfil e endereços existentes, sem persistir contato/endereço no navegador.
- [x] Conectar mapa à rota `/localization/companies`, mantendo coordenadas aproximadas e removendo distâncias/lotes fictícios.
- [x] Validar lint/build e estados controlados no navegador (1440, 768 e 390 px; sucesso, vazio, 403/503; leitura de notificações; atualização de nome; filtros e recuperação de erro no mapa; proteção sem sessão). OAuth real e gravação de endereços em banco não exercitados.

## Limitações verificadas na API atual

- `/shopping` filtra `s.id_user` (comprador), não pedidos recebidos pelo vendedor; `GET /shopping/:id` permite somente comprador/admin. Necessário o responsável pelo backend disponibilizar listagem/detalhe com autorização do vendedor e escopo dos itens. Não usar essas rotas como histórico de vendas.
- Criar avaliações/disputas a partir da negociação depende desse detalhe autorizado, para obter participantes e estado sem digitação manual de IDs. A integração atual consulta avaliações recebidas e disputas existentes; não oferece criação/resolução arbitrária.
- Indicadores retornam estimativas por compra completa, inclusive com múltiplos vendedores. Exibidos por registro, sem atribuir totais exclusivamente à empresa.
- OAuth, cobranças e geocodificação reais dependem da configuração do serviço; testes de navegador com respostas controladas não comprovam essas integrações externas.
