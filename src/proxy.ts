import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to root (login page) always
  if (pathname === "/") {
    return NextResponse.next();
  }

  // If no access code env var, bypass auth entirely
  const accessCode = process.env.NEXT_PUBLIC_ACCESS_CODE;
  if (!accessCode) {
    return NextResponse.next();
  }

  const access = request.cookies.get("b165-access")?.value;
  const role = request.cookies.get("b165-role")?.value;

  // Not authenticated — redirect to login
  if (access !== "true") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Professor route — only accessible to professors
  if (pathname.startsWith("/prof") && role !== "professor") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
