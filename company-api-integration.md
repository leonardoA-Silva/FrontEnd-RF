# Integração funcional da empresa

Escopo aprovado: conectar as capacidades existentes da API ao visual atual, sem novas dependências ou alterações no backend.

- [x] Conferir contratos e autorização de produtos, localizações, perfil, impacto e disputas.
- [x] Habilitar atualização e exclusão dos próprios materiais, preservando prioridade e localização; publicação permanece bloqueada pela ausência de regra de empresa na API.
- [x] Implementar gestão dos próprios endereços e foto do perfil, com confirmação de exclusão, erros e recuperação.
- [x] Consultar impactos reais e disputas autorizadas, sem inventar gráficos ou ações administrativas.
- [x] Verificar os fluxos com a API real, estados de erro, desktop/celular, lint e build; registrar limitações.

Reservas recebidas, publicação, pagamentos e seleção de novos contatos dependem de contratos/permissões adicionais e não fazem parte desta integração.

Evidências: [verificação funcional](docs/verification/company-functional-integration.md). Lint e build finais aprovados; nenhuma alteração enviada ao remoto nesta etapa.
