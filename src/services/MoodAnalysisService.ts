// Sistema de Análise de Sentimento e Motivação para ENEM Pro
// Monitoramento do estado emocional e psicológico do estudante

import { userDataService } from './UserDataService';

export interface MoodEntry {
  id: string;
  timestamp: Date;
  mood: 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad';
  energy: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  stress: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  motivation: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  confidence: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  notes?: string;
  triggers?: string[];
  studySession?: string;
}

export interface MoodTrend {
  period: 'day' | 'week' | 'month';
  averageMood: number;
  averageEnergy: number;
  averageStress: number;
  averageMotivation: number;
  averageConfidence: number;
  trend: 'improving' | 'stable' | 'declining';
  insights: string[];
  recommendations: string[];
}

export interface MotivationProfile {
  primaryMotivators: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  studyPreferences: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    sessionLength: 'short' | 'medium' | 'long';
    breakFrequency: 'frequent' | 'moderate' | 'rare';
    environment: 'quiet' | 'moderate' | 'busy';
  };
  goals: {
    shortTerm: string[];
    longTerm: string[];
    academic: string[];
    personal: string[];
  };
  challenges: string[];
  strengths: string[];
}

export interface WellbeingRecommendation {
  id: string;
  type: 'study' | 'wellness' | 'motivation' | 'stress' | 'social';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: number; // em minutos
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface StressIndicator {
  level: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  causes: string[];
  recommendations: string[];
  lastAssessment: Date;
}

export class MoodAnalysisService {
  private static instance: MoodAnalysisService;
  private moodEntries: MoodEntry[] = [];
  private motivationProfile: MotivationProfile;
  private recommendations: WellbeingRecommendation[] = [];
  private stressIndicators: StressIndicator[] = [];

  static getInstance(): MoodAnalysisService {
    if (!MoodAnalysisService.instance) {
      MoodAnalysisService.instance = new MoodAnalysisService();
    }
    return MoodAnalysisService.instance;
  }

  constructor() {
    // Perfil de motivação padrão
    this.motivationProfile = {
      primaryMotivators: ['achievement', 'learning', 'future_goals'],
      learningStyle: 'visual',
      studyPreferences: {
        timeOfDay: 'afternoon',
        sessionLength: 'medium',
        breakFrequency: 'moderate',
        environment: 'quiet'
      },
      goals: {
        shortTerm: ['Melhorar em matemática', 'Completar 5 simulados por semana'],
        longTerm: ['Passar no ENEM', 'Entrar na faculdade dos sonhos'],
        academic: ['Tirar nota 800+ no ENEM', 'Dominar todas as matérias'],
        personal: ['Manter equilíbrio vida-estudo', 'Desenvolver disciplina']
      },
      challenges: ['Concentração', 'Gestão de tempo', 'Ansiedade'],
      strengths: ['Persistência', 'Curiosidade', 'Organização']
    };
    this.initializeData();
  }

  // Inicializar dados
  private initializeData(): void {
    // Recomendações padrão
    this.recommendations = [
      {
        id: 'rec1',
        type: 'wellness',
        title: 'Pausa para Respiração',
        description: 'Faça 5 minutos de respiração profunda para reduzir o estresse',
        priority: 'medium',
        estimatedTime: 5,
        difficulty: 'easy',
        category: 'Relaxamento',
        isCompleted: false
      },
      {
        id: 'rec2',
        type: 'study',
        title: 'Técnica Pomodoro',
        description: 'Use a técnica de 25 minutos de estudo + 5 minutos de pausa',
        priority: 'high',
        estimatedTime: 30,
        difficulty: 'easy',
        category: 'Produtividade',
        isCompleted: false
      },
      {
        id: 'rec3',
        type: 'motivation',
        title: 'Visualizar Objetivos',
        description: 'Escreva seus objetivos e visualize o sucesso',
        priority: 'medium',
        estimatedTime: 10,
        difficulty: 'easy',
        category: 'Motivação',
        isCompleted: false
      }
    ];
    this.loadFromLocalStorage();
  }

  // Registrar entrada de humor
  recordMoodEntry(entry: Omit<MoodEntry, 'id' | 'timestamp'>): MoodEntry {
    const newEntry: MoodEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.moodEntries.push(newEntry);
    this.analyzeMoodPatterns();
    this.generateRecommendations();
    this.saveToLocalStorage();

    return newEntry;
  }

