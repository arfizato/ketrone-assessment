"use client"

import FormPreview from "@/components/FormPreview"
import { FieldInstance } from "@/components/fieldForms/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Braces } from "lucide-react"
import { useState } from "react"

/**
 * Live preview of the form, with a header toggle to inspect the raw field
 * state as JSON for debugging. Owns only its local view toggle; the field
 * data is passed in.
 */
export default function PreviewPanel({
  fields,
  className,
}: {
  fields: FieldInstance[]
  className?: string
}) {
  const [showJson, setShowJson] = useState(false)

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">
          {showJson ? "Form state" : "Preview"}
        </h2>
        <Button
          variant={showJson ? "secondary" : "ghost"}
          size="icon"
          aria-label="Toggle debug state"
          aria-pressed={showJson}
          onClick={() => setShowJson((v) => !v)}
        >
          <Braces className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {showJson ? (
          <pre className="bg-accent rounded p-3 text-xs">
            {JSON.stringify(fields, null, 2)}
          </pre>
        ) : (
          <FormPreview fields={fields} />
        )}
      </div>
    </div>
  )
}
