"use client"

import ComponentPalette from "@/components/ComponentPalette"
import DesignPanel from "@/components/design/DesignPanel"
import EmbedDialog from "@/components/EmbedDialog"
import FormBuilder from "@/components/FormBuilder"
import PreviewPanel from "@/components/PreviewPanel"
import {
  DEFAULT_FIELD_DATA,
  FieldData,
  FieldInstance,
  FieldType,
} from "@/components/fieldForms/types"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBreakpoint } from "@/hooks/use-breakpoint"
import { FormTheme } from "@/lib/theme"
import { arrayMove } from "@dnd-kit/sortable"
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Hammer,
  Loader2,
  PanelBottom,
  Save,
  SlidersHorizontal,
} from "lucide-react"
import Link from "next/link"
import { useState, useSyncExternalStore, useTransition } from "react"
import { toast } from "sonner"
import { saveFormAction } from "../actions"

type View = "build" | "preview"
type Step = "content" | "design"

type ProjectEditorProps = {
  /** the form's id (the [slug] route param) */
  slug: string
  /** the form's title, shown in the header */
  title: string
  /** initial fields + theme loaded from Firestore on the server */
  initialFields: FieldInstance[]
  initialTheme: FormTheme
}

/** Centered, underline-style Build/Preview switcher reused in the top nav (md)
 *  and the mobile bottom bar (sm). Active view is shown bold with an underline. */
function ViewTabs({
  value,
  onValueChange,
}: {
  value: View
  onValueChange: (v: View) => void
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as View)}>
      <TabsList variant="line" className="h-10 gap-4 bg-transparent">
        <TabsTrigger
          value="build"
          className="px-1 text-sm data-active:font-semibold"
        >
          <Hammer className="size-4" />
          Build
        </TabsTrigger>
        <TabsTrigger
          value="preview"
          className="px-1 text-sm data-active:font-semibold"
        >
          <Eye className="size-4" />
          Preview
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

/** Subscribe to the OS color-scheme so a "system" appearance can follow it. */
const prefersDark = {
  subscribe(cb: () => void) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    mql.addEventListener("change", cb)
    return () => mql.removeEventListener("change", cb)
  },
  snapshot: () => window.matchMedia("(prefers-color-scheme: dark)").matches,
}

function useSystemDark() {
  return useSyncExternalStore(
    prefersDark.subscribe,
    prefersDark.snapshot,
    () => false
  )
}

