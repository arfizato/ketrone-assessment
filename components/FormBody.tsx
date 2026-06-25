import { useState } from "react"
import type { FieldInstance, TableColumn } from "./fieldForms/types"
import type { Config } from "@/lib/schemas"

/** text validation -> native input type */
const INPUT_TYPE: Record<string, string> = {
  Email: "email",
  URL: "url",
  Number: "number",
  Currency: "number",
  Percent: "number",
  Date: "date",
}
/** table column type -> native input type */
const COLUMN_TYPE: Record<string, string> = {
  Text: "text",
  Number: "number",
  Currency: "number",
  Percent: "number",
  Date: "date",
}
/** file validation -> accept attribute */
const FILE_ACCEPT: Record<string, string | undefined> = {
  All: undefined,
  PDF: "application/pdf",
  Image: "image/*",
}

type Values = Record<string, unknown>

function Label({ data }: { data: FieldInstance["data"] }) {
  return (
    <label className="field-label" data-slot="label">
      {data.label?.trim() || "Untitled field"}
      {data.required ? <span className="req"> *</span> : null}
    </label>
  )
}

function colKey(c: TableColumn, i: number) {
  return c.label || `col${i}`
}
function blankRow(columns: TableColumn[]): Record<string, string> {
  const row: Record<string, string> = {}
  columns.forEach((c, i) => (row[colKey(c, i)] = ""))
  return row
}

function TableField({
  field,
  value,
  onChange,
}: {
  field: FieldInstance
  value: unknown
  onChange: (v: unknown) => void
}) {
  const columns = field.data.columns ?? []
  const rows = (value as Record<string, string>[]) ?? [blankRow(columns)]

  if (columns.length === 0) {
    return (
      <div className="field">
        <Label data={field.data} />
        <p className="muted">No columns defined</p>
      </div>
    )
  }

  const setCell = (r: number, key: string, v: string) =>
    onChange(rows.map((row, i) => (i === r ? { ...row, [key]: v } : row)))
  const addRow = () => onChange([...rows, blankRow(columns)])
  const removeRow = (r: number) =>
    onChange(rows.length > 1 ? rows.filter((_, i) => i !== r) : rows)

  return (
    <div className="field">
      <Label data={field.data} />
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i}>{c.label || `Column ${i + 1}`}</th>
              ))}
              <th aria-hidden className="th-x" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {columns.map((c, ci) => {
                  const key = colKey(c, ci)
                  return (
                    <td key={ci}>
                      <input
                        className="cell"
                        type={COLUMN_TYPE[c.type] ?? "text"}
                        value={row[key] ?? ""}
                        onChange={(e) => setCell(r, key, e.currentTarget.value)}
                      />
                    </td>
                  )
                })}
                <td>
                  <button
                    type="button"
                    className="row-x"
                    aria-label="Remove row"
                    disabled={rows.length === 1}
                    onClick={() => removeRow(r)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="add-row" onClick={addRow}>
        + Add row
      </button>
    </div>
  )
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldInstance
  value: unknown
  onChange: (v: unknown) => void
}) {
  const { data } = field

  switch (field.type) {
    case "text":
      return (
        <div className="field">
          <Label data={data} />
          <input
            className="control"
            data-slot="input"
            type={INPUT_TYPE[data.validation ?? ""] ?? "text"}
            placeholder={data.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.currentTarget.value)}
          />
        </div>
      )

    case "select": {
      const options = (data.options ?? []).filter(
        (o) => o.value.trim() && o.label.trim()
      )
      return (
        <div className="field">
          <Label data={data} />
          <select
            className="control"
            data-slot="select-trigger"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.currentTarget.value)}
          >
            <option value="" disabled>
              {data.placeholder?.trim() || "Select an option"}
            </option>
            {options.map((o, i) => (
              <option key={i} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )
    }

    case "radio": {
      const options = (data.options ?? []).filter(
        (o) => o.value.trim() && o.label.trim()
      )
      const selected = value as string | undefined
      const showWarning =
        !!data.helperLabel && !!selected && /high/i.test(selected)
      return (
        <div className="field">
          <Label data={data} />
          <div className="radio-group">
            {options.map((o, i) => {
              const id = `${field.id}-${i}`
              return (
                <label key={i} className="radio-row" htmlFor={id}>
                  <input
                    type="radio"
                    id={id}
                    name={field.id}
                    value={o.value}
                    checked={selected === o.value}
                    onChange={() => onChange(o.value)}
                  />
                  <span>{o.label}</span>
                </label>
              )
            })}
          </div>
          {showWarning ? (
            <p className="warning" role="alert">
              {data.helperLabel}
            </p>
          ) : null}
        </div>
      )
    }

    case "file":
      return (
        <div className="field">
          <Label data={data} />
          <label className="dropzone">
            <span>
              {data.placeholder?.trim() ||
                "Drag & drop a file, or click to browse"}
            </span>
            <input
              type="file"
              className="sr-file"
              accept={FILE_ACCEPT[data.validation ?? "All"]}
              onChange={(e) => {
                const f = e.currentTarget.files?.[0]
                onChange(f ? { name: f.name, size: f.size, type: f.type } : null)
              }}
            />
            {value ? (
              <span className="file-name">
                {(value as { name: string }).name}
              </span>
            ) : null}
          </label>
        </div>
      )

    case "table":
      return <TableField field={field} value={value} onChange={onChange} />
  }
}

export default function FormBody({
  config,
  origin,
}: {
  config: Config
  origin: string
}) {
  const [values, setValues] = useState<Values>({})
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle"
  )

  const set = (id: string, v: unknown) =>
    setValues((prev) => ({ ...prev, [id]: v }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch(`${origin}/api/forms/${config.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: config.id, values }),
      })
      const json = await res.json()
      console.log("[embed] submit response", json)
      setStatus(res.ok && json.ok ? "ok" : "error")
    } catch (err) {
      console.error("[embed] submit failed", err)
      setStatus("error")
    }
  }

  return (
    <div
      className="form-root themed-form"
      data-container={config.theme.container}
      data-field-style={config.theme.fieldStyle}
      data-density={config.theme.density}
      data-shadow={config.theme.shadow}
    >
      <form className="form" onSubmit={onSubmit}>
        {config.title ? <h2 className="form-title">{config.title}</h2> : null}
        {config.subtitle ? (
          <p className="form-subtitle">{config.subtitle}</p>
        ) : null}

        {config.fields.map((field) => (
          <Field
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={(v) => set(field.id, v)}
          />
        ))}

        <button
          type="submit"
          className="submit"
          data-slot="button"
          disabled={status === "sending"}
        >
          {status === "sending"
            ? "Submitting…"
            : config.submitLabel?.trim() || "Submit"}
        </button>

        {status === "ok" ? <p className="note ok">Submitted ✓</p> : null}
        {status === "error" ? (
          <p className="note error">Something went wrong.</p>
        ) : null}
      </form>
    </div>
  )
}
