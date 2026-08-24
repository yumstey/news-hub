import type { ComponentPropsWithRef, ReactNode } from "react"

import { buttonClassName } from "./buttonClassName"
import type { ButtonSize, ButtonVariant } from "./buttonClassName"

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leading?: ReactNode
  trailing?: ReactNode
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  leading,
  trailing,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...rest}
    >
      {leading}
      {children}
      {trailing}
    </button>
  )
}
