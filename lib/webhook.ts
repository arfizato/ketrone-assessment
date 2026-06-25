import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Outbound webhook integrity (spec Part B / priority 5).
 *
 * We forward each verified submission to the law firm's endpoint and prove it
 * came from us with an HMAC-SHA256 signature over `<timestamp>.<body>` (the
 * timestamp is bound into the signed string so a captured payload can't be
 * replayed with a new time). The receiver recomputes the same HMAC with the
 * shared secret and compares — see `verifySignature` for the reference check.
 */

export const SIGNATURE_HEADER = "X-Ketrone-Signature"
export const TIMESTAMP_HEADER = "X-Ketrone-Timestamp"

/** Hex HMAC-SHA256 of `<timestamp>.<body>` keyed by the shared secret. */
export function signPayload(
  secret: string,
  body: string,
  timestamp: string
): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")
}

/** Constant-time check of a `sha256=<hex>` signature header. Reference impl for
 *  the firm's backend; also used by our tests. */
export function verifySignature(
  secret: string,
  body: string,
  timestamp: string,
  header: string
): boolean {
  const expected = `sha256=${signPayload(secret, body, timestamp)}`
  const a = Buffer.from(header)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export type WebhookResult = {
  delivered: boolean
  status?: number
  error?: string
}

/**
 * POST a JSON payload to the firm's webhook, signed when a secret is set.
 * Never throws — failures are returned so the caller can record them and still
 * acknowledge the submission (which is already persisted).
 */
export async function dispatchWebhook(opts: {
  url: string
  secret?: string
  payload: unknown
  timestampMs: number
  timeoutMs?: number
}): Promise<WebhookResult> {
  const body = JSON.stringify(opts.payload)
  const timestamp = String(opts.timestampMs)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [TIMESTAMP_HEADER]: timestamp,
  }
  if (opts.secret) {
    headers[SIGNATURE_HEADER] = `sha256=${signPayload(opts.secret, body, timestamp)}`
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 5000)
  try {
    const res = await fetch(opts.url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    })
    return { delivered: res.ok, status: res.status }
  } catch (e) {
    return { delivered: false, error: e instanceof Error ? e.message : "unknown" }
  } finally {
    clearTimeout(timer)
  }
}
