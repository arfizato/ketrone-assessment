import { describe, expect, test } from "vitest"
import { escapeHtml, sanitizeDeep } from "../lib/sanitize"

describe("escapeHtml", () => {
  test("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<img src=x onerror="alert('xss')">&`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt;&amp;"
    )
  })
})

describe("sanitizeDeep", () => {
  test("escapes strings inside nested objects and arrays", () => {
    const dirty = { a: "<b>", list: [{ c: "x>y" }], n: 3, ok: true }
    expect(sanitizeDeep(dirty)).toEqual({
      a: "&lt;b&gt;",
      list: [{ c: "x&gt;y" }],
      n: 3,
      ok: true,
    })
  })

  test("leaves non-strings untouched", () => {
    expect(sanitizeDeep(42)).toBe(42)
    expect(sanitizeDeep(null)).toBe(null)
  })
})
