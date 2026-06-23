"use client"

import FormPreview from "@/components/FormPreview"
import { FieldInstance } from "@/components/fieldForms/types"
import { FormTheme, resolveTheme } from "@/lib/theme"
import { CSSProperties } from "react"

/** Shown when the form has no fields yet, so theming is still visible. */
const SAMPLE_FIELDS: FieldInstance[] = [
  { id: "sample-name", type: "text", data: { label: "Full name", placeholder: "Jane Doe", required: true } },
  { id: "sample-email", type: "text", data: { label: "Email", placeholder: "jane@firm.com", validation: "Email", required: true } },
  {
    id: "sample-matter",
    type: "select",
    data: {
      label: "Matter type",
      placeholder: "Select a matter",
      options: [
        { label: "Corporate", value: "corporate" },
        { label: "Litigation", value: "litigation" },
        { label: "Real estate", value: "real-estate" },
      ],
    },
  },
]

/**
 * Renders the live, themed form. The resolved CSS variables are spread onto a
 * stage element (so the form's own --background shows behind it) and the enum
 * knobs ride as data-* on the inner `.themed-form` wrapper. <FormPreview> is
 * reused unchanged — the cascade does the theming.
 */
export default function ThemedPreview({
  theme,
  mode,
  fields,
  className,
}: {
  theme: FormTheme
  mode: "light" | "dark"
  fields: FieldInstance[]
  className?: string
}) {
  const vars = resolveTheme(theme, mode)
  const shown = fields.length > 0 ? fields : SAMPLE_FIELDS

  return (
    <div
      className={
        "flex h-full items-start justify-center overflow-auto p-6 " +
        (className ?? "")
      }
      style={{ ...vars, background: "var(--background)" } as CSSProperties}
    >
      <div
        className="themed-form w-full max-w-md"
        data-field-style={theme.fieldStyle}
        data-container={theme.container}
        data-density={theme.density}
        data-shadow={theme.shadow}
      >
        {fields.length === 0 && (
          <p className="mb-4 text-center text-xs text-muted-foreground">
            Sample form — add fields in Content to theme your own.
          </p>
        )}
        <FormPreview fields={shown} />
      </div>
    </div>
  )
}
