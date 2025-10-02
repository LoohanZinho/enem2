// Sistema de Gamificação Completo para ENEM Pro
// Badges, conquistas, níveis e sistema de pontos

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'study' | 'achievement' | 'streak' | 'simulado' | 'redacao' | 'social';
  points: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: Date;
  requirements: {
    type: string;
    value: number;
    current: number;
  }[];
}

export interface Level {
  level: number;
  name: string;
  requiredPoints: number;
  benefits: string[];
  color: string;
  icon: string;
}

export interface UserStats {
  totalPoints: number;
  currentLevel: number;
  badges: Badge[];
  achievements: Achievement[];
  studyStreak: number;
  longestStreak: number;
  totalStudyTime: number; // em minutos
  simuladosCompleted: number;
  redacoesWritten: number;
  questionsAnswered: number;
  correctAnswers: number;
  lastActivity: Date;
}

export class GamificationService {
  private static instance: GamificationService;
  private userStats: UserStats | null = null;

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // Badges disponíveis
  private badges: Badge[] = [
    // Badges de Estudo
    {
      id: 'first_study',
      name: 'Primeiro Passo',
      description: 'Complete sua primeira sessão de estudo',
      icon: '🎯',
      color: 'blue',
      rarity: 'common',
      category: 'study',
      points: 10,
      maxProgress: 1
    },
    {
      id: 'study_streak_7',
      name: 'Semana de Dedicação',
      description: 'Estude por 7 dias consecutivos',
      icon: '🔥',
      color: 'orange',
      rarity: 'rare',
      category: 'streak',
      points: 50,
      maxProgress: 7
    },
    {
      id: 'study_streak_30',
      name: 'Mês de Foco',
      description: 'Estude por 30 dias consecutivos',
      icon: '💎',
      color: 'purple',
      rarity: 'epic',
      category: 'streak',
      points: 200,
      maxProgress: 30
    },
    {
      id: 'study_streak_100',
      name: 'Lenda dos Estudos',
      description: 'Estude por 100 dias consecutivos',
      icon: '👑',
      color: 'gold',
      rarity: 'legendary',
      category: 'streak',
      points: 1000,
      maxProgress: 100
    },
    {
      id: 'study_time_100h',
      name: 'Centenário',
      description: 'Acumule 100 horas de estudo',
      icon: '⏰',
      color: 'green',
      rarity: 'rare',
      category: 'study',
      points: 100,
      maxProgress: 6000 // 100 horas em minutos
    },
    {
      id: 'study_time_500h',
      name: 'Mestre do Tempo',
      description: 'Acumule 500 horas de estudo',
      icon: '⌛',
      color: 'purple',
      rarity: 'epic',
      category: 'study',
      points: 500,
      maxProgress: 30000 // 500 horas em minutos
    },

    // Badges de Simulados
    {
      id: 'first_simulado',
      name: 'Iniciante',
      description: 'Complete seu primeiro simulado',
      icon: '📝',
      color: 'blue',
      rarity: 'common',
      category: 'simulado',
      points: 20,
      maxProgress: 1
    },
    {
      id: 'simulado_10',
      name: 'Persistente',
      description: 'Complete 10 simulados',
      icon: '📊',
      color: 'green',
      rarity: 'rare',
      category: 'simulado',
      points: 100,
      maxProgress: 10
    },
    {
      id: 'simulado_50',
      name: 'Veterano',
      description: 'Complete 50 simulados',
      icon: '🏆',
      color: 'purple',
      rarity: 'epic',
      category: 'simulado',
      points: 500,
      maxProgress: 50
    },
    {
      id: 'simulado_perfect',
      name: 'Perfeição',
      description: 'Tire 100% em um simulado',
      icon: '💯',
      color: 'gold',
      rarity: 'legendary',
      category: 'simulado',
      points: 300,
      maxProgress: 1
    },

    // Badges de Redação
    {
      id: 'first_redacao',
      name: 'Escritor',
      description: 'Escreva sua primeira redação',
      icon: '✍️',
      color: 'blue',
      rarity: 'common',
      category: 'redacao',
      points: 15,
      maxProgress: 1
    },
    {
      id: 'redacao_20',
      name: 'Cronista',
      description: 'Escreva 20 redações',
      icon: '📚',
      color: 'green',
      rarity: 'rare',
      category: 'redacao',
      points: 150,
      maxProgress: 20
    },
    {
      id: 'redacao_900',
      name: 'Mestre da Escrita',
      description: 'Tire 900+ em uma redação',
      icon: '🌟',
      color: 'purple',
      rarity: 'epic',
      category: 'redacao',
      points: 400,
      maxProgress: 1
    },

    // Badges de Conquistas
    {
      id: 'early_bird',
      name: 'Madrugador',
      description: 'Estude antes das 6h da manhã',
      icon: '🌅',
      color: 'yellow',
      rarity: 'rare',
      category: 'achievement',
      points: 30,
      maxProgress: 1
    },
    {
      id: 'night_owl',
      name: 'Coruja Noturna',
      description: 'Estude após as 23h',
      icon: '🦉',
      color: 'indigo',
      rarity: 'rare',
      category: 'achievement',
      points: 30,
      maxProgress: 1
    },
    {
      id: 'weekend_warrior',
      name: 'Guerreiro do Fim de Semana',
      description: 'Estude nos fins de semana',
      icon: '⚔️',
      color: 'red',
      rarity: 'common',
      category: 'achievement',
      points: 25,
      maxProgress: 1
    },
    {
      id: 'speed_demon',
      name: 'Demônio da Velocidade',
      description: 'Complete um simulado em menos de 2 horas',
      icon: '⚡',
      color: 'yellow',
      rarity: 'epic',
      category: 'achievement',
      points: 200,
      maxProgress: 1
    }
  ];

