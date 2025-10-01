// Utilitário para criar usuário padrão com plano anual
import DatabaseService from '@/services/DatabaseService';

export interface DefaultUserData {
  email: string;
  password: string;
  name: string;
  plan: 'anual';
}

export class DefaultUserService {
  private static instance: DefaultUserService;
  private readonly DEFAULT_USER: DefaultUserData = {
    email: 'businessjota04@gmail.com',
    password: '812483jm',
    name: 'João Marcos',
    plan: 'anual'
  };

  static getInstance(): DefaultUserService {
    if (!DefaultUserService.instance) {
      DefaultUserService.instance = new DefaultUserService();
    }
    return DefaultUserService.instance;
  }

  /**
   * Cria o usuário padrão se não existir
   */
  async createDefaultUserIfNotExists(): Promise<boolean> {
    try {
      const db = DatabaseService.getInstance();
      
      // Verificar se usuário já existe
      const existingUser = await db.getUserByEmail(this.DEFAULT_USER.email);
      if (existingUser) {
        console.log('✅ Usuário padrão já existe:', existingUser.email);
        return true;
      }

      console.log('🚀 Criando usuário padrão com plano anual...');

      // Criar usuário no banco de dados
      const userData = {
        email: this.DEFAULT_USER.email,
        passwordHash: btoa(this.DEFAULT_USER.password),
        name: this.DEFAULT_USER.name,
        phone: '',
        avatar: '',
        role: 'user' as const
      };

      const user = await db.createUser(userData);
      console.log('✅ Usuário criado no banco:', user);

      // Criar chave de acesso para plano anual
      const accessKey = this.createAccessKey(user);
      
      // Salvar chave de acesso
      const accessKeys = JSON.parse(localStorage.getItem('enem_pro_access_keys') || '[]');
      accessKeys.push(accessKey);
      localStorage.setItem('enem_pro_access_keys', JSON.stringify(accessKeys));
      localStorage.setItem('enem_pro_current_key', JSON.stringify(accessKey));

      // Marcar fluxo como completo
      localStorage.setItem('enem_pro_completed_flow', 'true');

      // Salvar dados do usuário para o sistema
      const userDataForStorage = {
        name: user.name,
        email: user.email,
        id: user.id,
        level: 1,
        accessKey: accessKey.key,
        paymentVerified: true,
        plan: 'anual',
        planExpiresAt: accessKey.expiresAt,
        createdAt: user.createdAt
      };
      localStorage.setItem('enem_pro_user', JSON.stringify(userDataForStorage));

      // Salvar ID do usuário para o sistema de autenticação
      localStorage.setItem('enem_pro_user_id', user.email);

      console.log('🎉 Usuário padrão criado com sucesso!');
      console.log('📧 Email:', user.email);
      console.log('🔑 Chave de acesso:', accessKey.key);
      console.log('💎 Plano: Anual (R$ 539,90)');

      return true;

    } catch (error) {
      console.error('❌ Erro ao criar usuário padrão:', error);
      return false;
    }
  }

  /**
   * Cria chave de acesso para plano anual
   */
  private createAccessKey(user: any) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 ano

    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const key = `ENEM${timestamp}${random}`;

    return {
      id: `key_${Date.now()}`,
      key: key,
      userId: user.email,
      userEmail: user.email,
      userName: user.name,
      paymentId: `payment_${Date.now()}`,
      paymentMethod: 'credit_card',
      status: 'active',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isRecurring: true,
      subscriptionId: `sub_anual_${Date.now()}`
    };
  }

  /**
   * Verifica se o usuário padrão existe
   */
  async checkDefaultUserExists(): Promise<boolean> {
    try {
      const db = DatabaseService.getInstance();
      const user = await db.getUserByEmail(this.DEFAULT_USER.email);
      return !!user;
    } catch (error) {
      console.error('Erro ao verificar usuário padrão:', error);
      return false;
    }
  }
}

export default DefaultUserService;
