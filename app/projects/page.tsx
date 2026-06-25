import Link from "next/link"
import { Plus } from "lucide-react"
import { listForms } from "@/lib/forms-store"
import { Button } from "@/components/ui/button"
import FormCardActions from "@/components/FormCardActions"
import { createFormAction } from "./actions"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const forms = await listForms()

  return (
    <div className="mx-auto min-h-svh w-full max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your forms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {forms.length} {forms.length === 1 ? "form" : "forms"} in your
            workspace.
          </p>
        </div>
        <form action={createFormAction}>
          <Button type="submit" size="sm">
            <Plus className="size-4" />
            New form
          </Button>
        </form>
      </header>

      {forms.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No forms yet. Create one with <span className="font-medium">New form</span>,
          or seed the samples with <code className="font-mono">npm run seed</code>.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {forms.map((f) => (
            <li key={f.id} className="relative">
              <Link
                href={`/projects/${f.id}`}
                className="block rounded-lg border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-accent"
              >
                <div className="truncate pr-16 font-medium">{f.title}</div>
                <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
                  {f.id}
                </div>
              </Link>
              <FormCardActions
                id={f.id}
                title={f.title}
                className="absolute right-2 top-2"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
