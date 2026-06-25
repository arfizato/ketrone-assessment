import { z } from "zod"

export const SelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

export const TableColumnSchema = z.object({
  label: z.string(),
  type: z.string(),
})

export const FieldDataSchema = z.object({
  label: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  validation: z.string().optional(),
  options: z.array(SelectOptionSchema).optional(),
  columns: z.array(TableColumnSchema).optional(),
  helperLabel: z.string().optional(),
})

export const FieldInstanceSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "textarea", "select", "file", "table", "radio"]),
  data: FieldDataSchema,
})

export const FormThemeSchema = z.object({
  base: z.enum(["neutral", "slate", "gray", "zinc", "stone"]),
  accent: z.string(),
  radius: z.number(),
  font: z.enum(["system", "inter", "geist", "roboto", "space-grotesk", "lora"]),
  density: z.enum(["compact", "comfortable", "spacious"]),
  shadow: z.enum(["none", "subtle", "medium", "strong"]),
  container: z.enum(["card", "flat"]),
  fieldStyle: z.enum(["outlined", "filled", "underlined"]),
  appearance: z.enum(["system", "light", "dark"]),
})

/** Lifecycle status shown + filtered on the /projects list. */
export const FORM_STATUSES = ["active", "inactive", "archived"] as const
export type FormStatus = (typeof FORM_STATUSES)[number]

export const ConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  submitLabel: z.string().optional(),
  /** lifecycle status; absent is treated as "active" */
  status: z.enum(FORM_STATUSES).optional(),
  theme: FormThemeSchema,
  fields: z.array(FieldInstanceSchema),
  // --- backend integration (server-only; never sent to the public embed) ---
  /** where verified submissions are forwarded as a signed JSON payload */
  webhookUrl: z.string().url().optional(),
  /** shared secret used to HMAC-SHA256-sign outbound webhooks */
  webhookSecret: z.string().optional(),
  /** registered domains allowed to embed + submit; empty/absent = open */
  allowedOrigins: z.array(z.string()).optional(),
})

/** The public projection sent to the embed — drops every server-only secret. */
export const PublicConfigSchema = ConfigSchema.omit({
  webhookUrl: true,
  webhookSecret: true,
  allowedOrigins: true,
})

export const ConfigsSchema = z.array(ConfigSchema)

export const SubmissionSchema = z.object({
  formId: z.string(),
  values: z.record(z.string(), z.unknown()),
})

export type Config = z.infer<typeof ConfigSchema>
export type PublicConfig = z.infer<typeof PublicConfigSchema>
export type Submission = z.infer<typeof SubmissionSchema>
