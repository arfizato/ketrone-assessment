"use client"

import FileForm from "@/components/fieldForms/FileForm"
import SelectForm from "@/components/fieldForms/SelectForm"
import TextForm from "@/components/fieldForms/TextForm"
import {
  DEFAULT_FIELD_DATA,
  FieldData,
  FieldFormProps,
  FieldInstance,
  FieldType,
} from "@/components/fieldForms/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ComponentType, useState } from "react"

type PaletteItem = {
  name: string
  type: FieldType
  desc?: string
}

/** The left-rail palette of field types the user can add. */
const FIELD_PALETTE: PaletteItem[] = [
  { name: "Text", type: "text" },
  { name: "Select", type: "select", desc: "select something man" },
  { name: "Radio", type: "radio" },
  { name: "File", type: "file" },
  { name: "List", type: "list" },
]
function PlaceholderForm({ field, remove }: FieldFormProps) {
  return (
    <Card className="flex-row items-center justify-between p-4">
      <span className="bg-accent p-2">{field.type} field — coming soon</span>
      <Button variant="ghost" onClick={remove}>
        ❌
      </Button>
    </Card>
  )
}
const FIELD_COMPONENTS: Record<FieldType, ComponentType<FieldFormProps>> = {
  text: TextForm,
  select: SelectForm,
  radio: PlaceholderForm,
  file: FileForm,
  list: PlaceholderForm,
}

export default function Page() {
  // --- the backbone: a single source of truth for the whole form ---
  const [form, setForm] = useState<FieldInstance[]>([])

  const addField = (type: FieldType) => {
    setForm((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, data: { ...DEFAULT_FIELD_DATA[type] } },
    ])
  }
  const updateField = (id: string, patch: Partial<FieldData>) => {
    setForm((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, data: { ...f.data, ...patch } } : f
      )
    )
  }
  const removeField = (id: string) => {
    setForm((prev) => prev.filter((f) => f.id !== id))
  }
  const moveField = (id: string, direction: -1 | 1) => {
    setForm((prev) => {
      const index = prev.findIndex((f) => f.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-12 w-full bg-accent p-2">nav</div>
      <ResizablePanelGroup
        orientation="horizontal"
        className="w-full rounded-lg border"
      >
        {/* TODO: use drawer for responsive on small screens */}
        <ResizablePanel defaultSize="15%" minSize="150px">
          <div className="h-[200px] flex-col items-center justify-center gap-6 p-6">
            {FIELD_PALETTE.map((item) => (
              <button
                key={item.type}
                className="my-4 bg-zinc-600"
                onClick={() => addField(item.type)}
              >
                <span>{item.name}</span>
                {item.desc && (
                  <span className="font-mono italic">{item.desc}</span>
                )}
              </button>
            ))}
          </div>
        </ResizablePanel>

        {/* TODO: use tabs for responsive on medium screens */}
        <ResizableHandle />
        <ResizablePanel defaultSize="50%" minSize="450px">
          <div className="h-full flex-col items-center justify-center gap-4 overflow-auto p-6">
            {form.map((field, i) => {
              const Comp = FIELD_COMPONENTS[field.type]
              return (
                <div key={field.id} className="flex items-start gap-2 py-2">
                  {/* TODO: turn into drag & drop ux => objectively better  */}
                  <div className="flex flex-col gap-1 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={i === 0}
                      onClick={() => moveField(field.id, -1)}
                    >
                      ⬆️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={i === form.length - 1}
                      onClick={() => moveField(field.id, 1)}
                    >
                      ⬇️
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Comp
                      field={field}
                      update={(patch) => updateField(field.id, patch)}
                      remove={() => removeField(field.id)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </ResizablePanel>

        {/* live view of the shared backbone state */}
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="35%" minSize="300px">
          <div className="h-full overflow-auto p-6">
            <span className="font-semibold">Form state</span>
            <pre className="mt-4 rounded bg-accent p-3 text-xs">
              {JSON.stringify(form, null, 2)}
            </pre>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
