import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const protectedRoutes = ['/cart', '/wishlist', '/checkout', '/orders', '/account'];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    const sessionCookie = request.cookies.get('bz_session');

    if (!sessionCookie?.value) {
      const nextPath = encodeURIComponent(`${pathname}${search}`);
      const loginUrl = new URL(`/login?next=${nextPath}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cart/:path*',
    '/wishlist/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/account/:path*',
  ],
};
