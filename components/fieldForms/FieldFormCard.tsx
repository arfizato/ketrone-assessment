"use client"

import { ChevronDown } from "lucide-react"
import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { FIELD_META } from "./meta"
import { FieldType } from "./types"

/**
 * Collapsible card wrapper shared by every field-config form. Shows the field
 * type's icon + name with the user's label as a subtitle, and a chevron that
 * collapses the config body so long forms stay scannable. Collapse state is
 * controlled by the builder list (so the drag/duplicate/delete rail can react
 * to it — only reordering stays available while collapsed).
 */
export function FieldFormCard({
  type,
  label,
  open,
  onToggle,
  children,
}: {
  type: FieldType
  label?: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const { name, desc, icon: Icon } = FIELD_META[type]
  const subtitle = label?.trim() || desc

  return (
    <Card className="p-4">
      <div className={cn("flex items-center gap-2.5", open && "border-b pb-3")}>
        <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md border">
          <Icon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm leading-none font-semibold">{name}</span>
          <span className="text-muted-foreground mt-1 truncate text-xs">
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
