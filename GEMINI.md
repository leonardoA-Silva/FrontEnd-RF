# Regras do Projeto - FrontEnd-RF

## Restrição de Escopo: Módulo de Usuário
- **Apenas Usuário**: Neste projeto, você só tem permissão para alterar, criar ou refatorar códigos pertencentes à parte de **Usuário** (comprador / pessoa física / artesão).
- **Arquivos e Módulos Permitidos**:
  - `src/pages/dashboard/DashboardUsuario.tsx`
  - `src/pages/register/RegisterUser.tsx`
  - Telas e fluxos de autenticação/perfil do usuário (`src/pages/login/Login.tsx` no que tange ao usuário, `src/hooks/useLoggedUser.ts`, rotas de usuário em `src/axios/Axios.ts`)
  - Componentes estritamente compartilhados ou voltados ao usuário quando requisitado.
- **Arquivos e Módulos Proibidos**:
  - `src/pages/dashboard/DashboardEmpresa.tsx`
  - `src/pages/register/RegisterCompany.tsx`
  - Módulos exclusivos de Empresa ou de outros tipos de contas que não pertençam ao escopo de Usuário.
