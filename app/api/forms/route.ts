import { NextResponse } from "next/server"
import { listForms } from "@/lib/forms-store"

// Same-origin admin use (the Publish dialog's form picker). no-store so newly
// published forms show up immediately once persistence lands.
export async function GET() {
  const forms = await listForms()
  return NextResponse.json(forms, { headers: { "Cache-Control": "no-store" } })
}
