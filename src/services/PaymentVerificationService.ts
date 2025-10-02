interface PaymentStatus {
  isPaid: boolean;
  paymentId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  timestamp?: string;
  customerEmail?: string;
}

interface CaktoWebhookData {
  event: string;
  data: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    customer: {
      email: string;
      name: string;
    };
    created_at: string;
  };
}

class PaymentVerificationService {
  private static instance: PaymentVerificationService;
  private readonly PAYMENT_KEY = 'enem_pro_payment_verified';
  private readonly WEBHOOK_SECRET = 'cakto_webhook_secret_2024';

  static getInstance(): PaymentVerificationService {
    if (!PaymentVerificationService.instance) {
      PaymentVerificationService.instance = new PaymentVerificationService();
    }
    return PaymentVerificationService.instance;
  }

  /**
   * Verifica se o pagamento foi confirmado
   */
  async verifyPayment(): Promise<PaymentStatus> {
    try {
      if (typeof window === 'undefined') return { isPaid: false };
      // Verificar se existe confirmação de pagamento no localStorage
      const paymentData = localStorage.getItem(this.PAYMENT_KEY);
      
      if (!paymentData || paymentData === 'undefined' || paymentData === 'null') {
        return { isPaid: false };
      }

      const payment = JSON.parse(paymentData);
      
      // Verificar se o pagamento está válido e não expirou (24 horas)
      const now = Date.now();
      const paymentTime = new Date(payment.timestamp).getTime();
      const hoursSincePayment = (now - paymentTime) / (1000 * 60 * 60);
      
      if (hoursSincePayment > 24) {
        // Pagamento expirado, remover dados
        this.clearPaymentData();
        return { isPaid: false };
      }

      // Verificar se o status é de aprovação
      if (payment.status === 'approved' || payment.status === 'paid') {
        return {
          isPaid: true,
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          timestamp: payment.timestamp,
          customerEmail: payment.customerEmail
        };
      }

      return { isPaid: false };
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      return { isPaid: false };
    }
  }

  /**
   * Simula o processamento de webhook da Cakto
   */
  async processCaktoWebhook(webhookData: CaktoWebhookData): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;
      // Verificar se é um evento de pagamento aprovado
      if (webhookData.event === 'payment.approved' || webhookData.event === 'payment.completed') {
        const paymentData = {
          id: webhookData.data.id,
          amount: webhookData.data.amount,
          currency: webhookData.data.currency,
          status: 'approved',
          timestamp: new Date().toISOString(),
          customerEmail: webhookData.data.customer.email,
          customerName: webhookData.data.customer.name
        };

        // Salvar dados do pagamento
        localStorage.setItem(this.PAYMENT_KEY, JSON.stringify(paymentData));
        
        // Marcar fluxo como completo
        localStorage.setItem('enem_pro_completed_flow', 'true');
        
        // Gerar código de acesso
        const accessCode = this.generateAccessCode();
        localStorage.setItem('enem_pro_access_code', accessCode);

        // Salvar dados do usuário
        const userData = {
          name: webhookData.data.customer.name,
          email: webhookData.data.customer.email,
          id: Date.now().toString(),
          level: 1,
          paymentVerified: true
        };
        localStorage.setItem('enem_pro_user', JSON.stringify(userData));

        console.log('Pagamento confirmado via webhook:', paymentData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return false;
    }
  }

  /**
   * Simula um pagamento aprovado para testes
   */
  async simulatePaymentApproval(customerEmail: string, customerName: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;
      const paymentData = {
        id: `PAY_${Date.now()}`,
        amount: 5790, // R$ 57,90
        currency: 'BRL',
        status: 'approved',
        timestamp: new Date().toISOString(),
        customerEmail: customerEmail,
        customerName: customerName
      };

      // Salvar dados do pagamento
      localStorage.setItem(this.PAYMENT_KEY, JSON.stringify(paymentData));
      
      // Marcar fluxo como completo
      localStorage.setItem('enem_pro_completed_flow', 'true');
      
      // Gerar código de acesso
      const accessCode = this.generateAccessCode();
      localStorage.setItem('enem_pro_access_code', accessCode);

      // Salvar dados do usuário
      const userData = {
        name: customerName,
        email: customerEmail,
        id: Date.now().toString(),
        level: 1,
        paymentVerified: true
      };
      localStorage.setItem('enem_pro_user', JSON.stringify(userData));

      console.log('Pagamento simulado aprovado:', paymentData);
      return true;
    } catch (error) {
      console.error('Erro ao simular pagamento:', error);
      return false;
    }
  }

  /**
   * Limpa todos os dados de pagamento
   */
  clearPaymentData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.PAYMENT_KEY);
    localStorage.removeItem('enem_pro_completed_flow');
    localStorage.removeItem('enem_pro_access_code');
    localStorage.removeItem('enem_pro_user');
  }

  /**
   * Gera código de acesso único
   */
  private generateAccessCode(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ENEM${timestamp}${random}`;
  }

  /**
   * Verifica se o usuário tem acesso válido
   */
  async hasValidAccess(): Promise<boolean> {
    const paymentStatus = await this.verifyPayment();
    return paymentStatus.isPaid;
  }
}

export default PaymentVerificationService;
