"use server";
import { NextResponse, type NextRequest } from 'next/server';
import { authService } from '@/services/AuthService';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    // A validação do login agora é feita aqui, no lado do servidor.
    const result = await authService.login(credentials.email, credentials.password);

    if (result.success && result.user) {
      // Se o login for bem-sucedido, configuramos o cookie na resposta.
      const response = NextResponse.json({ success: true, user: result.user });
      
      cookies().set('enem_pro_user_id', result.user.id, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24, // 1 dia
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      
      return response;

    } else {
      // Falha no login, retorna a mensagem de erro do serviço.
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erro na rota de login:', error);
    return NextResponse.json(
      { success: false, message: 'Ocorreu um erro no servidor.' },
      { status: 500 }
    );
  }
}
