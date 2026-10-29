import type { InputHTMLAttributes, ReactNode } from "react";

interface AccountFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  children?: ReactNode;
  wide?: boolean;
}

export default function AccountField({ label, error, hint, children, wide, id, ...input }: AccountFieldProps) {
  return <div className={`account-field ${wide ? "account-field-wide" : ""}`}>
    <label htmlFor={id}>{label}{input.required && <span className="account-required" aria-hidden="true"> *</span>}</label>
    {children ?? <input {...input} id={id} className="account-input" aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} />}
    {error ? <p id={`${id}-error`} className="account-field-error">{error}</p> : hint && <p id={`${id}-hint`} className="account-field-hint">{hint}</p>}
  </div>;
}
