# Base da branch Rafael/Testes

Criada em 10/11/2026 para testar localmente a versão mais recente da área de empresa do Leonardo e preservar uma cópia no Git remoto.

Origem: `origin/test-new-ui`, commit `76c595a` (`feat(company): integrate management workflows`), de autoria de `leonardoA-Silva` em 10/11/2026.

Comparação das últimas alterações na área de empresa entre todas as branches disponíveis após `git fetch origin --prune`:

| Branch | Última alteração de empresa | Data |
| --- | --- | --- |
| `test-new-ui` | `76c595a` — fluxos de gestão empresarial | 10/11/2026 |
| `leonardo/telas-empresa` | `f086a0e` — mapa e links de disputas | 05/11/2026 |
| `new-ui` | `8e6fb7f` — chat e notificações | 05/11/2026 |
| `leonardo/Dashboard-empresa` | `1e07499` — identificação da empresa e saída | 09/09/2026 |

A escolha considera o histórico e os arquivos da empresa, não apenas a data do último commit geral. As demais branches não apresentam alterações empresariais posteriores à origem escolhida.

Esta é uma cópia da versão do Leonardo, sem integração automática com `Rafael/Sprint2----Comprador`. O trabalho do comprador permanece preservado nessa outra branch. Consulte `company-integration.md` para funcionalidades e limitações da versão empresarial.

O código da aplicação é o mesmo do commit de origem. A criação desta branch não altera a `main`, a API ou o mobile. Instale as dependências declaradas desta versão com `npm ci` ao alternar entre branches com arquivos de dependências diferentes.
