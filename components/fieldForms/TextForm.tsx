"use client"

import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Switch } from "../ui/switch"
import { FieldFormCard } from "./FieldFormCard"
import { FieldFormProps } from "./types"

function TextForm({ field, update, open, onToggle }: FieldFormProps) {
  const { data } = field

  return (
    <FieldFormCard field={field} open={open} onToggle={onToggle}>
      <Field aria-required>
        <FieldLabel>Label</FieldLabel>
        <Input
          placeholder="Full Name"
          value={data.label ?? ""}
          onChange={(e) => update({ label: e.target.value })}
        />
        <FieldError></FieldError>
      </Field>

      <Field aria-required>
        <FieldLabel>Placeholder</FieldLabel>
        <Input
          placeholder="John Doe"
          value={data.placeholder ?? ""}
          onChange={(e) => update({ placeholder: e.target.value })}
        />
        <FieldError></FieldError>
      </Field>

      <Field className="w-full max-w-none">
        <FieldLabel>Validation</FieldLabel>
        <Select
          value={data.validation ?? "None"}
          onValueChange={(value) => update({ validation: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="URL">URL</SelectItem>
              <SelectItem value="Number">Number</SelectItem>
              <SelectItem value="Currency">Currency</SelectItem>
              <SelectItem value="Percent">Percent</SelectItem>
              <SelectItem value="Date">Date</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
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

export default TextForm
