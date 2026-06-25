// Seed the local Firestore emulator from data/forms.json.
// Usage (with the emulator already running via `npm run emulator`):
//   npm run seed
import { fileURLToPath } from "node:url"

process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8910"
process.env.GCLOUD_PROJECT ||= "demo-ketrone"
// Throwaway local key so the REST transport can sign a self-signed JWT offline;
// the emulator ignores the token. (Same file the app uses via .env.local.)
process.env.GOOGLE_APPLICATION_CREDENTIALS ||= fileURLToPath(
  new URL("../firebase-emulator-sa.json", import.meta.url)
)

import { readFile } from "node:fs/promises"
// Dynamic import so the env vars above are set before the client initialises.
const { Firestore } = await import("@google-cloud/firestore")

const db = new Firestore({
  projectId: process.env.GCLOUD_PROJECT,
  preferRest: true,
})

const url = new URL("../data/forms.json", import.meta.url)
const forms = JSON.parse(await readFile(url, "utf8"))

for (const { id, ...body } of forms) {
  await db.collection("forms").doc(id).set(body)
  console.log(`seeded ${id} — ${body.title}`)
}
console.log(`done: ${forms.length} forms in the emulator`)
process.exit(0)
