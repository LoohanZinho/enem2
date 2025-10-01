import { NextResponse } from 'next/server';
import { authService } from '@/services/AuthService';
import { User } from '@/types/User';
import nodemailer from 'nodemailer';

// Mapeia o nome do produto recebido da Cakto para o tipo de plano e duração em meses
const planMapping: { [key: string]: { plan: User['plan'], durationInMonths: number } } = {
  'Plano Mensal': { plan: 'mensal', durationInMonths: 1 },
  'Plano 6 Meses': { plan: '6meses', durationInMonths: 6 },
  'Plano Anual': { plan: 'anual', durationInMonths: 12 },
  'Produto Teste': { plan: 'anual', durationInMonths: 12 },
};

// Função para calcular a data de expiração
const calculateExpirationDate = (startDate: Date, months: number): string => {
  const expirationDate = new Date(startDate);
  expirationDate.setMonth(expirationDate.getMonth() + months);
  return expirationDate.toISOString();
};

// Função para enviar email de boas-vindas
const sendWelcomeEmail = async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: (process.env.SMTP_PORT || '587') === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `EnemPro <${process.env.EMAIL_FROM || 'noreply@enempro.com.br'}>`,
      to: user.email,
      subject: '🎓 Bem-vindo ao ENEM Pro - Suas credenciais de acesso',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Olá, ${user.nome}!</h2>
          <p>Seu pagamento foi confirmado e seu acesso à plataforma EnemPro foi liberado!</p>
          <h3>Suas credenciais de acesso:</h3>
          <ul>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Senha:</strong> ${user.password}</li>
          </ul>
          <p>Você pode acessar a plataforma através do link abaixo:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Acessar Plataforma</a>
          <p>Recomendamos que você altere sua senha no primeiro acesso.</p>
          <br>
          <p>Atenciosamente,</p>
          <p><strong>Equipe EnemPro</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`E-mail de boas-vindas enviado para ${user.email}`);
  } catch (error) {
    console.error(`Falha ao enviar e-mail para ${user.email}:`, error);
    // Não impede a criação do usuário, apenas loga o erro
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const webhookData = Array.isArray(body) ? body[0] : body;

    if (!webhookData || !webhookData.data) {
      return NextResponse.json({ success: false, message: 'Payload inválido.' }, { status: 400 });
    }

    const { event, data } = webhookData;
    const { customer, paidAt, product } = data;

    if ((event === 'subscription_created' || event === 'subscription_renewed') && paidAt) {
      if (!customer || !customer.email || !customer.name) {
        return NextResponse.json({ success: false, message: 'Dados do cliente ausentes.' }, { status: 400 });
      }

      const planInfo = planMapping[product?.name];
      if (!planInfo) {
        console.warn(`Plano não reconhecido: "${product?.name}". Verifique o mapeamento.`);
        return NextResponse.json({ success: false, message: `Plano "${product?.name}" não configurado.` }, { status: 400 });
      }

      const { plan, durationInMonths } = planInfo;
      const paymentDate = new Date(paidAt);
      const expirationDate = calculateExpirationDate(paymentDate, durationInMonths);
      const defaultPassword = '123456';

      const loginResult = await authService.login({email: customer.email, password: ''});
      const existingUser = loginResult.success ? loginResult.user : null;

      if (existingUser) {
        console.log(`Usuário com email ${customer.email} já existe. Atualizando assinatura.`);
        await authService.updateUser(existingUser.id, { 
          isActive: true,
          plan: plan,
          planExpiresAt: expirationDate
        });
        return NextResponse.json({ success: true, message: 'Assinatura de usuário existente foi renovada/atualizada.' });
      } else {
        console.log(`Criando novo usuário para ${customer.email}.`);
        
        const newUserPayload: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
          email: customer.email,
          password: defaultPassword,
          nome: customer.name,
          phone: customer.phone || '',
          cpf: customer.docNumber || '',
          birthDate: '', 
          role: 'user',
          isActive: true,
          plan: plan,
          planExpiresAt: expirationDate,
        };

        const result = await authService.register(newUserPayload);

        if (result.success && result.user) {
          console.log(`Usuário ${customer.email} criado com sucesso via webhook com plano ${plan}.`);
          // Enviar email de boas-vindas
          await sendWelcomeEmail(newUserPayload);
          return NextResponse.json({ success: true, message: 'Usuário criado com sucesso.', userId: result.user.id });
        } else {
          console.error('Falha ao registrar usuário via webhook:', result.message);
          return NextResponse.json({ success: false, message: `Falha ao registrar usuário: ${result.message}` }, { status: 500 });
        }
      }
    }

    console.log(`Evento '${event}' recebido, mas não processado (sem data de pagamento ou tipo de evento não relevante).`);
    return NextResponse.json({ success: true, message: `Evento '${event}' recebido, mas não acionou nenhuma ação.` });

  } catch (error) {
    console.error('Erro ao processar webhook da Cakto:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no servidor.';
    return NextResponse.json({ success: false, message: 'Erro interno do servidor.', error: errorMessage }, { status: 500 });
  }
}
