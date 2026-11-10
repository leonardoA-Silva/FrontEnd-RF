import CompanyPage from "../../components/dashboard/CompanyPage";
import { companyStyles as styles } from "../../components/dashboard/companyStyles";
export default function Negociacoes() {
  return <CompanyPage title="Negociações recebidas" description="Histórico de solicitações dos materiais publicados pela empresa.">
    <section className={styles.panel}><h2 className="text-xl font-semibold">Histórico ainda indisponível</h2><p className="mt-3 max-w-2xl">O serviço ainda não disponibiliza a consulta de pedidos recebidos pelo vendedor. Suas notificações continuam disponíveis, mas não é possível consultar os itens ou gerenciar essas solicitações por esta tela.</p></section>
  </CompanyPage>;
}
