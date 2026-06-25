import {
  AlignLeft,
  CircleDot,
  Heading,
  List,
  Pilcrow,
  Table,
  Type,
  Upload,
  type LucideIcon,
} from "lucide-react"
import { FieldType } from "./types"

export type FieldMeta = {
  name: string
  desc: string
  icon: LucideIcon
}

/**
 * Single source of truth for how each field type presents itself: the icon and
 * copy shown in the palette (ComponentPalette) and on each builder card header
 * (FieldFormCard). Add a field type here when you add one to FieldType.
 */
export const FIELD_META: Record<FieldType, FieldMeta> = {
  text: { name: "Text", desc: "Single-line input", icon: Type },
  textarea: { name: "Textarea", desc: "Multi-line text", icon: AlignLeft },
  select: { name: "Select", desc: "Dropdown of options", icon: List },
  radio: { name: "Radio", desc: "Single choice from a list", icon: CircleDot },
  file: { name: "File", desc: "File upload", icon: Upload },
  table: { name: "Table", desc: "Editable grid", icon: Table },
  heading: { name: "Heading", desc: "Section heading", icon: Heading },
  paragraph: { name: "Paragraph", desc: "Explanatory text", icon: Pilcrow },
}

/** Display order of field types in the palette. */
export const FIELD_ORDER: FieldType[] = [
  "text",
  "textarea",
  "select",
  "radio",
  "file",
  "table",
  "heading",
  "paragraph",
]
