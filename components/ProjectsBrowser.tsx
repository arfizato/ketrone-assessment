"use client"

import Link from "next/link"
import { useState } from "react"
import FormCardActions from "@/components/FormCardActions"
import FormStatusBadge, { STATUS_META } from "@/components/FormStatusBadge"
import FormThumb from "@/components/FormThumb"
import type { FormSummary } from "@/lib/forms-store"
import { FORM_STATUSES } from "@/lib/schemas"
import { cn } from "@/lib/utils"

type Filter = "all" | (typeof FORM_STATUSES)[number]

/**
 * The /projects list: status filter chips over a list of form rows. Each row
 * is a stretched-link card — the whole row navigates, while the status pill and
 * the duplicate/delete controls sit above it (pointer-events-auto) so they keep
 * their own clicks.
 */
export default function ProjectsBrowser({ forms }: { forms: FormSummary[] }) {
  const [filter, setFilter] = useState<Filter>("all")

  const countFor = (key: Filter) =>
    key === "all" ? forms.length : forms.filter((f) => f.status === key).length

  const visible =
    filter === "all" ? forms : forms.filter((f) => f.status === filter)

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    ...FORM_STATUSES.map((s) => ({ key: s, label: STATUS_META[s].label })),
  ]

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-1">
        {chips.map((c) => {
          const active = filter === c.key
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {c.label}
              <span className="ml-1.5 text-xs opacity-70">{countFor(c.key)}</span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        forms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No forms yet. Create one with{" "}
            <span className="font-medium">New form</span>, or seed the samples
            with <code className="font-mono">npm run seed</code>.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No{" "}
            {filter === "all"
              ? ""
              : STATUS_META[filter].label.toLowerCase() + " "}
            forms.
          </p>
        )
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((f) => (
            <li
              key={f.id}
              className="relative flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-foreground/30 hover:bg-accent"
            >
              {/* stretched link: the whole row is the click target */}
              <Link
                href={`/projects/${f.id}`}
                aria-label={f.title || "Untitled form"}
                className="absolute inset-0 z-0 rounded-lg"
              />
              <div className="pointer-events-none relative z-10 flex w-full items-center gap-3">
                <FormThumb id={f.id} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">
                      {f.title || "Untitled form"}
                    </span>
                    <span className="pointer-events-auto shrink-0">
                      <FormStatusBadge id={f.id} status={f.status} />
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {f.fieldCount} {f.fieldCount === 1 ? "field" : "fields"}
                    {f.subtitle ? ` · ${f.subtitle}` : ""}
                  </div>
                </div>
                <div className="pointer-events-auto shrink-0">
                  <FormCardActions id={f.id} title={f.title} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
