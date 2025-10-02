// Serviço centralizado para gerenciar dados isolados por usuário
// Garante que cada usuário tenha seu próprio espaço de dados

import { User } from '@/types/User';
import DatabaseService from './DatabaseService';

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
  private readonly CURRENT_USER_KEY = 'enem_pro_current_user';
  private db = DatabaseService.getInstance();

  static getInstance(): UserDataService {
    if (!UserDataService.instance) {
      UserDataService.instance = new UserDataService();
    }
    return UserDataService.instance;
  }

  // Obter usuário atual
  private getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
      if (!userJson || userJson === 'undefined') return null;
      return JSON.parse(userJson);
    } catch (error) {
      console.error("Erro ao ler usuário do localStorage:", error);
      localStorage.removeItem(this.CURRENT_USER_KEY);
      return null;
    }
  }
  
  private async getUserId(): Promise<string | null> {
      const user = this.getCurrentUser();
      return user ? user.id : null;
  }


  // Carregar dados do usuário atual do Firestore
  async loadUserData(): Promise<UserData | null> {
    const userId = await this.getUserId();
    if (!userId) return null;

    try {
      const data = await this.db.getUserData(userId);
      if (data) {
          // Convert date strings back to Date objects
          const parseDates = (obj: any): any => {
            for (const key in obj) {
              if (typeof obj[key] === 'string') {
                const match = obj[key].match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/);
                if (match) {
                  obj[key] = new Date(obj[key]);
                }
              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                parseDates(obj[key]);
              }
            }
            return obj;
          };
          const parsedData = parseDates(data);
          return {
              ...parsedData,
              createdAt: new Date(parsedData.createdAt),
              updatedAt: new Date(parsedData.updatedAt)
          } as UserData;
      }
      return this.initializeUserData(userId);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return null;
    }
  }

  // Inicializar dados do usuário no Firestore
  async initializeUserData(userId: string): Promise<UserData> {
    const userData: UserData = {
      userId,
      flashcards: [],
      essays: [],
      calendar: [],
      notes: [],
      goals: [],
      moodEntries: [],
      analytics: [],
      gamification: [],
      studySessions: [],
      schedule: [],
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.saveUserData(userData);
    return userData;
  }


  // Salvar dados do usuário no Firestore
  async saveUserData(userData: UserData): Promise<void> {
    const userId = await this.getUserId();
    if (!userId || userId !== userData.userId) return;

    try {
      userData.updatedAt = new Date();
      await this.db.saveUserData(userId, userData);
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
    }
  }

  // Atualizar dados específicos do usuário no Firestore
  async updateUserData(updates: Partial<Omit<UserData, 'userId' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const currentData = await this.loadUserData();
    if (!currentData) return;

    const updatedData: UserData = {
      ...currentData,
      ...updates,
      updatedAt: new Date()
    };

    await this.saveUserData(updatedData);
  }


  // Métodos específicos para o cronograma de estudos
  
  // Salvar cronograma do usuário
  async saveSchedule(schedule: any[]): Promise<void> {
    await this.updateUserData({ schedule });
  }

  // Carregar cronograma do usuário
  async loadSchedule(): Promise<any[]> {
    const userData = await this.loadUserData();
    return userData?.schedule || [];
  }

  // Adicionar atividade ao cronograma
  async addActivity(weekIndex: number, dayIndex: number, activity: any): Promise<void> {
    const userData = await this.loadUserData();
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
    await this.saveUserData(userData);
  }

  // Atualizar atividade no cronograma
  async updateActivity(weekIndex: number, dayIndex: number, activityId: string, updatedActivity: any): Promise<void> {
    const userData = await this.loadUserData();
    if (!userData || !userData.schedule[weekIndex]?.days[dayIndex]?.activities) return;

    const activities = userData.schedule[weekIndex].days[dayIndex].activities;
    const activityIndex = activities.findIndex((a: any) => a.id === activityId);
    
    if (activityIndex !== -1) {
      activities[activityIndex] = { ...activities[activityIndex], ...updatedActivity };
      await this.saveUserData(userData);
    }
  }

  // Excluir atividade do cronograma
  async deleteActivity(weekIndex: number, dayIndex: number, activityId: string): Promise<void> {
    const userData = await this.loadUserData();
    if (!userData || !userData.schedule[weekIndex]?.days[dayIndex]?.activities) return;

    userData.schedule[weekIndex].days[dayIndex].activities = 
      userData.schedule[weekIndex].days[dayIndex].activities.filter((a: any) => a.id !== activityId);
    await this.saveUserData(userData);
  }

  // Métodos específicos para tarefas
  
  // Salvar tarefas do usuário
  async saveTasks(tasks: any[]): Promise<void> {
    await this.updateUserData({ tasks });
  }

  // Carregar tarefas do usuário
  async loadTasks(): Promise<any[]> {
    const userData = await this.loadUserData();
    return userData?.tasks || [];
  }

  // Adicionar tarefa
  async addTask(task: any): Promise<void> {
    const userData = await this.loadUserData();
    if (!userData) return;

    userData.tasks.push(task);
    await this.saveUserData(userData);
  }

  // Atualizar tarefa
  async updateTask(taskId: string, updatedTask: any): Promise<void> {
    const userData = await this.loadUserData();
    if (!userData) return;

    const taskIndex = userData.tasks.findIndex((t: any) => t.id === taskId);
    if (taskIndex !== -1) {
      userData.tasks[taskIndex] = { ...userData.tasks[taskIndex], ...updatedTask };
      await this.saveUserData(userData);
    }
  }

  // Excluir tarefa
  async deleteTask(taskId: string): Promise<void> {
    const userData = await this.loadUserData();
    if (!userData) return;

    userData.tasks = userData.tasks.filter((t: any) => t.id !== taskId);
    await this.saveUserData(userData);
  }

  // Métodos específicos para metas
  async saveGoals(goals: any[]): Promise<void> {
    await this.updateUserData({ goals });
  }

  async loadGoals(): Promise<any[]> {
    const userData = await this.loadUserData();
    return userData?.goals || [];
  }

  // Obter estatísticas do usuário
  async getUserStats(): Promise<any> {
    const userData = await this.loadUserData();
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
