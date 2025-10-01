"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Shield, Key, Eye, EyeOff, Loader2, Edit, Trash2, Save, X } from "lucide-react";
import { authService } from "@/services/AuthService";
import type { User as UserType } from "@/types/User";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({ email: "", password: "", nome: "" });
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const ADMIN_PASSWORD = "2Raparigas*";

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Senha incorreta.");
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      setError("Falha ao carregar usuários.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.nome) {
      setError("Preencha nome, email e senha para o novo usuário.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await authService.register({
        email: newUser.email,
        password: newUser.password,
        nome: newUser.nome,
        role: "user",
        phone: "",
        cpf: "",
        birthDate: "",
        isActive: true,
      });

      if (result.success) {
        setNewUser({ email: "", password: "", nome: "" });
        await fetchUsers();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Falha ao adicionar usuário.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      setIsLoading(true);
      try {
        await authService.deleteUser(userId);
        await fetchUsers();
      } catch (err) {
        setError("Falha ao excluir usuário.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setIsLoading(true);
    try {
      await authService.updateUser(editingUser.id, {
        nome: editingUser.nome,
        email: editingUser.email,
        password: editingUser.password, // Assumindo que a senha pode ser editada
      });
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      setError("Falha ao atualizar usuário.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Card className="w-full max-w-sm bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="text-yellow-400"/>
              Acesso Restrito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-slate-300">Senha de Administrador</Label>
                <div className="relative">
                   <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400"/>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white focus:ring-yellow-400"
                  />
                </div>
              </div>
              {authError && <Alert variant="destructive"><AlertDescription>{authError}</AlertDescription></Alert>}
              <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-8">
      <h1 className="text-4xl font-bold mb-8 text-slate-800 dark:text-white">Painel de Administração</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Adicionar Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-nome">Nome</Label>
                <Input
                  id="new-nome"
                  type="text"
                  value={newUser.nome}
                  onChange={(e) => setNewUser(prev => ({...prev, nome: e.target.value}))}
                  placeholder="Nome do usuário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({...prev, email: e.target.value}))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Senha</Label>
                <Input
                  id="new-password"
                  type="text"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({...prev, password: e.target.value}))}
                  placeholder="Senha em texto puro"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Adicionar Usuário"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <Loader2 className="h-6 w-6 animate-spin mx-auto"/>}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map(userItem => (
                <div key={userItem.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                  {editingUser?.id === userItem.id ? (
                    <div className="flex-1 space-y-2">
                      <Input name="nome" value={editingUser.nome} onChange={handleEditChange} placeholder="Nome" />
                      <Input name="email" type="email" value={editingUser.email} onChange={handleEditChange} placeholder="Email" />
                      <Input name="password" value={editingUser.password} onChange={handleEditChange} placeholder="Senha" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdateUser}><Save className="h-4 w-4"/></Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}><X className="h-4 w-4"/></Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-slate-500"/>
                        <div>
                          <p className="font-semibold text-sm">{userItem.nome}</p>
                          <p className="text-xs text-slate-500">{userItem.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingUser(userItem)}><Edit className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteUser(userItem.id)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
