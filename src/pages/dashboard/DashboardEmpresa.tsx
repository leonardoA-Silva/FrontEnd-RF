import CompanyWorkspace from "../company/CompanyWorkspace";

export default function DashboardEmpresa({ preview = false }: { preview?: boolean }) {
  return <CompanyWorkspace preview={preview} />;
}
