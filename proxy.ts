import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";

const BASE_PATH = "/phnavt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only care about routes under our app's basePath
  if (!pathname.startsWith(BASE_PATH)) {
    return NextResponse.next();
  }

  const appPath = pathname.slice(BASE_PATH.length) || "/";

  // Admin routes require an IT session
  if (appPath.startsWith("/admin")) {
    const token = req.cookies.get("session")?.value;
    const session = await decrypt(token);
    if (!session?.userId || session.role !== "IT") {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = BASE_PATH;
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
