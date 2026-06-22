"use client"

import { Plus, Upload, X } from "lucide-react"
import { useState } from "react"
import { FieldInstance } from "./fieldForms/types"
import { Button } from "./ui/button"
import { Field, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

/** text-field validation -> native input type */
const INPUT_TYPES: Record<string, string> = {
  Email: "email",
  URL: "url",
  Number: "number",
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
  const columns = (field.data.columns ?? []).filter((c) => c.label.trim())
  const [rows, setRows] = useState(1)

  if (columns.length === 0) {
    return <p className="text-muted-foreground text-sm">No columns defined</p>
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-3 py-2 text-left font-medium">
                  {col.label}
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
                    <Input
                      type={
                        col.type === "Number"
                          ? "number"
                          : col.type === "Date"
                            ? "date"
                            : "text"
                      }
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

function PreviewField({ field }: { field: FieldInstance }) {
  const { data } = field

  switch (field.type) {
    case "text":
      return (
        <Field>
          <PreviewLabel label={data.label} required={data.required} />
          <Input
            type={INPUT_TYPES[data.validation ?? ""] ?? "text"}
            placeholder={data.placeholder}
          />
        </Field>
      )

    case "select": {
      const options = (data.options ?? []).filter(
        (o) => o.value.trim() && o.label.trim(),
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
            <SelectContent position="popper">
              <SelectGroup>
                {options.length === 0 ? (
                  <div className="text-muted-foreground px-2 py-1.5 text-sm">
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

    case "file":
      return (
        <Field>
          <PreviewLabel label={data.label} required={data.required} />
          <label className="border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-accent/50 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors">
            <Upload className="text-muted-foreground size-5" />
            <span className="text-muted-foreground text-sm">
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

export default function FormPreview({ fields }: { fields: FieldInstance[] }) {
  if (fields.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Add a field to see the preview.
      </p>
    )
  }

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      {fields.map((field) => (
        <PreviewField key={field.id} field={field} />
      ))}
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  )
}
