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

# Status

Built: the no-code form builder, live theme customizer, the embeddable runtime
(one `<script>` tag → Shadow-DOM-isolated, themed form with instant config sync),
the config + submit API routes (Zod-validated, input-sanitised), and
Firestore-backed persistence. Forms live in the `forms` collection; the builder
loads one per `/projects/<id>` and the embed fetches it from `/api/forms/<id>`.

Remaining: save/publish from the builder back to Firestore, HMAC-signed outbound
webhooks + origin/domain checks on submit, IaC (Cloud Run + Terraform), and a full
setup/security writeup to replace this section.

# TODO:

- improve navbar:
  - reorder buttons to to have publish be the CTA and right most buton
  - name field is centered in navbar + resize to fit

- form
  - make fieldforms collapsable
  - remove preview in field forms (file)
  - add textarea?
  - add title
  - add description
  - each formfield icon gets a random color to be able to differenciate between different text fields

- /projects
  - icon/thumbnail
  - delete/dupe button
  - status (active, archive, inactive)+ filters
