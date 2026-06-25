import { describe, expect, test } from "vitest"
import { corsHeaders, isOriginAllowed } from "../lib/origin"

describe("isOriginAllowed", () => {
  test("unconfigured (undefined/empty) allowlist is open", () => {
    expect(isOriginAllowed(undefined, "https://anything.com")).toBe(true)
    expect(isOriginAllowed([], null)).toBe(true)
  })
  test("allows a registered origin", () => {
    expect(isOriginAllowed(["https://firm.com"], "https://firm.com")).toBe(true)
  })
  test("rejects an unregistered origin", () => {
    expect(isOriginAllowed(["https://firm.com"], "https://evil.com")).toBe(false)
  })
  test("rejects a missing origin when the allowlist is configured", () => {
    expect(isOriginAllowed(["https://firm.com"], null)).toBe(false)
  })
})

describe("corsHeaders", () => {
  test("echoes the request origin and varies on it", () => {
    const h = corsHeaders("https://firm.com")
    expect(h["Access-Control-Allow-Origin"]).toBe("https://firm.com")
    expect(h["Vary"]).toBe("Origin")
  })
  test("falls back to * when there is no origin", () => {
    expect(corsHeaders(null)["Access-Control-Allow-Origin"]).toBe("*")
  })
  test("advertises the methods it is given", () => {
    expect(corsHeaders("https://firm.com", "GET, OPTIONS")["Access-Control-Allow-Methods"]).toBe(
      "GET, OPTIONS"
    )
  })
})
