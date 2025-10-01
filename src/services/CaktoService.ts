// Serviço de Integração com Cakto
export interface CaktoProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  image?: string;
}

export interface CaktoCustomer {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
}

export interface CaktoOrder {
  id: string;
  productId: string;
  customer: CaktoCustomer;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paymentUrl: string;
  accessCode?: string;
  createdAt: string;
  paidAt?: string;
}

export interface CaktoWebhookPayload {
  event: 'payment.approved' | 'payment.cancelled' | 'payment.refunded';
  order: CaktoOrder;
  signature: string;
}

class CaktoService {
  private apiUrl = import.meta.env.VITE_CAKTO_API_URL || 'https://api.cakto.com';
  private apiKey = import.meta.env.VITE_CAKTO_API_KEY || '';
  private webhookSecret = import.meta.env.VITE_CAKTO_WEBHOOK_SECRET || '';

  // Produto do ENEM Pro
  private readonly PRODUCT_ID = 'enem-pro-course';
  private readonly PRODUCT_PRICE = 5790; // R$ 57,90 em centavos

  // Criar pedido na Cakto
  async createOrder(customer: CaktoCustomer): Promise<{ success: boolean; order?: CaktoOrder; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Cakto-Version': '2024-01-01'
        },
        body: JSON.stringify({
          product_id: this.PRODUCT_ID,
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            document: customer.cpf
          },
          amount: this.PRODUCT_PRICE,
          currency: 'BRL',
          description: 'Curso ENEM Pro - Acesso Completo',
          metadata: {
            course: 'enem-pro',
            access_type: 'lifetime',
            features: ['video-aulas', 'simulados', 'correcao-redacao', 'suporte']
          },
          webhook_url: `${window.location.origin}/api/webhook/cakto`,
          success_url: `${window.location.origin}/pagamento/sucesso`,
          cancel_url: `${window.location.origin}/pagamento/cancelado`
        })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          order: data
        };
      } else {
        return {
          success: false,
          error: data.message || 'Erro ao criar pedido na Cakto'
        };
      }
    } catch (error) {
      console.error('Erro ao criar pedido na Cakto:', error);
      return {
        success: false,
        error: 'Erro de conexão. Tente novamente.'
      };
    }
  }

  // Verificar status do pedido
  async getOrderStatus(orderId: string): Promise<{ success: boolean; order?: CaktoOrder; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Cakto-Version': '2024-01-01'
        }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          order: data
        };
      } else {
        return {
          success: false,
          error: data.message || 'Erro ao verificar status do pedido'
        };
      }
    } catch (error) {
      console.error('Erro ao verificar status do pedido:', error);
      return {
        success: false,
        error: 'Erro de conexão. Tente novamente.'
      };
    }
  }

  // Processar webhook da Cakto
  async processWebhook(payload: CaktoWebhookPayload): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar assinatura do webhook
      if (!this.verifyWebhookSignature(payload)) {
        return {
          success: false,
          error: 'Assinatura inválida'
        };
      }

      const { event, order } = payload;

      switch (event) {
        case 'payment.approved':
          await this.handlePaymentApproved(order);
          break;
        case 'payment.cancelled':
          await this.handlePaymentCancelled(order);
          break;
        case 'payment.refunded':
          await this.handlePaymentRefunded(order);
          break;
        default:
          console.log('Evento não reconhecido:', event);
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  // Verificar assinatura do webhook
  private verifyWebhookSignature(payload: CaktoWebhookPayload): boolean {
    // Implementar verificação de assinatura HMAC
    // Por enquanto, retornar true para desenvolvimento
    return true;
  }

  // Processar pagamento aprovado
  private async handlePaymentApproved(order: CaktoOrder): Promise<void> {
    try {
      // Gerar código de acesso único
      const accessCode = this.generateAccessCode();
      
      // Salvar dados do usuário e código de acesso
      const userData = {
        id: order.id,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        cpf: order.customer.cpf,
        accessCode,
        course: 'enem-pro',
        accessType: 'lifetime',
        features: ['video-aulas', 'simulados', 'correcao-redacao', 'suporte'],
        purchasedAt: new Date().toISOString(),
        status: 'active'
      };

      // Salvar no localStorage (em produção, salvar no backend)
      localStorage.setItem('enem_pro_user', JSON.stringify(userData));
      localStorage.setItem('enem_pro_completed_flow', 'true');
      localStorage.setItem('enem_pro_access_code', accessCode);

      // Enviar email com código de acesso
      await this.sendAccessCodeEmail(order.customer.email, accessCode, order.customer.name);

      console.log('Pagamento aprovado e acesso liberado:', userData);
    } catch (error) {
      console.error('Erro ao processar pagamento aprovado:', error);
    }
  }

  // Processar pagamento cancelado
  private async handlePaymentCancelled(order: CaktoOrder): Promise<void> {
    console.log('Pagamento cancelado:', order.id);
    // Implementar lógica de cancelamento se necessário
  }

  // Processar reembolso
  private async handlePaymentRefunded(order: CaktoOrder): Promise<void> {
    console.log('Pagamento reembolsado:', order.id);
    // Implementar lógica de reembolso se necessário
  }

  // Gerar código de acesso único
  private generateAccessCode(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ENEM-${timestamp}-${random}`.toUpperCase();
  }

  // Enviar email com código de acesso
  private async sendAccessCodeEmail(email: string, accessCode: string, name: string): Promise<void> {
    try {
      // Em produção, integrar com serviço de email (SendGrid, AWS SES, etc.)
      const emailData = {
        to: email,
        subject: '🎉 Bem-vindo ao ENEM Pro! Seu código de acesso',
        template: 'access-code',
        data: {
          name,
          accessCode,
          courseName: 'ENEM Pro',
          features: [
            'Videoaulas exclusivas',
            'Simulados personalizados',
            'Correção de redação',
            'Suporte especializado'
          ]
        }
      };

      // Simular envio de email
      console.log('Email enviado:', emailData);
      
      // Em produção, fazer chamada para API de email
      // await fetch('/api/send-email', { method: 'POST', body: JSON.stringify(emailData) });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  }

  // Verificar se usuário tem acesso
  checkUserAccess(): { hasAccess: boolean; userData?: any; accessCode?: string } {
    const userData = localStorage.getItem('enem_pro_user');
    const accessCode = localStorage.getItem('enem_pro_access_code');
    const completedFlow = localStorage.getItem('enem_pro_completed_flow');

    if (userData && accessCode && completedFlow === 'true') {
      return {
        hasAccess: true,
        userData: JSON.parse(userData),
        accessCode
      };
    }

    return { hasAccess: false };
  }

  // Redirecionar para pagamento integrado
  redirectToPayment(paymentUrl: string): void {
    // Em vez de redirecionar para URL externa, navegar para página integrada
    window.location.href = '/pagamento/integrado';
  }

  // URL direta da Cakto
  getCaktoPaymentUrl(): string {
    return 'https://pay.cakto.com.br/icgbeng_447611';
  }
}

export default new CaktoService();
