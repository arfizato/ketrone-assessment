import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to assessment
          </h1>
          <p className="text-sm text-muted-foreground">
            A no-code form builder with an embeddable, Shadow-DOM-isolated
            runtime. Go to <code className="font-mono">/projects</code> to see
            the app.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/projects">Go to /projects</Link>
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://majestic-parfait-4e3487.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Test CORS (external embed)
            </a>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          The external page above embeds a form from a different origin — use it
          to verify the cross-origin config fetch and submit flow.
        </p>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}
