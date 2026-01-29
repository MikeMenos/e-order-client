import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const isLoggedIn = !!accessToken?.trim();

  // Logged in on public path -> send to dashboard
  if (isLoggedIn && isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Not logged in on protected path -> send to home
  if (!isLoggedIn && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run only on page routes we need for auth; avoid interfering with internal routes
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard",
    "/basket",
    "/configuration",
    "/suppliers",
    // Match dynamic segments (suppliers/[id], configuration/...)
    "/suppliers/:path*",
    "/configuration/:path*",
  ],
};
