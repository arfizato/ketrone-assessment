"use client"

import { ChevronDown } from "lucide-react"
import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { FIELD_META } from "./meta"
import { FieldInstance } from "./types"

// A spread of distinct icon tints; a field's id picks one deterministically so
// several cards of the same type (e.g. many Text fields) are easy to tell apart.
const ICON_COLORS = [
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  "bg-orange-500/15 text-orange-600 dark:text-orange-400",
]

function colorFor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return ICON_COLORS[h % ICON_COLORS.length]
}

/**
 * Collapsible card wrapper shared by every field-config form. Shows the field
 * type's icon (tinted per-instance so duplicates are distinguishable) + name,
 * with the user's label as a subtitle, and a chevron that collapses the config
 * body. Collapse state is controlled by the builder list (so the drag rail can
 * react to it — only reordering stays available while collapsed).
 */
export function FieldFormCard({
  field,
  open,
  onToggle,
  children,
}: {
  field: FieldInstance
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const { name, desc, icon: Icon } = FIELD_META[field.type]
  const subtitle = field.data.label?.trim() || desc

  return (
    <Card className="p-4">
      <div className={cn("flex items-center gap-2.5", open && "border-b pb-3")}>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md border",
            colorFor(field.id)
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm leading-none font-semibold">{name}</span>
          <span className="mt-1 truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={open ? "Collapse field" : "Expand field"}
          aria-expanded={open}
          onClick={onToggle}
        >
          <ChevronDown
            className={cn("size-4 transition-transform", !open && "-rotate-90")}
          />
        </Button>
      </div>
      {open && children}
    </Card>
  )
}
