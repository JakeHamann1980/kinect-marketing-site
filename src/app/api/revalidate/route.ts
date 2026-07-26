import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Task 18 (Seed Script + Page Wiring + Revalidation).
 *
 * Sanity's "GROQ-powered webhook" (configured in the project's Manage
 * console -- or `sanity hooks create`, see docs/LAUNCH.md item 3 for why
 * this task documents that as a manual step rather than a CLI one) POSTs
 * here on every create/update/delete in the `production` dataset. The
 * handler:
 *   1. verifies the request actually came from Sanity, via
 *      `next-sanity/webhook`'s `parseBody`, which HMAC-verifies the
 *      `sanity-webhook-signature` header against `SANITY_REVALIDATE_SECRET`
 *      (the same secret configured on the webhook itself) -- this is the
 *      installed next-sanity version's (13.2.1) own signature-verification
 *      helper, so no separate `@sanity/webhook` dependency is needed;
 *   2. on a valid signature, calls `revalidateTag("content")`, invalidating
 *      every fetch in src/lib/sanity.ts (they all tag with `"content"` --
 *      there is no per-document granularity this site currently needs,
 *      since a single content edit should freshen every statically
 *      rendered page on the next request).
 *
 * Every page opts into `revalidate = false` (fully static, no time-based
 * revalidation) -- this route is the only mechanism that ever refreshes
 * cached content, which is intentional: Sanity availability is otherwise
 * non-fatal (see sanity.ts's fallback design), so there's no need to keep
 * re-fetching on a timer.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string; _id?: string }>(
      req,
      secret,
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    // "max" -- the longest built-in cache-life profile (no time-based
    // expiry) -- matches this repo's on-demand-only invalidation design:
    // every page below is `revalidate = false`, so "content" is never
    // time-revalidated, only ever explicitly here. Next 16's `revalidateTag`
    // now takes this as a required second argument (a bare single-argument
    // call still works but logs a deprecation warning pointing at
    // `updateTag`, which isn't usable here since this is a Route Handler,
    // not a Server Action).
    revalidateTag("content", "max");

    return NextResponse.json({ revalidated: true, now: Date.now(), id: body?._id ?? null });
  } catch (err) {
    console.error("[revalidate] error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
