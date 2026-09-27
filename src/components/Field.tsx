import type { InputHTMLAttributes, ReactNode } from 'react'
import './Field.css'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string; trailing?: ReactNode }

export function Field({ label, hint, error, trailing, id, ...rest }: Props) {
  const inputId = id ?? `f-${label}`
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label className="field__label" htmlFor={inputId}>{label}</label>
      <div className="field__row">
        <input id={inputId} className="field__input" {...rest} />
        {trailing}
      </div>
      {(error || hint) && <p className="field__hint">{error ?? hint}</p>}
    </div>
  )
}
