import { randomUUID } from "node:crypto"
import { db, FORMS, SUBMISSIONS } from "./firestore"
import {
  ConfigSchema,
  PublicConfigSchema,
  type Config,
  type FormStatus,
  type PublicConfig,
} from "./schemas"
import type { WebhookResult } from "./webhook"
import { DEFAULT_THEME } from "./theme"

/**
 * Firestore-backed form store. Each form is one document in the `forms`
 * collection, keyed by its id (the id is the doc id, not a field in the body).
 * Locally this hits the emulator; on Cloud Run it hits real Firestore via ADC.
 */

/** Fetch one form by id. Returns null if it doesn't exist. */
export async function getForm(id: string): Promise<Config | null> {
  const snap = await db.collection(FORMS).doc(id).get()
  if (!snap.exists) return null
  return ConfigSchema.parse({ id: snap.id, ...snap.data() })
}

/** Lightweight id + title + status list for the admin /projects list. */
export async function listForms(): Promise<
  { id: string; title: string; status: FormStatus }[]
> {
  const snap = await db.collection(FORMS).get()
  return snap.docs.map((d) => ({
    id: d.id,
    title: (d.get("title") as string) ?? "Untitled",
    status: (d.get("status") as FormStatus) ?? "active",
  }))
}

/** Upsert a form. The id becomes the doc id; the rest is the doc body. */
export async function saveForm(config: Config): Promise<void> {
  const { id, ...body } = config
  await db.collection(FORMS).doc(id).set(body)
}

/**
 * Create a blank form (default theme, no fields) and persist it. Returns the
 * new id so the caller can navigate into the builder. Ids match the seed style:
 * a short `frm_` prefix + random suffix.
 */
export async function createForm(title = "Untitled form"): Promise<string> {
  const id = `frm_${randomUUID().replace(/-/g, "").slice(0, 9)}`
  await saveForm({ id, title, status: "active", theme: DEFAULT_THEME, fields: [] })
  return id
}

/** Update just a form's lifecycle status (merge — leaves the rest intact). */
export async function setFormStatus(
  id: string,
  status: FormStatus
): Promise<void> {
  await db.collection(FORMS).doc(id).set({ status }, { merge: true })
}

/** Delete a form. (Its submissions subcollection is left for a server-side
 *  cleanup job; the client SDK can't recursively delete in one call.) */
export async function deleteForm(id: string): Promise<void> {
  await db.collection(FORMS).doc(id).delete()
}

/** Copy a form into a new id (title suffixed "(copy)"). Returns the new id. */
export async function duplicateForm(id: string): Promise<string> {
  const form = await getForm(id)
  if (!form) throw new Error(`form ${id} not found`)
  const newId = `frm_${randomUUID().replace(/-/g, "").slice(0, 9)}`
  await saveForm({ ...form, id: newId, title: `${form.title} (copy)` })
  return newId
}

/** Strip server-only secrets so the form is safe to send to the public embed. */
export function toPublicForm(config: Config): PublicConfig {
  // PublicConfigSchema omits webhookUrl/webhookSecret/allowedOrigins, and Zod
  // drops keys not in the schema — so the parse guarantees they can't leak.
  return PublicConfigSchema.parse(config)
}

/** Store one submission under forms/<id>/submissions. Returns the new doc id. */
export async function saveSubmission(
  formId: string,
  submission: { values: Record<string, unknown>; origin: string | null }
): Promise<string> {
  const ref = await db
    .collection(FORMS)
    .doc(formId)
    .collection(SUBMISSIONS)
    .add({ ...submission, submittedAt: new Date().toISOString() })
  return ref.id
}

/** Record the outbound webhook outcome on a stored submission (best-effort). */
export async function recordWebhookResult(
  formId: string,
  submissionId: string,
  webhook: WebhookResult
): Promise<void> {
  await db
    .collection(FORMS)
    .doc(formId)
    .collection(SUBMISSIONS)
    .doc(submissionId)
    .set({ webhook }, { merge: true })
}
