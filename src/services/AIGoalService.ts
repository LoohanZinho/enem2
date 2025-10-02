// Sistema de Metas Personalizadas com IA para ENEM Pro
// Criação e acompanhamento inteligente de objetivos de estudo

import { userDataService, UserData } from './UserDataService';

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'study_time' | 'simulados' | 'redacoes' | 'subjects' | 'performance' | 'habits';
  category: 'daily' | 'weekly' | 'monthly' | 'long_term';
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'paused' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
  milestones: Milestone[];
  aiRecommendations: string[];
  progressHistory: ProgressEntry[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: Date;
  isCompleted: boolean;
  completedAt?: Date;
  reward?: string;
}

export interface ProgressEntry {
  date: Date;
  value: number;
  notes?: string;
  mood?: string;
  energy?: string;
}

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  difficulty: string;
  estimatedDuration: number; // em dias
  prerequisites: string[];
  tags: string[];
  aiPrompt: string;
}

export interface GoalAnalysis {
  goalId: string;
  completionRate: number;
  averageProgress: number;
  trend: 'improving' | 'stable' | 'declining';
  predictedCompletion: Date;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  obstacles: string[];
  strengths: string[];
}

export interface StudyPlan {
  id: string;
  name: string;
  description: string;
  goals: string[]; // IDs dos goals
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  progress: number;
  aiGenerated: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  subjects: string[];
}

export class AIGoalService {
  private static instance: AIGoalService;
  private goals: Map<string, Goal> = new Map();
  private templates: GoalTemplate[] = [];
  private studyPlans: StudyPlan[] = [];
  private userProfile: any = null;

  static getInstance(): AIGoalService {
    if (!AIGoalService.instance) {
      AIGoalService.instance = new AIGoalService();
    }
    return AIGoalService.instance;
  }

  constructor() {
    this.initializeTemplates();
    this.loadUserProfile();
    this.loadFromLocalStorage();
  }

