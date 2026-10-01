import { NextResponse, type NextRequest } from 'next/server';

/**
 * A fast first gate for the admin: no session cookie, no admin page — straight to the login.
 * It cannot see the database, so it only checks that a cookie exists; the session itself is
 * verified server-side by the admin layout and by every server action and API route.
 */
const SESSION_COOKIE = 'kapu_admin';
const LOGIN_PATH = '/admin/belepes';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === LOGIN_PATH || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
