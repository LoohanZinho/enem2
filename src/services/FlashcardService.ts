// Sistema de Flashcards Inteligentes para ENEM Pro
// Algoritmo de repetição espaçada e personalização baseada em performance

import { userDataService, UserData } from './UserDataService';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: Date;
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  easeFactor: number;
  interval: number;
  quality: number; // 0-5 scale
  isActive: boolean;
  media?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    alt?: string;
  }[];
}

export interface StudySession {
  id: string;
  subject: string;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number; // em minutos
  startedAt: Date;
  completedAt?: Date;
  averageResponseTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudyStats {
  totalCards: number;
  cardsStudied: number;
  correctRate: number;
  averageResponseTime: number;
  streak: number;
  longestStreak: number;
  lastStudyDate?: Date;
  subjectStats: Map<string, {
    totalCards: number;
    studied: number;
    correctRate: number;
    averageTime: number;
  }>;
}

export interface StudyPlan {
  id: string;
  name: string;
  subject: string;
  targetCards: number;
  dailyGoal: number;
  estimatedDays: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  progress: number;
}

export class FlashcardService {
  private static instance: FlashcardService;
  private flashcards: Map<string, Flashcard> = new Map();
  private studySessions: StudySession[] = [];
  private studyPlans: StudyPlan[] = [];
  private currentSession: StudySession | null = null;

  static getInstance(): FlashcardService {
    if (!FlashcardService.instance) {
      FlashcardService.instance = new FlashcardService();
    }
    return FlashcardService.instance;
  }

  constructor() {
    this.loadUserData();
  }

  // Carregar dados do usuário
  private async loadUserData(): Promise<void> {
    const userData = await userDataService.loadUserData();
    if (userData && userData.flashcards && userData.flashcards.length > 0) {
      // Carregar flashcards
      this.flashcards.clear();
      userData.flashcards.forEach(card => {
        this.flashcards.set(card.id, {
          ...card,
          createdAt: new Date(card.createdAt),
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
          nextReview: card.nextReview ? new Date(card.nextReview) : undefined
        });
      });

      // Carregar sessões de estudo
      this.studySessions = (userData.studySessions || []).map(session => ({
        ...session,
        startedAt: new Date(session.startedAt),
        completedAt: session.completedAt ? new Date(session.completedAt) : undefined
      }));

      // Carregar planos de estudo
      this.studyPlans = (userData.goals || []).map(goal => ({
        ...goal,
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate)
      }));
    } else {
      // Se não há dados do usuário, inicializar com dados de exemplo
      this.initializeSampleData();
    }
  }

  // Salvar dados do usuário
  private saveUserData(): void {
    const flashcards = Array.from(this.flashcards.values());
    const goals = this.studyPlans;

    userDataService.updateUserData({
      flashcards,
      studySessions: this.studySessions,
      goals
    });
  }

  // Inicializar dados de exemplo (apenas para demonstração)
  private initializeSampleData(): void {
    const sampleCards: Flashcard[] = [
      {
        id: 'card1',
        front: 'Qual é a fórmula da área do círculo?',
        back: 'A = πr², onde r é o raio do círculo',
        subject: 'Matemática',
        topic: 'Geometria',
        difficulty: 'easy',
        tags: ['geometria', 'área', 'círculo'],
        createdAt: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true
      },
      {
        id: 'card2',
        front: 'O que é a Lei de Ohm?',
        back: 'V = R × I, onde V é tensão, R é resistência e I é corrente elétrica',
        subject: 'Física',
        topic: 'Eletricidade',
        difficulty: 'medium',
        tags: ['física', 'eletricidade', 'lei de ohm'],
        createdAt: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true
      },
      {
        id: 'card3',
        front: 'Quais são as principais características do Romantismo brasileiro?',
        back: 'Nacionalismo, subjetivismo, idealização da natureza, valorização do passado histórico e do folclore',
        subject: 'Literatura',
        topic: 'Romantismo',
        difficulty: 'hard',
        tags: ['literatura', 'romantismo', 'brasil'],
        createdAt: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true
      },
      {
        id: 'card4',
        front: 'O que é fotossíntese?',
        back: 'Processo pelo qual plantas convertem luz solar, CO₂ e água em glicose e oxigênio',
        subject: 'Biologia',
        topic: 'Fisiologia Vegetal',
        difficulty: 'medium',
        tags: ['biologia', 'fotossíntese', 'plantas'],
        createdAt: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true
      },
      {
        id: 'card5',
        front: 'Qual foi o período da Revolução Francesa?',
        back: '1789-1799, marcando o fim do Antigo Regime e início da era moderna',
        subject: 'História',
        topic: 'Revolução Francesa',
        difficulty: 'easy',
        tags: ['história', 'revolução francesa', 'século XVIII'],
        createdAt: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true
      }
    ];

    sampleCards.forEach(card => {
      this.flashcards.set(card.id, card);
    });
    this.saveUserData();
  }

