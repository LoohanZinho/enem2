// Sistema de banco de dados local usando IndexedDB
// Garante isolamento total entre usuários
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Firestore,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';
import { UserData } from './UserDataService';
import { initializeFirebase } from '@/firebase';


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
  private db: Firestore;

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private constructor() {
    const { firestore } = initializeFirebase();
    this.db = firestore;
  }

  // ===== OPERAÇÕES DE DADOS DO USUÁRIO =====

  async saveUserData(userId: string, data: UserData): Promise<void> {
    const userDocRef = doc(this.db, 'user_data', userId);
    // Deep clone e converte todas as instâncias de Date para string ISO
    const serializableData = JSON.parse(JSON.stringify(data));
    await setDoc(userDocRef, serializableData, { merge: true });
  }

  async getUserData(userId: string): Promise<DocumentData | null> {
      const userDocRef = doc(this.db, 'user_data', userId);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
          return docSnap.data();
      }
      return null;
  }


  // ===== OPERAÇÕES DE USUÁRIO (exemplo, deve ser movido para AuthService) =====

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const usersCollection = collection(this.db, 'users');
    const q = query(usersCollection, where('email', '==', userData.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error('E-mail já cadastrado.');
    }

    const newUser: Omit<User, 'id'> = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(collection(this.db, 'users'));
    await setDoc(docRef, newUser);

    return { id: docRef.id, ...newUser };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const usersCollection = collection(this.db, 'users');
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      return null;
    }
  
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  }
  
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const userDocRef = doc(this.db, 'users', userId);
    await updateDoc(userDocRef, { ...updates, updatedAt: new Date().toISOString() });
    const updatedDoc = await getDoc(userDocRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as User;
  }

  // As operações de CRUD para Essays, Flashcards, etc., seriam semelhantes,
  // sempre usando o userId para garantir o isolamento dos dados.

  async createEssay(userId: string, essayData: Omit<Essay, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Essay> {
    const essayDocRef = doc(collection(this.db, `users/${userId}/essays`));
    const newEssay: Essay = {
      ...essayData,
      id: essayDocRef.id,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(essayDocRef, newEssay);
    return newEssay;
  }

  async getUserEssays(userId: string): Promise<Essay[]> {
    const essaysCollection = collection(this.db, `users/${userId}/essays`);
    const snapshot = await getDocs(essaysCollection);
    return snapshot.docs.map(doc => doc.data() as Essay);
  }

  async updateEssay(userId: string, essayId: string, updates: Partial<Essay>): Promise<Essay> {
    const essayDocRef = doc(this.db, `users/${userId}/essays`, essayId);
    await updateDoc(essayDocRef, { ...updates, updatedAt: new Date().toISOString() });
    const updatedDoc = await getDoc(essayDocRef);
    return updatedDoc.data() as Essay;
  }

  async deleteEssay(userId: string, essayId: string): Promise<void> {
    const essayDocRef = doc(this.db, `users/${userId}/essays`, essayId);
    await deleteDoc(essayDocRef);
  }
  
  // Flashcards
  async createFlashcard(userId: string, flashcardData: any): Promise<Flashcard> {
      const flashcardDocRef = doc(collection(this.db, `users/${userId}/flashcards`));
      // ...
      return {} as Flashcard; // Placeholder
  }

  async getUserFlashcards(userId: string): Promise<Flashcard[]> {
      // ...
      return []; // Placeholder
  }
  
  async updateFlashcard(userId: string, flashcardId: string, updates: any): Promise<Flashcard> {
      // ...
      return {} as Flashcard; // Placeholder
  }

  async deleteFlashcard(userId: string, flashcardId: string): Promise<void> {
      // ...
  }

  // Schedules
  async createSchedule(userId: string, scheduleData: any): Promise<Schedule> {
    // ...
    return {} as Schedule; // Placeholder
  }

  async getUserSchedules(userId: string): Promise<Schedule[]> {
      // ...
      return []; // Placeholder
  }

  async updateSchedule(userId: string, scheduleId: string, updates: any): Promise<Schedule> {
      // ...
      return {} as Schedule; // Placeholder
  }

  async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
      // ...
  }

  // Notes
  async createNote(userId: string, noteData: any): Promise<Note> {
    // ...
    return {} as Note; // Placeholder
  }

  async getUserNotes(userId: string): Promise<Note[]> {
    // ...
    return []; // Placeholder
  }

  async updateNote(userId: string, noteId: string, updates: any): Promise<Note> {
    // ...
    return {} as Note; // Placeholder
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    // ...
  }


}

export default DatabaseService;
