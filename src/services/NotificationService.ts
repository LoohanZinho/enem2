interface PaymentNotification {
  planId: string;
  planName: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  paymentMethod: string;
  timestamp: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'study' | 'simulado' | 'motivation' | 'deadline' | 'payment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationPreferences {
  studyReminders: boolean;
  achievementAlerts: boolean;
  simuladoReminders: boolean;
  motivationMessages: boolean;
  deadlineAlerts: boolean;
  frequency: 'low' | 'medium' | 'high';
}

class NotificationService {
  private static instance: NotificationService;
  private webhookUrl: string;
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences = {
    studyReminders: true,
    achievementAlerts: true,
    simuladoReminders: true,
    motivationMessages: true,
    deadlineAlerts: true,
    frequency: 'medium'
  };

  constructor() {
    this.webhookUrl = 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK';
    
    if (typeof window !== 'undefined') {
        this.loadNotificationsFromStorage();
        this.loadPreferencesFromStorage();
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Envia notificação de pagamento
   */
  public async sendPaymentNotification(notification: PaymentNotification): Promise<boolean> {
    try {
      console.log('🔔 NOVA VENDA DETECTADA!', notification);

      // Notificação no console (sempre funciona)
      this.logPaymentNotification(notification);

      // Notificação via webhook (se configurado)
      if (this.webhookUrl && this.webhookUrl !== 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK') {
        await this.sendWebhookNotification(notification);
      }

      // Notificação via email (simulação)
      await this.sendEmailNotification(notification);

      // Notificação via WhatsApp (simulação)
      await this.sendWhatsAppNotification(notification);

      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return false;
    }
  }

  /**
   * Log da notificação no console
   */
  private logPaymentNotification(notification: PaymentNotification): void {
    console.log(`
🎉 ===== NOVA VENDA =====
📦 Plano: ${notification.planName}
💰 Valor: R$ ${notification.amount.toFixed(2)}
👤 Cliente: ${notification.customerName} (${notification.customerEmail})
💳 Método: ${notification.paymentMethod}
⏰ Data: ${new Date(notification.timestamp).toLocaleString('pt-BR')}
📊 Status: ${notification.status.toUpperCase()}
========================
    `);
  }

  /**
   * Envia notificação via webhook (Slack, Discord, etc.)
   */
  private async sendWebhookNotification(notification: PaymentNotification): Promise<void> {
    try {
      const message = {
        text: `🎉 Nova venda no ENEM Pro!`,
        attachments: [
          {
            color: notification.status === 'paid' ? 'good' : 'warning',
            fields: [
              {
                title: 'Plano',
                value: notification.planName,
                short: true
              },
              {
                title: 'Valor',
                value: `R$ ${notification.amount.toFixed(2)}`,
                short: true
              },
              {
                title: 'Cliente',
                value: `${notification.customerName} (${notification.customerEmail})`,
                short: false
              },
              {
                title: 'Método de Pagamento',
                value: notification.paymentMethod,
                short: true
              },
              {
                title: 'Status',
                value: notification.status.toUpperCase(),
                short: true
              },
              {
                title: 'Data',
                value: new Date(notification.timestamp).toLocaleString('pt-BR'),
                short: false
              }
            ]
          }
        ]
      };

      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      console.log('✅ Notificação enviada via webhook');
    } catch (error) {
      console.error('❌ Erro ao enviar webhook:', error);
    }
  }

  /**
   * Envia notificação via email (simulação)
   */
  private async sendEmailNotification(notification: PaymentNotification): Promise<void> {
    try {
      // Simulação de envio de email
      console.log(`
📧 EMAIL ENVIADO:
Para: admin@enempro.com
Assunto: Nova venda - ${notification.planName}
Conteúdo: Cliente ${notification.customerName} comprou ${notification.planName} por R$ ${notification.amount.toFixed(2)}
      `);
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
    }
  }

  /**
   * Envia notificação via WhatsApp (simulação)
   */
  private async sendWhatsAppNotification(notification: PaymentNotification): Promise<void> {
    try {
      // Simulação de envio de WhatsApp
      const message = `🎉 *Nova venda no ENEM Pro!*

📦 *Plano:* ${notification.planName}
💰 *Valor:* R$ ${notification.amount.toFixed(2)}
👤 *Cliente:* ${notification.customerName}
📧 *Email:* ${notification.customerEmail}
💳 *Pagamento:* ${notification.paymentMethod}
📊 *Status:* ${notification.status.toUpperCase()}
⏰ *Data:* ${new Date(notification.timestamp).toLocaleString('pt-BR')}

Acesse o painel para mais detalhes.`;

      console.log(`
📱 WHATSAPP ENVIADO:
Para: +5521996170604
Mensagem: ${message}
      `);
    } catch (error) {
      console.error('❌ Erro ao enviar WhatsApp:', error);
    }
  }

  /**
   * Simula notificação de pagamento para desenvolvimento
   */
  public async simulatePaymentNotification(planId: string, planName: string, amount: number): Promise<void> {
    const notification: PaymentNotification = {
      planId,
      planName,
      amount,
      customerEmail: 'teste@email.com',
      customerName: 'Cliente Teste',
      paymentMethod: 'PIX',
      timestamp: new Date().toISOString(),
      status: 'paid'
    };

    await this.sendPaymentNotification(notification);
  }

  // ===== MÉTODOS PARA GERENCIAR NOTIFICAÇÕES =====

  /**
   * Carrega notificações do localStorage
   */
  private loadNotificationsFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('enem_pro_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      } else {
        // Notificações de exemplo
        this.notifications = [
          {
            id: '1',
            title: 'Bem-vindo ao ENEM Pro!',
            message: 'Comece sua jornada de estudos com nossos recursos exclusivos.',
            type: 'motivation',
            priority: 'medium',
            read: false,
            timestamp: new Date().toISOString(),
            actionUrl: '/cronograma',
            actionText: 'Começar Estudos'
          },
          {
            id: '2',
            title: 'Lembrete de Estudo',
            message: 'Hora de revisar seus flashcards de Matemática.',
            type: 'reminder',
            priority: 'low',
            read: false,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            actionUrl: '/flashcards',
            actionText: 'Estudar'
          }
        ];
        this.saveNotificationsToStorage();
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      this.notifications = [];
    }
  }

  /**
   * Carrega preferências do localStorage
   */
  private loadPreferencesFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('enem_pro_notification_preferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  }

  /**
   * Salva notificações no localStorage
   */
  private saveNotificationsToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('enem_pro_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    }
  }

  /**
   * Salva preferências no localStorage
   */
  private savePreferencesToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('enem_pro_notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    }
  }

  /**
   * Retorna todas as notificações
   */
  public getNotifications(): Notification[] {
    return [...this.notifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Retorna as preferências de notificação
   */
  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Marca uma notificação como lida
   */
  public markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotificationsToStorage();
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  public markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveNotificationsToStorage();
  }

  /**
   * Remove uma notificação
   */
  public deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotificationsToStorage();
  }

  /**
   * Remove todas as notificações
   */
  public clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotificationsToStorage();
  }

  /**
   * Atualiza as preferências de notificação
   */
  public updatePreferences(newPreferences: NotificationPreferences): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferencesToStorage();
  }

  /**
   * Adiciona uma nova notificação
   */
  public addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    this.notifications.unshift(newNotification);
    this.saveNotificationsToStorage();
  }
}

export default NotificationService;
