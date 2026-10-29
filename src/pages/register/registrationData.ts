export type RegistrationKind = "company" | "personal";

export interface RegistrationData {
  name: string;
  cnpj: string;
  cpf: string;
  email: string;
  birthday: string;
  cellphone: string;
  zip_code: string;
  street: string;
  neighborhood: string;
  number: string;
  city: string;
  state: string;
  password: string;
}

export type RegistrationErrors = Partial<Record<keyof RegistrationData, string>>;

export const emptyRegistration: RegistrationData = {
  name: "", cnpj: "", cpf: "", email: "", birthday: "", cellphone: "", zip_code: "",
  street: "", neighborhood: "", number: "", city: "", state: "", password: "",
};

export function validateRegistration(data: RegistrationData, kind: RegistrationKind): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const required: (keyof RegistrationData)[] = ["name", "email", "cellphone", "zip_code", "street", "neighborhood", "number", "state", "city", "password", "cpf"];
  required.push(kind === "company" ? "cnpj" : "birthday");
  required.forEach(key => { if (!data[key].trim()) errors[key] = "Preencha este campo para continuar."; });
  if (data.cpf && data.cpf.replace(/\D/g, "").length !== 11) errors.cpf = "Informe os 11 dígitos do CPF.";
  if (kind === "company" && data.cnpj && data.cnpj.replace(/\D/g, "").length !== 14) errors.cnpj = "Informe os 14 dígitos do CNPJ.";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Informe um e-mail válido.";
  if (data.cellphone && data.cellphone.replace(/\D/g, "").length !== 11) errors.cellphone = "Informe 11 dígitos, incluindo o DDD.";
  if (data.zip_code && data.zip_code.replace(/\D/g, "").length !== 8) errors.zip_code = "Informe os 8 dígitos do CEP.";
  if (data.state && !/^[A-Za-z]{2}$/.test(data.state)) errors.state = "Informe a sigla do estado com duas letras.";
  if (data.number.length > 6) errors.number = "Use até 6 caracteres para o número.";
  if (data.password && data.password.length < 6) errors.password = "Use pelo menos 6 caracteres.";
  return errors;
}
