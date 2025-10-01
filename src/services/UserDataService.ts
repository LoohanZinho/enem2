// Serviço centralizado para gerenciar dados isolados por usuário
// Garante que cada usuário tenha seu próprio espaço de dados

import { User } from '@/types/User';

export interface UserData {
  userId: string;
  flashcards: any[];
  essays: any[];
  calendar: any[];
  notes: any[];
  goals: any[];
  moodEntries: any[];
  analytics: any[];
  gamification: any[];
  studySessions: any[];
  schedule: any[]; // Cronograma de estudos
  tasks: any[]; // Tarefas do TaskMonitor
  createdAt: Date;
  updatedAt: Date;
}

export class UserDataService {
  private static instance: UserDataService;
  private readonly STORAGE_PREFIX = 'enem_pro_user_data_';
  private readonly CURRENT_USER_KEY = 'enem_pro_current_user';

  static getInstance(): UserDataService {
    if (!UserDataService.instance) {
      UserDataService.instance = new UserDataService();
    }
    return UserDataService.instance;
  }

  // Obter usuário atual
  private getCurrentUser(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Obter chave de armazenamento para o usuário atual
  private getUserStorageKey(): string | null {
    const user = this.getCurrentUser();
    return user ? `${this.STORAGE_PREFIX}${user.id}` : null;
  }

  // Inicializar dados do usuário (chamado quando usuário faz login)
  initializeUserData(user: User): UserData {
    const userData: UserData = {
      userId: user.id,
      flashcards: [],
      essays: [],
      calendar: [],
      notes: [],
      goals: [],
      moodEntries: [],
      analytics: [],
      gamification: [],
      studySessions: [],
      schedule: [], // Cronograma vazio inicialmente
      tasks: [], // Tarefas vazias inicialmente
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.saveUserData(userData);
    return userData;
  }

  // Carregar dados do usuário atual
  loadUserData(): UserData | null {
    const storageKey = this.getUserStorageKey();
    if (!storageKey) return null;

    try {
      const data = localStorage.getItem(storageKey);
      if (!data) return null;

      const userData = JSON.parse(data);
      return {
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return null;
    }
  }

  // Salvar dados do usuário
  saveUserData(userData: UserData): void {
    const storageKey = this.getUserStorageKey();
    if (!storageKey) return;

    try {
      userData.updatedAt = new Date();
      localStorage.setItem(storageKey, JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
    }
  }

  // Atualizar dados específicos do usuário
  updateUserData(updates: Partial<Omit<UserData, 'userId' | 'createdAt' | 'updatedAt'>>): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedData: UserData = {
      ...currentData,
      ...updates,
      updatedAt: new Date()
    };

    this.saveUserData(updatedData);
  }

  // Adicionar flashcard
  addFlashcard(flashcard: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedFlashcards = [...currentData.flashcards, flashcard];
    this.updateUserData({ flashcards: updatedFlashcards });
  }

  // Atualizar flashcard
  updateFlashcard(id: string, updates: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedFlashcards = currentData.flashcards.map(card => 
      card.id === id ? { ...card, ...updates } : card
    );
    this.updateUserData({ flashcards: updatedFlashcards });
  }

  // Remover flashcard
  removeFlashcard(id: string): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedFlashcards = currentData.flashcards.filter(card => card.id !== id);
    this.updateUserData({ flashcards: updatedFlashcards });
  }

  // Adicionar redação
  addEssay(essay: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedEssays = [...currentData.essays, essay];
    this.updateUserData({ essays: updatedEssays });
  }

  // Atualizar redação
  updateEssay(id: string, updates: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedEssays = currentData.essays.map(essay => 
      essay.id === id ? { ...essay, ...updates } : essay
    );
    this.updateUserData({ essays: updatedEssays });
  }

  // Remover redação
  removeEssay(id: string): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedEssays = currentData.essays.filter(essay => essay.id !== id);
    this.updateUserData({ essays: updatedEssays });
  }

  // Adicionar evento do calendário
  addCalendarEvent(event: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedCalendar = [...currentData.calendar, event];
    this.updateUserData({ calendar: updatedCalendar });
  }

  // Atualizar evento do calendário
  updateCalendarEvent(id: string, updates: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedCalendar = currentData.calendar.map(event => 
      event.id === id ? { ...event, ...updates } : event
    );
    this.updateUserData({ calendar: updatedCalendar });
  }

  // Remover evento do calendário
  removeCalendarEvent(id: string): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedCalendar = currentData.calendar.filter(event => event.id !== id);
    this.updateUserData({ calendar: updatedCalendar });
  }

  // Adicionar anotação
  addNote(note: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedNotes = [...currentData.notes, note];
    this.updateUserData({ notes: updatedNotes });
  }