  // Analisar padrões de humor
  private analyzeMoodPatterns(): void {
    if (this.moodEntries.length < 3) return;

    const recentEntries = this.moodEntries.slice(-7); // Últimos 7 dias
    const trends = this.calculateTrends(recentEntries);
    
    // Atualizar recomendações baseadas nas tendências
    this.updateRecommendationsBasedOnTrends(trends);
  }

  // Calcular tendências
  private calculateTrends(entries: MoodEntry[]): {
    mood: number;
    energy: number;
    stress: number;
    motivation: number;
    confidence: number;
  } {
    const moodValues = { very_happy: 5, happy: 4, neutral: 3, sad: 2, very_sad: 1 };
    const energyValues = { very_high: 5, high: 4, medium: 3, low: 2, very_low: 1 };
    const stressValues = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };
    const motivationValues = { very_high: 5, high: 4, medium: 3, low: 2, very_low: 1 };
    const confidenceValues = { very_high: 5, high: 4, medium: 3, low: 2, very_low: 1 };

    const averages = {
      mood: entries.reduce((sum, entry) => sum + moodValues[entry.mood], 0) / entries.length,
      energy: entries.reduce((sum, entry) => sum + energyValues[entry.energy], 0) / entries.length,
      stress: entries.reduce((sum, entry) => sum + stressValues[entry.stress], 0) / entries.length,
      motivation: entries.reduce((sum, entry) => sum + motivationValues[entry.motivation], 0) / entries.length,
      confidence: entries.reduce((sum, entry) => sum + confidenceValues[entry.confidence], 0) / entries.length
    };

    return averages;
  }

  // Atualizar recomendações baseadas em tendências
  private updateRecommendationsBasedOnTrends(trends: any): void {
    // Se estresse alto, adicionar recomendações de relaxamento
    if (trends.stress > 3.5) {
      this.addRecommendation({
        type: 'stress',
        title: 'Técnica de Relaxamento',
        description: 'Pratique meditação ou alongamento para reduzir o estresse',
        priority: 'high',
        estimatedTime: 15,
        difficulty: 'easy',
        category: 'Bem-estar'
      });
    }

    // Se motivação baixa, adicionar recomendações motivacionais
    if (trends.motivation < 3) {
      this.addRecommendation({
        type: 'motivation',
        title: 'Recompensa Pessoal',
        description: 'Defina uma recompensa para quando completar uma meta',
        priority: 'medium',
        estimatedTime: 5,
        difficulty: 'easy',
        category: 'Motivação'
      });
    }

    // Se confiança baixa, adicionar recomendações de autoestima
    if (trends.confidence < 3) {
      this.addRecommendation({
        type: 'motivation',
        title: 'Lista de Conquistas',
        description: 'Escreva suas conquistas recentes para aumentar a confiança',
        priority: 'medium',
        estimatedTime: 10,
        difficulty: 'easy',
        category: 'Autoestima'
      });
    }
  }

  // Adicionar recomendação
  private addRecommendation(rec: Omit<WellbeingRecommendation, 'id' | 'isCompleted'>): void {
    const newRec: WellbeingRecommendation = {
      ...rec,
      id: this.generateId(),
      isCompleted: false
    };

    // Verificar se já existe recomendação similar
    const exists = this.recommendations.some(r => 
      r.title === newRec.title && r.type === newRec.type
    );

    if (!exists) {
      this.recommendations.push(newRec);
    }
  }

