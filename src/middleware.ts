
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const currentUserCookie = request.cookies.get('enem_pro_user_id');
  const currentUser = currentUserCookie?.value;
  
  const { pathname } = request.nextUrl;

  const publicPaths = [
    '/', 
    '/login',
    '/redefinir-senha',
    '/api/create-user',
    '/suporte-ativacao',
    '/admin',
    '/webhook',
  ];

  const isPublicPath = publicPaths.some(path => 
    pathname === path || (path !== '/' && pathname.startsWith(path))
  );
  
  if (!isPublicPath && !currentUser) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (currentUser && pathname === '/login') {
    return NextResponse.redirect(new URL('/cronograma', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
