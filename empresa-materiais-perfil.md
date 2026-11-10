# Gestão empresarial

- [x] Conferir contratos de produtos, fotos, endereços e senha (backend somente leitura).
- [x] Editar/excluir anúncios próprios e gerenciar fotos pela atualização autorizada do produto.
- [x] Criar/excluir endereços e atualizar foto/senha no perfil empresarial.
- [x] Executar lint/build e verificar ações, conflitos e responsividade no navegador.

Escopo: somente telas empresariais e registro das respectivas rotas. Fotos isoladas da API não verificam autoria; usar PUT do produto com coleção de fotos, que verifica proprietário. Não alterar backend, home, login, cadastros ou painel pessoal.

Evidências: lint/build/diff check; navegador a 1440/390 px com respostas interceptadas. Verificados PUT multipart (fotos binárias), edição sem reenviar fotos, doação com preço vazio, preservação de rascunho em 500, confirmação/cancelamento de exclusão, bloqueio de edição de produto alheio, upload de perfil, PATCH de senha com limpeza dos campos e conflito 409 ao excluir endereço. Cadastro de endereço preenchido e persistência real no banco não exercitados; nenhuma mutação real no backend foi feita.
