"use client"

import ComponentPalette from "@/components/ComponentPalette"
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
import { arrayMove } from "@dnd-kit/sortable"
import { Eye, Hammer, PanelBottom } from "lucide-react"
import { useState } from "react"

type View = "build" | "preview"

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

export default function Page() {
  // --- the backbone: a single source of truth for the whole form ---
  const [form, setForm] = useState<FieldInstance[]>([])
  // below lg, the preview lives behind a toggle instead of its own panel
  const [view, setView] = useState<View>("build")
  // sm only: the component palette opens from a bottom drawer
  const [paletteOpen, setPaletteOpen] = useState(false)

  // undefined until mounted -> render the lg layout on the server / first paint
  const bp = useBreakpoint() ?? "lg"

  const addField = (type: FieldType) => {
    setForm((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, data: { ...DEFAULT_FIELD_DATA[type] } },
    ])
  }
  const updateField = (id: string, patch: Partial<FieldData>) => {
    setForm((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, data: { ...f.data, ...patch } } : f
      )
    )
  }
  const removeField = (id: string) => {
    setForm((prev) => prev.filter((f) => f.id !== id))
  }
  // insert a deep copy right after the original
  const duplicateField = (id: string) => {
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
    setForm((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === activeId)
      const newIndex = prev.findIndex((f) => f.id === overId)
      if (oldIndex < 0 || newIndex < 0) return prev
      return arrayMove(prev, oldIndex, newIndex)
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

  // tap-to-add inside the drawer should also dismiss it
  const addFromDrawer = (type: FieldType) => {
    addField(type)
    setPaletteOpen(false)
  }

  let main: React.ReactNode
  if (bp === "lg") {
    // --- lg: full three-panel resizable layout ---
    main = (
      <ResizablePanelGroup orientation="horizontal" className="w-full">
        <ResizablePanel defaultSize="15%" minSize="200px">
          <ComponentPalette onAdd={addField} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="50%" minSize="450px">
          {builder}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="35%" minSize="300px">
          <PreviewPanel fields={form} />
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  } else if (view === "preview") {
    // --- md / sm: preview takes over the full area ---
    main = <PreviewPanel fields={form} />
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
        <span className="text-sm font-medium">nav</span>
        <div className="flex justify-center">
          {bp === "md" && <ViewTabs value={view} onValueChange={setView} />}
        </div>
        <div />
      </header>

      <div className="min-h-0 flex-1">{main}</div>

      {bp === "sm" && (
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

      {bp === "sm" && (
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
    </div>
  )
}
