import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Protect /admin/dashboard
  if (pathname.startsWith('/admin/dashboard')) {
    const session = req.cookies.get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