export default function ProjectEditor({
  slug,
  title: initialTitle,
  initialFields,
  initialTheme,
}: ProjectEditorProps) {
  // --- the backbone: a single source of truth for the whole form ---
  // seeded from the form loaded on the server (by slug)
  const [title, setTitle] = useState(initialTitle)
  const [form, setForm] = useState<FieldInstance[]>(initialFields)
  const [theme, setTheme] = useState<FormTheme>(initialTheme)
  // any edit to title / fields / theme marks the form unsaved; cleared on save
  const [dirty, setDirty] = useState(false)
  const [isSaving, startSaving] = useTransition()
  // top-level step: build the content, then design it
  const [step, setStep] = useState<Step>("content")
  // below lg, the design controls open from a drawer over the preview
  const [designDrawerOpen, setDesignDrawerOpen] = useState(false)
  // below lg, the preview lives behind a toggle instead of its own panel
  const [view, setView] = useState<View>("build")
  // sm only: the component palette opens from a bottom drawer
  const [paletteOpen, setPaletteOpen] = useState(false)

  // undefined until mounted -> render the lg layout on the server / first paint
  const bp = useBreakpoint() ?? "lg"

  // the preview's light/dark follows the saved appearance: light/dark force it,
  // "system" follows the OS — exactly what the embed does at runtime
  const systemDark = useSystemDark()
  const previewMode: "light" | "dark" =
    theme.appearance === "dark"
      ? "dark"
      : theme.appearance === "light"
        ? "light"
        : systemDark
          ? "dark"
          : "light"

  const addField = (type: FieldType) => {
    setDirty(true)
    setForm((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, data: { ...DEFAULT_FIELD_DATA[type] } },
    ])
  }
  const updateField = (id: string, patch: Partial<FieldData>) => {
    setDirty(true)
    setForm((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, data: { ...f.data, ...patch } } : f
      )
    )
  }
  const removeField = (id: string) => {
    setDirty(true)
    setForm((prev) => prev.filter((f) => f.id !== id))
  }
  // insert a deep copy right after the original
  const duplicateField = (id: string) => {
    setDirty(true)
    setForm((prev) => {
      const index = prev.findIndex((f) => f.id === id)
      if (index < 0) return prev
      const copy: FieldInstance = {
        ...prev[index],
        id: crypto.randomUUID(),
        data: structuredClone(prev[index].data),
      }
      const next = [...prev]
      next.splice(index + 1, 0, copy)
      return next
    })
  }
  const reorderField = (activeId: string, overId: string) => {
    setDirty(true)
    setForm((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === activeId)
      const newIndex = prev.findIndex((f) => f.id === overId)
      if (oldIndex < 0 || newIndex < 0) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const updateTheme = (patch: Partial<FormTheme>) => {
    setDirty(true)
    setTheme((t) => ({ ...t, ...patch }))
  }

  // applying a preset keeps the user's chosen appearance (light/dark/system)
  // instead of snapping back to the preset's default
  const applyPreset = (preset: FormTheme) => {
    setDirty(true)
    setTheme((t) => ({ ...preset, appearance: t.appearance }))
  }

  // Persist the whole form (id + title + theme + fields) via the server action.
  // On success the embed reflects it on its next no-store fetch — no redeploy.
  const onSave = () => {
    startSaving(async () => {
      try {
        await saveFormAction({ id: slug, title, theme, fields: form })
        setDirty(false)
        toast.success("Saved")
      } catch {
        toast.error("Couldn't save — please try again.")
      }
    })
  }

  const builder = (
    <FormBuilder
      fields={form}
      onUpdate={updateField}
      onRemove={removeField}
      onDuplicate={duplicateField}
      onReorder={reorderField}
    />
  )

  const preview = (
    <PreviewPanel fields={form} theme={theme} mode={previewMode} />
  )

  // tap-to-add inside the drawer should also dismiss it
  const addFromDrawer = (type: FieldType) => {
    addField(type)
    setPaletteOpen(false)
  }

  // The left side swaps between the build tools (Content) and the theme
  // controls (Design); the preview panel is shared by both steps.
  const designTools = (
    <DesignPanel theme={theme} onChange={updateTheme} onApplyPreset={applyPreset} />
  )

  let main: React.ReactNode
  if (bp === "lg") {
    // --- lg: [ palette + builder | preview ] in Content; the left two panels
    //     collapse to the design controls in Design; preview stays put. ---
    main = (
      <ResizablePanelGroup orientation="horizontal" className="w-full">
        {step === "content" ? (
          <>
            <ResizablePanel defaultSize="15%" minSize="200px">
              <ComponentPalette onAdd={addField} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize="50%" minSize="450px">
              {builder}
            </ResizablePanel>
          </>
        ) : (
          <ResizablePanel defaultSize="65%" minSize="360px">
            {designTools}
          </ResizablePanel>
        )}
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="35%" minSize="300px">
          {preview}
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  } else if (step === "design") {
    // --- md / sm Design: preview fills the area; controls live in a drawer ---
    main = preview
  } else if (view === "preview") {
    // --- md / sm Content: preview takes over the full area ---
    main = preview
  } else if (bp === "md") {
    // --- md build: palette + builder side by side ---
    main = (
      <ResizablePanelGroup orientation="horizontal" className="w-full">
        <ResizablePanel defaultSize="28%" minSize="200px">
          <ComponentPalette onAdd={addField} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="72%" minSize="380px">
          {builder}
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  } else {
    // --- sm build: builder full-width (palette lives in the bottom drawer) ---
    main = builder
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b bg-accent px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/projects"
            aria-label="Back to forms"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setDirty(true)
            }}
            aria-label="Form title"
            placeholder="Untitled form"
            className="min-w-0 flex-1 truncate rounded-sm bg-transparent px-1 py-0.5 text-sm font-medium outline-none hover:bg-foreground/5 focus:bg-background focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex justify-center">
          {step === "content" && bp === "md" && (
            <ViewTabs value={view} onValueChange={setView} />
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={!dirty || isSaving}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSaving ? "Saving…" : "Save"}
          </Button>
          <EmbedDialog formId={slug} />
          {step === "content" ? (
            <Button size="sm" onClick={() => setStep("design")}>
              Design
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("content")}
            >
              <ArrowLeft className="size-4" />
              Content
            </Button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1">{main}</div>

      {/* sm Content: build/preview switch + open the component palette */}
      {step === "content" && bp === "sm" && (
        <nav className="flex h-16 shrink-0 items-center justify-between border-t bg-background px-4">
          <ViewTabs value={view} onValueChange={setView} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setView("build")
              setPaletteOpen(true)
            }}
          >
            <PanelBottom className="size-4" />
            Components
          </Button>
        </nav>
      )}

      {/* md / sm Design: open the theme controls drawer */}
      {step === "design" && bp !== "lg" && (
        <nav className="flex h-16 shrink-0 items-center justify-end border-t bg-background px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDesignDrawerOpen(true)}
          >
            <SlidersHorizontal className="size-4" />
            Customize
          </Button>
        </nav>
      )}

      {step === "content" && bp === "sm" && (
        <Drawer open={paletteOpen} onOpenChange={setPaletteOpen}>
          <DrawerContent>
            <DrawerHeader className="sr-only">
              <DrawerTitle>Components</DrawerTitle>
              <DrawerDescription>Click to add a field</DrawerDescription>
            </DrawerHeader>
            <ComponentPalette
              onAdd={addFromDrawer}
              className="h-auto overflow-auto"
            />
          </DrawerContent>
        </Drawer>
      )}

      {step === "design" && bp !== "lg" && (
        <Drawer open={designDrawerOpen} onOpenChange={setDesignDrawerOpen}>
          <DrawerContent>
            <DrawerHeader className="sr-only">
              <DrawerTitle>Design</DrawerTitle>
              <DrawerDescription>
                Customize your form&apos;s appearance
              </DrawerDescription>
            </DrawerHeader>
            <DesignPanel
              theme={theme}
              onChange={updateTheme}
              onApplyPreset={applyPreset}
              className="h-auto max-h-[70vh] overflow-auto"
            />
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
