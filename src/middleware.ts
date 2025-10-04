
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware gerencia o acesso às páginas da aplicação.
export function middleware(request: NextRequest) {
  // Pega o ID do usuário dos cookies para verificar se ele está logado.
  const currentUserCookie = request.cookies.get('enem_pro_user_id');
  const currentUser = currentUserCookie?.value;
  
  // Obtém o caminho da URL que o usuário está tentando acessar.
  const { pathname } = request.nextUrl;

  // Lista de páginas públicas que não exigem login.
  const publicPaths = [
    '/', // A página inicial (landing page)
    '/login', // A página de login
    '/redefinir-senha', // A página de redefinição de senha
    '/api/create-user', // O endpoint que recebe webhooks de pagamento
    '/api/login', // O endpoint que processa o login
    '/suporte-ativacao', // Página de suporte para ativação de conta
    '/admin', // Página de administração
    '/webhook', // Página de visualização de webhooks
  ];

  // Verifica se a página acessada está na lista de páginas públicas.
  const isPublicPath = publicPaths.some(path => 
    pathname === path || (path.endsWith('/') ? pathname.startsWith(path) : pathname === path)
  );
  
  // Se a página NÃO é pública e o usuário NÃO está logado...
  if (!isPublicPath && !currentUser) {
    // ...redireciona o usuário para a página de login.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se o usuário está logado e tenta acessar a página de login, redireciona para o cronograma
  if (currentUser && pathname === '/login') {
    return NextResponse.redirect(new URL('/cronograma', request.url));
  }

  // Se a página é pública ou o usuário está logado, permite o acesso.
  return NextResponse.next();
}

// Configuração para definir quais rotas o middleware deve observar.
export const config = {
  matcher: [
    // Executa o middleware em todas as rotas, exceto nos arquivos estáticos
    // e de otimização de imagem do Next.js.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
