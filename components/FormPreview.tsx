"use client"

import { Plus, Upload, X } from "lucide-react"
import { CSSProperties, useState } from "react"
import { FieldControl, InputVariant } from "./fieldForms/FieldControl"
import { FieldInstance } from "./fieldForms/types"
import { Button } from "./ui/button"
import { Field, FieldLabel } from "./ui/field"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

/** text-field validation value -> rendered input variant */
const VALIDATION_VARIANT: Record<string, InputVariant> = {
  Email: "email",
  URL: "url",
  Number: "number",
  Currency: "currency",
  Percent: "percent",
  Date: "date",
}

/** table column type -> rendered input variant */
const COLUMN_VARIANT: Record<string, InputVariant> = {
  Text: "text",
  Number: "number",
  Currency: "currency",
  Percent: "percent",
  Date: "date",
}

/** file-field validation -> native accept attribute */
const FILE_ACCEPT: Record<string, string | undefined> = {
  All: undefined,
  PDF: "application/pdf",
  Image: "image/*",
}

function PreviewLabel({
  label,
  required,
}: {
  label?: string
  required?: boolean
}) {
  return (
    <FieldLabel className="text-foreground">
      {label?.trim() || "Untitled field"}
      {required && <span className="text-destructive"> *</span>}
    </FieldLabel>
  )
}

/** Editable, row-addable preview of a table field. */
function TablePreview({ field }: { field: FieldInstance }) {
  const columns = field.data.columns ?? [] //.filter((c) => c.label.trim())
  const [rows, setRows] = useState(1)

  if (columns.length === 0) {
    return <p className="text-sm text-muted-foreground">No columns defined</p>
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-3 py-2 text-left font-medium">
                  {col.label ? col.label : `column ${i + 1}`}
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-t">
                {columns.map((col, c) => (
                  <td key={c} className="p-1">
                    <FieldControl
                      variant={COLUMN_VARIANT[col.type] ?? "text"}
                      className="h-8 border-0 shadow-none focus-visible:ring-1"
                    />
                  </td>
                ))}
                <td className="p-1 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove row"
                    disabled={rows === 1}
                    onClick={() => setRows((n) => Math.max(1, n - 1))}
                  >
                    <X className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" onClick={() => setRows((n) => n + 1)}>
        <Plus className="size-4" />
        Add row
      </Button>
    </div>
  )
}

function PreviewField({
  field,
  themeVars,
}: {
  field: FieldInstance
  /** resolved theme vars, applied to the portaled Select menu so it stays themed */
  themeVars?: CSSProperties
}) {
  const { data } = field

  switch (field.type) {
    case "text":
      return (
        <Field>
          <PreviewLabel label={data.label} required={data.required} />
          <FieldControl
            variant={VALIDATION_VARIANT[data.validation ?? ""] ?? "text"}
            placeholder={data.placeholder}
          />
        </Field>
      )

    case "textarea":
      return (
        <Field>
          <PreviewLabel label={data.label} required={data.required} />
          <Textarea placeholder={data.placeholder} rows={3} />
        </Field>
      )

    case "select": {
      const options = (data.options ?? []).filter(
        (o) => o.value.trim() && o.label.trim()
      )
      return (
        <Field>
          <PreviewLabel label={data.label} required={data.required} />
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={data.placeholder?.trim() || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent position="popper" style={themeVars}>
              <SelectGroup>
                {options.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No options
                  </div>
                ) : (
                  options.map((o, i) => (
                    <SelectItem key={i} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      )
    }

    case "radio": {
      const options = (data.options ?? []).filter(
        (o) => o.value.trim() && o.label.trim()
      )
      return (
        <Field>
          <PreviewLabel label={data.label} required={data.required} />
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">No options</p>
          ) : (
            <RadioGroup>
              {options.map((o, i) => {
                const id = `${field.id}-${i}`
                return (
                  <div key={i} className="flex items-center gap-2">
                    <RadioGroupItem value={o.value} id={id} />
                    <FieldLabel
                      htmlFor={id}
                      className="font-normal text-foreground"
                    >
                      {o.label}
                    </FieldLabel>
                  </div>
                )
              })}
            </RadioGroup>
          )}
        </Field>
      )
    }

    case "file":
      return (
        <Field>
          <PreviewLabel label={data.label} required={data.required} />
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center transition-colors hover:border-muted-foreground/50 hover:bg-accent/50">
            <Upload className="size-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {data.placeholder?.trim() ||
                "Drag & drop a file, or click to browse"}
            </span>
            <input
              type="file"
              className="hidden"
              accept={FILE_ACCEPT[data.validation ?? "All"]}
            />
          </label>
        </Field>
      )

    case "table":
      return (
        <Field>
          <PreviewLabel label={data.label} required={data.required} />
          <TablePreview field={field} />
        </Field>
      )
  }
}

export default function FormPreview({
  fields,
  themeVars,
}: {
  fields: FieldInstance[]
  themeVars?: CSSProperties
}) {
  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a field to see the preview.
      </p>
    )
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => e.preventDefault()}
    >
      {fields.map((field) => (
        <PreviewField key={field.id} field={field} themeVars={themeVars} />
      ))}
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  )
}
