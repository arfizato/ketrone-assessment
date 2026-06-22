import * as React from "react"

export type Breakpoint = "sm" | "md" | "lg"

const MD = 768
const LG = 1024

/**
 * Layout tier for the /projects builder:
 *   lg  >= 1024px   full three-panel resizable layout
 *   md  768-1023px  palette + builder side by side, preview behind a toggle
 *   sm  < 768px     builder only, palette in a bottom drawer
 *
 * Returns `undefined` until mounted so the server and first client render
 * agree (callers fall back to the `lg` layout); it settles to the real tier
 * once the effect runs. Mirrors the matchMedia pattern in use-mobile.ts.
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint | undefined>(
    undefined,
  )

  React.useEffect(() => {
    const read = () => {
      const w = window.innerWidth
      setBreakpoint(w >= LG ? "lg" : w >= MD ? "md" : "sm")
    }
    // one listener per boundary so a resize across either edge re-reads
    const mdMql = window.matchMedia(`(min-width: ${MD}px)`)
    const lgMql = window.matchMedia(`(min-width: ${LG}px)`)
    read()
    mdMql.addEventListener("change", read)
    lgMql.addEventListener("change", read)
    return () => {
      mdMql.removeEventListener("change", read)
      lgMql.removeEventListener("change", read)
    }
  }, [])

  return breakpoint
}
