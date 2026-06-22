"use client"

import { Button } from "../ui/button"
import { Card } from "../ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "../ui/field"
import { Input } from "../ui/input"
import { Switch } from "../ui/switch"
import { FieldFormHeader } from "./FieldFormHeader"
import { FieldFormProps, SelectOption } from "./types"
import { Plus, X } from "lucide-react"

function SelectForm({ field, update }: FieldFormProps) {
  const { data } = field
  const opts = data.options ?? []

  // every mutation rewrites the whole options array back into the backbone
  const setOpts = (next: SelectOption[]) => update({ options: next })

  const updateOpt = (index: number, patch: Partial<SelectOption>) =>
    setOpts(opts.map((o, i) => (i === index ? { ...o, ...patch } : o)))

  const dropOpt = (index: number) => setOpts(opts.filter((_, i) => i !== index))

  const addOpt = () => setOpts([...opts, { label: "", value: "" }])

  return (
    <Card className="p-4">
      <FieldFormHeader type={field.type} />
      <Field aria-required>
        <FieldLabel>Label</FieldLabel>
        <Input
          placeholder="Document Type"
          value={data.label ?? ""}
          onChange={(e) => update({ label: e.target.value })}
        />
        <FieldError></FieldError>
      </Field>

      <Field aria-required>
        <FieldLabel>Placeholder</FieldLabel>
        <Input
          placeholder="Contract"
          value={data.placeholder ?? ""}
          onChange={(e) => update({ placeholder: e.target.value })}
        />
        <FieldError></FieldError>
      </Field>

      <FieldGroup className="gap-3">
        <FieldTitle>Options</FieldTitle>
        {opts.map((opt, i) => (
          // TODO: Make em movable
          <Field
            aria-required
            key={i}
            orientation="horizontal"
            className="px-2"
          >
            <span className="w-full">
              <FieldLabel>Label</FieldLabel>
              <Input
                placeholder="Contrat Durée Indeterminée"
                value={opt.label}
                onChange={(e) => updateOpt(i, { label: e.target.value })}
              />
            </span>

            <span className="w-full">
              <FieldLabel>Value</FieldLabel>
              <Input
                placeholder="CDI"
                value={opt.value}
                onChange={(e) => updateOpt(i, { value: e.target.value })}
              />
            </span>
            <span>
              <FieldLabel className="opacity-0">.</FieldLabel>
              <Button
                variant="destructive"
                size="icon"
                aria-label="Remove option"
                onClick={() => dropOpt(i)}
              >
                <X className="size-4" />
              </Button>
            </span>
            <FieldError></FieldError>
          </Field>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="mt-2 self-start"
          onClick={addOpt}
        >
          <Plus className="size-4" />
          Add option
        </Button>
      </FieldGroup>

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
    </Card>
  )
}

export default SelectForm
