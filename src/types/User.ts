export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  plan?: 'mensal' | '6meses' | 'anual';
  planExpiresAt?: string;
  avatar?: string;
}
