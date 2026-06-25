const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

/** Escape the five HTML-significant characters in a string. */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])
}

/** Recursively escape every string in a value; non-strings pass through. */
export function sanitizeDeep<T>(value: T): T {
  if (typeof value === "string") return escapeHtml(value) as T
  if (Array.isArray(value)) return value.map((v) => sanitizeDeep(v)) as T
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        sanitizeDeep(v),
      ])
    ) as T
  }
  return value
}
