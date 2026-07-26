/**
 * Task 20 (JSON-LD Structured Data). Renders a single structured-data block
 * as a `<script type="application/ld+json">` tag. Server component (no
 * "use client" -- nothing here is interactive or reads browser APIs), so it
 * costs nothing on the client bundle and the block is present in the
 * initial server-rendered HTML, which is what crawlers/Rich Results Test
 * actually read.
 *
 * `dangerouslySetInnerHTML` is the only way to emit a literal
 * `<script>...</script>` with a JSON body in React/JSX -- children would be
 * HTML-escaped (turning `"` into `&quot;` etc.) and break the JSON.
 * It is safe here specifically because:
 *
 *   1. `data` is always one of this repo's own `src/lib/jsonld.ts` builder
 *      outputs (or content drawn from `src/content/*.ts`) -- build-time
 *      constants compiled into the app, never end-user input, a request
 *      body, a query param, or anything else attacker-controlled reaches
 *      this component.
 *   2. The one residual risk with trusted-but-arbitrary string data inside
 *      a `<script>` body is a "script-context breakout": if a string value
 *      contained the literal substring `</script>`, a naive
 *      `JSON.stringify` would let that string close the real `<script>`
 *      tag early and let whatever HTML follows in the JSON be parsed as
 *      markup instead of script content. Escaping every `<` to its Unicode
 *      escape `<` (below) neutralizes that regardless of where it
 *      appears in the payload, without touching the JSON's meaning (valid
 *      JSON has no unescaped raw `<` inside strings that matters
 *      semantically, and `<` round-trips through `JSON.parse`
 *      identically to a literal `<`).
 */
function safeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
