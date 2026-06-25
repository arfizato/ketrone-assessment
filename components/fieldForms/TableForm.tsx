"use client"

import { Button } from "../ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "../ui/field"
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
import { FieldFormProps, TableColumn } from "./types"
import { Plus, X } from "lucide-react"

const COLUMN_TYPES = ["Text", "Number", "Currency", "Percent", "Date"]

function TableForm({ field, update, open, onToggle }: FieldFormProps) {
  const { data } = field
  const columns = data.columns ?? []

  // every mutation rewrites the whole columns array back into the backbone
  const setColumns = (next: TableColumn[]) => update({ columns: next })

  const updateColumn = (index: number, patch: Partial<TableColumn>) =>
    setColumns(columns.map((c, i) => (i === index ? { ...c, ...patch } : c)))

  const dropColumn = (index: number) =>
    setColumns(columns.filter((_, i) => i !== index))

  const addColumn = () => setColumns([...columns, { label: "", type: "Text" }])

  return (
    <FieldFormCard field={field} open={open} onToggle={onToggle}>
      <Field aria-required>
        <FieldLabel>Label</FieldLabel>
        <Input
          placeholder="Work experience"
          value={data.label ?? ""}
          onChange={(e) => update({ label: e.target.value })}
        />
        <FieldError></FieldError>
      </Field>

      <FieldGroup className="gap-3">
        <FieldTitle>Columns</FieldTitle>
        {columns.map((col, i) => (
          <Field
            aria-required
            key={i}
            orientation="horizontal"
            className="px-2"
          >
            <span className="w-full">
              <FieldLabel>Header</FieldLabel>
              <Input
                placeholder="Company"
                value={col.label}
                onChange={(e) => updateColumn(i, { label: e.target.value })}
              />
            </span>

            <span className="w-full">
              <FieldLabel>Type</FieldLabel>
              <Select
                value={col.type}
                onValueChange={(value) => updateColumn(i, { type: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Text" className="w-full" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {COLUMN_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </span>
            <span>
              <FieldLabel className="opacity-0">.</FieldLabel>
              <Button
                variant="destructive"
                size="icon"
                aria-label="Remove column"
                onClick={() => dropColumn(i)}
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
          onClick={addColumn}
        >
          <Plus className="size-4" />
          Add column
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
    </FieldFormCard>
  )
}

export default TableForm
