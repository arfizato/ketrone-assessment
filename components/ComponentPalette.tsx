"use client"

import { FIELD_META, FIELD_ORDER } from "@/components/fieldForms/meta"
import { FieldType } from "@/components/fieldForms/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

/**
 * The list of add-a-field buttons. Used as a sidebar on lg/md and inside the
 * bottom drawer on sm — the caller decides what `onAdd` does (e.g. also close
 * the drawer). Pass `className` to override the default full-height sizing.
 *
 * Each item carries a tooltip with its description, so the meaning stays
 * readable even when the panel is narrow enough to truncate the inline text.
 */
export default function ComponentPalette({
  onAdd,
  className,
}: {
  onAdd: (type: FieldType) => void
  className?: string
}) {
  return (
    <div className={cn("flex h-full flex-col bg-muted/30", className)}>
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Components</h2>
        <p className="text-xs text-muted-foreground">Click to add a field</p>
      </div>
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-col gap-1.5 overflow-auto p-3">
          {FIELD_ORDER.filter(
            (type) => FIELD_META[type].group === "decorational"
          ).map((type) => ComponentGroup(type, onAdd))}

          <span className="mx-auto my-2 h-px w-11/12 bg-muted-foreground opacity-30" />

          {FIELD_ORDER.filter(
            (type) => FIELD_META[type].group === "functional"
          ).map((type) => ComponentGroup(type, onAdd))}
        </div>
      </TooltipProvider>
    </div>
  )
}

function ComponentGroup(type: FieldType, onAdd: (type: FieldType) => void) {
  const { name, desc, icon: Icon } = FIELD_META[type]
  return (
    <Tooltip key={type}>
      <TooltipTrigger asChild>
        <button
          onClick={() => onAdd(type)}
          className="group flex items-center gap-3 rounded-lg border border-transparent bg-card p-2.5 text-left transition-colors hover:border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-foreground">
            <Icon className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-sm leading-none font-medium">{name}</span>
            <span className="mt-1 truncate text-xs text-muted-foreground">
              {desc}
            </span>
          </span>
          <Plus className="ml-auto size-4 shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <span className="font-medium">{name}</span> — {desc}
      </TooltipContent>
    </Tooltip>
  )
}
