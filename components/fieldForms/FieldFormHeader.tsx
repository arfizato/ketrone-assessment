import { FIELD_META } from "./meta"
import { FieldType } from "./types"

/**
 * Compact header for a builder card: the field type's icon + name, so each
 * card on the canvas is recognizable at a glance. Renders as the first child
 * inside the form's <Card>.
 */
export function FieldFormHeader({ type }: { type: FieldType }) {
  const { name, desc, icon: Icon } = FIELD_META[type]
  return (
    <div className="flex items-center gap-2.5 border-b pb-3">
      <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md border">
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-sm leading-none font-semibold">{name}</span>
        <span className="text-muted-foreground mt-1 truncate text-xs">
          {desc}
        </span>
      </div>
    </div>
  )
}
