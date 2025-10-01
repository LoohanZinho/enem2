// Sistema de Relatórios e Métricas Avançadas para ENEM Pro
// Análise profunda de performance e insights personalizados

export interface PerformanceMetrics {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  overallScore: number;
  studyTime: number; // em minutos
  questionsAnswered: number;
  correctAnswers: number;
  accuracyRate: number;
  averageResponseTime: number;
  improvementRate: number;
  consistencyScore: number;
  subjectBreakdown: Map<string, SubjectMetrics>;
  trends: TrendAnalysis;
  predictions: PredictionData;
  recommendations: string[];
}

export interface SubjectMetrics {
  subject: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracyRate: number;
  averageScore: number;
  timeSpent: number;
  improvementRate: number;
  weakTopics: string[];
  strongTopics: string[];
  difficultyDistribution: Map<string, number>;
  lastStudied: Date;
  studyStreak: number;
}

export interface TrendAnalysis {
  overall: 'improving' | 'stable' | 'declining';
  studyTime: 'improving' | 'stable' | 'declining';
  accuracy: 'improving' | 'stable' | 'declining';
  consistency: 'improving' | 'stable' | 'declining';
  confidence: 'improving' | 'stable' | 'declining';
  velocity: number; // taxa de melhoria
  acceleration: number; // aceleração da melhoria
  seasonality: {
    bestDay: string;
    bestHour: number;
    worstDay: string;
    worstHour: number;
  };
}

export interface PredictionData {
  predictedENEMScore: number;
  confidence: number;
  timeToTarget: number; // dias para atingir meta
  probabilityOfSuccess: number;
  riskFactors: string[];
  opportunities: string[];
  milestones: {
    date: Date;
    expectedScore: number;
    description: string;
  }[];
}

export interface LearningInsights {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  optimalStudyTime: {
    start: string;
    end: string;
    duration: number;
  };
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  retentionRate: number;
  forgettingCurve: {
    day1: number;
    day3: number;
    day7: number;
    day30: number;
  };
  knowledgeGaps: {
    subject: string;
    topic: string;
    severity: 'low' | 'medium' | 'high';
    impact: number;
  }[];
  masteryLevel: Map<string, number>; // 0-100
}

export interface ComparativeAnalysis {
  peerComparison: {
    percentile: number;
    rank: number;
    totalUsers: number;
    betterThan: number;
  };
  historicalComparison: {
    previousPeriod: PerformanceMetrics;
    improvement: number;
    areasOfGrowth: string[];
    areasOfDecline: string[];
  };
  benchmarkComparison: {
    targetScore: number;
    currentGap: number;
    requiredImprovement: number;
    timeline: Date;
  };
}

export interface ReportData {
  id: string;
  type: 'performance' | 'progress' | 'insights' | 'predictions' | 'comparative';
  title: string;
  description: string;
  generatedAt: Date;
  period: string;
  data: any;
  visualizations: VisualizationConfig[];
  insights: string[];
  recommendations: string[];
  isScheduled: boolean;
  nextGeneration?: Date;
}

export interface VisualizationConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'radar' | 'gauge';
  title: string;
  data: any;
  options: any;
  position: { x: number; y: number; width: number; height: number };
}

export interface StudyPattern {
  id: string;
  name: string;
  description: string;
  frequency: number; // vezes por semana
  duration: number; // minutos por sessão
  effectiveness: number; // 0-100
  subjects: string[];
  timeOfDay: string;
  dayOfWeek: string[];
  successRate: number;
  lastUsed: Date;
}

export class AdvancedAnalyticsService {
  private static instance: AdvancedAnalyticsService;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private reports: ReportData[] = [];
  private studyPatterns: StudyPattern[] = [];
  private insights: Map<string, LearningInsights> = new Map();

  static getInstance(): AdvancedAnalyticsService {
    if (!AdvancedAnalyticsService.instance) {
      AdvancedAnalyticsService.instance = new AdvancedAnalyticsService();
    }
    return AdvancedAnalyticsService.instance;
  }

