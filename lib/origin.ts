/**
 * Origin / domain guard (spec Part B / priority 5).
 *
 * The API checks the embedding site's `Origin` header against the form's
 * registered `allowedOrigins`. A form with no registered origins is treated as
 * open (so freshly created / seed forms work without configuration); once a
 * lawyer registers domains, only those may submit.
 */

/** True when `origin` is permitted for a form with the given allowlist. */
export function isOriginAllowed(
  allowed: string[] | undefined,
  origin: string | null
): boolean {
  if (!allowed || allowed.length === 0) return true // unconfigured = open
  if (!origin) return false
  return allowed.includes(origin)
}

/**
 * CORS headers for a submit/config response. We echo the request origin (so the
 * embedded script can read the response) and advertise the allowed methods.
 * Server-side `isOriginAllowed` — not CORS — is the actual authorization gate;
 * a rejected origin still gets readable CORS so the client sees the 403.
 */
export function corsHeaders(
  origin: string | null,
  methods = "POST, OPTIONS"
): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  }
}
