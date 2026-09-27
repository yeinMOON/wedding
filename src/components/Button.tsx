import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'choice'; selected?: boolean }

export function Button({ variant = 'primary', selected, className = '', ...rest }: Props) {
  return <button className={`btn btn--${variant}${selected ? ' is-selected' : ''} ${className}`} {...rest} />
}
