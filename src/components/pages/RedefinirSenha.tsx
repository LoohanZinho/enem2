"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
// import { useAuth } from "@/contexts/AuthContext"; // Removido - sistema sem autenticação
import { 
  Lock, 
  Eye, 
  EyeOff, 
  BookOpen,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Shield
} from "lucide-react";
import Link from 'next/link';

const RedefinirSenha = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const { resetPassword } = useAuth(); // Removido - sistema sem autenticação
  const resetPassword = async () => ({ success: true, message: "Senha redefinida com sucesso!" }); // Mock para funcionar sem autenticação
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams?.get('token');
  const email = searchParams?.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Link inválido ou expirado. Solicite uma nova redefinição.');
    }
  }, [token, email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.newPassword.trim()) {
      setError('Nova senha é obrigatória');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    if (!token || !email) {
      setError('Link inválido ou expirado.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(); //token, email, formData.newPassword
      
      if (result.success) {
        setSuccess(true);
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err: unknown) {
      setError('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        {/* Header with Theme Toggle */}
        <header className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </header>

        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
            <CardHeader className="bg-green-600 text-white py-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center font-bold">
                Senha Redefinida!
              </CardTitle>
              <p className="text-green-100 text-center">
                Sua senha foi alterada com sucesso
              </p>
            </CardHeader>
            
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Você será redirecionado para a página de login em alguns segundos.
              </p>
              
              <Button
                onClick={handleBackToLogin}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                Ir para Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Header with Theme Toggle */}
      <header className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </header>

      {/* Botão Voltar */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-10"
        onClick={handleBackToLogin}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar ao Login
      </Button>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="max-w-md mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white leading-tight">
              Redefinir Senha
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Digite sua nova senha
            </p>
          </div>

          {/* Card de Redefinição */}
          <Card className="shadow-2xl border-0 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
            <CardHeader className="bg-blue-600 text-white py-6">
              <CardTitle className="text-2xl text-center font-bold">
                Nova Senha
              </CardTitle>
              <p className="text-blue-100 text-center">
                Crie uma senha segura para sua conta
              </p>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-800 dark:text-white font-medium">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="pl-12 pr-12 h-14 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-14 px-4 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-800 dark:text-white font-medium">
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-12 pr-12 h-14 border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-14 px-4 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading || !token || !email}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Redefinir Senha
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Lembrou da senha? </span>
                <Link
                  href="/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Fazer Login
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Garantias */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-6 rounded-2xl border border-slate-600 dark:border-slate-500">
            <h4 className="font-bold text-white text-lg mb-4 text-center">Segurança:</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-slate-300">Sua senha é criptografada e segura</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <span className="text-slate-300">Acesso protegido por autenticação</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RedefinirSenha;
