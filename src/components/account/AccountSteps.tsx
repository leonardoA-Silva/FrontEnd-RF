import { Check } from "lucide-react";

export default function AccountSteps({ current }: { current: 1 | 2 | 3 }) {
  return <ol className="account-progress" aria-label="Etapas do cadastro">{["Seu perfil", "Seus dados", "Confirmação"].map((label, index) => <li key={label} className={index + 1 <= current ? "is-current" : ""} aria-current={index + 1 === current ? "step" : undefined}><span>{index + 1 < current ? <Check size={13} /> : `0${index + 1}`}</span><span>{label}</span></li>)}</ol>;
}
