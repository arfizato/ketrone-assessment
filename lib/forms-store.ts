import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ConfigsSchema, type Config } from "./schemas"

const FORMS_PATH = join(process.cwd(), "data", "forms.json")

/**
 * Read all forms from the JSON store and return the one matching `id`.
 * Reads on every call (no cache) so the GET route can stay `no-store` and
 * reflect edits instantly. Swap the body for a Firestore query later —
 * the signature is the seam.
 */
export async function getForm(id: string): Promise<Config | null> {
  const raw = await readFile(FORMS_PATH, "utf8")
  const forms = ConfigsSchema.parse(JSON.parse(raw))
  return forms.find((f) => f.id === id) ?? null
}
