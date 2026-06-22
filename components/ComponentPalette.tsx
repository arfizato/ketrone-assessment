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
    <div className={cn("bg-muted/30 flex h-full flex-col", className)}>
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Components</h2>
        <p className="text-muted-foreground text-xs">Click to add a field</p>
      </div>
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-col gap-1.5 overflow-auto p-3">
          {FIELD_ORDER.map((type) => {
            const { name, desc, icon: Icon } = FIELD_META[type]
            return (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onAdd(type)}
                    className="group bg-card hover:border-border hover:bg-accent focus-visible:ring-ring flex items-center gap-3 rounded-lg border border-transparent p-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="bg-background text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors">
                      <Icon className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm leading-none font-medium">
                        {name}
                      </span>
                      <span className="text-muted-foreground mt-1 truncate text-xs">
                        {desc}
                      </span>
                    </span>
                    <Plus className="text-muted-foreground/0 group-hover:text-muted-foreground ml-auto size-4 shrink-0 transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="font-medium">{name}</span> — {desc}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>
    </div>
  )
}
