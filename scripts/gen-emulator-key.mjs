// Generate a throwaway service-account key for the LOCAL Firestore emulator.
//   node scripts/gen-emulator-key.mjs            # create if missing
//   node scripts/gen-emulator-key.mjs --force    # regenerate, overwriting
//
// This is NOT a real credential. The "demo-*" emulator runs fully offline and
// ignores the token entirely; the key only exists so the Firestore client's
// REST transport can sign a self-signed JWT locally (see lib/firestore.ts).
import { generateKeyPairSync } from "node:crypto"
import { existsSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const out = fileURLToPath(
  new URL("../firebase-emulator-sa.json", import.meta.url)
)

if (existsSync(out) && !process.argv.includes("--force")) {
  console.log(
    "firebase-emulator-sa.json already exists — leaving it. Pass --force to regenerate."
  )
  process.exit(0)
}

const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
})

const sa = {
  type: "service_account",
  project_id: "demo-ketrone",
  private_key_id: "emulator-local",
  private_key: privateKey,
  client_email: "emulator@demo-ketrone.iam.gserviceaccount.com",
  client_id: "0",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
}

writeFileSync(out, JSON.stringify(sa, null, 2) + "\n")
console.log(`wrote ${out} (throwaway emulator key — not a real credential)`)
