import PasswordForm from "./PasswordForm";
import { buyerStyles as s } from "./buyerStyles";

export default function BuyerSecurity() {
  return <section className="space-y-6"><h1 className={s.title}>Segurança da conta</h1><PasswordForm /></section>;
}
