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

function FileForm({ field, update, open, onToggle }: FieldFormProps) {
  const { data } = field

  return (
    <FieldFormCard
      type={field.type}
      label={data.label}
      open={open}
      onToggle={onToggle}
    >
      <Field aria-required>
        <FieldLabel>Label</FieldLabel>
        <Input
          placeholder="Upload your CV"
          value={data.label ?? ""}
          onChange={(e) => update({ label: e.target.value })}
        />
        <FieldError></FieldError>
      </Field>

      <Field>
        <FieldLabel>Drop-zone text</FieldLabel>
        <Input
          placeholder="Drag & drop a file, or click to browse"
          value={data.placeholder ?? ""}
          onChange={(e) => update({ placeholder: e.target.value })}
        />
        <FieldError></FieldError>
      </Field>

      <Field className="w-full max-w-xs">
        <FieldLabel>Accepted files</FieldLabel>
        <Select
          value={data.validation ?? "All"}
          onValueChange={(value) => update({ validation: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="Image">Image</SelectItem>
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

export default FileForm
