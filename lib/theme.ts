/**
 * Per-form theming contract.
 *
 * A FormTheme is a small, serializable description of how a form should look.
 * `resolveTheme()` turns it into a flat map of CSS variables for one appearance
 * (light or dark). That map is the single source consumed in two places:
 *   - the admin: spread onto a wrapper via `style={…}` around <FormPreview>
 *   - the embed (later): set on the shadow `:host` via setProperty
 *
 * The four enum knobs (fieldStyle / container / density / shadow) ride as
 * `data-*` attributes and are handled by the `.themed-form[data-…]` CSS layer
 * in globals.css — they can't be expressed as a single variable value.
 */

export type Appearance = "system" | "light" | "dark"
export type Density = "compact" | "comfortable" | "spacious"
export type Shadow = "none" | "subtle" | "medium" | "strong"
export type Container = "card" | "flat"
export type FieldStyle = "outlined" | "filled" | "underlined"
export type BaseFamilyId = "neutral" | "slate" | "gray" | "zinc" | "stone"
export type FontId =
  | "system"
  | "inter"
  | "geist"
  | "roboto"
  | "space-grotesk"
  | "lora"

export type FormTheme = {
  /** curated neutral family — drives background / foreground / border / muted … */
  base: BaseFamilyId
  /** brand color (hex) — drives --primary + --ring; we compute its foreground */
  accent: string
  /** corner radius in rem — drives --radius */
  radius: number
  font: FontId
  density: Density
  shadow: Shadow
  container: Container
  fieldStyle: FieldStyle
  /** the embed's *default* color-scheme (admin previews via its own toggle) */
  appearance: Appearance
}

export const DEFAULT_THEME: FormTheme = {
  base: "neutral",
  accent: "#4f46e5",
  radius: 0.625,
  font: "inter",
  density: "comfortable",
  shadow: "subtle",
  container: "card",
  fieldStyle: "outlined",
  appearance: "system",
}

/* ------------------------------------------------------------------ */
/* Base neutral families                                              */
/* Each family is a hue + a small chroma; the token scale below is the */
/* shadcn "neutral" lightness ramp, tinted by that hue. This keeps the */
/* set consistent and bulletproof (no hand-copied palettes to drift). */
/* ------------------------------------------------------------------ */

type Family = { id: BaseFamilyId; label: string; hue: number; chroma: number }

export const BASE_FAMILIES: Family[] = [
  { id: "neutral", label: "Neutral", hue: 0, chroma: 0 },
  { id: "slate", label: "Slate", hue: 257, chroma: 0.013 },
  { id: "gray", label: "Gray", hue: 264, chroma: 0.008 },
  { id: "zinc", label: "Zinc", hue: 286, chroma: 0.006 },
  { id: "stone", label: "Stone", hue: 60, chroma: 0.006 },
]

/** Lightness for each semantic token as [light, dark]. */
const SCALE = {
  background: [1, 0.145],
  foreground: [0.145, 0.985],
  card: [1, 0.205],
  cardForeground: [0.145, 0.985],
  popover: [1, 0.205],
  popoverForeground: [0.145, 0.985],
  secondary: [0.97, 0.269],
  secondaryForeground: [0.205, 0.985],
  muted: [0.97, 0.269],
  mutedForeground: [0.556, 0.708],
  accentSurface: [0.97, 0.269],
  accentForeground: [0.205, 0.985],
  border: [0.922, 0.27],
  input: [0.922, 0.27],
} satisfies Record<string, [number, number]>

function tone(l: number, fam: Family): string {
  const chroma = l >= 0.99 ? 0 : fam.chroma
  return `oklch(${l} ${chroma} ${fam.hue})`
}

/* ------------------------------------------------------------------ */
/* Fonts                                                              */
/* ------------------------------------------------------------------ */

export const FONTS: { id: FontId; label: string; stack: string; google?: string }[] =
  [
    { id: "system", label: "System", stack: "ui-sans-serif, system-ui, sans-serif" },
    { id: "inter", label: "Inter", stack: "'Inter', sans-serif", google: "Inter:wght@400;500;600" },
    { id: "geist", label: "Geist", stack: "'Geist', sans-serif", google: "Geist:wght@400;500;600" },
    { id: "roboto", label: "Roboto", stack: "'Roboto', sans-serif", google: "Roboto:wght@400;500;700" },
    { id: "space-grotesk", label: "Space Grotesk", stack: "'Space Grotesk', sans-serif", google: "Space+Grotesk:wght@400;500;600" },
    { id: "lora", label: "Lora", stack: "'Lora', serif", google: "Lora:wght@400;500;600" },
  ]

function fontStack(id: FontId): string {
  return (FONTS.find((f) => f.id === id) ?? FONTS[0]).stack
}

/** The Google Fonts href that loads every curated web font (admin preview). */
export const CURATED_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  FONTS.filter((f) => f.google)
    .map((f) => `family=${f.google}`)
    .join("&") +
  "&display=swap"

/* ------------------------------------------------------------------ */
/* Shadow + density scales                                            */
/* ------------------------------------------------------------------ */

