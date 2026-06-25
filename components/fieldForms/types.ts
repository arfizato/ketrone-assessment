/**
 * Shared "backbone" contract for the form builder.
 *
 * The page (app/projects/page.tsx) owns the state: a list of FieldInstance.
 * Every field-config component is a controlled component — it never keeps its
 * own copy of the config. Instead it receives its slice (`field`) plus two
 * pre-bound helpers (`update`, `remove`) so all state lives in one place.
 *
 * To add a new field type:
 *   1. add its key to FieldType
 *   2. (optional) seed defaults in DEFAULT_FIELD_DATA
 *   3. build a component that accepts FieldFormProps
 *   4. register it in FIELD_COMPONENTS in page.tsx
 */

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "file"
  | "table"
  | "radio"
  | "heading"
  | "paragraph"

export type SelectOption = {
  label: string
  value: string
}

/** A column definition for the table field; the filler adds rows at fill time. */
export type TableColumn = {
  label: string
  type: string // "Text" | "Number" | "Date"
}

/**
 * Type-specific config for a single field. Every key is optional so a field
 * can start empty and be filled in. Add new keys here as field types grow.
 */
export type FieldData = {
  label?: string
  placeholder?: string
  required?: boolean

  /** text fields: "None" | "Email" | "URL" | "Number"
   *  file fields: "All" | "PDF" | "Image"
   */
  validation?: string

  /** select & radio fields */
  options?: SelectOption[]

  /** table fields: user-defined columns; the filler adds rows at fill time */
  columns?: TableColumn[]

  /** conditional helper / warning label shown under the field */
  helperLabel?: string
}

/** One configured field living in the form. `id` is stable for update/remove. */
export type FieldInstance = {
  id: string
  type: FieldType
  data: FieldData
}

/**
 * The contract every field-config component shares. Components only configure
 * data; the page owns field lifecycle (add / remove / duplicate / reorder).
 * `update` is already bound to this field's id by the page.
 */
export type FieldFormProps = {
  field: FieldInstance
  /** merge a patch into this field's data */
  update: (patch: Partial<FieldData>) => void
  /** card collapse state — owned by the builder list so the action rail can
   *  react to it (only reordering is available while collapsed) */
  open: boolean
  onToggle: () => void
}

/** Starting data when a field of a given type is first added. */
export const DEFAULT_FIELD_DATA: Record<FieldType, FieldData> = {
  text: {},
  textarea: {},
  select: { options: [{ label: "", value: "" }] },
  file: { validation: "All" },
  table: { columns: [{ label: "", type: "Text" }] },
  radio: { options: [{ label: "", value: "" }] },
  // static content fields — `label` holds the displayed text
  heading: {},
  paragraph: {},
}
