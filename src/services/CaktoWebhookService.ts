import NotificationService from './NotificationService';

interface CaktoWebhookData {
  event: string;
  data: {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'cancelled' | 'refunded';
    customer: {
      email: string;
      name: string;
    };
    payment_method: string;
    subscription_id?: string;
    created_at: string;
    updated_at: string;
  };
}

class CaktoWebhookService {
  private static instance: CaktoWebhookService;
  private webhookSecret: string;

  constructor() {
    this.webhookSecret = 'default-secret';
  }

  public static getInstance(): CaktoWebhookService {
    if (!CaktoWebhookService.instance) {
      CaktoWebhookService.instance = new CaktoWebhookService();
    }
    return CaktoWebhookService.instance;
  }

  /**
   * Processa webhook da Cakto
   */
  public async processWebhook(webhookData: CaktoWebhookData): Promise<boolean> {
    try {
      console.log('Processando webhook da Cakto:', webhookData);

      // Verificar se o pagamento foi aprovado
      if (webhookData.data.status === 'paid') {
        await this.handlePaymentSuccess(webhookData.data);
        return true;
      } else if (webhookData.data.status === 'cancelled') {
        await this.handlePaymentCancelled(webhookData.data);
        return true;
      } else if (webhookData.data.status === 'refunded') {
        await this.handlePaymentRefunded(webhookData.data);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao processar webhook da Cakto:', error);
      return false;
    }
  }

  /**
   * Processa pagamento aprovado
   */
  private async handlePaymentSuccess(paymentData: CaktoWebhookData['data']): Promise<void> {
    try {
      // Gerar código de acesso único
      const accessCode = this.generateAccessCode();
      const planId = this.determinePlan(paymentData.amount);
      const planName = this.getPlanName(planId);
      
      // Salvar dados do pagamento
      const userData = {
        id: paymentData.id,
        email: paymentData.customer.email,
        name: paymentData.customer.name,
        plan: planId,
        accessCode: accessCode,
        paymentMethod: paymentData.payment_method,
        amount: paymentData.amount,
        status: 'paid',
        createdAt: new Date().toISOString()
      };

      // Salvar no localStorage (simulação)
      localStorage.setItem('enem_pro_user', JSON.stringify(userData));
      localStorage.setItem('enem_pro_access_code', accessCode);
      localStorage.setItem('enem_pro_payment_data', JSON.stringify(paymentData));
      localStorage.setItem('enem_pro_payment_verified', 'true');
      localStorage.setItem('enem_pro_payment_time', Date.now().toString());

      // Marcar fluxo como completo
      localStorage.setItem('enem_pro_completed_flow', 'true');

      console.log('Pagamento processado com sucesso:', userData);

      // Enviar notificações
      const notificationService = NotificationService.getInstance();
      await notificationService.sendPaymentNotification({
        planId,
        planName,
        amount: paymentData.amount,
        customerEmail: paymentData.customer.email,
        customerName: paymentData.customer.name,
        paymentMethod: paymentData.payment_method,
        timestamp: paymentData.created_at,
        status: 'paid'
      });

    } catch (error) {
      console.error('Erro ao processar pagamento aprovado:', error);
      throw error;
    }
  }

  /**
   * Processa pagamento cancelado
   */
  private async handlePaymentCancelled(paymentData: CaktoWebhookData['data']): Promise<void> {
    console.log('Pagamento cancelado:', paymentData);
    
    // Limpar dados do localStorage
    localStorage.removeItem('enem_pro_user');
    localStorage.removeItem('enem_pro_access_code');
    localStorage.removeItem('enem_pro_payment_data');
    localStorage.removeItem('enem_pro_payment_verified');
    localStorage.removeItem('enem_pro_payment_time');
    localStorage.removeItem('enem_pro_completed_flow');
  }

  /**
   * Processa reembolso
   */
  private async handlePaymentRefunded(paymentData: CaktoWebhookData['data']): Promise<void> {
    console.log('Pagamento reembolsado:', paymentData);
    
    // Limpar dados do localStorage
    localStorage.removeItem('enem_pro_user');
    localStorage.removeItem('enem_pro_access_code');
    localStorage.removeItem('enem_pro_payment_data');
    localStorage.removeItem('enem_pro_payment_verified');
    localStorage.removeItem('enem_pro_payment_time');
    localStorage.removeItem('enem_pro_completed_flow');
  }

  /**
   * Gera código de acesso único
   */
  private generateAccessCode(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ENEM${timestamp}${random}`.toUpperCase();
  }

  /**
   * Determina o plano baseado no valor
   */
  private determinePlan(amount: number): string {
    if (amount <= 9790) return 'basic';
    if (amount <= 14790) return 'premium';
    return 'vip';
  }

  /**
   * Obtém o nome do plano
   */
  private getPlanName(planId: string): string {
    const planNames = {
      basic: 'Plano Básico',
      premium: 'Plano Premium',
      vip: 'Plano VIP'
    };
    return planNames[planId as keyof typeof planNames] || 'Plano Desconhecido';
  }

  /**
   * Verifica se o webhook é válido
   */
  public verifyWebhook(signature: string, payload: string): boolean {
    // Aqui você implementaria a verificação da assinatura da Cakto
    // Por enquanto, retornamos true para simulação
    return true;
  }

  /**
   * Simula processamento de webhook (para desenvolvimento)
   */
  public async simulatePaymentSuccess(planId: string): Promise<void> {
    const planAmounts = {
      basic: 9790,
      premium: 14790,
      vip: 19790
    };

    const mockPaymentData: CaktoWebhookData = {
      event: 'payment.approved',
      data: {
        id: `PAY_${Date.now()}`,
        amount: planAmounts[planId as keyof typeof planAmounts] || 9790,
        currency: 'BRL',
        status: 'paid',
        customer: {
          email: 'teste@email.com',
          name: 'Cliente Teste'
        },
        payment_method: 'pix',
        subscription_id: `SUB_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    await this.processWebhook(mockPaymentData);
  }
}

export default CaktoWebhookService;
