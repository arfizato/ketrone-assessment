import { NextRequest, NextResponse } from "next/server"
import { getForm } from "@/lib/forms-store"

const CORS = { "Access-Control-Allow-Origin": "*" }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const form = await getForm(id)
  if (!form) {
    return NextResponse.json(
      { error: "not_found" },
      { status: 404, headers: CORS }
    )
  }
  return NextResponse.json(form, {
    headers: { ...CORS, "Cache-Control": "no-store" },
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...CORS, "Access-Control-Allow-Methods": "GET, OPTIONS" },
  })
}
