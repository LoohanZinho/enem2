// Serviço de Pagamento - Integração com múltiplas formas de pagamento
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'pix' | 'boleto' | 'debit_card';
  enabled: boolean;
  icon: string;
  description: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  paymentMethod: string;
  customer: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
  billing: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  card?: {
    number: string;
    name: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    installments: number;
  };
  pix?: {
    key?: string;
    keyType?: 'cpf' | 'email' | 'phone' | 'random';
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  qrCode?: string;
  boletoUrl?: string;
  error?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
}

class PaymentService {
  private apiUrl = import.meta.env.VITE_PAYMENT_API_URL || 'https://api.pagamentos.com';
  private apiKey = import.meta.env.VITE_PAYMENT_API_KEY || '';

  // Métodos de pagamento disponíveis
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'credit_card',
        name: 'Cartão de Crédito',
        type: 'credit_card',
        enabled: true,
        icon: 'credit-card',
        description: 'Parcelamento em até 12x sem juros'
      },
      {
        id: 'pix',
        name: 'PIX',
        type: 'pix',
        enabled: true,
        icon: 'zap',
        description: 'Aprovação instantânea'
      },
      {
        id: 'boleto',
        name: 'Boleto Bancário',
        type: 'boleto',
        enabled: true,
        icon: 'file-text',
        description: 'Vencimento em 3 dias úteis'
      },
      {
        id: 'debit_card',
        name: 'Cartão de Débito',
        type: 'debit_card',
        enabled: true,
        icon: 'credit-card',
        description: 'Débito em conta corrente'
      }
    ];
  }

  // Processar pagamento com cartão de crédito
  async processCreditCardPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/credit-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          customer: data.customer,
          billing: data.billing,
          card: data.card,
          installments: data.card?.installments || 1
        })
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          transactionId: result.transactionId,
          status: result.status
        };
      } else {
        return {
          success: false,
          error: result.message || 'Erro ao processar pagamento',
          status: 'rejected'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erro de conexão. Tente novamente.',
        status: 'rejected'
      };
    }
  }

  // Processar pagamento via PIX
  async processPixPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/pix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          customer: data.customer,
          pix: data.pix
        })
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          transactionId: result.transactionId,
          qrCode: result.qrCode,
          paymentUrl: result.paymentUrl,
          status: 'pending'
        };
      } else {
        return {
          success: false,
          error: result.message || 'Erro ao gerar PIX',
          status: 'rejected'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erro de conexão. Tente novamente.',
        status: 'rejected'
      };
    }
  }

  // Processar pagamento via boleto
  async processBoletoPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/boleto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          customer: data.customer,
          billing: data.billing
        })
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          transactionId: result.transactionId,
          boletoUrl: result.boletoUrl,
          status: 'pending'
        };
      } else {
        return {
          success: false,
          error: result.message || 'Erro ao gerar boleto',
          status: 'rejected'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erro de conexão. Tente novamente.',
        status: 'rejected'
      };
    }
  }

  // Processar pagamento com cartão de débito
  async processDebitCardPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/debit-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          customer: data.customer,
          billing: data.billing,
          card: data.card
        })
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          transactionId: result.transactionId,
          status: result.status
        };
      } else {
        return {
          success: false,
          error: result.message || 'Erro ao processar pagamento',
          status: 'rejected'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erro de conexão. Tente novamente.',
        status: 'rejected'
      };
    }
  }

  // Processar pagamento (método principal)
  async processPayment(data: PaymentData): Promise<PaymentResult> {
    switch (data.paymentMethod) {
      case 'credit_card':
        return this.processCreditCardPayment(data);
      case 'pix':
        return this.processPixPayment(data);
      case 'boleto':
        return this.processBoletoPayment(data);
      case 'debit_card':
        return this.processDebitCardPayment(data);
      default:
        return {
          success: false,
          error: 'Forma de pagamento não suportada',
          status: 'rejected'
        };
    }
  }

  // Verificar status do pagamento
  async checkPaymentStatus(transactionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${transactionId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          transactionId: result.transactionId,
          status: result.status
        };
      } else {
        return {
          success: false,
          error: result.message || 'Erro ao verificar status',
          status: 'rejected'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erro de conexão. Tente novamente.',
        status: 'rejected'
      };
    }
  }

  // Webhook para confirmação de pagamentos
  async handleWebhook(payload: any): Promise<boolean> {
    try {
      // Aqui você implementaria a lógica para processar webhooks
      // de confirmação de pagamento dos gateways
      console.log('Webhook recebido:', payload);
      
      // Exemplo de processamento
      if (payload.event === 'payment.approved') {
        // Ativar acesso do usuário ao curso
        await this.activateUserAccess(payload.transactionId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return false;
    }
  }

  // Ativar acesso do usuário
  private async activateUserAccess(transactionId: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/users/activate-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          transactionId,
          accessType: 'course',
          duration: 'lifetime'
        })
      });
    } catch (error) {
      console.error('Erro ao ativar acesso:', error);
    }
  }
}

export default new PaymentService();
