import { auth } from "@/auth";
import { NextResponse } from "next/server";

const areas = [
  ["/student", "STUDENT"],
  ["/mentor", "MENTOR"],
  ["/admin", "ADMIN"],
  ["/company", "COMPANY"],
] as const;

export default auth((req) => {
  const { nextUrl } = req;
  const area = areas.find(([prefix]) => nextUrl.pathname.startsWith(prefix));
  if (!area) return NextResponse.next();

  const role = req.auth?.user?.role;
  if (!req.auth || !role) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (role !== area[1]) {
    return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/student/:path*",
    "/mentor/:path*",
    "/admin/:path*",
    "/company/:path*",
  ],
};
