import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/buku-kas', '/cek-rekening', '/kategori', '/laba-rugi', '/neraca', '/arus-kas', '/laporan', '/pengaturan', '/login'],
};