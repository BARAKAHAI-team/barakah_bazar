import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Admin API routes protection
  if (pathname.startsWith('/api/admin')) {
    const sessionCookie = request.cookies.get('bz_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Admin authentication required.' } },
        { status: 401 }
      );
    }
    try {
      const session = JSON.parse(sessionCookie);
      if (session.role !== 'admin') {
        return NextResponse.json(
          { ok: false, error: { code: 'FORBIDDEN', message: 'Admin privileges required.' } },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_SESSION', message: 'Session invalid.' } },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 2. Admin UI pages protection
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('bz_session')?.value;
    const nextPath = encodeURIComponent(`${pathname}${search}`);

    if (!sessionCookie) {
      return NextResponse.redirect(new URL(`/login?next=${nextPath}`, request.url));
    }

    try {
      const session = JSON.parse(sessionCookie);
      if (session.role !== 'admin') {
        // Redirect unauthorized customers to storefront
        return NextResponse.redirect(new URL('/?unauthorized=admin', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL(`/login?next=${nextPath}`, request.url));
    }

    return NextResponse.next();
  }

  // 3. Customer protected routes
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
    '/admin/:path*',
    '/api/admin/:path*',
    '/cart/:path*',
    '/wishlist/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/account/:path*',
  ],
};
