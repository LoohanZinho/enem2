const express = require('express');
const crypto = require('crypto');
const app = express();

// Middleware para parsing JSON
app.use(express.json());

// Simulação de banco de dados para chaves de acesso
let accessKeys = [];
let users = [];

// Webhook endpoint para Cakto
app.post('/api/webhook/cakto', (req, res) => {
  try {
    const signature = req.headers['x-cakto-signature'];
    const payload = JSON.stringify(req.body);
    
    // Verificar assinatura do webhook (em produção, use a chave secreta real)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.CAKTO_WEBHOOK_SECRET || 'cakto_webhook_secret_2024')
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.log('Assinatura inválida do webhook');
      return res.status(401).json({ error: 'Assinatura inválida' });
    }

    const webhookData = req.body;
    
    // Processar diferentes tipos de eventos
    switch (webhookData.event) {
      case 'payment.approved':
      case 'payment.completed':
        console.log('Pagamento aprovado:', webhookData.data);
        
        // Gerar chave de acesso única
        const accessKey = generateAccessKey();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 dias
        
        const keyData = {
          id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          key: accessKey,
          userId: webhookData.data.customer.email,
          userEmail: webhookData.data.customer.email,
          userName: webhookData.data.customer.name,
          paymentId: webhookData.data.id,
          paymentMethod: webhookData.data.payment_method || 'credit_card',
          status: 'active',
          createdAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          isRecurring: webhookData.data.payment_method === 'credit_card' && !!webhookData.data.subscription_id,
          subscriptionId: webhookData.data.subscription_id
        };
        
        // Salvar chave de acesso
        accessKeys.push(keyData);
        
        // Salvar dados do usuário
        const userData = {
          name: webhookData.data.customer.name,
          email: webhookData.data.customer.email,
          id: Date.now().toString(),
          level: 1,
          accessKey: accessKey,
          paymentVerified: true,
          paymentMethod: webhookData.data.payment_method,
          subscriptionId: webhookData.data.subscription_id
        };
        users.push(userData);
        
        // Enviar email com chave de acesso (simulado)
        sendAccessKeyEmail(keyData);
        
        console.log('Chave de acesso criada:', keyData);
        console.log('Acesso ativado para o usuário');
        
        break;
        
      case 'payment.refunded':
        console.log('Pagamento reembolsado:', webhookData.data);
        // Desativar acesso do usuário
        break;
        
      case 'payment.failed':
        console.log('Pagamento falhou:', webhookData.data);
        // Não ativar acesso
        break;
        
      default:
        console.log('Evento não reconhecido:', webhookData.event);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para simular pagamento aprovado (apenas para desenvolvimento)
app.post('/api/simulate-payment', (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email e nome são obrigatórios' });
    }

    // Simular webhook de pagamento aprovado
    const simulatedWebhook = {
      event: 'payment.approved',
      data: {
        id: `PAY_${Date.now()}`,
        amount: 5790,
        currency: 'BRL',
        status: 'approved',
        customer: {
          email: email,
          name: name
        },
        created_at: new Date().toISOString()
      }
    };

    // Processar como se fosse um webhook real
    console.log('Simulando pagamento aprovado:', simulatedWebhook);
    
    res.status(200).json({ 
      success: true, 
      message: 'Pagamento simulado com sucesso',
      webhook: simulatedWebhook
    });
  } catch (error) {
    console.error('Erro ao simular pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para gerar chave de acesso única
function generateAccessKey() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const prefix = 'ENEM';
  return `${prefix}${timestamp}${random}`;
}

// Função para enviar email com chave de acesso (simulado)
function sendAccessKeyEmail(keyData) {
  console.log('\n📧 EMAIL ENVIADO:');
  console.log('=====================================');
  console.log(`Para: ${keyData.userEmail}`);
  console.log(`Assunto: Sua chave de acesso ao ENEM Pro`);
  console.log('=====================================');
  console.log(`Olá ${keyData.userName},`);
  console.log('');
  console.log('Seu pagamento foi confirmado com sucesso!');
  console.log('');
  console.log('Sua chave de acesso é:');
  console.log(`🔑 ${keyData.key}`);
  console.log('');
  console.log('Esta chave:');
  console.log('• É válida por 30 dias');
  console.log('• Pode ser usada apenas uma vez');
  console.log('• Expira em: ' + new Date(keyData.expiresAt).toLocaleDateString('pt-BR'));
  console.log('');
  console.log('Acesse: https://enempro.com/login');
  console.log('=====================================\n');
}

// Função para renovar acesso (assinaturas)
function renewAccess(subscriptionId) {
  const user = users.find(u => u.subscriptionId === subscriptionId);
  if (user) {
    const key = accessKeys.find(k => k.subscriptionId === subscriptionId);
    if (key) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      key.expiresAt = expiresAt.toISOString();
      key.status = 'active';
      
      console.log('Acesso renovado para:', user.email);
      console.log('Nova validade até:', expiresAt.toLocaleDateString('pt-BR'));
      return true;
    }
  }
  return false;
}

// Endpoint para verificar chave de acesso
app.get('/api/verify-key/:key', (req, res) => {
  const { key } = req.params;
  const accessKey = accessKeys.find(k => k.key === key);
  
  if (!accessKey) {
    return res.status(404).json({ valid: false, reason: 'Chave não encontrada' });
  }
  
  if (accessKey.status === 'used') {
    return res.status(400).json({ valid: false, reason: 'Chave já foi utilizada' });
  }
  
  if (accessKey.status === 'revoked') {
    return res.status(400).json({ valid: false, reason: 'Chave foi revogada' });
  }
  
  const now = new Date();
  const expiresAt = new Date(accessKey.expiresAt);
  
  if (now > expiresAt) {
    accessKey.status = 'expired';
    return res.status(400).json({ valid: false, reason: 'Chave expirada' });
  }
  
  res.json({ valid: true, accessKey });
});

// Endpoint para usar chave de acesso
app.post('/api/use-key/:key', (req, res) => {
  const { key } = req.params;
  const accessKey = accessKeys.find(k => k.key === key);
  
  if (!accessKey) {
    return res.status(404).json({ success: false, reason: 'Chave não encontrada' });
  }
  
  if (accessKey.status !== 'active') {
    return res.status(400).json({ success: false, reason: 'Chave não está ativa' });
  }
  
  accessKey.status = 'used';
  accessKey.usedAt = new Date().toISOString();
  
  res.json({ success: true, accessKey });
});

// Endpoint para listar todas as chaves (apenas para desenvolvimento)
app.get('/api/keys', (req, res) => {
  res.json({ accessKeys, users });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Webhook server rodando na porta ${PORT}`);
  console.log(`Webhook Cakto: http://localhost:${PORT}/api/webhook/cakto`);
  console.log(`Simular Pagamento: http://localhost:${PORT}/api/simulate-payment`);
  console.log(`Verificar Chave: http://localhost:${PORT}/api/verify-key/:key`);
  console.log(`Usar Chave: http://localhost:${PORT}/api/use-key/:key`);
  console.log(`Listar Chaves: http://localhost:${PORT}/api/keys`);
});

module.exports = app;