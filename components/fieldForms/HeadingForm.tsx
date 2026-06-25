"use client"

import { Field, FieldError, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { FieldFormCard } from "./FieldFormCard"
import { FieldFormProps } from "./types"

/** Static section heading — the displayed text lives in `data.label`. */
function HeadingForm({ field, update, open, onToggle }: FieldFormProps) {
  const { data } = field

  return (
    <FieldFormCard field={field} open={open} onToggle={onToggle}>
      <Field>
        <FieldLabel>Heading text</FieldLabel>
        <Input
          placeholder="Section title"
          value={data.label ?? ""}
          onChange={(e) => update({ label: e.target.value })}
        />
        <FieldError></FieldError>
      </Field>
    </FieldFormCard>
  )
}

export default HeadingForm
