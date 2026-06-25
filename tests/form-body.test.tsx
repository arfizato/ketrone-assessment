// @vitest-environment jsdom
import { render } from "preact"
import { act } from "preact/test-utils"
import { afterEach, beforeEach, expect, test } from "vitest"
import FormBody from "../components/FormBody"
import type { Config } from "../lib/schemas"

const config = {
  id: "frm_test",
  title: "Test Form",
  submitLabel: "Go",
  theme: {
    base: "slate",
    accent: "#6366f1",
    radius: 0.5,
    font: "inter",
    density: "compact",
    shadow: "subtle",
    container: "card",
    fieldStyle: "outlined",
    appearance: "dark",
  },
  fields: [
    { id: "name", type: "text", data: { label: "Name", required: true } },
    {
      id: "holders",
      type: "table",
      data: {
        label: "Holders",
        columns: [
          { label: "Name", type: "Text" },
          { label: "Pct", type: "Percent" },
        ],
      },
    },
  ],
} as Config

let host: HTMLElement
beforeEach(() => {
  host = document.createElement("div")
  document.body.appendChild(host)
})
afterEach(() => {
  render(null, host)
  host.remove()
})

test("renders a labelled control per field and a submit button", () => {
  act(() => {
    render(<FormBody config={config} origin="http://x" />, host)
  })
  expect(host.textContent).toContain("Name")
  expect(host.querySelector('[data-slot="input"]')).not.toBeNull()
  expect(host.querySelector("table")).not.toBeNull()
  expect(host.textContent).toContain("Go")
})

test("Add row grows the table by one row", () => {
  act(() => {
    render(<FormBody config={config} origin="http://x" />, host)
  })
  const before = host.querySelectorAll("tbody tr").length
  const addBtn = Array.from(host.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("Add row")
  )!
  act(() => {
    addBtn.click()
  })
  expect(host.querySelectorAll("tbody tr").length).toBe(before + 1)
})
