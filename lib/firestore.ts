import { Firestore } from "@google-cloud/firestore"

// Project id: a throwaway "demo-" id locally (the emulator treats demo-* as
// offline), the real GCP project in production. The client auto-connects to the
// emulator when FIRESTORE_EMULATOR_HOST is set; on Cloud Run it uses the service
// account's Application Default Credentials. preferRest uses the REST transport
// (gRPC fails to complete its HTTP/2 handshake against the loopback emulator on
// Windows). Locally, GOOGLE_APPLICATION_CREDENTIALS points at a throwaway key so
// the client can sign a self-signed JWT offline — the emulator ignores the token.
const projectId =
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  "demo-ketrone"

// Reuse one client across Next's dev HMR reloads.
const globalForFirestore = globalThis as unknown as { __db?: Firestore }

export const db =
  globalForFirestore.__db ??
  new Firestore({
    projectId,
    ignoreUndefinedProperties: true,
    preferRest: true,
  })

if (process.env.NODE_ENV !== "production") globalForFirestore.__db = db

/** Collection holding one document per form, keyed by form id. */
export const FORMS = "forms"

/** Per-form subcollection of received submissions (forms/<id>/submissions). */
export const SUBMISSIONS = "submissions"