const SHADOWS: Record<Shadow, string> = {
  none: "none",
  subtle: "0 1px 2px 0 oklch(0 0 0 / 0.06)",
  medium: "0 4px 14px -3px oklch(0 0 0 / 0.12)",
  strong: "0 14px 36px -6px oklch(0 0 0 / 0.20)",
}

const DENSITY: Record<Density, { gap: string; control: string }> = {
  compact: { gap: "0.75rem", control: "1.85rem" },
  comfortable: { gap: "1.25rem", control: "2.25rem" },
  spacious: { gap: "1.75rem", control: "2.75rem" },
}

/* ------------------------------------------------------------------ */
/* Accent foreground (contrast)                                       */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.trim().replace("#", "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return null
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

/** Pick a readable foreground (near-black or near-white) for a brand color. */
function contrastForeground(color: string): string {
  const rgb = hexToRgb(color)
  if (!rgb) return "oklch(0.985 0 0)"
  const lin = (c: number) => {
    const x = c / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  }
  const L = 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b)
  return L > 0.45 ? "oklch(0.205 0 0)" : "oklch(0.985 0 0)"
}

/* ------------------------------------------------------------------ */
/* Resolve                                                            */
/* ------------------------------------------------------------------ */

/**
 * Turn a FormTheme into the flat CSS-variable map for one appearance.
 * Spread the result onto an element's `style`; every var(--…) inside it
 * resolves to these values (and only inside that subtree).
 */
export function resolveTheme(
  theme: FormTheme,
  appearance: "light" | "dark"
): Record<string, string> {
  const fam = BASE_FAMILIES.find((f) => f.id === theme.base) ?? BASE_FAMILIES[0]
  const dark = appearance === "dark"
  const t = (pair: [number, number]) => tone(dark ? pair[1] : pair[0], fam)

  return {
    "--background": t(SCALE.background),
    "--foreground": t(SCALE.foreground),
    "--card": t(SCALE.card),
    "--card-foreground": t(SCALE.cardForeground),
    "--popover": t(SCALE.popover),
    "--popover-foreground": t(SCALE.popoverForeground),
    "--secondary": t(SCALE.secondary),
    "--secondary-foreground": t(SCALE.secondaryForeground),
    "--muted": t(SCALE.muted),
    "--muted-foreground": t(SCALE.mutedForeground),
    "--accent": t(SCALE.accentSurface),
    "--accent-foreground": t(SCALE.accentForeground),
    "--border": dark ? "oklch(1 0 0 / 10%)" : t(SCALE.border),
    "--input": dark ? "oklch(1 0 0 / 15%)" : t(SCALE.input),
    "--destructive": dark
      ? "oklch(0.704 0.191 22.216)"
      : "oklch(0.577 0.245 27.325)",
    // brand
    "--primary": theme.accent,
    "--primary-foreground": contrastForeground(theme.accent),
    "--ring": theme.accent,
    // shape + type
    "--radius": `${theme.radius}rem`,
    "--font-sans": fontStack(theme.font),
    // extras consumed by the .themed-form CSS layer
    "--form-shadow": SHADOWS[theme.shadow],
    "--field-gap": DENSITY[theme.density].gap,
    "--control-height": DENSITY[theme.density].control,
  }
}

/* ------------------------------------------------------------------ */
/* Presets — starting values for the same object                      */
/* ------------------------------------------------------------------ */

export const PRESETS: { id: string; label: string; theme: FormTheme }[] = [
  { id: "default", label: "Default", theme: DEFAULT_THEME },
  {
    id: "minimal",
    label: "Minimal",
    theme: {
      base: "zinc",
      accent: "#18181b",
      radius: 0.25,
      font: "geist",
      density: "comfortable",
      shadow: "none",
      container: "flat",
      fieldStyle: "underlined",
      appearance: "system",
    },
  },
  {
    id: "soft",
    label: "Soft",
    theme: {
      base: "slate",
      accent: "#2563eb",
      radius: 1.1,
      font: "inter",
      density: "spacious",
      shadow: "medium",
      container: "card",
      fieldStyle: "filled",
      appearance: "system",
    },
  },
  {
    id: "warm",
    label: "Warm",
    theme: {
      base: "stone",
      accent: "#ea580c",
      radius: 0.75,
      font: "lora",
      density: "comfortable",
      shadow: "subtle",
      container: "card",
      fieldStyle: "outlined",
      appearance: "system",
    },
  },
  {
    id: "bold",
    label: "Bold",
    theme: {
      base: "gray",
      accent: "#7c3aed",
      radius: 0.5,
      font: "space-grotesk",
      density: "comfortable",
      shadow: "strong",
      container: "card",
      fieldStyle: "outlined",
      appearance: "system",
    },
  },
]

/** A few suggested accent swatches for the color picker. */
export const ACCENT_SWATCHES = [
  "#4f46e5",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#ca8a04",
  "#ea580c",
  "#e11d48",
  "#7c3aed",
  "#18181b",
]