  constructor() {
    this.initializeData();
  }

  // Inicializar dados
  private initializeData(): void {
    this.loadFromLocalStorage();
  }

  // Calcular métricas de performance
  async calculatePerformanceMetrics(
    userId: string, 
    period: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<PerformanceMetrics> {
    const endDate = new Date();
    const startDate = this.getStartDate(period, endDate);
    
    // Simular coleta de dados (em produção, viria de APIs)
    const rawData = await this.collectUserData(userId, startDate, endDate);
    
    const metrics: PerformanceMetrics = {
      userId,
      period,
      startDate,
      endDate,
      overallScore: this.calculateOverallScore(rawData),
      studyTime: this.calculateStudyTime(rawData),
      questionsAnswered: rawData.questionsAnswered,
      correctAnswers: rawData.correctAnswers,
      accuracyRate: rawData.correctAnswers / rawData.questionsAnswered,
      averageResponseTime: rawData.averageResponseTime,
      improvementRate: this.calculateImprovementRate(rawData),
      consistencyScore: this.calculateConsistencyScore(rawData),
      subjectBreakdown: this.calculateSubjectBreakdown(rawData),
      trends: this.analyzeTrends(rawData),
      predictions: this.generatePredictions(rawData),
      recommendations: this.generateRecommendations(rawData)
    };

    this.metrics.set(`${userId}_${period}`, metrics);
    this.saveToLocalStorage();
    
    return metrics;
  }

  // Coletar dados do usuário
  private async collectUserData(userId: string, startDate: Date, endDate: Date): Promise<any> {
    // Simular dados (em produção, viria de APIs reais)
    return {
      questionsAnswered: Math.floor(Math.random() * 100) + 50,
      correctAnswers: Math.floor(Math.random() * 80) + 30,
      averageResponseTime: Math.floor(Math.random() * 120) + 60,
      studySessions: this.generateStudySessions(startDate, endDate),
      subjectData: this.generateSubjectData(),
      moodData: this.generateMoodData(startDate, endDate),
      goalData: this.generateGoalData()
    };
  }

  // Gerar sessões de estudo simuladas
  private generateStudySessions(startDate: Date, endDate: Date): any[] {
    const sessions = [];
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const sessionCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < sessionCount; j++) {
        sessions.push({
          date,
          duration: Math.floor(Math.random() * 120) + 30,
          subject: this.getRandomSubject(),
          questions: Math.floor(Math.random() * 20) + 5,
          correct: Math.floor(Math.random() * 15) + 3
        });
      }
    }
    
