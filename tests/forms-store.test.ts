import { describe, expect, test } from "vitest"
import type { Config } from "../lib/schemas"

// forms-store is Firestore-backed now, so these are integration tests that need
// a live emulator. They're skipped in the default `npm test` run (no
// FIRESTORE_EMULATOR_HOST) and run when the emulator is up.
const describeEmu = process.env.FIRESTORE_EMULATOR_HOST ? describe : describe.skip

const sample: Config = {
  id: "frm_test_emu",
  title: "Emu Co",
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
  fields: [],
}

describeEmu("forms-store (Firestore emulator)", () => {
  test("saveForm + getForm round-trips; unknown id is null", async () => {
    const { saveForm, getForm } = await import("../lib/forms-store")
    await saveForm(sample)
    expect((await getForm("frm_test_emu"))?.title).toBe("Emu Co")
    expect(await getForm("frm_does_not_exist")).toBeNull()
  })

  test("listForms returns id + title", async () => {
    const { listForms } = await import("../lib/forms-store")
    const list = await listForms()
    expect(list.find((f) => f.id === "frm_test_emu")?.title).toBe("Emu Co")
  })

  test("createForm makes a blank, default-themed form that round-trips", async () => {
    const { createForm, getForm } = await import("../lib/forms-store")
    const id = await createForm("New Co")
    expect(id).toMatch(/^frm_/)
    const form = await getForm(id)
    expect(form?.title).toBe("New Co")
    expect(form?.fields).toEqual([])
    // a real theme was stored (passes ConfigSchema on read)
    expect(form?.theme.base).toBeTruthy()
  })

  test("saveSubmission stores under the form and returns a doc id", async () => {
    const { saveForm, saveSubmission } = await import("../lib/forms-store")
    await saveForm(sample)
    const subId = await saveSubmission("frm_test_emu", {
      values: { name: "Jo" },
      origin: "https://firm.com",
    })
    expect(typeof subId).toBe("string")
    expect(subId.length).toBeGreaterThan(0)
  })
})
