import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const protectedPrefixes = ["/student", "/mentor", "/admin"];
  const isProtected = protectedPrefixes.some((p) =>
    nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn && role) {
    if (nextUrl.pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, nextUrl));
    }
    if (nextUrl.pathname.startsWith("/mentor") && role !== "MENTOR") {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, nextUrl));
    }
    if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/student/:path*", "/mentor/:path*", "/admin/:path*"],
};
