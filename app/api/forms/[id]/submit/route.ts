import { NextRequest, NextResponse } from "next/server"
import { SubmissionSchema } from "@/lib/schemas"
import { sanitizeDeep } from "@/lib/sanitize"
import {
  getForm,
  recordWebhookResult,
  saveSubmission,
} from "@/lib/forms-store"
import { corsHeaders, isOriginAllowed } from "@/lib/origin"
import { dispatchWebhook } from "@/lib/webhook"

/**
 * Secure ingestion endpoint (spec priorities 4 + 5):
 *   1. validate + sanitize the payload (XSS/injection guard)
 *   2. verify the request Origin against the form's registered domains
 *   3. write the submission to Firestore (forms/<id>/submissions)
 *   4. forward it to the firm's webhook with an HMAC-SHA256 signature
 * The submission is acknowledged once persisted; a failed webhook is recorded
 * but doesn't fail the request (the firm can replay from Firestore).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const origin = req.headers.get("origin")
  const cors = corsHeaders(origin)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400, headers: cors }
    )
  }

  const parsed = SubmissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 422, headers: cors }
    )
  }

  const form = await getForm(id)
  if (!form) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404, headers: cors }
    )
  }

  // Origins audit: reject submissions from unregistered domains.
  if (!isOriginAllowed(form.allowedOrigins, origin)) {
    return NextResponse.json(
      { ok: false, error: "forbidden_origin" },
      { status: 403, headers: cors }
    )
  }

  const clean = sanitizeDeep(parsed.data)

  // Persist first — Firestore is the source of truth and survives webhook failure.
  const submissionId = await saveSubmission(id, {
    values: clean.values,
    origin,
  })

  // Forward to the firm's endpoint, signed. Best-effort; record the outcome.
  if (form.webhookUrl) {
    const timestampMs = Date.now()
    const result = await dispatchWebhook({
      url: form.webhookUrl,
      secret: form.webhookSecret,
      timestampMs,
      payload: {
        formId: id,
        submissionId,
        submittedAt: new Date(timestampMs).toISOString(),
        values: clean.values,
      },
    })
    await recordWebhookResult(id, submissionId, result)
  }

  return NextResponse.json({ ok: true, submissionId }, { headers: cors })
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  })
}
