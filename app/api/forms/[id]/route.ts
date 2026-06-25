import { NextRequest, NextResponse } from "next/server"
import { getForm, toPublicForm } from "@/lib/forms-store"
import { corsHeaders, isOriginAllowed } from "@/lib/origin"

export const dynamic = "force-dynamic"

/**
 * Widget call (spec step 1–3): the embed fetches its layout + theme here.
 * Returns only the public projection — webhook url/secret and the origin
 * allowlist never cross the wire. The Origins Audit runs here too, so an
 * unregistered domain can't even read a configured form's layout.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const origin = req.headers.get("origin")
  const cors = corsHeaders(origin, "GET, OPTIONS")

  const form = await getForm(id)
  if (!form) {
    return NextResponse.json(
      { error: "not_found" },
      { status: 404, headers: cors }
    )
  }

  if (!isOriginAllowed(form.allowedOrigins, origin)) {
    return NextResponse.json(
      { error: "forbidden_origin" },
      { status: 403, headers: cors }
    )
  }

  return NextResponse.json(toPublicForm(form), {
    headers: { ...cors, "Cache-Control": "no-store" },
  })
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin"), "GET, OPTIONS"),
  })
}
