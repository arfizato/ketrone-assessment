"use client"

import { Input } from "../ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group"

/**
 * The set of rendered-input flavours shared by the table cells and the text
 * field. Map a stored column type / validation value to one of these before
 * passing it in (see VALIDATION_VARIANT / COLUMN_VARIANT in FormPreview).
 */
export type InputVariant =
  | "text"
  | "email"
  | "url"
  | "number"
  | "currency"
  | "percent"
  | "date"

type FieldControlProps = Omit<React.ComponentProps<"input">, "type"> & {
  variant: InputVariant
}

/**
 * One input, rendered to match its variant: a `$` prefix for currency, a `%`
 * suffix (with a 0–100 range) for percent, and the right native input `type`
 * otherwise. `className` lands on the outer control (the InputGroup when there
 * is an addon, the Input otherwise) so callers can size/style it per context.
 */
export function FieldControl({ variant, className, ...props }: FieldControlProps) {
  const prefix = variant === "currency" ? "$" : undefined
  const suffix = variant === "percent" ? "%" : undefined

  if (prefix || suffix) {
    return (
      <InputGroup className={className}>
        {prefix && (
          <InputGroupAddon align="inline-start">{prefix}</InputGroupAddon>
        )}
        <InputGroupInput
          type="number"
          min={variant === "percent" ? 0 : undefined}
          max={variant === "percent" ? 100 : undefined}
          {...props}
        />
        {suffix && (
          <InputGroupAddon align="inline-end">{suffix}</InputGroupAddon>
        )}
      </InputGroup>
    )
  }

  const type =
    variant === "number"
      ? "number"
      : variant === "date"
        ? "date"
        : variant === "email"
          ? "email"
          : variant === "url"
            ? "url"
            : "text"

  return <Input type={type} className={className} {...props} />
}
