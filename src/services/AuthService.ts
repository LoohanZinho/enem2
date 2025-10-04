
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Firestore,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';
import { User } from '@/types/User';
import { initializeFirebase } from '@/firebase';

interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private db: Firestore | null = null;
  private usersCollection: CollectionReference<DocumentData> | null = null;
  private readonly CURRENT_USER_KEY = 'enem_pro_current_user';
  private didInitialize = false;

  private async initialize() {
    if (this.didInitialize) return;
    const firebaseServices = initializeFirebase();
    this.db = getFirestore(firebaseServices.firebaseApp);
    this.usersCollection = collection(this.db, 'users');
    this.didInitialize = true;
  }

  private ensureInitialized() {
    if (!this.didInitialize) {
      this.initialize();
    }
  }

  getCurrentUser(): User | null {
    this.ensureInitialized();
    if (typeof window === 'undefined') return null;

    try {
        const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
        if (userJson && userJson !== 'undefined' && userJson !== 'null') {
          return JSON.parse(userJson);
        }
        return null;
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem(this.CURRENT_USER_KEY);
        return null;
    }
  }

  setCurrentUser(user: User | null): void {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        // Manter o cookie para o middleware
        document.cookie = `enem_pro_user_id=${user.id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      } else {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        document.cookie = 'enem_pro_user_id=; path=/; max-age=0; SameSite=Lax';
      }
    }
  }

  async register(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; message: string; user?: User }> {
    await this.initialize();
    if (!this.usersCollection) {
        return { success: false, message: 'Erro ao inicializar o serviço do Firestore.' };
    }

    try {
      const q = query(
        this.usersCollection,
        where('email', '==', userData.email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return { success: false, message: 'Este e-mail já está em uso.' };
      }

      const newUser: Omit<User, 'id'> = {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(this.usersCollection, newUser);
      const createdUser = { ...newUser, id: docRef.id };

      return {
        success: true,
        message: 'Usuário registrado com sucesso!',
        user: createdUser,
      };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return { success: false, message: 'Erro ao registrar usuário.' };
    }
  }

  async login(
    credentials: LoginCredentials
  ): Promise<{ success: boolean; message: string; user?: User }> {
    await this.initialize();
    if (!this.usersCollection) {
        return { success: false, message: 'Erro ao inicializar o serviço do Firestore.' };
    }
    try {
      const q = query(
        this.usersCollection,
        where('email', '==', credentials.email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, message: 'Email ou senha inválidos.' };
      }

      const userDoc = querySnapshot.docs[0];
      const user = { id: userDoc.id, ...userDoc.data() } as User;

      if (user.password !== credentials.password) {
        return { success: false, message: 'Email ou senha inválidos.' };
      }
      
      if (!user.isActive) {
        return {
          success: false,
          message: 'Sua conta está desativada. Entre em contato com o suporte para mais informações.',
        };
      }

      if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
        return {
          success: false,
          message: 'Sua assinatura expirou. Por favor, renove seu plano para continuar acessando a plataforma.',
        };
      }

      this.setCurrentUser(user);

      return {
        success: true,
        message: 'Login realizado com sucesso!',
        user,
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro ao fazer login.' };
    }
  }
  
    async getUserByEmail(email: string): Promise<User | null> {
    await this.initialize();
    if (!this.usersCollection) {
      console.error('Firestore não inicializado.');
      return null;
    }
    try {
      const q = query(this.usersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    await this.initialize();
    if (!this.usersCollection) {
        console.error('Firestore não inicializado.');
        return [];
    }
    try {
      const querySnapshot = await getDocs(this.usersCollection);
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as User);
      });
      return users;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    await this.initialize();
    if (!this.db) {
        console.error('Firestore não inicializado.');
        return null;
    }
    try {
      const userDocRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      return null;
    }
  }

  async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<{ success: boolean; message: string }> {
    await this.initialize();
    if (!this.db) {
      return { success: false, message: 'Erro ao inicializar o serviço do Firestore.' };
    }
    try {
      const userDocRef = doc(this.db, 'users', userId);
      await updateDoc(userDocRef, {
        ...updates,
        role: updates.role || 'user', // Garante que o role seja mantido ou definido
        updatedAt: new Date().toISOString(),
      });
      return { success: true, message: 'Usuário atualizado com sucesso!' };
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return { success: false, message: 'Erro ao atualizar usuário.' };
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    await this.initialize();
    if (!this.db) {
      return { success: false, message: 'Erro ao inicializar o serviço do Firestore.' };
    }
    try {
      const userDocRef = doc(this.db, 'users', userId);
      await deleteDoc(userDocRef);
      return { success: true, message: 'Usuário excluído com sucesso!' };
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      return { success: false, message: 'Erro ao excluir usuário.' };
    }
  }

  logout(): void {
    this.setCurrentUser(null);
  }
}

export const authService = new AuthService();
