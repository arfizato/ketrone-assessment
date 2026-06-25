"use client"

import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Switch } from "../ui/switch"
import { FieldFormCard } from "./FieldFormCard"
import { FieldFormProps } from "./types"

function TextareaForm({ field, update, open, onToggle }: FieldFormProps) {
  const { data } = field

  return (
    <FieldFormCard field={field} open={open} onToggle={onToggle}>
      <Field aria-required>
        <FieldLabel>Label</FieldLabel>
        <Input
          placeholder="Describe your situation"
          value={data.label ?? ""}
          onChange={(e) => update({ label: e.target.value })}
        />
        <FieldError></FieldError>
      </Field>

      <Field>
        <FieldLabel>Placeholder</FieldLabel>
        <Input
          placeholder="Add any details that will help us…"
          value={data.placeholder ?? ""}
          onChange={(e) => update({ placeholder: e.target.value })}
        />
        <FieldError></FieldError>
      </Field>

      <Field orientation="horizontal" className="w-full justify-between">
        <div>
          <FieldLabel>Required</FieldLabel>
          <FieldDescription>Must be filled before submission</FieldDescription>
        </div>
        <Switch
          checked={data.required ?? false}
          onCheckedChange={(checked) => update({ required: checked })}
        />
      </Field>
    </FieldFormCard>
  )
}

export default TextareaForm
