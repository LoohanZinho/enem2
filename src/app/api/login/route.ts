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

    const result = await authService.login({ email, password });

    if (result.success && result.user) {
      // O login foi bem-sucedido, agora criamos o cookie na resposta.
      const response = NextResponse.json({ success: true, user: result.user });
      
      // Define o cookie que o middleware irá ler.
      cookies().set('enem_pro_user_id', result.user.id, {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 dia
        httpOnly: true, // Mais seguro, o cookie não é acessível via JS no cliente
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
