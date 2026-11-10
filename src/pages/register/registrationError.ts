import axios from "axios";
import { accountError } from "../../components/account/accountError";
import type { RegistrationErrors, RegistrationKind } from "./registrationData";

export function registrationError(failure: unknown, kind: RegistrationKind): { message: string; fields: RegistrationErrors; conflict: boolean } {
  if (axios.isAxiosError(failure) && failure.response?.status === 409) {
    // Recognize known messages without exposing arbitrary backend response data.
    const reason = failure.response.data?.error;
    if (reason === "Email já cadastrado.") return {
      message: "Este e-mail já está vinculado a uma conta. Entre na conta existente. Criar outro cadastro não altera o tipo da sua conta.",
      fields: { email: "Este e-mail já está cadastrado." }, conflict: true,
    };
    if (reason === "Documento já registrado") return {
      message: kind === "company"
        ? "O CPF do responsável ou o CNPJ já está vinculado a um cadastro. A API não informa qual deles. Alterar apenas o e-mail não resolve; entre na conta existente."
        : "Este CPF já está vinculado a um cadastro. Entre na conta existente.",
      fields: kind === "company" ? {} : { cpf: "Este CPF já está cadastrado." }, conflict: true,
    };
    return { message: "Já existe um cadastro com estes dados. Entre na conta existente ou confira os dados antes de tentar novamente.", fields: {}, conflict: true };
  }
  return { message: accountError(failure, "Não foi possível concluir o cadastro agora. Seus dados continuam no formulário para tentar novamente."), fields: {}, conflict: false };
}
