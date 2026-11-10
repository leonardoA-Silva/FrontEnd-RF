# Comprador integrado à Rafael/Testes

## Origem e aparência

Funcionalidades recuperadas de `Rafael/Sprint2----Comprador`, commit `258514d`, sobre a base empresarial do Leonardo `76c595a`. O CSS global, as dependências e os arquivos de gestão empresarial são preservados. Os componentes importados usam os tokens de `DESIGN.md`, Manrope, superfícies claras, bordas suaves e controles arredondados da versão atual. O layout fotográfico do login foi mantido. Não foi importado o CSS antigo do comprador nem adicionada dependência de MUI.

## Fluxos disponíveis

- Catálogo público e interno com busca, filtros, paginação, imagens da API, detalhes, localização conforme permissão, contato com fornecedor e solicitação de reserva.
- Reservas e histórico com detalhe, cancelamento permitido pela API e pagamento Pix: criação confirmada, recuperação do QR existente, consulta/sincronização e cancelamento conforme suporte do provedor. Resultado ambíguo não autoriza uma nova cobrança automática.
- Perfil com nome, celular, aniversário e foto recuperada do backend, sincronizada com o cabeçalho; orientação de preenchimento após cadastro social.
- Endereços com ViaCEP, criação, edição e exclusão confirmada. Coordenadas manuais são opcionais; geocodificação depende da API.
- Consulta, edição e exclusão de cartões já cadastrados. Não foi implementado novo cadastro nem pagamento por cartão.
- Conversas e mensagens via Socket.IO, incluindo leitura, envio, edição, exclusão e saída da conversa; notificações com filtros, leitura, exclusão e links aos recursos.
- Avaliações próprias, disputas e estimativas ambientais, respeitando os estados e as permissões retornados pela API.
- Login com senha/Google, cadastro pessoal, retomada da confirmação por código, recuperação/redefinição de senha, primeiro acesso e exclusão da conta com confirmação.
- Sobre nós com chamada de cadastro somente para visitantes.

Nenhum indicador de exemplo do antigo dashboard é apresentado como dado da pessoa conectada. Não há conversão de conta pessoal para empresa nem implementação de LinkedIn. O cadastro empresarial existente do Leonardo foi preservado; esta integração não substitui essa página pelo cadastro da outra branch.

## Validação e limites

Executar `npm run lint` e `npm run build`. O projeto continua sem suíte frontend configurada. Os scripts locais ignorados em `.verification.local/` verificam os fluxos com HTTP, MySQL temporário e Socket.IO reais. O lint ignora esse diretório gerado para evitar analisar caches do Vite que são substituídos durante os testes.

Pix usa o provedor simulado nos testes; Google e SMTP usam substitutos controlados. Isso não comprova liquidação financeira, entrega de e-mail real, configuração do Google Cloud ou geocodificação externa. Não aplicar o schema destrutivo no banco do projeto. As verificações visuais usam dados sintéticos e não substituem testes com uma conta autorizada no ambiente de destino.
