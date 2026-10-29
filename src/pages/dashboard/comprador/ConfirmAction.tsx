import { useEffect, useRef } from "react";
import { buyerStyles as s } from "./buyerStyles";

export default function ConfirmAction({ title, description, busy, error, confirm, cancel }: { title: string; description: string; busy: boolean; error: string; confirm: () => void; cancel: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);
  return <dialog ref={dialog} aria-label={title} onCancel={event => { event.preventDefault(); if (!busy) cancel(); }} className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%_-_32px)] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-[#1B4B3A] shadow-xl backdrop:bg-black/40">
    <h2 className={s.subtitle}>{title}</h2><p className={`${s.copy} my-5`}>{description}</p>
    {error && <p role="alert" className={`${s.error} mb-5`}>{error}</p>}
    <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={cancel} className={s.secondary}>Voltar</button><button disabled={busy} onClick={confirm} className={s.button}>{busy ? "Aguarde..." : "Confirmar"}</button></div>
  </dialog>;
}
