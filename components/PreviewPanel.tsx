"use client"

import ThemedPreview from "@/components/design/ThemedPreview"
import { FieldInstance } from "@/components/fieldForms/types"
import { Button } from "@/components/ui/button"
import { FormTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"
import { Braces } from "lucide-react"
import { useState } from "react"

/**
 * Live preview of the form, themed with the current FormTheme, plus a header
 * toggle to inspect the raw field state as JSON for debugging. Owns only its
 * local view toggle; the fields, theme, and preview mode are passed in. The
 * same panel is shown while building (Content) and while theming (Design).
 */
export default function PreviewPanel({
  fields,
  theme,
  mode = "light",
  className,
}: {
  fields: FieldInstance[]
  theme: FormTheme
  mode?: "light" | "dark"
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
      <div className="min-h-0 flex-1">
        {showJson ? (
          <div className="h-full overflow-auto p-4">
            <pre className="bg-accent rounded p-3 text-xs">
              {JSON.stringify({ fields, theme }, null, 2)}
            </pre>
          </div>
        ) : (
          <ThemedPreview theme={theme} mode={mode} fields={fields} />
        )}
      </div>
    </div>
  )
}
