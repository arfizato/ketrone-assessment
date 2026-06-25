/** Well-distributed 32-bit hash (FNV-1a + avalanche) so similar ids don't map
 *  to similar visuals. */
function hash32(s: string) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h ^= h >>> 15
  h = Math.imul(h, 2246822507)
  h ^= h >>> 13
  h = Math.imul(h, 3266489909)
  h ^= h >>> 16
  return h >>> 0
}

/**
 * A deterministic generated thumbnail for a form. The tile background hue, the
 * two-tone inner gradient, its angle, and its corner radius are each derived
 * from independent slices of the id hash — so every form gets a distinct, stable
 * icon (two forms won't collide on a single shared dimension).
 */
export default function FormThumb({ id }: { id: string }) {
  const h = hash32(id)

  const hue = h % 360
  // a clearly different second hue (90°–270° away) makes each blob two-tone
  const hue2 = (hue + 90 + ((h >>> 9) % 180)) % 360
  const radius = ["50%", "34%", "22%", "12%"][(h >>> 17) % 4]
  const angle = [120, 160, 200, 240][(h >>> 20) % 4]

  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-lg"
      style={{ background: `hsl(${hue} 60% 50% / 0.18)` }}
    >
      <div
        className="size-5"
        style={{
          borderRadius: radius,
          background: `linear-gradient(${angle}deg, hsl(${hue} 75% 58%), hsl(${hue2} 70% 48%))`,
        }}
      />
    </div>
  )
}
