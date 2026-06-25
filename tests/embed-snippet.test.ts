import { describe, expect, test } from "vitest"
import { buildSnippet } from "../lib/embed-snippet"

describe("buildSnippet", () => {
  test("builds a script tag pointing at the app origin with the form id", () => {
    expect(buildSnippet("https://app.example.com", "frm_abc")).toBe(
      '<script src="https://app.example.com/embed.js" data-form="frm_abc"></script>'
    )
  })
})
