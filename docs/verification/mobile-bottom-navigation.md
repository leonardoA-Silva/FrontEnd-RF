# Navegação inferior no celular

- Até 767 px, a navegação compartilhada dos painéis de empresa e usuário fica fixa no rodapé, com espaço reservado no conteúdo e suporte a `safe-area-inset-bottom`.
- O botão de sair fica no cabeçalho no celular. A navegação lateral permanece no desktop.
- Abas permitem rolagem horizontal em telas estreitas; a aba ativa entra na área visível. O rodapé da página continua acessível acima da barra.
- Verificação no Edge: biblioteca, publicação, perfil e painel do usuário em 320, 390, 768 e 1440 px; navegação até Conta/Histórico, rolagem até o fim, ausência de transbordamento horizontal da página e de erros de execução.
- Captura: [celular](dashboard-motion/mobile-bottom-nav.png).
- `npm run lint` e `npm run build`: aprovados. O build mantém o aviso existente de tamanho do módulo de escultura 3D.

Alterações locais na branch `new-ui`, sem commit ou push nesta etapa.
