import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export function AccountSignIn() {
  return <p className="account-switch">Já faz parte da rede? <Link to="/login">Entre na sua conta <ArrowUpRight size={14} /></Link></p>;
}

export function RegistrationSection({ children }: { children: ReactNode }) {
  return <section className="registration-sheet">{children}</section>;
}
