import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";

const BASE_PATH = "/phnavt";
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only care about routes under our app's basePath
  if (!pathname.startsWith(BASE_PATH)) {
    return NextResponse.next();
  }

  const appPath = pathname.slice(BASE_PATH.length) || "/";

  // Allow public routes through without a session
  const isPublic = PUBLIC_PATHS.some((p) => appPath === p || appPath.startsWith(p + "/"));
  if (isPublic) return NextResponse.next();

  const token = req.cookies.get("session")?.value;
  const session = await decrypt(token);

  // Redirect unauthenticated users to login
  if (!session?.userId) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = `${BASE_PATH}/login`;
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes require an IT session
  if (appPath.startsWith("/admin") && session.role !== "IT") {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = BASE_PATH;
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
