// ===== SERVIDOR DE EMAIL SIMPLIFICADO - ENEM PRO =====
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configuração SMTP (Gmail)
const smtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'enempro25@gmail.com', // ALTERE AQUI
        pass: 'owpz-zjuk-wrsv-egsw'      // ALTERE AQUI
    }
};

// Criar transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Template de email de boas-vindas
function generateWelcomeEmail(userData, paymentData) {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao ENEM Pro</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 800;
        }
        .content {
            padding: 40px 30px;
        }
        .credentials-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #4ade80;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        .credential-item {
            display: flex;
            align-items: center;
            margin: 15px 0;
            padding: 10px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #4ade80;
        }
        .credential-icon {
            font-size: 20px;
            margin-right: 15px;
            width: 30px;
        }
        .credential-label {
            font-weight: 600;
            color: #374151;
            margin-right: 10px;
            min-width: 80px;
        }
        .credential-value {
            font-family: 'Courier New', monospace;
            background: #f3f4f6;
            padding: 5px 10px;
            border-radius: 5px;
            font-weight: 600;
            color: #1f2937;
        }
        .cta-button {
            text-align: center;
            margin: 30px 0;
        }
        .cta-button a {
            display: inline-block;
            background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
            color: white;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 8px 20px rgba(74, 222, 128, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">🎓</div>
            <h1>ENEM Pro</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Bem-vindo(a) à nossa plataforma!</p>
        </div>
        
        <div class="content">
            <h2 style="color: #1e40af; margin-top: 0;">Seu acesso foi liberado! 🎉</h2>
            
            <p>Olá <strong>${userData.name}</strong>,</p>
            
            <p>Seu pagamento foi processado com sucesso via Cakto e seu acesso ao ENEM Pro foi liberado! Agora você tem acesso completo a todos os recursos da nossa plataforma.</p>
            
            <div class="credentials-box">
                <h3 style="color: #1e40af; margin-top: 0;">🔐 Suas credenciais de acesso</h3>
                <div class="credential-item">
                    <span class="credential-icon">📧</span>
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">${userData.email}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-icon">🔑</span>
                    <span class="credential-label">Senha:</span>
                    <span class="credential-value">${userData.password}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-icon">🎫</span>
                    <span class="credential-label">Chave:</span>
                    <span class="credential-value">${userData.accessKey}</span>
                </div>
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e2e8f0;">
                <h3 style="color: #1e40af; margin-top: 0;">📋 Detalhes da sua assinatura</h3>
                <p><strong>💎 Plano:</strong> ${userData.planName}</p>
                <p><strong>💰 Valor pago:</strong> R$ ${(paymentData.amount / 100).toFixed(2).replace('.', ',')}</p>
                <p><strong>💳 Método:</strong> ${paymentData.payment_method || 'Cartão de Crédito'}</p>
                <p><strong>📅 Válido até:</strong> ${new Date(userData.expiresAt).toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div style="background: #fff3cd; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #92400e; margin-top: 0;">⚠️ Informações importantes</h4>
                <ul style="color: #92400e; margin: 10px 0 0 0;">
                    <li>Faça login com a senha padrão fornecida acima</li>
                    <li>Altere sua senha no primeiro acesso por segurança</li>
                    <li>Sua chave de acesso é única e pessoal - não compartilhe</li>
                    <li>Em caso de dúvidas, entre em contato conosco</li>
                </ul>
            </div>
            
            <div class="cta-button">
                <a href="http://localhost:8080/login">🚀 Acessar Plataforma Agora</a>
            </div>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb;">
            <p style="margin: 5px 0;"><strong>Equipe ENEM Pro</strong></p>
            <p style="margin: 5px 0;">Transformando sonhos em aprovação no ENEM</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Rota para testar conexão SMTP
app.post('/api/test-smtp', async (req, res) => {
    try {
        await transporter.verify();
        res.json({
            success: true,
            message: 'Conexão SMTP verificada com sucesso',
            smtpHost: smtpConfig.host,
            smtpPort: smtpConfig.port,
            smtpUser: smtpConfig.auth.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Rota para enviar email de teste
app.post('/api/send-test-email', async (req, res) => {
    try {
        const { to, name, type } = req.body;

        if (!to || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email e nome são obrigatórios'
            });
        }

        let result;
        
        if (type === 'welcome') {
            // Dados de teste para email de boas-vindas
            const userData = {
                name: name,
                email: to,
                password: 'enempro2025',
                accessKey: 'ENEMTEST' + Date.now().toString(36).toUpperCase(),
                planName: 'Anual',
                expiresAt: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString()
            };
            
            const paymentData = {
                amount: 53990,
                payment_method: 'credit_card',
                id: 'test_' + Date.now()
            };
            
            const html = generateWelcomeEmail(userData, paymentData);
            
            const mailOptions = {
                from: `"ENEM Pro" <${smtpConfig.auth.user}>`,
                to: to,
                subject: '🎓 Bem-vindo ao ENEM Pro - Suas credenciais de acesso',
                html: html,
                text: `
ENEM PRO - Bem-vindo à nossa plataforma!

Olá ${userData.name},

Seu pagamento foi processado com sucesso via Cakto e seu acesso ao ENEM Pro foi liberado!

SUAS CREDENCIAIS DE ACESSO:
📧 Email: ${userData.email}
🔐 Senha: ${userData.password}
🔑 Chave de acesso: ${userData.accessKey}

DETALHES DA SUA ASSINATURA:
💎 Plano: ${userData.planName}
💰 Valor pago: R$ ${(paymentData.amount / 100).toFixed(2).replace('.', ',')}
💳 Método: ${paymentData.payment_method}
📅 Válido até: ${new Date(userData.expiresAt).toLocaleDateString('pt-BR')}

IMPORTANTE:
- Faça login com a senha padrão fornecida
- Altere sua senha no primeiro acesso
- Sua chave de acesso é única e pessoal

Acesse: http://localhost:8080/login

Atenciosamente,
Equipe ENEM Pro
                `
            };
            
            result = await transporter.sendMail(mailOptions);
        } else {
            // Email de teste simples
            const mailOptions = {
                from: `"ENEM Pro" <${smtpConfig.auth.user}>`,
                to: to,
                subject: '🧪 Teste de Email - ENEM Pro',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #4ade80;">✅ Teste de Email Funcionando!</h2>
                        <p>Se você está vendo este email, o serviço de email está configurado corretamente.</p>
                        <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                        <p><strong>Servidor SMTP:</strong> ${smtpConfig.host}:${smtpConfig.port}</p>
                        <p><strong>Destinatário:</strong> ${to}</p>
                    </div>
                `
            };
            
            result = await transporter.sendMail(mailOptions);
        }

        res.json({
            success: true,
            messageId: result.messageId,
            message: 'Email enviado com sucesso'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Rota para status do serviço
app.get('/api/email-status', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        config: {
            host: smtpConfig.host,
            port: smtpConfig.port,
            user: smtpConfig.auth.user
        },
        timestamp: new Date().toISOString()
    });
});

// Servir arquivo de teste
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-cakto-integration.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Email rodando na porta ${PORT}`);
    console.log(`📧 Interface: http://localhost:${PORT}`);
    console.log(`⚙️ Configuração: Edite o arquivo simple-email-server.js`);
    console.log(`\n📝 IMPORTANTE: Configure suas credenciais SMTP no arquivo simple-email-server.js`);
    console.log(`   Linha 15: user: 'seu-email@gmail.com'`);
    console.log(`   Linha 16: pass: 'sua-senha-de-app'`);
});

module.exports = app;
