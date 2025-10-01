export interface User {
  id: string;
  nome: string;
  email: string;
  password?: string; // Changed from passwordHash to password, and made optional
  phone?: string;
  cpf?: string;
  birthDate?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt?: string; // made optional
  isActive: boolean;
  plan?: 'mensal' | '6meses' | 'anual';
  planExpiresAt?: string;
  avatar?: string;
  name?: string; // Added name for compatibility
}
