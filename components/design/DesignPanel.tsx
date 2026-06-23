"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import {
  ACCENT_SWATCHES,
  BASE_FAMILIES,
  FONTS,
  FormTheme,
  PRESETS,
} from "@/lib/theme"

function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
    </div>
  )
}

/** Equal-width segmented control over a small string enum. */
function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      className="w-full"
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} className="flex-1">
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/** A small color dot representing a base neutral family. */
function familySwatch(hue: number, chroma: number) {
  return `oklch(0.62 ${chroma * 4} ${hue})`
}

export default function DesignPanel({
  theme,
  onChange,
  onApplyPreset,
  className,
}: {
  theme: FormTheme
  onChange: (patch: Partial<FormTheme>) => void
  onApplyPreset: (theme: FormTheme) => void
  className?: string
}) {
  return (
    <div className={cn("h-full space-y-6 overflow-auto p-4", className)}>
      <Section label="Preset">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.id}
              variant="outline"
              size="sm"
              onClick={() => onApplyPreset(p.theme)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </Section>

      <Section label="Base color">
        <div className="flex flex-wrap gap-2">
          {BASE_FAMILIES.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-label={f.label}
              aria-pressed={theme.base === f.id}
              onClick={() => onChange({ base: f.id })}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors",
                theme.base === f.id
                  ? "border-foreground"
                  : "border-input hover:bg-muted"
              )}
            >
              <span
                className="size-4 rounded-full border"
                style={{ background: familySwatch(f.hue, f.chroma) }}
              />
              {f.label}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Accent color">
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Accent color"
            value={theme.accent}
            onChange={(e) => onChange({ accent: e.target.value })}
            className="size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
          />
          <Input
            value={theme.accent}
            onChange={(e) => onChange({ accent: e.target.value })}
            className="font-mono"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ACCENT_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => onChange({ accent: c })}
              className={cn(
                "size-6 rounded-full border transition-transform hover:scale-110",
                theme.accent.toLowerCase() === c.toLowerCase() &&
                  "ring-2 ring-foreground ring-offset-1 ring-offset-background"
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      </Section>

      <Section label="Font">
        <div className="flex flex-wrap gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={theme.font === f.id}
              onClick={() => onChange({ font: f.id })}
              style={{ fontFamily: f.stack }}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm transition-colors",
                theme.font === f.id
                  ? "border-foreground"
                  : "border-input hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Section>

      <Section label={`Radius — ${theme.radius}rem`}>
        <Slider
          min={0}
          max={1.5}
          step={0.025}
          value={[theme.radius]}
          onValueChange={([v]) => onChange({ radius: v })}
        />
      </Section>

      <Section label="Density">
        <Segmented
          value={theme.density}
          onChange={(density) => onChange({ density })}
          options={[
            { value: "compact", label: "Compact" },
            { value: "comfortable", label: "Comfortable" },
            { value: "spacious", label: "Spacious" },
          ]}
        />
      </Section>

      <Section label="Field style">
        <Segmented
          value={theme.fieldStyle}
          onChange={(fieldStyle) => onChange({ fieldStyle })}
          options={[
            { value: "outlined", label: "Outlined" },
            { value: "filled", label: "Filled" },
            { value: "underlined", label: "Underlined" },
          ]}
        />
      </Section>

      <Section label="Shadow">
        <Segmented
          value={theme.shadow}
          onChange={(shadow) => onChange({ shadow })}
          options={[
            { value: "none", label: "None" },
            { value: "subtle", label: "Subtle" },
            { value: "medium", label: "Medium" },
            { value: "strong", label: "Strong" },
          ]}
        />
      </Section>

      <Section label="Container">
        <Segmented
          value={theme.container}
          onChange={(container) => onChange({ container })}
          options={[
            { value: "card", label: "Card" },
            { value: "flat", label: "Flat" },
          ]}
        />
      </Section>

      <Section label="Default appearance">
        <Segmented
          value={theme.appearance}
          onChange={(appearance) => onChange({ appearance })}
          options={[
            { value: "system", label: "System" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Section>
    </div>
  )
}
