# Integração com Cakto - ENEM Pro

## Visão Geral

Este sistema integra com a Cakto para processar pagamentos de forma segura e automática, liberando acesso ao curso ENEM Pro após confirmação do pagamento.

## Funcionalidades

### 1. **Pagamento Externo**
- Botão único de pagamento que redireciona para a Cakto
- Processamento seguro de todos os métodos de pagamento
- Interface limpa e profissional

### 2. **Webhook Automático**
- Recebe notificações da Cakto em tempo real
- Processa pagamentos aprovados automaticamente
- Gera códigos de acesso únicos

### 3. **Liberação de Acesso**
- Código de acesso enviado por email
- Acesso liberado automaticamente após pagamento
- Controle de fluxo obrigatório (Landing → Cadastro → Pagamento → Curso)

## Configuração

### 1. **Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações da Cakto
VITE_CAKTO_API_URL=https://api.cakto.com
VITE_CAKTO_API_KEY=your_cakto_api_key_here
VITE_CAKTO_WEBHOOK_SECRET=your_webhook_secret_here

# Configurações de Email (opcional)
VITE_EMAIL_SERVICE_URL=https://api.sendgrid.com
VITE_EMAIL_API_KEY=your_email_api_key_here
```

### 2. **Configuração da Cakto**

1. **Criar conta na Cakto**
2. **Configurar webhook URL**: `https://seudominio.com/api/webhook/cakto`
3. **Configurar URLs de retorno**:
   - Sucesso: `https://seudominio.com/pagamento/sucesso`
   - Cancelamento: `https://seudominio.com/pagamento/cancelado`

### 3. **Produto na Cakto**

Configure o produto com:
- **ID**: `enem-pro-course`
- **Nome**: `ENEM Pro - Acesso Completo`
- **Preço**: R$ 297,00 (29700 centavos)
- **Moeda**: BRL
- **Descrição**: Curso completo para o ENEM

## Arquitetura

### 1. **Fluxo de Pagamento**

```
1. Usuário preenche dados pessoais e endereço
2. Clica em "Pagar com Cakto"
3. Sistema cria pedido na Cakto
4. Usuário é redirecionado para pagamento
5. Cakto processa pagamento
6. Webhook notifica aprovação
7. Sistema gera código de acesso
8. Email é enviado com código
9. Usuário acessa o curso
```

### 2. **Componentes**

- **`CaktoService`**: Integração com API da Cakto
- **`Pagamento.tsx`**: Interface de pagamento
- **`PagamentoSucesso.tsx`**: Página de sucesso
- **`PagamentoCancelado.tsx`**: Página de cancelamento
- **`webhook/cakto.js`**: Endpoint para webhooks

### 3. **Webhook Events**

- **`payment.approved`**: Pagamento aprovado
- **`payment.cancelled`**: Pagamento cancelado
- **`payment.refunded`**: Pagamento reembolsado

## Implementação

### 1. **Criar Pedido**

```typescript
const customer = {
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '11999999999',
  cpf: '12345678901'
};

const result = await CaktoService.createOrder(customer);
if (result.success) {
  CaktoService.redirectToPayment(result.order.paymentUrl);
}
```

### 2. **Processar Webhook**

```javascript
app.post('/api/webhook/cakto', (req, res) => {
  const { event, order, signature } = req.body;
  
  // Verificar assinatura
  if (!verifySignature(req.body, signature)) {
    return res.status(400).json({ error: 'Assinatura inválida' });
  }
  
  // Processar evento
  switch (event) {
    case 'payment.approved':
      handlePaymentApproved(order);
      break;
    // ... outros eventos
  }
  
  res.status(200).json({ success: true });
});
```

### 3. **Gerar Código de Acesso**

```typescript
function generateAccessCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ENEM-${timestamp}-${random}`.toUpperCase();
}
```

## Segurança

### 1. **Verificação de Assinatura**
- Todos os webhooks são verificados usando HMAC-SHA256
- Chave secreta configurada na Cakto e no sistema

### 2. **Validação de Dados**
- Validação de CPF, email e telefone
- Sanitização de inputs
- Verificação de campos obrigatórios

### 3. **Controle de Acesso**
- Fluxo obrigatório: Landing → Cadastro → Pagamento → Curso
- Códigos de acesso únicos e não reutilizáveis
- Verificação de status de pagamento

## Monitoramento

### 1. **Logs**
- Todos os eventos são logados
- Erros são capturados e reportados
- Webhooks são monitorados

### 2. **Métricas**
- Taxa de conversão
- Tempo de processamento
- Erros de pagamento

## Troubleshooting

### 1. **Webhook não recebido**
- Verificar URL configurada na Cakto
- Verificar logs do servidor
- Testar endpoint manualmente

### 2. **Pagamento não processado**
- Verificar logs da Cakto
- Verificar configuração da API
- Verificar assinatura do webhook

### 3. **Email não enviado**
- Verificar configuração do serviço de email
- Verificar logs de envio
- Verificar spam do usuário

## Próximos Passos

1. **Implementar backend real** (substituir arquivo estático)
2. **Integrar serviço de email** (SendGrid, AWS SES)
3. **Adicionar analytics** (conversões, abandono)
4. **Implementar retry** para webhooks falhados
5. **Adicionar testes** automatizados

## Suporte

Para dúvidas sobre a integração:
- **Documentação da Cakto**: https://docs.cakto.com
- **Suporte técnico**: suporte@enempro.com
- **Logs do sistema**: /logs/webhook
