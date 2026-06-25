"use client"

import { Copy, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import {
  deleteFormAction,
  duplicateFormAction,
} from "@/app/projects/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

/**
 * Per-card duplicate + delete controls for the /projects list. Rendered as an
 * overlay (a sibling of the card's Link, not a child) so clicks don't trigger
 * navigation. Delete is gated behind a confirm dialog since it's irreversible.
 */
export default function FormCardActions({
  id,
  title,
  className,
}: {
  id: string
  title: string
  className?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const duplicate = () =>
    startTransition(async () => {
      try {
        await duplicateFormAction(id)
        router.refresh()
        toast.success("Form duplicated")
      } catch {
        toast.error("Couldn't duplicate the form.")
      }
    })

  const remove = () =>
    startTransition(async () => {
      try {
        await deleteFormAction(id)
        router.refresh()
        toast.success("Form deleted")
      } catch {
        toast.error("Couldn't delete the form.")
      }
    })

  return (
    <div className={className}>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Duplicate form"
          onClick={duplicate}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete form"
              className="text-destructive hover:text-destructive"
              disabled={isPending}
            >
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{title}”?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the form, and any site embedding it will
                stop rendering. This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={remove}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
