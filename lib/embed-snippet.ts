/** The embeddable <script> snippet a site owner pastes into their page. */
export function buildSnippet(origin: string, formId: string): string {
  return `<script src="${origin}/embed.js" data-form="${formId}"></script>`
}