  // Inicializar templates de metas
  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'template1',
        name: 'Estudar 2 horas por dia',
        description: 'Meta diária de tempo de estudo',
        type: 'study_time',
        category: 'daily',
        difficulty: 'easy',
        estimatedDuration: 30,
        prerequisites: [],
        tags: ['estudo', 'tempo', 'diário'],
        aiPrompt: 'Criar meta de estudo diário baseada no tempo disponível do usuário'
      },
      {
        id: 'template2',
        name: 'Completar 5 simulados por semana',
        description: 'Meta semanal de simulados',
        type: 'simulados',
        category: 'weekly',
        difficulty: 'medium',
        estimatedDuration: 7,
        prerequisites: ['conhecimento básico'],
        tags: ['simulados', 'prática', 'semanal'],
        aiPrompt: 'Criar meta de simulados baseada no nível atual e tempo disponível'
      },
      {
        id: 'template3',
        name: 'Escrever 3 redações por semana',
        description: 'Meta semanal de redações',
        type: 'redacoes',
        category: 'weekly',
        difficulty: 'medium',
        estimatedDuration: 7,
        prerequisites: ['conhecimento de estrutura'],
        tags: ['redação', 'escrita', 'semanal'],
        aiPrompt: 'Criar meta de redação baseada no nível de escrita atual'
      },
      {
        id: 'template4',
        name: 'Melhorar nota em Matemática para 800+',
        description: 'Meta de performance em matemática',
        type: 'performance',
        category: 'monthly',
        difficulty: 'hard',
        estimatedDuration: 30,
        prerequisites: ['conhecimento intermediário'],
        tags: ['matemática', 'performance', 'nota'],
        aiPrompt: 'Criar meta de performance baseada no histórico e pontos fracos'
      }
    ];
  }

  // Carregar perfil do usuário
  private async loadUserProfile(): Promise<void> {
    if (typeof window === 'undefined') return;
    const userData = await userDataService.loadUserData();
    this.userProfile = userData?.analytics ? userData.analytics[0] : this.getDefaultUserProfile();
  }

  private getDefaultUserProfile(): any {
    return {
      studyTime: 2, // horas por dia
      subjects: ['Matemática', 'Português', 'Física', 'Química', 'Biologia', 'História', 'Geografia'],
      weakSubjects: ['Matemática', 'Física'],
      strongSubjects: ['Português', 'História'],
      availableTime: {
        weekdays: 3, // horas
        weekends: 6 // horas
      },
      learningStyle: 'visual',
      motivation: 'high',
      experience: 'intermediate'
    };
  }

  // Criar meta personalizada com IA
  createPersonalizedGoal(
    type: string, 
    category: string, 
    userPreferences: any = {}
  ): Goal {
    const template = this.templates.find(t => t.type === type && t.category === category);
    if (!template) {
      throw new Error('Template não encontrado');
    }

    const aiRecommendations = this.generateAIRecommendations(template, userPreferences);
    const milestones = this.generateMilestones(template, userPreferences);
    
    const goal: Goal = {
      id: this.generateId(),
      title: this.generateGoalTitle(template, userPreferences),
      description: this.generateGoalDescription(template, userPreferences),
      type: template.type as any,
      category: template.category as any,
      target: this.calculateTarget(template, userPreferences),
      current: 0,
      unit: this.getUnit(template.type),
      deadline: this.calculateDeadline(template, userPreferences),
      priority: this.calculatePriority(template, userPreferences),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      difficulty: template.difficulty as any,
      tags: template.tags,
      milestones,
      aiRecommendations,
      progressHistory: []
    };

    this.goals.set(goal.id, goal);
    this.saveToLocalStorage();
    return goal;
  }

  // Gerar recomendações de IA
  private generateAIRecommendations(template: GoalTemplate, preferences: any): string[] {
    const recommendations: string[] = [];

    switch (template.type) {
      case 'study_time':
        recommendations.push('Estude em blocos de 25-30 minutos com pausas de 5 minutos');
        recommendations.push('Use a técnica Pomodoro para manter o foco');
        recommendations.push('Escolha o horário do dia em que você tem mais energia');
        break;
      
      case 'simulados':
        recommendations.push('Faça simulados em ambiente similar ao ENEM');
        recommendations.push('Analise suas respostas erradas para identificar pontos fracos');
        recommendations.push('Mantenha um cronômetro para simular o tempo real');
        break;
      
      case 'redacoes':
        recommendations.push('Pratique diferentes tipos de temas de redação');
        recommendations.push('Peça feedback de professores ou colegas');
        recommendations.push('Estude a estrutura da redação ENEM');
        break;
      
      case 'performance':
        recommendations.push('Foque nos tópicos com maior peso no ENEM');
        recommendations.push('Use flashcards para memorização');
        recommendations.push('Pratique exercícios de diferentes níveis de dificuldade');
        break;
    }

    if (this.userProfile?.learningStyle === 'visual') {
      recommendations.push('Use mapas mentais e diagramas para estudar');
    } else if (this.userProfile?.learningStyle === 'auditory') {
      recommendations.push('Grave áudios explicando os conceitos');
    }

    if (this.userProfile?.motivation === 'low') {
      recommendations.push('Defina recompensas pequenas para cada conquista');
      recommendations.push('Estude com amigos ou em grupo');
    }

    return recommendations;
  }

  // Gerar marcos (milestones)
  private generateMilestones(template: GoalTemplate, preferences: any): Milestone[] {
    const milestones: Milestone[] = [];
    const totalTarget = this.calculateTarget(template, preferences);
    const deadline = this.calculateDeadline(template, preferences);
    const duration = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (duration >= 7) {
      const quarterTarget = Math.floor(totalTarget * 0.25);
      const halfTarget = Math.floor(totalTarget * 0.5);
      const threeQuarterTarget = Math.floor(totalTarget * 0.75);

      milestones.push({
        id: this.generateId(),
        title: '25% Concluído',
        description: `Complete ${quarterTarget} ${this.getUnit(template.type)}`,
        targetValue: quarterTarget,
        currentValue: 0,
        deadline: new Date(Date.now() + (duration * 0.25 * 24 * 60 * 60 * 1000)),
        isCompleted: false,
        reward: 'Parabéns! Você está no caminho certo!'
      });

      milestones.push({
        id: this.generateId(),
        title: '50% Concluído',
        description: `Complete ${halfTarget} ${this.getUnit(template.type)}`,
        targetValue: halfTarget,
        currentValue: 0,
        deadline: new Date(Date.now() + (duration * 0.5 * 24 * 60 * 60 * 1000)),
        isCompleted: false,
        reward: 'Excelente progresso! Continue assim!'
      });

      milestones.push({
        id: this.generateId(),
        title: '75% Concluído',
        description: `Complete ${threeQuarterTarget} ${this.getUnit(template.type)}`,
        targetValue: threeQuarterTarget,
        currentValue: 0,
        deadline: new Date(Date.now() + (duration * 0.75 * 24 * 60 * 60 * 1000)),
        isCompleted: false,
        reward: 'Quase lá! Você está indo muito bem!'
      });
    }

    return milestones;
  }

  // Gerar título da meta
  private generateGoalTitle(template: GoalTemplate, preferences: any): string {
    const baseTitle = template.name;
    
    if (preferences.subject) {
      return `${baseTitle} - ${preferences.subject}`;
    }
    
    if (preferences.timeframe) {
      return `${baseTitle} (${preferences.timeframe})`;
    }
    
    return baseTitle;
  }

  // Gerar descrição da meta
  private generateGoalDescription(template: GoalTemplate, preferences: any): string {
    let description = template.description;
    
    if (preferences.subject) {
      description += ` Focando especificamente em ${preferences.subject}.`;
    }
    
    if (preferences.reason) {
      description += ` ${preferences.reason}`;
    }
    
    return description;
  }

  // Calcular target baseado no perfil e preferências
  private calculateTarget(template: GoalTemplate, preferences: any): number {
    const baseTarget = this.getBaseTarget(template.type);
    
    let multiplier = 1;
    
    if (this.userProfile?.experience === 'beginner') {
      multiplier = 0.7;
    } else if (this.userProfile?.experience === 'advanced') {
      multiplier = 1.3;
    }
    
    if (this.userProfile?.motivation === 'high') {
      multiplier *= 1.2;
    } else if (this.userProfile?.motivation === 'low') {
      multiplier *= 0.8;
    }
    
    return Math.round(baseTarget * multiplier);
  }

  // Obter target base para cada tipo
  private getBaseTarget(type: string): number {
    switch (type) {
      case 'study_time': return 120; // minutos por dia
      case 'simulados': return 5; // por semana
      case 'redacoes': return 3; // por semana
      case 'performance': return 800; // nota
      default: return 10;
    }
  }

  // Calcular prazo
  private calculateDeadline(template: GoalTemplate, preferences: any): Date {
    const now = new Date();
    const duration = template.estimatedDuration;
    
    if (preferences.deadline) {
      return new Date(preferences.deadline);
    }
    
    return new Date(now.getTime() + (duration * 24 * 60 * 60 * 1000));
  }

  // Calcular prioridade
  private calculatePriority(template: GoalTemplate, preferences: any): 'low' | 'medium' | 'high' | 'critical' {
    if (preferences.priority) {
      return preferences.priority;
    }
    
    if (template.difficulty === 'expert') return 'high';
    if (template.difficulty === 'hard') return 'medium';
    return 'low';
  }

  // Obter unidade baseada no tipo
  private getUnit(type: string): string {
    switch (type) {
      case 'study_time': return 'minutos';
      case 'simulados': return 'simulados';
      case 'redacoes': return 'redações';
      case 'performance': return 'pontos';
      default: return 'unidades';
    }
  }

  // Atualizar progresso da meta
  updateGoalProgress(goalId: string, progress: number, notes?: string): boolean {
    const goal = this.goals.get(goalId);
    if (!goal) return false;

    goal.current = Math.min(progress, goal.target);
    goal.updatedAt = new Date();

    goal.progressHistory.push({
      date: new Date(),
      value: goal.current,
      notes
    });

    this.checkMilestones(goal);

    if (goal.current >= goal.target && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
    }

    this.saveToLocalStorage();
    return true;
  }

  // Verificar marcos
  private checkMilestones(goal: Goal): void {
    goal.milestones.forEach(milestone => {
      if (!milestone.isCompleted && goal.current >= milestone.targetValue) {
        milestone.isCompleted = true;
        milestone.completedAt = new Date();
      }
    });
  }

  // Analisar meta
  analyzeGoal(goalId: string): GoalAnalysis | null {
    const goal = this.goals.get(goalId);
    if (!goal) return null;

    const completionRate = (goal.current / goal.target) * 100;
    const averageProgress = this.calculateAverageProgress(goal);
    const trend = this.calculateTrend(goal);
    const predictedCompletion = this.predictCompletion(goal);
    const riskLevel = this.assessRisk(goal);
    const recommendations = this.generateGoalRecommendations(goal);
    const obstacles = this.identifyObstacles(goal);
    const strengths = this.identifyStrengths(goal);

    return {
      goalId,
      completionRate,
      averageProgress,
      trend,
      predictedCompletion,
      riskLevel,
      recommendations,
      obstacles,
      strengths
    };
  }

  // Calcular progresso médio
  private calculateAverageProgress(goal: Goal): number {
    if (goal.progressHistory.length === 0) return 0;
    
    const totalProgress = goal.progressHistory.reduce((sum, entry) => sum + entry.value, 0);
    return totalProgress / goal.progressHistory.length;
  }

  // Calcular tendência
  private calculateTrend(goal: Goal): 'improving' | 'stable' | 'declining' {
    if (goal.progressHistory.length < 2) return 'stable';
    
    const recent = goal.progressHistory.slice(-3);
    const older = goal.progressHistory.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.value, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  // Prever conclusão
  private predictCompletion(goal: Goal): Date {
    if (goal.current >= goal.target) return new Date();
    
    const remaining = goal.target - goal.current;
    const recentProgress = this.calculateRecentProgress(goal);
    
    if (recentProgress <= 0) return new Date(goal.deadline);
    
    const daysToComplete = Math.ceil(remaining / recentProgress);
    return new Date(Date.now() + (daysToComplete * 24 * 60 * 60 * 1000));
  }

  // Calcular progresso recente
  private calculateRecentProgress(goal: Goal): number {
    if (goal.progressHistory.length < 2) return 0;
    
    const recent = goal.progressHistory.slice(-7); // últimos 7 dias
    if (recent.length < 2) return 0;
    
    const first = recent[0];
    const last = recent[recent.length - 1];
    const days = (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24);
    
    if (days === 0) return 0;
    
    return (last.value - first.value) / days;
  }

  // Avaliar risco
  private assessRisk(goal: Goal): 'low' | 'medium' | 'high' {
    const timeRemaining = goal.deadline.getTime() - Date.now();
    const daysRemaining = timeRemaining / (1000 * 60 * 60 * 24);
    const progressNeeded = goal.target - goal.current;
    const dailyProgressNeeded = progressNeeded / Math.max(daysRemaining, 1);
    const recentProgress = this.calculateRecentProgress(goal);
    
    if (recentProgress >= dailyProgressNeeded * 1.2) return 'low';
    if (recentProgress >= dailyProgressNeeded * 0.8) return 'medium';
    return 'high';
  }

  // Gerar recomendações para a meta
  private generateGoalRecommendations(goal: Goal): string[] {
    const recommendations: string[] = [];
    const analysis = this.analyzeGoal(goal.id);
    
    if (!analysis) return recommendations;
    
    if (analysis.riskLevel === 'high') {
      recommendations.push('Aumente o tempo dedicado a esta meta');
      recommendations.push('Quebre a meta em tarefas menores e mais gerenciáveis');
      recommendations.push('Considere ajustar o prazo se necessário');
    }
    
    if (analysis.trend === 'declining') {
      recommendations.push('Identifique e resolva os obstáculos que estão impedindo o progresso');
      recommendations.push('Reavalie sua estratégia de estudo');
    }
    
    if (goal.current === 0 && daysSinceCreation(goal) > 3) {
      recommendations.push('Comece a trabalhar nesta meta hoje mesmo');
      recommendations.push('Defina um horário específico para trabalhar nesta meta');
    }
    
    return recommendations;
  }

  // Identificar obstáculos
  private identifyObstacles(goal: Goal): string[] {
    const obstacles: string[] = [];
    
    if (goal.progressHistory.length === 0 && daysSinceCreation(goal) > 1) {
      obstacles.push('Falta de início');
    }
    
    if (goal.current > 0 && this.calculateRecentProgress(goal) === 0) {
      obstacles.push('Progresso estagnado');
    }
    
    const analysis = this.analyzeGoal(goal.id);
    if (analysis && analysis.riskLevel === 'high') {
      obstacles.push('Prazo apertado');
    }
    
    return obstacles;
  }

  // Identificar pontos fortes
  private identifyStrengths(goal: Goal): string[] {
    const strengths: string[] = [];
    
    if (goal.current > 0) {
      strengths.push('Iniciou a meta');
    }
    
    const analysis = this.analyzeGoal(goal.id);
    if (analysis && analysis.trend === 'improving') {
      strengths.push('Progresso consistente');
    }
    
    if (goal.milestones.some(m => m.isCompleted)) {
      strengths.push('Conquistou marcos');
    }
    
    return strengths;
  }

  // Obter todas as metas
  getGoals(): Goal[] {
    return Array.from(this.goals.values());
  }

  // Obter metas ativas
  getActiveGoals(): Goal[] {
    return Array.from(this.goals.values()).filter(goal => goal.status === 'active');
  }

  // Obter templates
  getTemplates(): GoalTemplate[] {
    return this.templates;
  }

  // Criar plano de estudo com IA
  createAIStudyPlan(preferences: any): StudyPlan {
    const goals = this.generateGoalsForStudyPlan(preferences);
    const studyPlan: StudyPlan = {
      id: this.generateId(),
      name: preferences.name || 'Plano de Estudo Personalizado',
      description: 'Plano de estudo gerado por IA baseado no seu perfil',
      goals: goals.map(g => g.id),
      startDate: new Date(),
      endDate: new Date(Date.now() + (preferences.duration || 30) * 24 * 60 * 60 * 1000),
      isActive: true,
      progress: 0,
      aiGenerated: true,
      difficulty: preferences.difficulty || 'intermediate',
      estimatedHours: preferences.estimatedHours || 100,
      subjects: preferences.subjects || this.userProfile?.subjects
    };

    this.studyPlans.push(studyPlan);
    this.saveToLocalStorage();
    return studyPlan;
  }

  // Gerar metas para plano de estudo
  private generateGoalsForStudyPlan(preferences: any): Goal[] {
    const goals: Goal[] = [];
    
    const studyTimeGoal = this.createPersonalizedGoal('study_time', 'daily', preferences);
    goals.push(studyTimeGoal);
    
    const simuladoGoal = this.createPersonalizedGoal('simulados', 'weekly', preferences);
    goals.push(simuladoGoal);
    
    const redacaoGoal = this.createPersonalizedGoal('redacoes', 'weekly', preferences);
    goals.push(redacaoGoal);
    
    if (this.userProfile?.weakSubjects) {
      this.userProfile.weakSubjects.forEach((subject: string) => {
        const subjectGoal = this.createPersonalizedGoal('performance', 'monthly', {
          ...preferences,
          subject,
          target: 700
        });
        goals.push(subjectGoal);
      });
    }
    
    return goals;
  }

  // Salvar no localStorage
  private saveToLocalStorage(): void {
    userDataService.updateUserData({
      goals: Array.from(this.goals.values()),
      analytics: [this.userProfile, ...this.studyPlans]
    });
  }

  // Carregar do localStorage
  private async loadFromLocalStorage(): Promise<void> {
    const userData = await userDataService.loadUserData();
    if (userData) {
      if (userData.goals) {
        this.goals = new Map(userData.goals.map((goal: any) => [
          goal.id,
          {
            ...goal,
            createdAt: new Date(goal.createdAt),
            updatedAt: new Date(goal.updatedAt),
            deadline: new Date(goal.deadline),
            completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
            milestones: goal.milestones.map((m: any) => ({
              ...m,
              deadline: new Date(m.deadline),
              completedAt: m.completedAt ? new Date(m.completedAt) : undefined
            })),
            progressHistory: goal.progressHistory.map((p: any) => ({
              ...p,
              date: new Date(p.date)
            }))
          }
        ]));
      }

      if (userData.analytics) {
        this.studyPlans = (userData.analytics.slice(1) || []).map((plan: any) => ({
          ...plan,
          startDate: new Date(plan.startDate),
          endDate: new Date(plan.endDate)
        }));
      }
    } else {
      this.goals = new Map();
      this.studyPlans = [];
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

function daysSinceCreation(goal: Goal): number {
  return (Date.now() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24);
}

export default AIGoalService;
