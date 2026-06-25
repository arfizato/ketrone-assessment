import { describe, expect, test } from "vitest"
import { getForm } from "../lib/forms-store"

describe("getForm", () => {
  test("returns a known form by id", async () => {
    const form = await getForm("frm_8m2kd9q1")
    expect(form?.title).toBe("Create a Company")
  })
  test("returns null for an unknown id", async () => {
    expect(await getForm("frm_nope")).toBeNull()
  })
})
