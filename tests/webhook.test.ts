import { describe, expect, test } from "vitest"
import { signPayload, verifySignature } from "../lib/webhook"

describe("webhook HMAC signing", () => {
  const secret = "shared-secret"
  const body = JSON.stringify({ formId: "frm_x", values: { name: "Jo" } })
  const ts = "1700000000000"

  test("signPayload is deterministic and hex sha256 (64 chars)", () => {
    const sig = signPayload(secret, body, ts)
    expect(sig).toBe(signPayload(secret, body, ts))
    expect(sig).toMatch(/^[0-9a-f]{64}$/)
  })

  test("the timestamp is bound into the signature", () => {
    expect(signPayload(secret, body, ts)).not.toBe(
      signPayload(secret, body, "1700000000001")
    )
  })

  test("verifySignature accepts a matching sha256=<hex> header", () => {
    const header = `sha256=${signPayload(secret, body, ts)}`
    expect(verifySignature(secret, body, ts, header)).toBe(true)
  })

  test("rejects a tampered body", () => {
    const header = `sha256=${signPayload(secret, body, ts)}`
    expect(verifySignature(secret, body + "x", ts, header)).toBe(false)
  })

  test("rejects a replay with a different timestamp", () => {
    const header = `sha256=${signPayload(secret, body, ts)}`
    expect(verifySignature(secret, body, "1700000009999", header)).toBe(false)
  })

  test("rejects a wrong secret", () => {
    const header = `sha256=${signPayload(secret, body, ts)}`
    expect(verifySignature("other", body, ts, header)).toBe(false)
  })
})