  // Gerar recomendações personalizadas
  generateRecommendations(): WellbeingRecommendation[] {
    const activeRecommendations = this.recommendations.filter(rec => !rec.isCompleted);
    
    // Ordenar por prioridade e relevância
    return activeRecommendations.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Obter tendências de humor
  getMoodTrends(period: 'day' | 'week' | 'month' = 'week'): MoodTrend {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const periodEntries = this.moodEntries.filter(entry => entry.timestamp >= startDate);
    const trends = this.calculateTrends(periodEntries);

    // Determinar tendência geral
    const overallTrend = this.determineOverallTrend(periodEntries);
    
    // Gerar insights
    const insights = this.generateInsights(trends, periodEntries);
    
    // Gerar recomendações
    const recommendations = this.generateTrendRecommendations(trends, overallTrend);

    return {
      period,
      averageMood: trends.mood,
      averageEnergy: trends.energy,
      averageStress: trends.stress,
      averageMotivation: trends.motivation,
      averageConfidence: trends.confidence,
      trend: overallTrend,
      insights,
      recommendations
    };
  }

  // Determinar tendência geral
  private determineOverallTrend(entries: MoodEntry[]): 'improving' | 'stable' | 'declining' {
    if (entries.length < 2) return 'stable';

    const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
    const secondHalf = entries.slice(Math.floor(entries.length / 2));

    const firstTrends = this.calculateTrends(firstHalf);
    const secondTrends = this.calculateTrends(secondHalf);

    const moodChange = secondTrends.mood - firstTrends.mood;
    const energyChange = secondTrends.energy - firstTrends.energy;
    const stressChange = firstTrends.stress - secondTrends.stress; // Invertido porque menos estresse é melhor

    const overallChange = (moodChange + energyChange + stressChange) / 3;

    if (overallChange > 0.3) return 'improving';
    if (overallChange < -0.3) return 'declining';
    return 'stable';
  }

  // Gerar insights
  private generateInsights(trends: any, entries: MoodEntry[]): string[] {
    const insights: string[] = [];

    if (trends.mood > 4) {
      insights.push('Você está se sentindo muito bem! Continue mantendo esse estado positivo.');
    } else if (trends.mood < 2.5) {
      insights.push('Seu humor está baixo. Que tal fazer uma pausa e fazer algo que você gosta?');
    }

    if (trends.stress > 4) {
      insights.push('Seus níveis de estresse estão altos. Considere técnicas de relaxamento.');
    }

    if (trends.energy < 2.5) {
      insights.push('Você parece estar com pouca energia. Talvez seja hora de descansar mais.');
    }

    if (trends.motivation < 2.5) {
      insights.push('Sua motivação está baixa. Lembre-se dos seus objetivos e por que você está estudando.');
    }

    // Análise de padrões
    const morningEntries = entries.filter(e => e.timestamp.getHours() < 12);
    const afternoonEntries = entries.filter(e => e.timestamp.getHours() >= 12 && e.timestamp.getHours() < 18);
    const eveningEntries = entries.filter(e => e.timestamp.getHours() >= 18);

    if (morningEntries.length > 0 && afternoonEntries.length > 0) {
      const morningMood = this.calculateTrends(morningEntries).mood;
      const afternoonMood = this.calculateTrends(afternoonEntries).mood;
      
      if (morningMood > afternoonMood + 0.5) {
        insights.push('Você parece ter mais energia pela manhã. Considere estudar mais cedo.');
      } else if (afternoonMood > morningMood + 0.5) {
        insights.push('Você parece ter mais energia à tarde. Aproveite esse horário para estudar.');
      }
    }

    return insights;
  }

  // Gerar recomendações baseadas em tendências
  private generateTrendRecommendations(trends: any, overallTrend: string): string[] {
    const recommendations: string[] = [];

    if (overallTrend === 'declining') {
      recommendations.push('Considere reduzir a carga de estudos temporariamente');
      recommendations.push('Faça mais pausas durante o dia');
      recommendations.push('Pratique atividades relaxantes');
    } else if (overallTrend === 'improving') {
      recommendations.push('Continue com o que está funcionando!');
      recommendations.push('Considere aumentar gradualmente a carga de estudos');
    }

    if (trends.stress > 3.5) {
      recommendations.push('Pratique técnicas de respiração profunda');
      recommendations.push('Faça exercícios físicos regularmente');
      recommendations.push('Mantenha uma rotina de sono consistente');
    }

    if (trends.motivation < 3) {
      recommendations.push('Defina metas pequenas e alcançáveis');
      recommendations.push('Celebre pequenas conquistas');
      recommendations.push('Conecte-se com outros estudantes');
    }

    return recommendations;
  }

  // Avaliar estresse
  assessStress(): StressIndicator {
    const recentEntries = this.moodEntries.slice(-7);
    const stressLevels = recentEntries.map(entry => {
      const stressValues = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };
      return stressValues[entry.stress];
    });

    const averageStress = stressLevels.length > 0 ? stressLevels.reduce((sum, level) => sum + level, 0) / stressLevels.length : 0;

    let level: 'low' | 'medium' | 'high' | 'critical';
    if (averageStress <= 2) level = 'low';
    else if (averageStress <= 3) level = 'medium';
    else if (averageStress <= 4) level = 'high';
    else level = 'critical';

    const symptoms = this.identifyStressSymptoms(recentEntries);
    const causes = this.identifyStressCauses(recentEntries);
    const recommendations = this.generateStressRecommendations(level, symptoms, causes);

    return {
      level,
      symptoms,
      causes,
      recommendations,
      lastAssessment: new Date()
    };
  }

