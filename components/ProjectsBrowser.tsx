"use client"

import Link from "next/link"
import { useState } from "react"
import FormCardActions from "@/components/FormCardActions"
import FormStatusBadge, { STATUS_META } from "@/components/FormStatusBadge"
import { FORM_STATUSES, type FormStatus } from "@/lib/schemas"
import { cn } from "@/lib/utils"

type FormSummary = { id: string; title: string; status: FormStatus }
type Filter = "all" | FormStatus

/**
 * The /projects list: status filter chips over a grid of form cards. Each card
 * is a full-card link with a status pill (bottom-left) and duplicate/delete
 * controls (top-right) overlaid as siblings so they don't trigger navigation.
 */
export default function ProjectsBrowser({ forms }: { forms: FormSummary[] }) {
  const [filter, setFilter] = useState<Filter>("all")

  const countFor = (key: Filter) =>
    key === "all" ? forms.length : forms.filter((f) => f.status === key).length

  const visible = filter === "all" ? forms : forms.filter((f) => f.status === filter)

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
            {filter === "all" ? "" : STATUS_META[filter].label.toLowerCase() + " "}
            forms.
          </p>
        )
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((f) => (
            <li key={f.id} className="relative">
              <Link
                href={`/projects/${f.id}`}
                className="block rounded-lg border bg-card p-4 pb-12 transition-colors hover:border-foreground/30 hover:bg-accent"
              >
                <div className="truncate pr-16 font-medium">{f.title}</div>
                <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
                  {f.id}
                </div>
              </Link>
              <div className="absolute bottom-3 left-4">
                <FormStatusBadge id={f.id} status={f.status} />
              </div>
              <FormCardActions
                id={f.id}
                title={f.title}
                className="absolute right-2 top-2"
              />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
