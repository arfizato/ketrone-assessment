import { notFound } from "next/navigation"
import { getForm } from "@/lib/forms-store"
import ProjectEditor from "./ProjectEditor"

export const dynamic = "force-dynamic"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const form = await getForm(slug)
  if (!form) notFound()

  return (
    <ProjectEditor
      slug={slug}
      title={form.title}
      initialFields={form.fields}
      initialTheme={form.theme}
    />
  )
}
