"use client"

import FileForm from "@/components/fieldForms/FileForm"
import RadioForm from "@/components/fieldForms/RadioForm"
import SelectForm from "@/components/fieldForms/SelectForm"
import TableForm from "@/components/fieldForms/TableForm"
import TextForm from "@/components/fieldForms/TextForm"
import {
  FieldData,
  FieldFormProps,
  FieldInstance,
  FieldType,
} from "@/components/fieldForms/types"
import { Button } from "@/components/ui/button"
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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Copy, GripVertical, LayoutTemplate, Trash2 } from "lucide-react"
import { ComponentType, useState } from "react"

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
  // collapse lives here (not in the card) so the rail can drop duplicate/delete
  // when collapsed — only reordering stays, which keeps the row height tight
  const [open, setOpen] = useState(true)

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
        {open && (
          <>
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
          </>
        )}
      </div>
      <div className="flex-1">
        <Comp
          field={field}
          update={update}
          open={open}
          onToggle={() => setOpen((o) => !o)}
        />
      </div>
    </div>
  )
}

/**
 * The build surface: a sortable list of configured fields, or an empty state.
 * State lives in the page; this component just renders fields and reports
 * edits back through the callbacks. `onReorder` receives the dragged and
 * drop-target ids so the page can apply the move.
 */
export default function FormBuilder({
  fields,
  onUpdate,
  onRemove,
  onDuplicate,
  onReorder,
  className,
}: {
  fields: FieldInstance[]
  onUpdate: (id: string, patch: Partial<FieldData>) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  onReorder: (activeId: string, overId: string) => void
  className?: string
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorder(String(active.id), String(over.id))
  }

  return (
    <div className={cn("h-full overflow-auto p-6", className)}>
      {fields.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <LayoutTemplate className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">No fields yet</p>
            <p className="text-muted-foreground mx-auto max-w-xs text-sm">
              Pick a component to start building your form.
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
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field) => (
              <SortableField
                key={field.id}
                field={field}
                update={(patch) => onUpdate(field.id, patch)}
                remove={() => onRemove(field.id)}
                duplicate={() => onDuplicate(field.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
