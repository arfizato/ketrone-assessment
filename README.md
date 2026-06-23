# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

# todo:

## Form theming — remaining work

The Design step themes the **admin preview** today via a per-form `FormTheme`
(`lib/theme.ts`) → CSS vars + `data-*` on a `.themed-form` wrapper. Built and
done: base/accent colors, font, radius, density, field-style, container, shadow,
appearance (system/light/dark), presets. Outstanding:

### Make the theme reach the actual embedded form
- [ ] **Embed wiring** — apply `resolveTheme()` output to the shadow `:host` at
      runtime, inject the chosen font's `<link>`, and render `FormBody` (see
      `docs/embed-renderer-design.md`). The contract exists; the consumer doesn't.
- [ ] **Persistence** — `theme` and `form` are in-memory `useState`
      (`app/projects/page.tsx`); they're lost on refresh. Persist to Firestore.
- [ ] **Form identity** — no form id/title yet. The embed needs an id to fetch
      `/api/forms/<id>` returning `{ fields, theme }`; that route + a save/publish
      action don't exist.

### Polish
- [ ] **Reset to default** + indicate which preset is active (after persistence).
- [ ] md/sm Design: auto-open the controls drawer on entry; replace the literal
      `"nav"` placeholder in the header.
- [ ] **Tests** for the pure logic — `resolveTheme()` / `contrastForeground()`.

### Known limitation
- An open shadcn `Select` menu in the admin preview is themed via inline vars; the
  embed uses a native `<select>`, so this is admin-preview-only.
