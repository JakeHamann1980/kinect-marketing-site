import { NextRequest, NextResponse } from "next/server";
import { personaFromHost, PERSONA_IDS } from "@/lib/personas";

const PROD_ROOT = "kinectapp.ai";

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;
  const persona = personaFromHost(host);

  // Subdomain root → internal persona route
  if (persona) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = `/${persona}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next(); // shared routes (legal, api) serve as-is
  }

  // Root domain in production: canonicalize path access to the subdomain
  const seg = pathname.split("/")[1];
  if (host === PROD_ROOT && (PERSONA_IDS as readonly string[]).includes(seg)) {
    return NextResponse.redirect(`https://${seg}.${PROD_ROOT}/`, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|studio|screenshots|favicon.ico|robots.txt|sitemap.xml|llms.txt).*)",
  ],
};
