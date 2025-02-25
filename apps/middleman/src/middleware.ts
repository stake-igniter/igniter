import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: [/*"/dashboard/:path*",*/ "/admin/dashboard/:path*"],
};
