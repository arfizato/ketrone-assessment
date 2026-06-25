import { describe, expect, test } from "vitest"
import { ConfigSchema, SubmissionSchema } from "../lib/schemas"

const validConfig = {
  id: "frm_x",
  title: "T",
  theme: {
    base: "slate",
    accent: "#6366f1",
    radius: 0.625,
    font: "inter",
    density: "compact",
    shadow: "subtle",
    container: "card",
    fieldStyle: "outlined",
    appearance: "dark",
  },
  fields: [{ id: "name", type: "text", data: { label: "Name", required: true } }],
}

describe("ConfigSchema", () => {
  test("accepts a valid config", () => {
    expect(ConfigSchema.parse(validConfig).id).toBe("frm_x")
  })
  test("rejects an unknown field type", () => {
    const bad = { ...validConfig, fields: [{ id: "x", type: "slider", data: {} }] }
    expect(ConfigSchema.safeParse(bad).success).toBe(false)
  })
  test("rejects a bad theme enum", () => {
    const bad = { ...validConfig, theme: { ...validConfig.theme, density: "huge" } }
    expect(ConfigSchema.safeParse(bad).success).toBe(false)
  })
})

describe("SubmissionSchema", () => {
  test("accepts a formId + values map", () => {
    expect(
      SubmissionSchema.parse({ formId: "frm_x", values: { name: "Jo" } }).formId
    ).toBe("frm_x")
  })
  test("rejects a missing formId", () => {
    expect(SubmissionSchema.safeParse({ values: {} }).success).toBe(false)
  })
})