  // Identificar sintomas de estresse
  private identifyStressSymptoms(entries: MoodEntry[]): string[] {
    const symptoms: string[] = [];
    
    const lowEnergyCount = entries.filter(e => e.energy === 'low' || e.energy === 'very_low').length;
    const lowMoodCount = entries.filter(e => e.mood === 'sad' || e.mood === 'very_sad').length;
    const highStressCount = entries.filter(e => e.stress === 'high' || e.stress === 'very_high').length;

    if (entries.length > 0 && lowEnergyCount > entries.length * 0.5) {
      symptoms.push('Fadiga constante');
    }
    if (entries.length > 0 && lowMoodCount > entries.length * 0.4) {
      symptoms.push('Humor deprimido');
    }
    if (entries.length > 0 && highStressCount > entries.length * 0.6) {
      symptoms.push('Ansiedade elevada');
    }

    return symptoms;
  }

  // Identificar causas de estresse
  private identifyStressCauses(entries: MoodEntry[]): string[] {
    const causes: string[] = [];
    
    // Análise baseada em triggers mencionados
    const allTriggers = entries.flatMap(e => e.triggers || []);
    const triggerCounts = allTriggers.reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(triggerCounts).forEach(([trigger, count]) => {
      if (entries.length > 0 && count > entries.length * 0.3) {
        causes.push(trigger);
      }
    });

    // Causas comuns se não houver triggers específicos
    if (causes.length === 0) {
      causes.push('Pressão acadêmica', 'Gestão de tempo', 'Expectativas altas');
    }

    return causes;
  }

  // Gerar recomendações para estresse
  private generateStressRecommendations(level: string, symptoms: string[], causes: string[]): string[] {
    const recommendations: string[] = [];

    if (level === 'critical' || level === 'high') {
      recommendations.push('Considere buscar ajuda profissional');
      recommendations.push('Reduza drasticamente a carga de estudos');
      recommendations.push('Pratique técnicas de relaxamento diariamente');
    } else if (level === 'medium') {
      recommendations.push('Aumente as pausas entre sessões de estudo');
      recommendations.push('Pratique exercícios físicos regularmente');
      recommendations.push('Mantenha uma rotina de sono consistente');
    } else {
      recommendations.push('Continue mantendo o equilíbrio');
      recommendations.push('Monitore regularmente seus níveis de estresse');
    }

    return recommendations;
  }

  // Obter perfil de motivação
  getMotivationProfile(): MotivationProfile | null {
    return this.motivationProfile;
  }

  // Atualizar perfil de motivação
  updateMotivationProfile(updates: Partial<MotivationProfile>): void {
    if (this.motivationProfile) {
      this.motivationProfile = { ...this.motivationProfile, ...updates };
      this.saveToLocalStorage();
    }
  }

  // Marcar recomendação como concluída
  completeRecommendation(recommendationId: string): void {
    const rec = this.recommendations.find(r => r.id === recommendationId);
    if (rec) {
      rec.isCompleted = true;
      rec.completedAt = new Date();
      this.saveToLocalStorage();
    }
  }

  // Obter entradas de humor recentes
  getRecentMoodEntries(days: number = 7): MoodEntry[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.moodEntries.filter(entry => entry.timestamp >= cutoffDate);
  }

  // Salvar no localStorage
  private saveToLocalStorage(): void {
    userDataService.updateUserData({
      moodEntries: this.moodEntries,
      analytics: [this.motivationProfile, ...this.recommendations]
    });
  }

  // Carregar do localStorage
  private loadFromLocalStorage(): void {
    const userData = userDataService.loadUserData();
    if (userData) {
      this.moodEntries = userData.moodEntries ? userData.moodEntries.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })) : [];

      if (userData.analytics && userData.analytics.length > 0) {
        this.motivationProfile = userData.analytics[0] || this.motivationProfile;
        this.recommendations = userData.analytics.slice(1).map((rec: any) => ({
          ...rec,
          completedAt: rec.completedAt ? new Date(rec.completedAt) : undefined
        }));
      }
    } else {
      this.moodEntries = [];
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default MoodAnalysisService;
