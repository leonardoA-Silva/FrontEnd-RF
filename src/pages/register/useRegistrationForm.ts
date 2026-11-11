import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { cadastrarEmpresa, cadastrarUsuario } from "../../api/services";
import { registrationError } from "./registrationError";
import { emptyRegistration, validateRegistration } from "./registrationData";
import type { RegistrationData, RegistrationErrors, RegistrationKind } from "./registrationData";
import { useRegistrationAddress } from "./useRegistrationAddress";

export function useRegistrationForm(kind: RegistrationKind) {
  const [data, setData] = useState({ ...emptyRegistration });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const submitting = useRef(false);
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
    setConflict(false);
  }

  function changePhoto(file: File | null) {
    setPhotoError("");
    if (file && !file.type.startsWith("image/")) { setPhotoError("Escolha um arquivo de imagem."); return; }
    setPhoto(file);
    setPhotoUrl(file ? URL.createObjectURL(file) : "");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await send();
  }

  async function send() {
    if (submitting.current || busy || created) return;
    const nextErrors = validateRegistration(data, kind);
    setErrors(nextErrors);
    setError("");
    setConflict(false);
    if (Object.keys(nextErrors).length) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    setBusy(true);
    submitting.current = true;
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
      const result = registrationError(failure, kind);
      setError(result.message);
      setErrors(result.fields);
      setConflict(result.conflict);
      window.requestAnimationFrame(() => document.getElementById("registration-error")?.focus());
    } finally { submitting.current = false; setBusy(false); }
  }

  return { data, errors, error, conflict, busy, photoUrl, photoError, created, verificationOpen, setVerificationOpen, setField, changePhoto, submit, address };
}
