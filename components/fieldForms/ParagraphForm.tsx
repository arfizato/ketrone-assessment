"use client"

import { Field, FieldError, FieldLabel } from "../ui/field"
import { Textarea } from "../ui/textarea"
import { FieldFormCard } from "./FieldFormCard"
import { FieldFormProps } from "./types"

/** Static explanatory text — the displayed copy lives in `data.label`. */
function ParagraphForm({ field, update, open, onToggle }: FieldFormProps) {
  const { data } = field

  return (
    <FieldFormCard field={field} open={open} onToggle={onToggle}>
      <Field>
        <FieldLabel>Paragraph text</FieldLabel>
        <Textarea
          rows={3}
          placeholder="Add context or instructions for this section…"
          value={data.label ?? ""}
          onChange={(e) => update({ label: e.target.value })}
        />
        <FieldError></FieldError>
      </Field>
    </FieldFormCard>
  )
}

export default ParagraphForm
