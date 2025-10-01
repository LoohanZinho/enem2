interface AccessKey {
  id: string;
  key: string;
  userId: string;
  userEmail: string;
  userName: string;
  paymentId: string;
  paymentMethod: 'credit_card' | 'pix' | 'boleto' | 'debit_card';
  status: 'active' | 'expired' | 'used' | 'revoked';
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  isRecurring: boolean;
  subscriptionId?: string;
}

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customer: {
    email: string;
    name: string;
  };
  payment_method: string;
  subscription_id?: string;
  created_at: string;
}

class AccessKeyService {
  private static instance: AccessKeyService;
  private readonly STORAGE_KEY = 'enem_pro_access_keys';
  private readonly CURRENT_KEY_KEY = 'enem_pro_current_key';
  private readonly KEY_VALIDITY_DAYS = 30;

  static getInstance(): AccessKeyService {
    if (!AccessKeyService.instance) {
      AccessKeyService.instance = new AccessKeyService();
    }
    return AccessKeyService.instance;
  }

  /**
   * Gera uma chave de acesso única
   */
  private generateAccessKey(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = 'ENEM';
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Cria uma nova chave de acesso
   */
  async createAccessKey(paymentData: PaymentData): Promise<AccessKey> {
    if (typeof window === 'undefined') {
        throw new Error("localStorage is not available on the server");
    }
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (this.KEY_VALIDITY_DAYS * 24 * 60 * 60 * 1000));
      
      const accessKey: AccessKey = {
        id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        key: this.generateAccessKey(),
        userId: paymentData.customer.email,
        userEmail: paymentData.customer.email,
        userName: paymentData.customer.name,
        paymentId: paymentData.id,
        paymentMethod: this.mapPaymentMethod(paymentData.payment_method),
        status: 'active',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isRecurring: paymentData.payment_method === 'credit_card' && !!paymentData.subscription_id,
        subscriptionId: paymentData.subscription_id
      };

      // Salvar chave no localStorage
      const existingKeys = this.getAllAccessKeys();
      existingKeys.push(accessKey);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingKeys));

      // Definir como chave atual
      localStorage.setItem(this.CURRENT_KEY_KEY, JSON.stringify(accessKey));

      // Enviar email com a chave (simulado)
      await this.sendAccessKeyEmail(accessKey);

      console.log('Chave de acesso criada:', accessKey);
      return accessKey;
    } catch (error) {
      console.error('Erro ao criar chave de acesso:', error);
      throw error;
    }
  }

  /**
   * Valida uma chave de acesso
   */
  async validateAccessKey(key: string): Promise<{ valid: boolean; accessKey?: AccessKey; reason?: string }> {
    try {
      const accessKey = this.getAccessKeyByKey(key);
      
      if (!accessKey) {
        return { valid: false, reason: 'Chave não encontrada' };
      }

      if (accessKey.status === 'used') {
        return { valid: false, reason: 'Chave já foi utilizada' };
      }

      if (accessKey.status === 'revoked') {
        return { valid: false, reason: 'Chave foi revogada' };
      }

      const now = new Date();
      const expiresAt = new Date(accessKey.expiresAt);

      if (now > expiresAt) {
        // Marcar como expirada
        accessKey.status = 'expired';
        this.updateAccessKey(accessKey);
        return { valid: false, reason: 'Chave expirada' };
      }

      return { valid: true, accessKey };
    } catch (error) {
      console.error('Erro ao validar chave de acesso:', error);
      return { valid: false, reason: 'Erro interno' };
    }
  }

  /**
   * Usa uma chave de acesso (marca como usada)
   */
  async useAccessKey(key: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const accessKey = this.getAccessKeyByKey(key);
      
      if (!accessKey) {
        return false;
      }

      accessKey.status = 'used';
      accessKey.usedAt = new Date().toISOString();
      
      this.updateAccessKey(accessKey);
      
      // Definir como chave atual ativa
      localStorage.setItem(this.CURRENT_KEY_KEY, JSON.stringify(accessKey));
      
      return true;
    } catch (error) {
      console.error('Erro ao usar chave de acesso:', error);
      return false;
    }
  }

  /**
   * Verifica se o usuário tem acesso válido
   */
  async hasValidAccess(): Promise<{ hasAccess: boolean; accessKey?: AccessKey; reason?: string }> {
    try {
      const currentKey = this.getCurrentAccessKey();
      
      if (!currentKey) {
        return { hasAccess: false, reason: 'Nenhuma chave de acesso encontrada' };
      }

      const validation = await this.validateAccessKey(currentKey.key);
      
      if (!validation.valid) {
        return { hasAccess: false, reason: validation.reason };
      }

      return { hasAccess: true, accessKey: validation.accessKey };
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      return { hasAccess: false, reason: 'Erro interno' };
    }
  }

  /**
   * Renova acesso para pagamentos recorrentes
   */
  async renewAccess(subscriptionId: string): Promise<boolean> {
    try {
      const existingKey = this.getAccessKeyBySubscriptionId(subscriptionId);
      
      if (!existingKey) {
        return false;
      }

      // Renovar chave existente
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (this.KEY_VALIDITY_DAYS * 24 * 60 * 60 * 1000));
      
      existingKey.expiresAt = expiresAt.toISOString();
      existingKey.status = 'active';
      
      this.updateAccessKey(existingKey);
      
      // Enviar email de renovação
      await this.sendRenewalEmail(existingKey);
      
      return true;
    } catch (error) {
      console.error('Erro ao renovar acesso:', error);
      return false;
    }
  }

  /**
   * Processa webhook da Cakto
   */
  async processCaktoWebhook(webhookData: any): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if (webhookData.event === 'payment.approved' || webhookData.event === 'payment.completed') {
        const paymentData: PaymentData = {
          id: webhookData.data.id,
          amount: webhookData.data.amount,
          currency: webhookData.data.currency,
          status: webhookData.data.status,
          customer: webhookData.data.customer,
          payment_method: webhookData.data.payment_method || 'credit_card',
          subscription_id: webhookData.data.subscription_id,
          created_at: webhookData.data.created_at
        };

        // Criar chave de acesso
        const accessKey = await this.createAccessKey(paymentData);
        
        // Marcar fluxo como completo
        localStorage.setItem('enem_pro_completed_flow', 'true');
        
        // Salvar dados do usuário
        const userData = {
          name: paymentData.customer.name,
          email: paymentData.customer.email,
          id: Date.now().toString(),
          level: 1,
          accessKey: accessKey.key,
          paymentVerified: true
        };
        localStorage.setItem('enem_pro_user', JSON.stringify(userData));

        console.log('Webhook processado com sucesso:', accessKey);
        return true;
      }

      if (webhookData.event === 'subscription.renewed') {
        // Renovar acesso para assinatura
        const subscriptionId = webhookData.data.subscription_id;
        return await this.renewAccess(subscriptionId);
      }

      return false;
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return false;
    }
  }

  /**
   * Obtém chave de acesso atual
   */
  getCurrentAccessKey(): AccessKey | null {
    if (typeof window === 'undefined') return null;
    try {
      const keyData = localStorage.getItem(this.CURRENT_KEY_KEY);
      return keyData ? JSON.parse(keyData) : null;
    } catch (error) {
      console.error('Erro ao obter chave atual:', error);
      return null;
    }
  }

  /**
   * Obtém todas as chaves de acesso
   */
  getAllAccessKeys(): AccessKey[] {
    if (typeof window === 'undefined') return [];
    try {
      const keysData = localStorage.getItem(this.STORAGE_KEY);
      return keysData ? JSON.parse(keysData) : [];
    } catch (error) {
      console.error('Erro ao obter chaves:', error);
      return [];
    }
  }

  /**
   * Obtém chave por valor
   */
  private getAccessKeyByKey(key: string): AccessKey | null {
    const keys = this.getAllAccessKeys();
    return keys.find(k => k.key === key) || null;
  }

  /**
   * Obtém chave por subscription ID
   */
  private getAccessKeyBySubscriptionId(subscriptionId: string): AccessKey | null {
    const keys = this.getAllAccessKeys();
    return keys.find(k => k.subscriptionId === subscriptionId) || null;
  }

  /**
   * Atualiza chave de acesso
   */
  private updateAccessKey(accessKey: AccessKey): void {
    if (typeof window === 'undefined') return;
    const keys = this.getAllAccessKeys();
    const index = keys.findIndex(k => k.id === accessKey.id);
    
    if (index !== -1) {
      keys[index] = accessKey;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
    }
  }

  /**
   * Mapeia método de pagamento
   */
  private mapPaymentMethod(method: string): 'credit_card' | 'pix' | 'boleto' | 'debit_card' {
    switch (method.toLowerCase()) {
      case 'credit_card':
      case 'cartao_credito':
        return 'credit_card';
      case 'pix':
        return 'pix';
      case 'boleto':
        return 'boleto';
      case 'debit_card':
      case 'cartao_debito':
        return 'debit_card';
      default:
        return 'credit_card';
    }
  }

  /**
   * Envia email com chave de acesso (simulado)
   */
  private async sendAccessKeyEmail(accessKey: AccessKey): Promise<void> {
    console.log('📧 EMAIL ENVIADO:');
    console.log('=====================================');
    console.log(`Para: ${accessKey.userEmail}`);
    console.log(`Assunto: Sua chave de acesso ao ENEM Pro`);
    console.log('=====================================');
    console.log(`Olá ${accessKey.userName},`);
    console.log('');
    console.log('Seu pagamento foi confirmado com sucesso!');
    console.log('');
    console.log('Sua chave de acesso é:');
    console.log(`🔑 ${accessKey.key}`);
    console.log('');
    console.log('Esta chave:');
    console.log('• É válida por 30 dias');
    console.log('• Pode ser usada apenas uma vez');
    console.log('• Expira em: ' + new Date(accessKey.expiresAt).toLocaleDateString('pt-BR'));
    console.log('');
    console.log('Acesse: https://enempro.com/login');
    console.log('=====================================');
  }

  /**
   * Envia email de renovação (simulado)
   */
  private async sendRenewalEmail(accessKey: AccessKey): Promise<void> {
    console.log('📧 EMAIL DE RENOVAÇÃO ENVIADO:');
    console.log('=====================================');
    console.log(`Para: ${accessKey.userEmail}`);
    console.log(`Assunto: Acesso renovado - ENEM Pro`);
    console.log('=====================================');
    console.log(`Olá ${accessKey.userName},`);
    console.log('');
    console.log('Seu acesso foi renovado automaticamente!');
    console.log('');
    console.log('Sua chave de acesso continua:');
    console.log(`🔑 ${accessKey.key}`);
    console.log('');
    console.log('Nova validade até: ' + new Date(accessKey.expiresAt).toLocaleDateString('pt-BR'));
    console.log('=====================================');
  }

  /**
   * Limpa todas as chaves (para logout)
   */
  clearAllKeys(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.CURRENT_KEY_KEY);
    localStorage.removeItem('enem_pro_completed_flow');
    localStorage.removeItem('enem_pro_user');
  }
}

export default AccessKeyService;
