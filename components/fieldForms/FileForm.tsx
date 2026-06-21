"use client"

import { Button } from "../ui/button"
import { Card } from "../ui/card"
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
import { FieldFormProps } from "./types"

function FileForm({ field, update, remove }: FieldFormProps) {
  const { data } = field

  return (
    <Card className="p-4">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={remove}>
          ❌
        </Button>
      </div>

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
          <SelectContent>
            <SelectGroup>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="Image">Image</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {/* preview of the large drop-zone the rendered field will show */}
      <div className="border-muted-foreground/25 text-muted-foreground rounded-lg border-2 border-dashed p-8 text-center text-sm">
        {data.placeholder?.trim() || "Drag & drop a file, or click to browse"}
      </div>

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

export default FileForm
