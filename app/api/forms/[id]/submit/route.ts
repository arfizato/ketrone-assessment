import { NextRequest, NextResponse } from "next/server"
import { SubmissionSchema } from "@/lib/schemas"
import { sanitizeDeep } from "@/lib/sanitize"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400, headers: CORS }
    )
  }

  const parsed = SubmissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 422, headers: CORS }
    )
  }

  const clean = sanitizeDeep(parsed.data)
  // Ingestion sink for the test: server-side log. Webhooks/HMAC land here next.
  console.log(`[submit] form=${id}`, JSON.stringify(clean.values))

  return NextResponse.json({ ok: true }, { headers: CORS })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}