  // Obter flashcards por matéria
  getFlashcardsBySubject(subject: string): Flashcard[] {
    return Array.from(this.flashcards.values())
      .filter(card => card.subject === subject && card.isActive);
  }

  // Obter flashcards para revisão (algoritmo de repetição espaçada)
  getCardsForReview(subject?: string): Flashcard[] {
    const now = new Date();
    const cards = Array.from(this.flashcards.values())
      .filter(card => {
        if (!card.isActive) return false;
        if (subject && card.subject !== subject) return false;
        return !card.nextReview || card.nextReview <= now;
      });

    // Ordenar por prioridade (cards mais difíceis primeiro)
    return cards.sort((a, b) => {
      const aPriority = this.calculatePriority(a);
      const bPriority = this.calculatePriority(b);
      return bPriority - aPriority;
    });
  }

  // Calcular prioridade do card
  private calculatePriority(card: Flashcard): number {
    let priority = 0;
    
    // Cards nunca estudados têm prioridade máxima
    if (card.reviewCount === 0) return 1000;
    
    // Cards com baixa taxa de acerto
    const accuracy = card.correctCount / (card.correctCount + card.incorrectCount);
    priority += (1 - accuracy) * 100;
    
    // Cards com dificuldade alta
    if (card.difficulty === 'hard') priority += 50;
    else if (card.difficulty === 'medium') priority += 25;
    
    // Cards há muito tempo sem revisão
    if (card.lastReviewed) {
      const daysSinceReview = (Date.now() - card.lastReviewed.getTime()) / (1000 * 60 * 60 * 24);
      priority += daysSinceReview * 10;
    }
    
    return priority;
  }

  // Iniciar sessão de estudo
  startStudySession(subject: string, difficulty?: 'easy' | 'medium' | 'hard'): StudySession {
    const session: StudySession = {
      id: this.generateId(),
      subject,
      cardsStudied: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      timeSpent: 0,
      startedAt: new Date(),
      averageResponseTime: 0,
      difficulty: difficulty || 'medium'
    };

    this.currentSession = session;
    this.studySessions.push(session);
    this.saveUserData(); // Salvar automaticamente
    return session;
  }

  // Finalizar sessão de estudo
  endStudySession(): StudySession | null {
    if (!this.currentSession) return null;

    this.currentSession.completedAt = new Date();
    this.currentSession.timeSpent = 
      (this.currentSession.completedAt.getTime() - this.currentSession.startedAt.getTime()) / (1000 * 60);

    const session = this.currentSession;
    this.currentSession = null;
    this.saveUserData(); // Salvar automaticamente
    return session;
  }

  // Responder a um card
  answerCard(cardId: string, quality: number, responseTime: number): void {
    const card = this.flashcards.get(cardId);
    if (!card || !this.currentSession) return;

    // Atualizar estatísticas do card
    card.reviewCount++;
    card.lastReviewed = new Date();
    card.quality = quality;

    if (quality >= 3) {
      card.correctCount++;
    } else {
      card.incorrectCount++;
    }

    // Atualizar sessão atual
    this.currentSession.cardsStudied++;
    if (quality >= 3) {
      this.currentSession.correctAnswers++;
    } else {
      this.currentSession.incorrectAnswers++;
    }

    // Calcular tempo médio de resposta
    const totalTime = this.currentSession.averageResponseTime * (this.currentSession.cardsStudied - 1) + responseTime;
    this.currentSession.averageResponseTime = totalTime / this.currentSession.cardsStudied;

    // Aplicar algoritmo de repetição espaçada (SM-2)
    this.updateCardSchedule(card, quality);
    
    // Salvar dados após cada resposta
    this.saveUserData();
  }

