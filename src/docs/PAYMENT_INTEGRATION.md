# Integração de Pagamentos

Este documento descreve como integrar múltiplas formas de pagamento no sistema.

## Formas de Pagamento Suportadas

### 1. Cartão de Crédito
- **Gateway**: Stripe, PagSeguro, Mercado Pago
- **Recursos**: Parcelamento em até 12x
- **Validação**: Número, CVV, data de validade

### 2. PIX
- **Gateway**: Stripe, PagSeguro, Mercado Pago
- **Recursos**: Aprovação instantânea
- **Chaves**: CPF, Email, Telefone, Aleatória

### 3. Boleto Bancário
- **Gateway**: PagSeguro, Mercado Pago
- **Recursos**: Vencimento em 3 dias úteis
- **Geração**: Automática após confirmação

### 4. Cartão de Débito
- **Gateway**: Stripe, PagSeguro, Mercado Pago
- **Recursos**: Débito em conta corrente
- **Validação**: Mesma do cartão de crédito

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações de Pagamento
VITE_PAYMENT_API_URL=https://api.pagamentos.com
VITE_PAYMENT_API_KEY=your_api_key_here

# Configurações do Stripe (opcional)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here

# Configurações do PagSeguro (opcional)
VITE_PAGSEGURO_EMAIL=your_email@example.com
VITE_PAGSEGURO_TOKEN=your_pagseguro_token_here

# Configurações do Mercado Pago (opcional)
VITE_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_key_here
```

### Integração com Gateways

#### Stripe
```bash
npm install @stripe/stripe-js
```

#### PagSeguro
```bash
npm install pagseguro-node-sdk
```

#### Mercado Pago
```bash
npm install mercadopago
```

## Uso do Serviço

```typescript
import PaymentService from '@/services/PaymentService';

// Processar pagamento
const result = await PaymentService.processPayment({
  amount: 297,
  currency: 'BRL',
  paymentMethod: 'credit_card',
  customer: {
    name: 'João Silva',
    email: 'joao@example.com',
    cpf: '123.456.789-00',
    phone: '(11) 99999-9999'
  },
  billing: {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567'
  },
  card: {
    number: '4111111111111111',
    name: 'JOÃO SILVA',
    expiryMonth: '12',
    expiryYear: '2025',
    cvv: '123',
    installments: 1
  }
});

if (result.success) {
  console.log('Pagamento aprovado:', result.transactionId);
} else {
  console.error('Erro no pagamento:', result.error);
}
```

## Webhooks

Configure webhooks nos gateways para receber confirmações de pagamento:

### Stripe
```javascript
// webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/webhook/stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  
  if (event.type === 'payment_intent.succeeded') {
    // Ativar acesso do usuário
    PaymentService.handleWebhook(event.data.object);
  }
  
  res.json({received: true});
});
```

### PagSeguro
```javascript
// webhook.js
app.post('/webhook/pagseguro', (req, res) => {
  const { notificationCode, notificationType } = req.body;
  
  if (notificationType === 'transaction') {
    // Verificar status da transação
    PaymentService.checkPaymentStatus(notificationCode);
  }
  
  res.json({received: true});
});
```

## Segurança

### Dados Sensíveis
- Nunca armazene dados de cartão no frontend
- Use tokens de pagamento dos gateways
- Valide dados no backend

### Validação
- Valide CPF, CEP, telefone
- Verifique limites de cartão
- Implemente rate limiting

### Criptografia
- Use HTTPS em produção
- Criptografe dados sensíveis
- Implemente autenticação JWT

## Testes

### Cartões de Teste

#### Stripe
- **Sucesso**: 4242 4242 4242 4242
- **Falha**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

#### PagSeguro
- Use dados de teste do ambiente sandbox
- CPF: 111.111.111-11

#### Mercado Pago
- Use credenciais de teste
- Cartão: 4509 9535 6623 3704

## Monitoramento

### Logs
- Registre todas as transações
- Monitore falhas de pagamento
- Acompanhe métricas de conversão

### Alertas
- Configure alertas para falhas
- Monitore tempo de resposta
- Acompanhe taxa de aprovação

## Suporte

Para dúvidas sobre integração de pagamentos:
- Consulte a documentação dos gateways
- Verifique logs de erro
- Teste em ambiente sandbox
