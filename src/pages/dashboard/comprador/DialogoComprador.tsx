import { useEffect, useRef, type ReactNode } from "react";

export function DialogoComprador({ titulo, aoFechar, children }: {
  titulo: string;
  aoFechar: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      anterior?.focus();
    };
  }, []);
  return (
    <dialog ref={ref} aria-label={titulo} onCancel={(event) => { event.preventDefault(); aoFechar(); }}
      className="fixed inset-0 m-0 h-dvh max-h-dvh w-screen max-w-none border-0 bg-transparent p-0 text-[#1B4B3A] backdrop:bg-black/60 backdrop:backdrop-blur-xs">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-5" onClick={(event) => {
        if (event.target === event.currentTarget) aoFechar();
      }}>
        {children}
      </div>
    </dialog>
  );
}
