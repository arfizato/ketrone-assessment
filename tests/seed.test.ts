import { describe, expect, test } from "vitest"
import { ConfigsSchema } from "../lib/schemas"
import forms from "../data/forms.json"

describe("data/forms.json", () => {
  test("matches the config schema", () => {
    expect(() => ConfigsSchema.parse(forms)).not.toThrow()
  })
  test("contains the two seeded forms with unique ids", () => {
    const parsed = ConfigsSchema.parse(forms)
    const ids = parsed.map((f) => f.id)
    expect(ids).toContain("frm_8m2kd9q1")
    expect(ids).toContain("frm_q4p7zt6b")
    expect(new Set(ids).size).toBe(ids.length)
  })
})
