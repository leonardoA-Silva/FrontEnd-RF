import AccountAddress from "../../components/account/AccountAddress";
import { useCompany } from "./CompanyContext";
export default function CompanyAddresses() {
  const { identity } = useCompany();
  return identity ? <AccountAddress userId={identity.id} /> : <p role="alert">Entre novamente para carregar seu endereço.</p>;
}