  // Atualizar cronograma do card (algoritmo SM-2)
  private updateCardSchedule(card: Flashcard, quality: number): void {
    if (quality < 3) {
      // Resposta incorreta - reiniciar
      card.interval = 1;
      card.reviewCount = 0;
    } else {
      // Resposta correta
      if (card.reviewCount === 1) {
        card.interval = 1;
      } else if (card.reviewCount === 2) {
        card.interval = 6;
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }

      // Atualizar fator de facilidade
      card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      card.easeFactor = Math.max(1.3, card.easeFactor);
    }

    // Definir próxima revisão
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + card.interval);
    card.nextReview = nextReview;
  }

  // Criar novo flashcard
  createFlashcard(flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'reviewCount' | 'correctCount' | 'incorrectCount' | 'easeFactor' | 'interval' | 'quality' | 'isActive'>): Flashcard {
    const newCard: Flashcard = {
      ...flashcard,
      id: this.generateId(),
      createdAt: new Date(),
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      easeFactor: 2.5,
      interval: 1,
      quality: 0,
      isActive: true
    };

    this.flashcards.set(newCard.id, newCard);
    this.saveUserData(); // Salvar automaticamente
    return newCard;
  }

  // Atualizar flashcard
  updateFlashcard(id: string, updates: Partial<Flashcard>): boolean {
    const card = this.flashcards.get(id);
    if (!card) return false;

    Object.assign(card, updates);
    this.saveUserData(); // Salvar automaticamente
    return true;
  }

  // Deletar flashcard
  deleteFlashcard(id: string): boolean {
    const deleted = this.flashcards.delete(id);
    if (deleted) {
      this.saveUserData(); // Salvar automaticamente
    }
    return deleted;
  }

  // Obter estatísticas de estudo
  getStudyStats(subject?: string): StudyStats {
    const allCards = Array.from(this.flashcards.values());
    const filteredCards = subject ? allCards.filter(card => card.subject === subject) : allCards;
    
    const totalCards = filteredCards.length;
    const cardsStudied = filteredCards.filter(card => card.reviewCount > 0).length;
    const correctRate = cardsStudied > 0 ? 
      filteredCards.reduce((sum, card) => sum + card.correctCount, 0) / 
      filteredCards.reduce((sum, card) => sum + card.correctCount + card.incorrectCount, 0) : 0;

    const averageResponseTime = this.studySessions.length > 0 ?
      this.studySessions.reduce((sum, session) => sum + session.averageResponseTime, 0) / this.studySessions.length : 0;

    // Calcular sequência
    const streak = this.calculateStreak();
    const longestStreak = this.calculateLongestStreak();

    // Estatísticas por matéria
    const subjectStats = new Map<string, any>();
    const subjects = [...new Set(allCards.map(card => card.subject))];
    
    subjects.forEach(subj => {
      const subjectCards = allCards.filter(card => card.subject === subj);
      const subjectStudied = subjectCards.filter(card => card.reviewCount > 0).length;
      const subjectCorrectRate = subjectStudied > 0 ?
        subjectCards.reduce((sum, card) => sum + card.correctCount, 0) / 
        subjectCards.reduce((sum, card) => sum + card.correctCount + card.incorrectCount, 0) : 0;
      
      const subjectSessions = this.studySessions.filter(session => session.subject === subj);
      const subjectAverageTime = subjectSessions.length > 0 ?
        subjectSessions.reduce((sum, session) => sum + session.averageResponseTime, 0) / subjectSessions.length : 0;

      subjectStats.set(subj, {
        totalCards: subjectCards.length,
        studied: subjectStudied,
        correctRate: subjectCorrectRate,
        averageTime: subjectAverageTime
      });
    });

    return {
      totalCards,
      cardsStudied,
      correctRate,
      averageResponseTime,
      streak,
      longestStreak,
      lastStudyDate: this.studySessions.length > 0 ? 
        this.studySessions[this.studySessions.length - 1].completedAt : undefined,
      subjectStats
    };
  }

  // Calcular sequência atual
  private calculateStreak(): number {
    if (this.studySessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    const currentDate = new Date(today);
    
    for (let i = this.studySessions.length - 1; i >= 0; i--) {
      const session = this.studySessions[i];
      if (!session.completedAt) continue;
      
      const sessionDate = new Date(session.completedAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    return streak;
  }

  // Calcular maior sequência
  private calculateLongestStreak(): number {
    if (this.studySessions.length === 0) return 0;

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const session of this.studySessions) {
      if (!session.completedAt) continue;
      
      const sessionDate = new Date(session.completedAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (!lastDate) {
        currentStreak = 1;
      } else {
        const dayDiff = (lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
        if (dayDiff === 1) {
          currentStreak++;
        } else if (dayDiff > 1) {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      
      lastDate = sessionDate;
    }
    
    return Math.max(maxStreak, currentStreak);
  }

  // Criar plano de estudo
  createStudyPlan(plan: Omit<StudyPlan, 'id' | 'progress'>): StudyPlan {
    const newPlan: StudyPlan = {
      ...plan,
      id: this.generateId(),
      progress: 0
    };

    this.studyPlans.push(newPlan);
    this.saveUserData(); // Salvar automaticamente
    return newPlan;
  }

  // Obter planos de estudo
  getStudyPlans(): StudyPlan[] {
    return this.studyPlans;
  }

  // Obter sessões de estudo
  getStudySessions(): StudySession[] {
    return this.studySessions;
  }

  // Obter sessão atual
  getCurrentSession(): StudySession | null {
    return this.currentSession;
  }

  // Gerar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default FlashcardService;
