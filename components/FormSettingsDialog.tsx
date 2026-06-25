"use client"

import { Settings2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type FormSettings = {
  webhookUrl: string
  webhookSecret: string
  allowedOrigins: string[]
}

/** A 48-char hex secret for HMAC signing. */
function randomSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Header dialog for a form's backend integration: where verified submissions
 * are forwarded (webhook), the shared HMAC secret, and which origins may embed.
 * Controlled like DesignPanel — edits patch the editor's state and persist on
 * the next save. Origins are edited as text (one per line) with a local mirror
 * so typing doesn't fight the join/split round-trip.
 */
export default function FormSettingsDialog({
  settings,
  onChange,
}: {
  settings: FormSettings
  onChange: (patch: Partial<FormSettings>) => void
}) {
  const [originsText, setOriginsText] = useState(
    settings.allowedOrigins.join("\n")
  )

  const commitOrigins = (text: string) => {
    setOriginsText(text)
    onChange({
      allowedOrigins: text
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        // reseed the textarea from canonical state whenever the dialog opens
        if (open) setOriginsText(settings.allowedOrigins.join("\n"))
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="size-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Form settings</DialogTitle>
          <DialogDescription>
            Where verified submissions are forwarded, and which sites may embed
            this form.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              type="url"
              placeholder="https://api.lawfirm.com/intake"
              value={settings.webhookUrl}
              onChange={(e) => onChange({ webhookUrl: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Submissions are POSTed here as signed JSON. Leave empty to only
              store them.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="webhookSecret">Signing secret</Label>
            <div className="flex gap-2">
              <Input
                id="webhookSecret"
                value={settings.webhookSecret}
                placeholder="shared HMAC-SHA256 secret"
                onChange={(e) => onChange({ webhookSecret: e.target.value })}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ webhookSecret: randomSecret() })}
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Signs the <code>X-Ketrone-Signature</code> header so your backend
              can verify the payload came from us.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="allowedOrigins">Allowed origins</Label>
            <Textarea
              id="allowedOrigins"
              rows={3}
              placeholder={"https://lawfirm.com\nhttps://www.lawfirm.com"}
              value={originsText}
              onChange={(e) => commitOrigins(e.target.value)}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              One per line. Only these domains may load and submit this form.
              Leave empty to allow any.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
