# Ketrone — embeddable form platform

Ketrone is a no-code form builder whose forms embed on any third-party site with a
single `<script>` tag. The widget renders inside a **Shadow DOM** (so it's immune to
the host page's CSS), pulls its layout + theme **live** from the API (no redeploy to
update a form), and posts submissions to a secured ingestion endpoint that validates,
sanitises, persists to Firestore, and forwards each one to the firm's webhook with an
**HMAC-SHA256** signature.

- **Builder + live theming** — `/projects/<id>`
- **Embeddable runtime** — one `<script src=".../embed.js" data-form="...">` tag, Shadow-DOM isolated
- **APIs** — `GET /api/forms/<id>` (public config) and `POST /api/forms/<id>/submit` (validated ingestion)
- **Storage** — Firestore (`forms` collection; per-form `submissions` subcollection)

---

## Local development setup

### Prerequisites
- **Node.js 20+** and npm
- **Java 11+ (JRE)** — required by the Firestore emulator (`firebase-tools` runs it on the JVM)

No GCP account, billing, or real credentials are needed — everything runs against the
local emulator, fully offline.

### 1. Install dependencies
```bash
npm install
```

### 2. Create the local secrets (gitignored)
Two files are kept out of version control. Create them from the checked-in templates:

```bash
# environment — copy as-is; all values point at the local emulator
cp .env.local.example .env.local

# throwaway service-account key for the emulator
npm run gen:key
```

`.env.local` configures the emulator connection:
```
FIRESTORE_EMULATOR_HOST=127.0.0.1:8910
GCLOUD_PROJECT=demo-ketrone
GOOGLE_APPLICATION_CREDENTIALS=firebase-emulator-sa.json
```

`firebase-emulator-sa.json` is **not a real credential**. The `demo-*` project runs the
emulator fully offline and ignores the token entirely; the key only exists so the
Firestore client's REST transport can sign a self-signed JWT locally (see
[lib/firestore.ts](lib/firestore.ts)). `npm run gen:key` writes a fresh throwaway RSA
key into the file (pass `--force` to regenerate an existing one).

### 3. Start the Firestore emulator *(terminal 1)*
```bash
npm run emulator
```
Firestore on `:8910`, emulator UI on `:4000`.

### 4. Seed demo forms *(terminal 2, once)*
```bash
npm run seed
```
Loads the three sample forms from `data/forms.json` — the same ids the demo host page embeds.

### 5. Start the app *(terminal 2)*
```bash
npm run dev
```
The `predev` hook bundles the embed runtime (`embed/entry.tsx` → `public/embed.js`) via
esbuild, then Next.js serves on **http://localhost:3300**.

| Service | URL |
|---|---|
| Builder | http://localhost:3300/projects |
| Config + submit API | http://localhost:3300/api/forms/`<id>` |
| Embed demo (hostile-CSS host page) | http://localhost:3300/host.html |
| Firestore emulator UI | http://localhost:4000 |

Open **http://localhost:3300/host.html** to see three forms embedded via a single
`<script>` tag each, rendering correctly despite the page's deliberately hostile global CSS.

### Iterating on the embed runtime
`npm run dev` builds `embed.js` once at startup. While editing the widget, rebuild on change:
```bash
npm run build:embed:watch
```

### Other scripts
```bash
npm test          # vitest — HMAC signing, origin checks, embed snippet, …
npm run typecheck # tsc --noEmit
npm run lint      # eslint
npm run build     # production build (prebuild rebuilds embed.js)
```

---

## Security protocol — HMAC webhook signing

Every verified submission is forwarded to the law firm's webhook endpoint, signed so the
receiver can prove it came from Ketrone and wasn't tampered with or replayed.
Implementation: [lib/webhook.ts](lib/webhook.ts), dispatched from the
[submit route](app/api/forms/[id]/submit/route.ts).

**Signing scheme**
- Algorithm: **HMAC-SHA256**, keyed by a per-form shared secret (`webhookSecret`).
- The signed string is **`<timestamp>.<body>`** — not just the body. Binding the
  timestamp into the signature gives replay protection: a captured payload can't be
  re-sent later with a fresh timestamp, because that would invalidate the signature.
- Two headers accompany each POST:
  - `X-Ketrone-Signature: sha256=<hex digest>`
  - `X-Ketrone-Timestamp: <unix ms>`

**Verification (receiver side)**
The firm recomputes `HMAC-SHA256(secret, "<timestamp>.<body>")` and compares it to the
header. `verifySignature()` is the reference implementation we ship — it uses
**`crypto.timingSafeEqual`** (constant-time) with a length pre-check, so the comparison
doesn't leak information through timing.

**Operational properties**
- Signing is **conditional** — applied only when a `webhookSecret` is configured for the
  form (the timestamp header is always sent).
- The secret never leaves the server: it lives in the full form `Config` but is stripped
  by `toPublicForm()` / `PublicConfigSchema` before any config reaches the browser.
- Delivery is **best-effort and non-blocking**: a 5s `AbortController` timeout, and
  `dispatchWebhook` never throws. The submission is persisted to Firestore *before* the
  webhook fires, so a failed delivery is recorded on the submission (not bounced back to
  the user) and the firm can replay from Firestore.

---

## Dynamic config fetch on client-load

A form is embedded with a single tag — `<script src=".../embed.js" data-form="frm_xxx"></script>` —
and the script self-bootstraps on load. Implementation:
[public/embed.js](public/embed.js) (built from `embed/`), config served by
[app/api/forms/[id]/route.ts](app/api/forms/[id]/route.ts).

1. **Self-identify.** The script reads `document.currentScript` to find its own tag, pulls
   the form id from `data-form`, and derives the API origin from its own `src`
   (`new URL(script.src).origin`) — so the snippet works regardless of which domain hosts it.
2. **Isolate.** It inserts a `<div>` right after the script and attaches a **Shadow DOM**
   (`mode: "open"`) with `:host { all: initial }` plus its own scoped stylesheet. This is
   why the form renders correctly even on `host.html`'s deliberately hostile global CSS —
   the host page's styles can't pierce the shadow boundary, and ours can't leak out.
3. **Fetch config.** It calls `GET ${origin}/api/forms/<id>` with **`cache: "no-store"`**.
   That's the key to instant updates: every page view pulls the live config, so a save in
   the builder shows up on the embedding site with no redeploy. The endpoint returns only
   the **public projection** (theme + fields; webhook URL/secret and the origin allowlist
   are stripped) and runs the origin audit, so an unregistered domain can't even read the
   layout.
4. **Theme + render.** It resolves the theme into CSS custom properties, sets them on the
   wrapper, injects the curated Google Fonts stylesheet, and mounts the Preact form into
   the shadow root. Submissions then POST to `${origin}/api/forms/<id>/submit`.

If the fetch fails it degrades gracefully to a small "Form unavailable." message rather
than throwing.

---

## Deployment note

The app is written to run on **Cloud Run against managed Firestore** —
[lib/firestore.ts](lib/firestore.ts) falls back to Application Default Credentials and the
real project id when the emulator env vars are absent. Infrastructure-as-code
(Cloud Run + Terraform) is out of scope for this submission.
