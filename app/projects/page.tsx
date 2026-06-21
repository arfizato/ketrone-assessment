"use client"

import FileForm from "@/components/fieldForms/FileForm"
import SelectForm from "@/components/fieldForms/SelectForm"
import TableForm from "@/components/fieldForms/TableForm"
import TextForm from "@/components/fieldForms/TextForm"
import {
  DEFAULT_FIELD_DATA,
  FieldData,
  FieldFormProps,
  FieldInstance,
  FieldType,
} from "@/components/fieldForms/types"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Copy, GripVertical, Trash2 } from "lucide-react"
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
  { name: "File", type: "file" },
  { name: "Table", type: "table" },
]
const FIELD_COMPONENTS: Record<FieldType, ComponentType<FieldFormProps>> = {
  text: TextForm,
  select: SelectForm,
  file: FileForm,
  table: TableForm,
}

/** One sortable field card with its drag / duplicate / delete control rail. */
function SortableField({
  field,
  update,
  remove,
  duplicate,
}: {
  field: FieldInstance
  update: (patch: Partial<FieldData>) => void
  remove: () => void
  duplicate: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id })
  const Comp = FIELD_COMPONENTS[field.type]

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-start gap-2 py-2",
        isDragging && "relative z-10 opacity-60",
      )}
    >
      <div className="flex flex-col gap-1 pt-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Drag to reorder"
          className="cursor-grab touch-none active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Duplicate field"
          onClick={duplicate}
        >
          <Copy className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete field"
          className="text-destructive hover:text-destructive"
          onClick={remove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="flex-1">
        <Comp field={field} update={update} />
      </div>
    </div>
  )
}

export default function Page() {
  // --- the backbone: a single source of truth for the whole form ---
  const [form, setForm] = useState<FieldInstance[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

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
  // insert a deep copy right after the original
  const duplicateField = (id: string) => {
    setForm((prev) => {
      const index = prev.findIndex((f) => f.id === id)
      if (index < 0) return prev
      const copy: FieldInstance = {
        ...prev[index],
        id: crypto.randomUUID(),
        data: structuredClone(prev[index].data),
      }
      const next = [...prev]
      next.splice(index + 1, 0, copy)
      return next
    })
  }
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setForm((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id)
      const newIndex = prev.findIndex((f) => f.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={form.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {form.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    update={(patch) => updateField(field.id, patch)}
                    remove={() => removeField(field.id)}
                    duplicate={() => duplicateField(field.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
