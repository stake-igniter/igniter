import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const middleware: any = auth(async (req: NextRequest) => {
  //@ts-ignore
  const isLoggedIn = !!req.auth;
  const authCookie = req.cookies.get("authjs.session-token");

  const decodedCookie = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
});

export default middleware;

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
