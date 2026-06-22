"use client"

import FileForm from "@/components/fieldForms/FileForm"
import RadioForm from "@/components/fieldForms/RadioForm"
import SelectForm from "@/components/fieldForms/SelectForm"
import TableForm from "@/components/fieldForms/TableForm"
import TextForm from "@/components/fieldForms/TextForm"
import FormPreview from "@/components/FormPreview"
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
import {
  Braces,
  CircleDot,
  Copy,
  GripVertical,
  LayoutTemplate,
  List,
  Plus,
  Table,
  Trash2,
  Type,
  Upload,
  type LucideIcon,
} from "lucide-react"
import { ComponentType, useState } from "react"

type PaletteItem = {
  name: string
  type: FieldType
  desc: string
  icon: LucideIcon
}

/** The left-rail palette of field types the user can add. */
const FIELD_PALETTE: PaletteItem[] = [
  { name: "Text", type: "text", icon: Type, desc: "Single-line input" },
  { name: "Select", type: "select", icon: List, desc: "Dropdown of options" },
  { name: "Radio", type: "radio", icon: CircleDot, desc: "Single choice from a list" },
  { name: "File", type: "file", icon: Upload, desc: "File upload" },
  { name: "Table", type: "table", icon: Table, desc: "Editable grid" },
]
const FIELD_COMPONENTS: Record<FieldType, ComponentType<FieldFormProps>> = {
  text: TextForm,
  select: SelectForm,
  radio: RadioForm,
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
  // right panel: rendered preview by default, raw JSON state for debugging
  const [showJson, setShowJson] = useState(false)

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
        <ResizablePanel defaultSize="15%" minSize="200px">
          <div className="bg-muted/30 flex h-full flex-col">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold tracking-tight">
                Components
              </h2>
              <p className="text-muted-foreground text-xs">
                Click to add a field
              </p>
            </div>
            <div className="flex flex-col gap-1.5 overflow-auto p-3">
              {FIELD_PALETTE.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addField(item.type)}
                  className="group bg-card hover:border-border hover:bg-accent focus-visible:ring-ring flex items-center gap-3 rounded-lg border border-transparent p-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="bg-background text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors">
                    <item.icon className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm leading-none font-medium">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground mt-1 truncate text-xs">
                      {item.desc}
                    </span>
                  </span>
                  <Plus className="text-muted-foreground/0 group-hover:text-muted-foreground ml-auto size-4 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </ResizablePanel>

        {/* TODO: use tabs for responsive on medium screens */}
        <ResizableHandle />
        <ResizablePanel defaultSize="50%" minSize="450px">
          <div className="h-full overflow-auto p-6">
            {form.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
                  <LayoutTemplate className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">No fields yet</p>
                  <p className="text-muted-foreground mx-auto max-w-xs text-sm">
                    Pick a component from the left to start building your form.
                  </p>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </ResizablePanel>

        {/* live preview of the form (toggle to raw state for debugging) */}
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="35%" minSize="300px">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold tracking-tight">
                {showJson ? "Form state" : "Preview"}
              </h2>
              <Button
                variant={showJson ? "secondary" : "ghost"}
                size="icon"
                aria-label="Toggle debug state"
                aria-pressed={showJson}
                onClick={() => setShowJson((v) => !v)}
              >
                <Braces className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {showJson ? (
                <pre className="bg-accent rounded p-3 text-xs">
                  {JSON.stringify(form, null, 2)}
                </pre>
              ) : (
                <FormPreview fields={form} />
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
