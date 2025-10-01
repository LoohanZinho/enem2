// Sistema de banco de dados local usando IndexedDB
// Garante isolamento total entre usuários

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Essay {
  id: string;
  userId: string;
  title: string;
  content: string;
  subject: string;
  grade?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  userId: string;
  front: string;
  back: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  subject: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

class DatabaseService {
  private static instance: DatabaseService;
  private db: IDBDatabase | null = null;
  private dbName = 'ENEM_PRO_DATABASE';
  private version = 1;

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private constructor() {
    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Erro ao abrir banco de dados:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Banco de dados inicializado com sucesso');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Tabela de usuários
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('createdAt', 'createdAt');
        }

        // Tabela de redações
        if (!db.objectStoreNames.contains('essays')) {
          const essayStore = db.createObjectStore('essays', { keyPath: 'id' });
          essayStore.createIndex('userId', 'userId');
          essayStore.createIndex('subject', 'subject');
          essayStore.createIndex('createdAt', 'createdAt');
        }

        // Tabela de flashcards
        if (!db.objectStoreNames.contains('flashcards')) {
          const flashcardStore = db.createObjectStore('flashcards', { keyPath: 'id' });
          flashcardStore.createIndex('userId', 'userId');
          flashcardStore.createIndex('subject', 'subject');
          flashcardStore.createIndex('difficulty', 'difficulty');
          flashcardStore.createIndex('createdAt', 'createdAt');
        }

        // Tabela de cronograma
        if (!db.objectStoreNames.contains('schedules')) {
          const scheduleStore = db.createObjectStore('schedules', { keyPath: 'id' });
          scheduleStore.createIndex('userId', 'userId');
          scheduleStore.createIndex('date', 'date');
          scheduleStore.createIndex('subject', 'subject');
          scheduleStore.createIndex('createdAt', 'createdAt');
        }

        // Tabela de anotações
        if (!db.objectStoreNames.contains('notes')) {
          const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
          noteStore.createIndex('userId', 'userId');
          noteStore.createIndex('subject', 'subject');
          noteStore.createIndex('createdAt', 'createdAt');
        }

        console.log('Estrutura do banco de dados criada');
      };
    });
  }

  private async waitForDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      const checkDB = () => {
        if (this.db) {
          resolve(this.db);
        } else {
          setTimeout(checkDB, 100);
        }
      };
      checkDB();
    });
  }

  // ===== OPERAÇÕES DE USUÁRIO =====

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');

    const user: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(user);
      request.onsuccess = () => resolve(user);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    const index = store.index('email');

    return new Promise((resolve, reject) => {
      const request = index.get(email);
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(userId);
      getRequest.onsuccess = () => {
        const user = getRequest.result;
        if (!user) {
          reject(new Error('Usuário não encontrado'));
          return;
        }

        const updatedUser = {
          ...user,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        const putRequest = store.put(updatedUser);
        putRequest.onsuccess = () => resolve(updatedUser);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ===== OPERAÇÕES DE REDAÇÕES =====

  async createEssay(userId: string, essayData: Omit<Essay, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Essay> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['essays'], 'readwrite');
    const store = transaction.objectStore('essays');

    const essay: Essay = {
      ...essayData,
      id: Date.now().toString(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(essay);
      request.onsuccess = () => resolve(essay);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserEssays(userId: string): Promise<Essay[]> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['essays'], 'readonly');
    const store = transaction.objectStore('essays');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const essays = request.result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        resolve(essays);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateEssay(userId: string, essayId: string, updates: Partial<Essay>): Promise<Essay> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['essays'], 'readwrite');
    const store = transaction.objectStore('essays');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(essayId);
      getRequest.onsuccess = () => {
        const essay = getRequest.result;
        if (!essay || essay.userId !== userId) {
          reject(new Error('Redação não encontrada ou não pertence ao usuário'));
          return;
        }

        const updatedEssay = {
          ...essay,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        const putRequest = store.put(updatedEssay);
        putRequest.onsuccess = () => resolve(updatedEssay);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteEssay(userId: string, essayId: string): Promise<void> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['essays'], 'readwrite');
    const store = transaction.objectStore('essays');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(essayId);
      getRequest.onsuccess = () => {
        const essay = getRequest.result;
        if (!essay || essay.userId !== userId) {
          reject(new Error('Redação não encontrada ou não pertence ao usuário'));
          return;
        }

        const deleteRequest = store.delete(essayId);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ===== OPERAÇÕES DE FLASHCARDS =====

  async createFlashcard(userId: string, flashcardData: Omit<Flashcard, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'reviewCount'>): Promise<Flashcard> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['flashcards'], 'readwrite');
    const store = transaction.objectStore('flashcards');

    const flashcard: Flashcard = {
      ...flashcardData,
      id: Date.now().toString(),
      userId,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(flashcard);
      request.onsuccess = () => resolve(flashcard);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserFlashcards(userId: string): Promise<Flashcard[]> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['flashcards'], 'readonly');
    const store = transaction.objectStore('flashcards');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const flashcards = request.result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        resolve(flashcards);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateFlashcard(userId: string, flashcardId: string, updates: Partial<Flashcard>): Promise<Flashcard> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['flashcards'], 'readwrite');
    const store = transaction.objectStore('flashcards');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(flashcardId);
      getRequest.onsuccess = () => {
        const flashcard = getRequest.result;
        if (!flashcard || flashcard.userId !== userId) {
          reject(new Error('Flashcard não encontrado ou não pertence ao usuário'));
          return;
        }

        const updatedFlashcard = {
          ...flashcard,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        const putRequest = store.put(updatedFlashcard);
        putRequest.onsuccess = () => resolve(updatedFlashcard);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteFlashcard(userId: string, flashcardId: string): Promise<void> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['flashcards'], 'readwrite');
    const store = transaction.objectStore('flashcards');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(flashcardId);
      getRequest.onsuccess = () => {
        const flashcard = getRequest.result;
        if (!flashcard || flashcard.userId !== userId) {
          reject(new Error('Flashcard não encontrado ou não pertence ao usuário'));
          return;
        }

        const deleteRequest = store.delete(flashcardId);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ===== OPERAÇÕES DE CRONOGRAMA =====

  async createSchedule(userId: string, scheduleData: Omit<Schedule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['schedules'], 'readwrite');
    const store = transaction.objectStore('schedules');

    const schedule: Schedule = {
      ...scheduleData,
      id: Date.now().toString(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(schedule);
      request.onsuccess = () => resolve(schedule);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserSchedules(userId: string): Promise<Schedule[]> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['schedules'], 'readonly');
    const store = transaction.objectStore('schedules');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const schedules = request.result.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        resolve(schedules);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateSchedule(userId: string, scheduleId: string, updates: Partial<Schedule>): Promise<Schedule> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['schedules'], 'readwrite');
    const store = transaction.objectStore('schedules');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(scheduleId);
      getRequest.onsuccess = () => {
        const schedule = getRequest.result;
        if (!schedule || schedule.userId !== userId) {
          reject(new Error('Cronograma não encontrado ou não pertence ao usuário'));
          return;
        }

        const updatedSchedule = {
          ...schedule,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        const putRequest = store.put(updatedSchedule);
        putRequest.onsuccess = () => resolve(updatedSchedule);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['schedules'], 'readwrite');
    const store = transaction.objectStore('schedules');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(scheduleId);
      getRequest.onsuccess = () => {
        const schedule = getRequest.result;
        if (!schedule || schedule.userId !== userId) {
          reject(new Error('Cronograma não encontrado ou não pertence ao usuário'));
          return;
        }

        const deleteRequest = store.delete(scheduleId);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ===== OPERAÇÕES DE ANOTAÇÕES =====

  async createNote(userId: string, noteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['notes'], 'readwrite');
    const store = transaction.objectStore('notes');

    const note: Note = {
      ...noteData,
      id: Date.now().toString(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(note);
      request.onsuccess = () => resolve(note);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserNotes(userId: string): Promise<Note[]> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['notes'], 'readonly');
    const store = transaction.objectStore('notes');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const notes = request.result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        resolve(notes);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateNote(userId: string, noteId: string, updates: Partial<Note>): Promise<Note> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['notes'], 'readwrite');
    const store = transaction.objectStore('notes');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(noteId);
      getRequest.onsuccess = () => {
        const note = getRequest.result;
        if (!note || note.userId !== userId) {
          reject(new Error('Anotação não encontrada ou não pertence ao usuário'));
          return;
        }

        const updatedNote = {
          ...note,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        const putRequest = store.put(updatedNote);
        putRequest.onsuccess = () => resolve(updatedNote);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['notes'], 'readwrite');
    const store = transaction.objectStore('notes');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(noteId);
      getRequest.onsuccess = () => {
        const note = getRequest.result;
        if (!note || note.userId !== userId) {
          reject(new Error('Anotação não encontrada ou não pertence ao usuário'));
          return;
        }

        const deleteRequest = store.delete(noteId);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ===== UTILITÁRIOS =====

  async clearUserData(userId: string): Promise<void> {
    const db = await this.waitForDB();
    const transaction = db.transaction(['essays', 'flashcards', 'schedules', 'notes'], 'readwrite');

    const clearStore = (storeName: string) => {
      return new Promise<void>((resolve, reject) => {
        const store = transaction.objectStore(storeName);
        const index = store.index('userId');
        const request = index.getAllKeys(userId);
        
        request.onsuccess = () => {
          const keys = request.result;
          if (keys.length === 0) {
            resolve();
            return;
          }

          let completed = 0;
          keys.forEach(key => {
            const deleteRequest = store.delete(key);
            deleteRequest.onsuccess = () => {
              completed++;
              if (completed === keys.length) resolve();
            };
            deleteRequest.onerror = () => reject(deleteRequest.error);
          });
        };
        request.onerror = () => reject(request.error);
      });
    };

    await Promise.all([
      clearStore('essays'),
      clearStore('flashcards'),
      clearStore('schedules'),
      clearStore('notes')
    ]);
  }
}

export default DatabaseService;