  // Atualizar anotação
  updateNote(id: string, updates: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedNotes = currentData.notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    );
    this.updateUserData({ notes: updatedNotes });
  }

  // Remover anotação
  removeNote(id: string): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedNotes = currentData.notes.filter(note => note.id !== id);
    this.updateUserData({ notes: updatedNotes });
  }

  // Adicionar meta
  addGoal(goal: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedGoals = [...currentData.goals, goal];
    this.updateUserData({ goals: updatedGoals });
  }

  // Atualizar meta
  updateGoal(id: string, updates: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedGoals = currentData.goals.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    );
    this.updateUserData({ goals: updatedGoals });
  }

  // Remover meta
  removeGoal(id: string): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedGoals = currentData.goals.filter(goal => goal.id !== id);
    this.updateUserData({ goals: updatedGoals });
  }

  // Adicionar entrada de humor
  addMoodEntry(entry: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedMoodEntries = [...currentData.moodEntries, entry];
    this.updateUserData({ moodEntries: updatedMoodEntries });
  }

  // Adicionar sessão de estudo
  addStudySession(session: any): void {
    const currentData = this.loadUserData();
    if (!currentData) return;

    const updatedStudySessions = [...currentData.studySessions, session];
    this.updateUserData({ studySessions: updatedStudySessions });
  }

  // Limpar todos os dados do usuário (para reset)
  clearUserData(): void {
    const storageKey = this.getUserStorageKey();
    if (!storageKey) return;

    localStorage.removeItem(storageKey);
  }

  // Exportar dados do usuário
  exportUserData(): string {
    const userData = this.loadUserData();
    if (!userData) return '';

    return JSON.stringify(userData, null, 2);
  }

  // Importar dados do usuário
  importUserData(jsonData: string): boolean {
    try {
      const userData = JSON.parse(jsonData);
      const currentUser = this.getCurrentUser();
      
      if (!currentUser || userData.userId !== currentUser.id) {
        return false;
      }

      this.saveUserData(userData);
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }

  // Métodos específicos para o cronograma de estudos
  
  // Salvar cronograma do usuário
  saveSchedule(schedule: any[]): void {
    const userData = this.loadUserData();
    if (!userData) return;

    userData.schedule = schedule;
    this.saveUserData(userData);
  }

  // Carregar cronograma do usuário
  loadSchedule(): any[] {
    const userData = this.loadUserData();
    return userData?.schedule || [];
  }

  // Adicionar atividade ao cronograma
  addActivity(weekIndex: number, dayIndex: number, activity: any): void {
    const userData = this.loadUserData();
    if (!userData) return;

    if (!userData.schedule[weekIndex]) {
      userData.schedule[weekIndex] = { days: [] };
    }
    if (!userData.schedule[weekIndex].days[dayIndex]) {
      userData.schedule[weekIndex].days[dayIndex] = { activities: [] };
    }
    if (!userData.schedule[weekIndex].days[dayIndex].activities) {
      userData.schedule[weekIndex].days[dayIndex].activities = [];
    }

    userData.schedule[weekIndex].days[dayIndex].activities.push(activity);
    this.saveUserData(userData);
  }

  // Atualizar atividade no cronograma
  updateActivity(weekIndex: number, dayIndex: number, activityId: string, updatedActivity: any): void {
    const userData = this.loadUserData();
    if (!userData || !userData.schedule[weekIndex]?.days[dayIndex]?.activities) return;

    const activities = userData.schedule[weekIndex].days[dayIndex].activities;
    const activityIndex = activities.findIndex((a: any) => a.id === activityId);
    
    if (activityIndex !== -1) {
      activities[activityIndex] = { ...activities[activityIndex], ...updatedActivity };
      this.saveUserData(userData);
    }
  }

  // Excluir atividade do cronograma
  deleteActivity(weekIndex: number, dayIndex: number, activityId: string): void {
    const userData = this.loadUserData();
    if (!userData || !userData.schedule[weekIndex]?.days[dayIndex]?.activities) return;

    userData.schedule[weekIndex].days[dayIndex].activities = 
      userData.schedule[weekIndex].days[dayIndex].activities.filter((a: any) => a.id !== activityId);
    this.saveUserData(userData);
  }

  // Métodos específicos para tarefas
  
  // Salvar tarefas do usuário
  saveTasks(tasks: any[]): void {
    const userData = this.loadUserData();
    if (!userData) return;

    userData.tasks = tasks;
    this.saveUserData(userData);
  }

  // Carregar tarefas do usuário
  loadTasks(): any[] {
    const userData = this.loadUserData();
    return userData?.tasks || [];
  }

  // Adicionar tarefa
  addTask(task: any): void {
    const userData = this.loadUserData();
    if (!userData) return;

    userData.tasks.push(task);
    this.saveUserData(userData);
  }

  // Atualizar tarefa
  updateTask(taskId: string, updatedTask: any): void {
    const userData = this.loadUserData();
    if (!userData) return;

    const taskIndex = userData.tasks.findIndex((t: any) => t.id === taskId);
    if (taskIndex !== -1) {
      userData.tasks[taskIndex] = { ...userData.tasks[taskIndex], ...updatedTask };
      this.saveUserData(userData);
    }
  }

  // Excluir tarefa
  deleteTask(taskId: string): void {
    const userData = this.loadUserData();
    if (!userData) return;

    userData.tasks = userData.tasks.filter((t: any) => t.id !== taskId);
    this.saveUserData(userData);
  }

  // Obter estatísticas do usuário
  getUserStats(): any {
    const userData = this.loadUserData();
    if (!userData) return null;

    return {
      totalFlashcards: userData.flashcards.length,
      totalEssays: userData.essays.length,
      totalCalendarEvents: userData.calendar.length,
      totalNotes: userData.notes.length,
      totalGoals: userData.goals.length,
      totalMoodEntries: userData.moodEntries.length,
      totalStudySessions: userData.studySessions.length,
      totalScheduleWeeks: userData.schedule.length,
      totalActivities: userData.schedule.reduce((total: number, week: any) => 
        total + (week.days?.reduce((dayTotal: number, day: any) => 
          dayTotal + (day.activities?.length || 0), 0) || 0), 0),
      accountCreatedAt: userData.createdAt,
      lastUpdatedAt: userData.updatedAt
    };
  }
}

export const userDataService = UserDataService.getInstance();

