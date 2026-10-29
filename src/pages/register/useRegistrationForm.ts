import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { cadastrarEmpresa, cadastrarUsuario } from "../../axios/Axios";
import { accountError } from "../../components/account/accountError";
import { emptyRegistration, validateRegistration } from "./registrationData";
import type { RegistrationData, RegistrationErrors, RegistrationKind } from "./registrationData";
import { useRegistrationAddress } from "./useRegistrationAddress";

export function useRegistrationForm(kind: RegistrationKind) {
  const [data, setData] = useState({ ...emptyRegistration });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [created, setCreated] = useState<{ id: string; emailSent: boolean } | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const address = useRegistrationAddress(data, setData);

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  function setField(key: keyof RegistrationData, value: string) {
    setData(previous => ({ ...previous, [key]: value, ...(key === "state" ? { city: "" } : {}) }));
    setErrors(previous => ({ ...previous, [key]: undefined }));
    setError("");
  }

  function changePhoto(file: File | null) {
    setPhotoError("");
    if (file && !file.type.startsWith("image/")) { setPhotoError("Escolha um arquivo de imagem."); return; }
    setPhoto(file);
    setPhotoUrl(file ? URL.createObjectURL(file) : "");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || created) return;
    const nextErrors = validateRegistration(data, kind);
    setErrors(nextErrors);
    setError("");
    if (Object.keys(nextErrors).length) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    setBusy(true);
    const payload = {
      name: data.name.trim(), cpf: data.cpf.replace(/\D/g, ""), email: data.email.trim(), password: data.password,
      cellphone: data.cellphone.replace(/\D/g, ""), zip_code: data.zip_code.replace(/\D/g, ""),
      street: data.street.trim(), neighborhood: data.neighborhood.trim(), number: data.number.trim(),
      city: data.city.trim(), state: data.state.trim().toUpperCase(),
    };
    try {
      const response = kind === "company"
        ? await cadastrarEmpresa({ ...payload, cnpj: data.cnpj.replace(/\D/g, "") }, photo)
        : await cadastrarUsuario({ ...payload, birthday: data.birthday }, photo);
      if (!response.data || typeof response.data.id !== "string" || !response.data.id) {
        setError("O cadastro foi enviado, mas a confirmação não ficou disponível. Tente entrar com o e-mail informado antes de enviar novamente.");
        return;
      }
      setCreated({ id: response.data.id, emailSent: response.data.emailSent !== false });
      setData(previous => ({ ...previous, password: "" }));
      setVerificationOpen(true);
    } catch (failure) {
      setError(accountError(failure, "Não foi possível concluir o cadastro agora. Seus dados continuam no formulário para tentar novamente."));
    } finally { setBusy(false); }
  }

  return { data, errors, error, busy, photoUrl, photoError, created, verificationOpen, setVerificationOpen, setField, changePhoto, submit, address };
}
