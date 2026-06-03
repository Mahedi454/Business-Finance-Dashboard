import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/clients",
  "/projects",
  "/revenue",
  "/investments",
  "/expenses",
  "/employees",
  "/salaries",
  "/withdraws",
  "/reports",
  "/settings",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("business_finance_dashboard_token");
  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL(token ? "/dashboard" : "/login", request.url));
  }

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isExpiredSession = request.nextUrl.searchParams.get("session") === "expired";

  if (request.nextUrl.pathname === "/login" && token && !isExpiredSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/clients/:path*", "/projects/:path*", "/revenue/:path*", "/investments/:path*", "/expenses/:path*", "/employees/:path*", "/salaries/:path*", "/withdraws/:path*", "/reports/:path*", "/settings/:path*"],
};
