import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./app/lib/session";

const BASE_PATH = "/phnavt";
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];
const isDev = process.env.NODE_ENV === "development";

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const respond = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", csp);
    return response;
  };

  // Only care about routes under our app's basePath
  if (!pathname.startsWith(BASE_PATH)) {
    return respond(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  const appPath = pathname.slice(BASE_PATH.length) || "/";

  // Allow public routes through without a session
  const isPublic = PUBLIC_PATHS.some((p) => appPath === p || appPath.startsWith(p + "/"));
  if (isPublic) return respond(NextResponse.next({ request: { headers: requestHeaders } }));

  const token = req.cookies.get("session")?.value;
  const session = await decrypt(token);

  // Redirect unauthenticated users to login
  if (!session?.userId) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = `${BASE_PATH}/login`;
    loginUrl.searchParams.set("from", pathname);
    return respond(NextResponse.redirect(loginUrl));
  }

  // Admin routes require an IT session
  if (appPath.startsWith("/admin") && session.role !== "IT") {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = BASE_PATH;
    return respond(NextResponse.redirect(homeUrl));
  }

  return respond(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