  // Níveis do sistema
  private levels: Level[] = [
    { level: 1, name: 'Iniciante', requiredPoints: 0, benefits: ['Acesso básico'], color: 'gray', icon: '🌱' },
    { level: 2, name: 'Aprendiz', requiredPoints: 100, benefits: ['Badges desbloqueados'], color: 'blue', icon: '📚' },
    { level: 3, name: 'Estudante', requiredPoints: 300, benefits: ['Relatórios avançados'], color: 'green', icon: '🎓' },
    { level: 4, name: 'Dedicado', requiredPoints: 600, benefits: ['Metas personalizadas'], color: 'yellow', icon: '⭐' },
    { level: 5, name: 'Focado', requiredPoints: 1000, benefits: ['Tutoriais exclusivos'], color: 'orange', icon: '🔥' },
    { level: 6, name: 'Determinado', requiredPoints: 1500, benefits: ['Simulados premium'], color: 'red', icon: '💪' },
    { level: 7, name: 'Especialista', requiredPoints: 2200, benefits: ['Chat com tutores'], color: 'purple', icon: '🎯' },
    { level: 8, name: 'Mestre', requiredPoints: 3000, benefits: ['Conteúdo exclusivo'], color: 'indigo', icon: '👑' },
    { level: 9, name: 'Lenda', requiredPoints: 4000, benefits: ['Acesso VIP'], color: 'pink', icon: '🌟' },
    { level: 10, name: 'Ídolo', requiredPoints: 5000, benefits: ['Todas as funcionalidades'], color: 'gold', icon: '🏆' }
  ];

  // Inicializar stats do usuário
  initializeUserStats(): UserStats {
    this.userStats = {
      totalPoints: 0,
      currentLevel: 1,
      badges: [],
      achievements: [],
      studyStreak: 0,
      longestStreak: 0,
      totalStudyTime: 0,
      simuladosCompleted: 0,
      redacoesWritten: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      lastActivity: new Date()
    };
    this.saveToLocalStorage();
    return this.userStats;
  }

  // Carregar stats do usuário
  loadUserStats(): UserStats {
    if (typeof window === 'undefined') {
        if (!this.userStats) {
           return this.initializeUserStats();
        }
        return this.userStats;
    }
    const saved = localStorage.getItem('enem_pro_gamification');
    if (saved) {
      try {
        this.userStats = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse gamification data from localStorage", e);
        this.userStats = this.initializeUserStats();
      }
    } else {
      this.userStats = this.initializeUserStats();
    }
    return this.userStats!;
  }

