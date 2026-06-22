"use client"

import { cn } from "@/lib/utils"
import {
  CircleDot,
  List,
  Plus,
  Table,
  Type,
  Upload,
  type LucideIcon,
} from "lucide-react"
import { FieldType } from "./fieldForms/types"

type PaletteItem = {
  name: string
  type: FieldType
  desc: string
  icon: LucideIcon
}

/** The palette of field types the user can add. */
const FIELD_PALETTE: PaletteItem[] = [
  { name: "Text", type: "text", icon: Type, desc: "Single-line input" },
  { name: "Select", type: "select", icon: List, desc: "Dropdown of options" },
  { name: "Radio", type: "radio", icon: CircleDot, desc: "Single choice from a list" },
  { name: "File", type: "file", icon: Upload, desc: "File upload" },
  { name: "Table", type: "table", icon: Table, desc: "Editable grid" },
]

/**
 * The list of add-a-field buttons. Used as a sidebar on lg/md and inside the
 * bottom drawer on sm — the caller decides what `onAdd` does (e.g. also close
 * the drawer). Pass `className` to override the default full-height sizing.
 */
export default function ComponentPalette({
  onAdd,
  className,
}: {
  onAdd: (type: FieldType) => void
  className?: string
}) {
  return (
    <div className={cn("bg-muted/30 flex h-full flex-col", className)}>
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Components</h2>
        <p className="text-muted-foreground text-xs">Click to add a field</p>
      </div>
      <div className="flex flex-col gap-1.5 overflow-auto p-3">
        {FIELD_PALETTE.map((item) => (
          <button
            key={item.type}
            onClick={() => onAdd(item.type)}
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
  )
}
