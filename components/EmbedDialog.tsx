"use client"

import { Check, Copy, Share2 } from "lucide-react"
import { useEffect, useState } from "react"
import { buildSnippet } from "@/lib/embed-snippet"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FormSummary = { id: string; title: string }

/**
 * Header CTA: a lawyer picks a published form and copies the one-line <script>
 * snippet to paste on their site. Reads the available forms from /api/forms;
 * saving the current builder draft is handled separately (not yet wired).
 */
export default function EmbedDialog({ formId }: { formId?: string }) {
  const [open, setOpen] = useState(false)
  const [forms, setForms] = useState<FormSummary[]>([])
  const [selectedId, setSelectedId] = useState(formId ?? "")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Load the publishable forms each time the dialog opens.
  useEffect(() => {
    if (!open) return
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null)
    fetch("/api/forms", { cache: "no-store" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status)))
      )
      .then((list: FormSummary[]) => {
        if (!active) return
        setForms(list)
        setSelectedId((id) => id || list[0]?.id || "")
      })
      .catch(() => {
        if (active) setError("Couldn't load your forms.")
      })
    return () => {
      active = false
    }
  }, [open])

  const origin = typeof window === "undefined" ? "" : window.location.origin
  const snippet = selectedId ? buildSnippet(origin, selectedId) : ""

  async function copy() {
    if (!snippet) return
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Couldn't copy to the clipboard.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Share2 className="size-4" />
          Publish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish &amp; embed</DialogTitle>
          <DialogDescription>
            Paste this snippet into your site&apos;s HTML. It renders the live
            form and reflects edits on the next page load — no redeploy.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Form</span>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a form" />
              </SelectTrigger>
              <SelectContent position="popper">
                {forms.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="p-2">
                    {f.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Embed snippet</span>
            <div className="flex min-w-0 items-start gap-2">
              {/* radius + border live on this wrapper (overflow-hidden) so the
                  inner scrollbar is clipped to the rounded shape */}
              <div className="h-8 min-w-0 flex-1 overflow-hidden rounded-md border bg-muted">
                <pre className="scrollbar-inset flex h-full items-center overflow-x-auto px-3 text-xs whitespace-pre">
                  <code>{snippet || "—"}</code>
                </pre>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copy}
                disabled={!snippet}
                aria-label="Copy snippet"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <p
              className={`text-xs text-muted-foreground ${copied ? "opacity-100" : "opacity-0"} transition-all duration-150`}
            >
              Copied to clipboard.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
