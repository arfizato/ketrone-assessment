"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  createForm,
  deleteForm,
  duplicateForm,
  saveForm,
  setFormStatus,
} from "@/lib/forms-store"
import { ConfigSchema, type Config, type FormStatus } from "@/lib/schemas"

/**
 * Persist a form edited in the builder. Same-origin admin write, so it goes
 * through a server action (no CORS) rather than the public embed API. The
 * payload is re-validated server-side before it touches Firestore.
 *
 * Instant sync: the embed fetches `/api/forms/<id>` with `no-store`, so the
 * next render on the lawyer's site reflects this save with no redeploy. We
 * revalidate the admin routes so the editor + list stay fresh too.
 */
export async function saveFormAction(input: Config): Promise<void> {
  const config = ConfigSchema.parse(input)
  await saveForm(config)
  revalidatePath(`/projects/${config.id}`)
  revalidatePath("/projects")
}

/** Create a blank form and drop the lawyer straight into its builder. */
export async function createFormAction(): Promise<void> {
  const id = await createForm()
  revalidatePath("/projects")
  redirect(`/projects/${id}`)
}

/** Duplicate a form (stays on the list; caller refreshes to show the copy). */
export async function duplicateFormAction(id: string): Promise<void> {
  await duplicateForm(id)
  revalidatePath("/projects")
}

/** Delete a form. */
export async function deleteFormAction(id: string): Promise<void> {
  await deleteForm(id)
  revalidatePath("/projects")
}

/** Change a form's lifecycle status (active / inactive / archived). */
export async function setFormStatusAction(
  id: string,
  status: FormStatus
): Promise<void> {
  await setFormStatus(id, status)
  revalidatePath("/projects")
}
