import { randomUUID } from "node:crypto"
import { db, FORMS } from "./firestore"
import { ConfigSchema, type Config } from "./schemas"
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

/** Lightweight id + title list for the admin form picker (Publish dialog). */
export async function listForms(): Promise<{ id: string; title: string }[]> {
  const snap = await db.collection(FORMS).get()
  return snap.docs.map((d) => ({
    id: d.id,
    title: (d.get("title") as string) ?? "Untitled",
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
  await saveForm({ id, title, theme: DEFAULT_THEME, fields: [] })
  return id
}