  // Atualizar progresso e verificar badges
  updateProgress(type: string, value: number): { newBadges: Badge[], levelUp: boolean } {
    if (!this.userStats) {
      this.loadUserStats();
    }

    const newBadges: Badge[] = [];
    let levelUp = false;

    // Atualizar stats baseado no tipo
    switch (type) {
      case 'study_time':
        this.userStats!.totalStudyTime += value;
        break;
      case 'study_session':
        this.userStats!.studyStreak += 1;
        if (this.userStats!.studyStreak > this.userStats!.longestStreak) {
          this.userStats!.longestStreak = this.userStats!.studyStreak;
        }
        break;
      case 'simulado_completed':
        this.userStats!.simuladosCompleted += 1;
        break;
      case 'redacao_written':
        this.userStats!.redacoesWritten += 1;
        break;
      case 'question_answered':
        this.userStats!.questionsAnswered += 1;
        if (value === 1) { // resposta correta
          this.userStats!.correctAnswers += 1;
        }
        break;
    }

    // Verificar badges
    for (const badge of this.badges) {
      if (this.userStats!.badges.find(b => b.id === badge.id)) continue;

      let progress = 0;
      switch (badge.id) {
        case 'first_study':
          progress = this.userStats!.totalStudyTime > 0 ? 1 : 0;
          break;
        case 'study_streak_7':
          progress = Math.min(this.userStats!.studyStreak, 7);
          break;
        case 'study_streak_30':
          progress = Math.min(this.userStats!.studyStreak, 30);
          break;
        case 'study_streak_100':
          progress = Math.min(this.userStats!.studyStreak, 100);
          break;
        case 'study_time_100h':
          progress = Math.min(this.userStats!.totalStudyTime, 6000);
          break;
        case 'study_time_500h':
          progress = Math.min(this.userStats!.totalStudyTime, 30000);
          break;
        case 'first_simulado':
          progress = this.userStats!.simuladosCompleted > 0 ? 1 : 0;
          break;
        case 'simulado_10':
          progress = Math.min(this.userStats!.simuladosCompleted, 10);
          break;
        case 'simulado_50':
          progress = Math.min(this.userStats!.simuladosCompleted, 50);
          break;
        case 'first_redacao':
          progress = this.userStats!.redacoesWritten > 0 ? 1 : 0;
          break;
        case 'redacao_20':
          progress = Math.min(this.userStats!.redacoesWritten, 20);
          break;
      }

      if (progress >= (badge.maxProgress || 1)) {
        const unlockedBadge = { ...badge, unlockedAt: new Date(), progress };
        this.userStats!.badges.push(unlockedBadge);
        this.userStats!.totalPoints += badge.points;
        newBadges.push(unlockedBadge);
      }
    }

    // Verificar level up
    const newLevel = this.calculateLevel(this.userStats!.totalPoints);
    if (newLevel > this.userStats!.currentLevel) {
      this.userStats!.currentLevel = newLevel;
      levelUp = true;
    }

    this.userStats!.lastActivity = new Date();
    this.saveToLocalStorage();

    return { newBadges, levelUp };
  }

  // Calcular nível baseado nos pontos
  private calculateLevel(points: number): number {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (points >= this.levels[i].requiredPoints) {
        return this.levels[i].level;
      }
    }
    return 1;
  }

  // Obter informações do nível atual
  getCurrentLevelInfo(): Level {
    if (!this.userStats) this.loadUserStats();
    return this.levels[this.userStats!.currentLevel - 1];
  }

  // Obter progresso para o próximo nível
  getNextLevelProgress(): { current: number, required: number, percentage: number } {
    if (!this.userStats) this.loadUserStats();
    
    const currentLevel = this.getCurrentLevelInfo();
    const nextLevel = this.levels[this.userStats!.currentLevel] || this.levels[this.levels.length - 1];
    
    const current = this.userStats!.totalPoints - currentLevel.requiredPoints;
    const required = nextLevel.requiredPoints - currentLevel.requiredPoints;
    const percentage = Math.min((current / required) * 100, 100);

    return { current, required, percentage };
  }

  // Obter todos os badges
  getAllBadges(): Badge[] {
    return this.badges;
  }

  // Obter badges desbloqueados
  getUnlockedBadges(): Badge[] {
    if (!this.userStats) this.loadUserStats();
    return this.userStats!.badges;
  }

  // Obter badges por categoria
  getBadgesByCategory(category: string): Badge[] {
    return this.badges.filter(badge => badge.category === category);
  }

  // Obter ranking de usuários (simulado)
  getLeaderboard(): Array<{ name: string, points: number, level: number, avatar: string }> {
    // Em uma implementação real, isso viria de uma API
    return [
      { name: 'João Silva', points: 2847, level: 8, avatar: '/avatars/joao.jpg' },
      { name: 'Maria Santos', points: 2756, level: 7, avatar: '/avatars/maria.jpg' },
      { name: 'Pedro Costa', points: 2634, level: 7, avatar: '/avatars/pedro.jpg' },
      { name: 'Ana Oliveira', points: 2456, level: 6, avatar: '/avatars/ana.jpg' },
      { name: 'Carlos Lima', points: 2234, level: 6, avatar: '/avatars/carlos.jpg' }
    ];
  }

  // Obter estatísticas do usuário
  getUserStats(): UserStats {
    if (!this.userStats) this.loadUserStats();
    return this.userStats!;
  }

  // Resetar progresso (para testes)
  resetProgress(): void {
    this.userStats = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('enem_pro_gamification');
    }
  }

  // Salvar no localStorage
  private saveToLocalStorage(): void {
    if (typeof window !== 'undefined' && this.userStats) {
      localStorage.setItem('enem_pro_gamification', JSON.stringify(this.userStats));
    }
  }
}

export default GamificationService;
