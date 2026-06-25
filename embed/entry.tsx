import { render } from "preact"
import { resolveTheme, CURATED_FONTS_HREF, DEFAULT_THEME } from "../lib/theme"
import FormBody from "../components/FormBody"
import styles from "./styles.css"

// Captured synchronously at module eval — `currentScript` is the loading <script>.
const script = document.currentScript as HTMLScriptElement | null

function appOrigin(): string {
  try {
    return new URL(script!.src).origin
  } catch {
    return location.origin
  }
}

function resolveAppearance(appearance: string): "light" | "dark" {
  if (appearance === "light" || appearance === "dark") return appearance
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function ensureFontLink() {
  const id = "embed-curated-fonts"
  if (document.getElementById(id)) return
  const link = document.createElement("link")
  link.id = id
  link.rel = "stylesheet"
  link.href = CURATED_FONTS_HREF
  document.head.appendChild(link)
}

async function boot() {
  if (!script) return
  const id = script.dataset.form
  if (!id) {
    console.warn("[embed] missing data-form id on script tag")
    return
  }
  const origin = appOrigin()

  // Mount point in the host page, isolated via an open Shadow DOM.
  const mountHost = document.createElement("div")
  script.insertAdjacentElement("afterend", mountHost)
  const root = mountHost.attachShadow({ mode: "open" })

  const styleEl = document.createElement("style")
  styleEl.textContent = styles
  root.appendChild(styleEl)
  const mount = document.createElement("div")
  root.appendChild(mount)

  try {
    const res = await fetch(`${origin}/api/forms/${id}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`config request failed: ${res.status}`)
    const config = await res.json()

    const appearance = resolveAppearance(config?.theme?.appearance ?? "system")
    const vars = resolveTheme(config?.theme ?? DEFAULT_THEME, appearance)
    // CSS custom properties on the host element inherit into the shadow tree
    // (`all: initial` does not reset custom properties).
    for (const [k, v] of Object.entries(vars)) mountHost.style.setProperty(k, v)
    ensureFontLink()

    render(<FormBody config={config} origin={origin} />, mount)
  } catch (err) {
    console.warn("[embed] failed to load form", id, err)
    mount.innerHTML =
      '<p style="font:14px system-ui,sans-serif;color:#b91c1c">Form unavailable.</p>'
  }
}

boot()
