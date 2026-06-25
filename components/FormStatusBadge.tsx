"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { setFormStatusAction } from "@/app/projects/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FORM_STATUSES, type FormStatus } from "@/lib/schemas"
import { cn } from "@/lib/utils"

/** Label + dot color for each status, shared with the /projects filters. */
export const STATUS_META: Record<FormStatus, { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-emerald-500" },
  inactive: { label: "Inactive", dot: "bg-amber-500" },
  archived: { label: "Archived", dot: "bg-muted-foreground" },
}

/** A status pill that opens a menu to change a form's lifecycle status. */
export default function FormStatusBadge({
  id,
  status,
}: {
  id: string
  status: FormStatus
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const meta = STATUS_META[status]

  const change = (next: string) => {
    if (next === status) return
    startTransition(async () => {
      try {
        await setFormStatusAction(id, next as FormStatus)
        router.refresh()
      } catch {
        toast.error("Couldn't update the status.")
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label="Change status"
        className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
      >
        <span className={cn("size-1.5 rounded-full", meta.dot)} />
        {meta.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <DropdownMenuLabel>Set status</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={status} onValueChange={change}>
          {FORM_STATUSES.map((s) => (
            <DropdownMenuRadioItem key={s} value={s}>
              <span className={cn("size-1.5 rounded-full", STATUS_META[s].dot)} />
              {STATUS_META[s].label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