    return sessions;
  }

  // Gerar dados por matéria
  private generateSubjectData(): any {
    const subjects = ['Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Português'];
    const data: any = {};
    
    subjects.forEach(subject => {
      data[subject] = {
        questionsAnswered: Math.floor(Math.random() * 50) + 10,
        correctAnswers: Math.floor(Math.random() * 40) + 5,
        timeSpent: Math.floor(Math.random() * 300) + 60,
        weakTopics: this.generateWeakTopics(subject),
        strongTopics: this.generateStrongTopics(subject),
        lastStudied: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        studyStreak: Math.floor(Math.random() * 10)
      };
    });
    
    return data;
  }

  // Gerar dados de humor
  private generateMoodData(startDate: Date, endDate: Date): any[] {
    const moodData = [];
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      moodData.push({
        date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
        mood: Math.random() * 5 + 1,
        energy: Math.random() * 5 + 1,
        stress: Math.random() * 5 + 1,
        motivation: Math.random() * 5 + 1
      });
    }
    
    return moodData;
  }

  // Gerar dados de metas
  private generateGoalData(): any {
    return {
      totalGoals: Math.floor(Math.random() * 10) + 5,
      completedGoals: Math.floor(Math.random() * 8) + 2,
      activeGoals: Math.floor(Math.random() * 5) + 1,
      averageProgress: Math.random() * 100
    };
  }

  // Calcular pontuação geral
  private calculateOverallScore(data: any): number {
    const accuracy = data.correctAnswers / data.questionsAnswered;
    const timeBonus = Math.max(0, 1 - (data.averageResponseTime - 60) / 120);
    return Math.round((accuracy * 0.7 + timeBonus * 0.3) * 1000);
  }

  // Calcular tempo de estudo
  private calculateStudyTime(data: any): number {
    return data.studySessions.reduce((total: number, session: any) => total + session.duration, 0);
  }

  // Calcular taxa de melhoria
  private calculateImprovementRate(data: any): number {
    // Simular cálculo de melhoria baseado em dados históricos
    return Math.random() * 20 - 10; // -10% a +10%
  }

  // Calcular pontuação de consistência
  private calculateConsistencyScore(data: any): number {
    const dailyScores = data.studySessions.map((session: any) => 
      session.correct / session.questions
    );
    
    if (dailyScores.length === 0) return 0;
    
    const mean = dailyScores.reduce((sum: number, score: number) => sum + score, 0) / dailyScores.length;
    const variance = dailyScores.reduce((sum: number, score: number) => 
      sum + Math.pow(score - mean, 2), 0) / dailyScores.length;
    
    return Math.max(0, 100 - Math.sqrt(variance) * 100);
  }

  // Calcular breakdown por matéria
  private calculateSubjectBreakdown(data: any): Map<string, SubjectMetrics> {
    const breakdown = new Map<string, SubjectMetrics>();
    
    Object.entries(data.subjectData).forEach(([subject, subjectData]: [string, any]) => {
      breakdown.set(subject, {
        subject,
        questionsAnswered: subjectData.questionsAnswered,
        correctAnswers: subjectData.correctAnswers,
        accuracyRate: subjectData.correctAnswers / subjectData.questionsAnswered,
        averageScore: this.calculateOverallScore({ 
          correctAnswers: subjectData.correctAnswers, 
          questionsAnswered: subjectData.questionsAnswered,
          averageResponseTime: 90 
        }),
        timeSpent: subjectData.timeSpent,
        improvementRate: Math.random() * 20 - 10,
        weakTopics: subjectData.weakTopics,
        strongTopics: subjectData.strongTopics,
        difficultyDistribution: this.generateDifficultyDistribution(),
        lastStudied: subjectData.lastStudied,
        studyStreak: subjectData.studyStreak
      });
    });
    
    return breakdown;
  }

  // Analisar tendências
  private analyzeTrends(data: any): TrendAnalysis {
    return {
      overall: this.determineTrend(data.accuracyRate),
      studyTime: this.determineTrend(data.studyTime),
      accuracy: this.determineTrend(data.accuracyRate),
      consistency: this.determineTrend(data.consistencyScore),
      confidence: this.determineTrend(data.moodData?.averageMotivation || 3),
      velocity: Math.random() * 2 - 1,
      acceleration: Math.random() * 0.5 - 0.25,
      seasonality: {
        bestDay: 'Terça-feira',
        bestHour: 14,
        worstDay: 'Segunda-feira',
        worstHour: 8
      }
    };
  }

  // Determinar tendência
  private determineTrend(value: number): 'improving' | 'stable' | 'declining' {
    const change = Math.random() * 0.2 - 0.1; // -10% a +10%
    if (change > 0.05) return 'improving';
    if (change < -0.05) return 'declining';
    return 'stable';
  }

  // Gerar previsões
  private generatePredictions(data: any): PredictionData {
    const currentScore = this.calculateOverallScore(data);
    const targetScore = 800;
    const improvementRate = Math.max(0.1, data.improvementRate / 100);
    
    return {
      predictedENEMScore: Math.min(1000, currentScore + improvementRate * 30),
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      timeToTarget: Math.max(30, (targetScore - currentScore) / (improvementRate * 10)),
      probabilityOfSuccess: Math.min(0.95, currentScore / 1000 + improvementRate * 0.1),
      riskFactors: this.generateRiskFactors(data),
      opportunities: this.generateOpportunities(data),
      milestones: this.generateMilestones(currentScore, targetScore)
    };
  }

  // Gerar recomendações
  private generateRecommendations(data: any): string[] {
    const recommendations = [];
    
    if (data.accuracyRate < 0.6) {
      recommendations.push('Foque em revisar conceitos básicos');
    }
    
    if (data.averageResponseTime > 120) {
      recommendations.push('Pratique mais para aumentar a velocidade');
    }
    
    if (data.consistencyScore < 70) {
      recommendations.push('Mantenha uma rotina de estudos mais consistente');
    }
    
    recommendations.push('Continue praticando simulados regularmente');
    recommendations.push('Analise seus erros para identificar padrões');
    
    return recommendations;
  }

  // Gerar insights de aprendizado
  async generateLearningInsights(userId: string): Promise<LearningInsights> {
    const metrics = await this.calculatePerformanceMetrics(userId);
    
    const insights: LearningInsights = {
      learningStyle: this.determineLearningStyle(metrics),
      optimalStudyTime: this.calculateOptimalStudyTime(metrics),
      preferredDifficulty: this.determinePreferredDifficulty(metrics),
      retentionRate: this.calculateRetentionRate(metrics),
      forgettingCurve: this.calculateForgettingCurve(metrics),
      knowledgeGaps: this.identifyKnowledgeGaps(metrics),
      masteryLevel: this.calculateMasteryLevel(metrics)
    };
    
    this.insights.set(userId, insights);
    return insights;
  }

  // Determinar estilo de aprendizado
  private determineLearningStyle(metrics: PerformanceMetrics): 'visual' | 'auditory' | 'kinesthetic' | 'reading' {
    // Simular análise baseada em padrões de estudo
    const styles = ['visual', 'auditory', 'kinesthetic', 'reading'];
    return styles[Math.floor(Math.random() * styles.length)] as any;
  }

  // Calcular horário ótimo de estudo
  private calculateOptimalStudyTime(metrics: PerformanceMetrics): { start: string; end: string; duration: number } {
    return {
      start: '14:00',
      end: '18:00',
      duration: 120
    };
  }

  // Determinar dificuldade preferida
  private determinePreferredDifficulty(metrics: PerformanceMetrics): 'easy' | 'medium' | 'hard' {
    if (metrics.accuracyRate > 0.8) return 'hard';
    if (metrics.accuracyRate > 0.6) return 'medium';
    return 'easy';
  }

  // Calcular taxa de retenção
  private calculateRetentionRate(metrics: PerformanceMetrics): number {
    return Math.random() * 0.4 + 0.6; // 60-100%
  }

  // Calcular curva do esquecimento
  private calculateForgettingCurve(metrics: PerformanceMetrics): { day1: number; day3: number; day7: number; day30: number } {
    return {
      day1: 0.9,
      day3: 0.7,
      day7: 0.5,
      day30: 0.3
    };
  }

  // Identificar lacunas de conhecimento
  private identifyKnowledgeGaps(metrics: PerformanceMetrics): { subject: string; topic: string; severity: 'low' | 'medium' | 'high'; impact: number }[] {
    const gaps = [];
    
    metrics.subjectBreakdown.forEach((subjectMetrics, subject) => {
      if (subjectMetrics.accuracyRate < 0.6) {
        gaps.push({
          subject,
          topic: subjectMetrics.weakTopics[0] || 'Conceitos gerais',
          severity: subjectMetrics.accuracyRate < 0.4 ? 'high' : 'medium',
          impact: (0.6 - subjectMetrics.accuracyRate) * 100
        });
      }
    });
    
    return gaps;
  }

  // Calcular nível de domínio
  private calculateMasteryLevel(metrics: PerformanceMetrics): Map<string, number> {
    const mastery = new Map<string, number>();
    
    metrics.subjectBreakdown.forEach((subjectMetrics, subject) => {
      mastery.set(subject, Math.round(subjectMetrics.accuracyRate * 100));
    });
    
    return mastery;
  }

  // Gerar relatório
  async generateReport(
    userId: string, 
    type: 'performance' | 'progress' | 'insights' | 'predictions' | 'comparative',
    period: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<ReportData> {
    const metrics = await this.calculatePerformanceMetrics(userId, period);
    const insights = await this.generateLearningInsights(userId);
    
    const report: ReportData = {
      id: this.generateId(),
      type,
      title: this.getReportTitle(type, period),
      description: this.getReportDescription(type, period),
      generatedAt: new Date(),
      period,
      data: { metrics, insights },
      visualizations: this.generateVisualizations(type, metrics, insights),
      insights: this.generateReportInsights(type, metrics, insights),
      recommendations: this.generateReportRecommendations(type, metrics, insights),
      isScheduled: false
    };
    
    this.reports.push(report);
    this.saveToLocalStorage();
    
    return report;
  }

  // Obter título do relatório
  private getReportTitle(type: string, period: string): string {
    const titles: Record<string, Record<string, string>> = {
      performance: {
        day: 'Relatório de Performance - Hoje',
        week: 'Relatório de Performance - Esta Semana',
        month: 'Relatório de Performance - Este Mês',
        year: 'Relatório de Performance - Este Ano'
      },
      progress: {
        day: 'Relatório de Progresso - Hoje',
        week: 'Relatório de Progresso - Esta Semana',
        month: 'Relatório de Progresso - Este Mês',
        year: 'Relatório de Progresso - Este Ano'
      },
      insights: {
        day: 'Insights de Aprendizado - Hoje',
        week: 'Insights de Aprendizado - Esta Semana',
        month: 'Insights de Aprendizado - Este Mês',
        year: 'Insights de Aprendizado - Este Ano'
      },
      predictions: {
        day: 'Previsões - Hoje',
        week: 'Previsões - Esta Semana',
        month: 'Previsões - Este Mês',
        year: 'Previsões - Este Ano'
      },
      comparative: {
        day: 'Análise Comparativa - Hoje',
        week: 'Análise Comparativa - Esta Semana',
        month: 'Análise Comparativa - Este Mês',
        year: 'Análise Comparativa - Este Ano'
      }
    };
    
    return titles[type]?.[period] || 'Relatório';
  }

  // Obter descrição do relatório
  private getReportDescription(type: string, period: string): string {
    const descriptions: Record<string, string> = {
      performance: 'Análise detalhada do seu desempenho acadêmico',
      progress: 'Acompanhamento do seu progresso de estudos',
      insights: 'Insights personalizados sobre seu estilo de aprendizado',
      predictions: 'Previsões baseadas em IA sobre seu desempenho futuro',
      comparative: 'Comparação com outros estudantes e benchmarks'
    };
    
    return descriptions[type] || 'Relatório personalizado';
  }

  // Gerar visualizações
  private generateVisualizations(type: string, metrics: PerformanceMetrics, insights: LearningInsights): VisualizationConfig[] {
    const visualizations: VisualizationConfig[] = [];
    
    if (type === 'performance') {
      visualizations.push({
        type: 'line',
        title: 'Evolução da Pontuação',
        data: this.generateScoreEvolutionData(metrics),
        options: { responsive: true },
        position: { x: 0, y: 0, width: 6, height: 4 }
      });
      
      visualizations.push({
        type: 'radar',
        title: 'Performance por Matéria',
        data: this.generateSubjectRadarData(metrics),
        options: { responsive: true },
        position: { x: 6, y: 0, width: 6, height: 4 }
      });
    }
    
    if (type === 'insights') {
      visualizations.push({
        type: 'gauge',
        title: 'Taxa de Retenção',
        data: { value: insights.retentionRate * 100, max: 100 },
        options: { responsive: true },
        position: { x: 0, y: 0, width: 4, height: 4 }
      });
    }
    
    return visualizations;
  }

  // Gerar dados de evolução da pontuação
  private generateScoreEvolutionData(metrics: PerformanceMetrics): any {
    const days = Math.ceil((metrics.endDate.getTime() - metrics.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const data = [];
    
    for (let i = 0; i < days; i++) {
      data.push({
        date: new Date(metrics.startDate.getTime() + i * 24 * 60 * 60 * 1000),
        score: metrics.overallScore + Math.random() * 100 - 50
      });
    }
    
    return data;
  }

  // Gerar dados de radar por matéria
  private generateSubjectRadarData(metrics: PerformanceMetrics): any {
    const subjects = Array.from(metrics.subjectBreakdown.keys());
    const scores = subjects.map(subject => {
      const subjectMetrics = metrics.subjectBreakdown.get(subject)!;
      return subjectMetrics.accuracyRate * 100;
    });
    
    return {
      labels: subjects,
      datasets: [{
        label: 'Precisão (%)',
        data: scores,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)'
      }]
    };
  }

  // Gerar insights do relatório
  private generateReportInsights(type: string, metrics: PerformanceMetrics, insights: LearningInsights): string[] {
    const insights_list = [];
    
    if (type === 'performance') {
      insights_list.push(`Sua pontuação geral é ${metrics.overallScore} pontos`);
      insights_list.push(`Taxa de acerto de ${Math.round(metrics.accuracyRate * 100)}%`);
      insights_list.push(`Tempo médio de resposta: ${Math.round(metrics.averageResponseTime)} segundos`);
    }
    
    if (type === 'insights') {
      insights_list.push(`Seu estilo de aprendizado é ${insights.learningStyle}`);
      insights_list.push(`Taxa de retenção de ${Math.round(insights.retentionRate * 100)}%`);
      insights_list.push(`Horário ótimo para estudar: ${insights.optimalStudyTime.start} às ${insights.optimalStudyTime.end}`);
    }
    
    return insights_list;
  }

  // Gerar recomendações do relatório
  private generateReportRecommendations(type: string, metrics: PerformanceMetrics, insights: LearningInsights): string[] {
    const recommendations = [];
    
    if (metrics.accuracyRate < 0.7) {
      recommendations.push('Foque em revisar conceitos fundamentais');
    }
    
    if (metrics.consistencyScore < 80) {
      recommendations.push('Mantenha uma rotina de estudos mais regular');
    }
    
    recommendations.push('Continue praticando simulados semanalmente');
    recommendations.push('Analise seus erros para identificar padrões');
    
    return recommendations;
  }

  // Obter relatórios
  getReports(userId?: string): ReportData[] {
    if (userId) {
      return this.reports.filter(report => report.data.metrics?.userId === userId);
    }
    return this.reports;
  }

  // Obter métricas
  getMetrics(userId: string, period: string): PerformanceMetrics | undefined {
    return this.metrics.get(`${userId}_${period}`);
  }

  // Obter insights
  getInsights(userId: string): LearningInsights | undefined {
    return this.insights.get(userId);
  }

  // Gerar funções auxiliares
  private getStartDate(period: string, endDate: Date): Date {
    const startDate = new Date(endDate);
    
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    return startDate;
  }

  private getRandomSubject(): string {
    const subjects = ['Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Português'];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  private generateWeakTopics(subject: string): string[] {
    const topics: Record<string, string[]> = {
      'Matemática': ['Álgebra', 'Geometria', 'Funções'],
      'Física': ['Mecânica', 'Termodinâmica', 'Eletricidade'],
      'Química': ['Química Geral', 'Orgânica', 'Inorgânica'],
      'Biologia': ['Citologia', 'Genética', 'Ecologia'],
      'História': ['História do Brasil', 'História Geral'],
      'Geografia': ['Geografia Física', 'Geografia Humana'],
      'Português': ['Gramática', 'Literatura', 'Interpretação']
    };
    
    return topics[subject]?.slice(0, Math.floor(Math.random() * 2) + 1) || [];
  }

  private generateStrongTopics(subject: string): string[] {
    const topics: Record<string, string[]> = {
      'Matemática': ['Aritmética', 'Estatística'],
      'Física': ['Óptica', 'Ondas'],
      'Química': ['Físico-química'],
      'Biologia': ['Evolução', 'Fisiologia'],
      'História': ['Atualidades'],
      'Geografia': ['Geografia do Brasil'],
      'Português': ['Redação']
    };
    
    return topics[subject]?.slice(0, Math.floor(Math.random() * 2) + 1) || [];
  }

  private generateDifficultyDistribution(): Map<string, number> {
    const distribution = new Map<string, number>();
    distribution.set('easy', Math.floor(Math.random() * 40) + 20);
    distribution.set('medium', Math.floor(Math.random() * 40) + 30);
    distribution.set('hard', Math.floor(Math.random() * 30) + 10);
    return distribution;
  }

  private generateRiskFactors(data: any): string[] {
    return ['Falta de consistência', 'Dificuldade em matemática', 'Tempo limitado'];
  }

  private generateOpportunities(data: any): string[] {
    return ['Foco em simulados', 'Revisão de conceitos básicos', 'Prática de redação'];
  }

  private generateMilestones(currentScore: number, targetScore: number): any[] {
    const milestones = [];
    const steps = 4;
    const increment = (targetScore - currentScore) / steps;
    
    for (let i = 1; i <= steps; i++) {
      milestones.push({
        date: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000),
        expectedScore: Math.round(currentScore + increment * i),
        description: `Meta ${i}: ${Math.round(currentScore + increment * i)} pontos`
      });
    }
    
    return milestones;
  }

  // Salvar no localStorage
  private saveToLocalStorage(): void {
    localStorage.setItem('enem_pro_analytics_metrics', JSON.stringify(Array.from(this.metrics.entries())));
    localStorage.setItem('enem_pro_analytics_reports', JSON.stringify(this.reports));
    localStorage.setItem('enem_pro_analytics_insights', JSON.stringify(Array.from(this.insights.entries())));
  }

  // Carregar do localStorage
  private loadFromLocalStorage(): void {
    const savedMetrics = localStorage.getItem('enem_pro_analytics_metrics');
    const savedReports = localStorage.getItem('enem_pro_analytics_reports');
    const savedInsights = localStorage.getItem('enem_pro_analytics_insights');
    
    if (savedMetrics) {
      try {
        const metricsArray = JSON.parse(savedMetrics);
        if (Array.isArray(metricsArray)) {
          this.metrics = new Map(metricsArray.map(([key, value]: [string, any]) => [
            key,
            {
              ...value,
              startDate: new Date(value.startDate),
              endDate: new Date(value.endDate),
              subjectBreakdown: new Map(Object.entries(value.subjectBreakdown || {}))
            }
          ]));
        }
      } catch (e) {
        console.error("Failed to parse metrics from localStorage", e);
        this.metrics = new Map();
      }
    }
    
    if (savedReports) {
      try {
        const reportsArray = JSON.parse(savedReports);
        if (Array.isArray(reportsArray)) {
          this.reports = reportsArray.map((report: any) => ({
            ...report,
            generatedAt: new Date(report.generatedAt),
            nextGeneration: report.nextGeneration ? new Date(report.nextGeneration) : undefined
          }));
        }
      } catch (e) {
        console.error("Failed to parse reports from localStorage", e);
        this.reports = [];
      }
    }
    
    if (savedInsights) {
      try {
        const insightsArray = JSON.parse(savedInsights);
        if (Array.isArray(insightsArray)) {
          this.insights = new Map(insightsArray.map(([key, value]: [string, any]) => [
            key,
            {
              ...value,
              forgettingCurve: value.forgettingCurve,
              knowledgeGaps: value.knowledgeGaps,
              masteryLevel: new Map(Object.entries(value.masteryLevel || {}))
            }
          ]));
        }
      } catch(e) {
        console.error("Failed to parse insights from localStorage", e);
        this.insights = new Map();
      }
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default AdvancedAnalyticsService;
