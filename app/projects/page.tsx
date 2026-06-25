import { Plus } from "lucide-react"
import { listForms } from "@/lib/forms-store"
import { Button } from "@/components/ui/button"
import ProjectsBrowser from "@/components/ProjectsBrowser"
import { createFormAction } from "./actions"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const forms = await listForms()

  return (
    <div className="mx-auto min-h-svh w-full max-w-3xl px-6 py-10">
      <header className="mb-6 flex items-start justify-between gap-4">
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

      <ProjectsBrowser forms={forms} />
    </div>
  )
}
