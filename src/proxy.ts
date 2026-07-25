import { NextRequest, NextResponse } from "next/server";
import { personaFromHost, PERSONA_IDS } from "@/lib/personas";

const PROD_ROOT = "kinectapp.ai";

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname, search } = req.nextUrl;
  const persona = personaFromHost(host);

  // www canonicalization: strip the www prefix before any other logic
  if (host === `www.${PROD_ROOT}`) {
    return NextResponse.redirect(`https://${PROD_ROOT}${pathname}${search}`, 308);
  }

  // Subdomain root → internal persona route
  if (persona) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = `/${persona}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next(); // shared routes (legal, api) serve as-is
  }

  // Root domain in production: canonicalize path access to the subdomain,
  // preserving the remainder of the path and query string
  const seg = pathname.split("/")[1];
  if (host === PROD_ROOT && (PERSONA_IDS as readonly string[]).includes(seg)) {
    const rest = pathname.slice(seg.length + 1) || "/";
    return NextResponse.redirect(`https://${seg}.${PROD_ROOT}${rest}${search}`, 308);
  }
  return NextResponse.next();
}

export const config = {
  // Exclusions are segment-anchored (e.g. `/apiary` must still hit the proxy).
  matcher: [
    "/((?!(?:_next|api|studio|screenshots|favicon.ico|robots.txt|sitemap.xml|llms.txt)(?:/|$)).*)",
  ],
};
