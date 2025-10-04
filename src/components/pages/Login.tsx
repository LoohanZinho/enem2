
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  BookOpen,
  Loader2
} from "lucide-react";
import Link from 'next/link';

const Login = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Por favor, insira um email válido");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      router.push('/cronograma');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-900 dark:to-slate-800 relative overflow-hidden transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-400/20 rounded-full blur-3xl translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl -translate-x-48 translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/10 dark:bg-blue-300/20 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
      </div>

      {/* Header with Theme Toggle */}
      <header className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </header>
      
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        className="absolute top-6 left-6 z-10 text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 backdrop-blur-sm transition-colors duration-300"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar à Landing Page
      </Button>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-6xl relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-20">
          {/* Logo Premium */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              {/* Efeitos decorativos sutis */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400/60 dark:bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-300/60 dark:bg-blue-300 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-slate-800 dark:text-white leading-tight">
            Bem-vindo de <span className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">volta!</span>
          </h1>
          <p className="text-2xl text-slate-600 dark:text-white/80 font-medium">
            Faça login para continuar seus estudos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulário de Login */}
          <div className="lg:col-span-1">
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-200/50 dark:border-white/20">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white py-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-700/90 dark:from-blue-700/90 dark:to-blue-800/90"></div>
                <div className="relative z-10 text-center">
                  <CardTitle className="text-3xl font-black mb-2">
                    Entrar na Conta
                  </CardTitle>
                  <p className="text-blue-100 text-lg font-medium">
                    Acesse sua conta para continuar
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-500/50 text-red-800 dark:text-red-100">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Email */}
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-lg font-semibold text-slate-700 dark:text-white">
                      Email
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        className="pl-12 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-blue-50/50 dark:focus:bg-slate-600/50 transition-all duration-300 text-lg"
                        required
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-lg font-semibold text-slate-700 dark:text-white">
                      Senha
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Sua senha"
                        className="pl-12 pr-12 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-blue-50/50 dark:focus:bg-slate-600/50 transition-all duration-300 text-lg"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Esqueci minha senha */}
                  <div className="text-right">
                    <Link
                      href="/redefinir-senha"
                      className="text-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>

                  {/* Botão de Login */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 relative overflow-hidden group"
                  >
                    {/* Efeito de brilho */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Conteúdo do botão */}
                    <span className="relative z-10">
                      {isLoading ? (
                        <div className="flex items-center space-x-3">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span>Entrando...</span>
                        </div>
                      ) : (
                        "Entrar"
                      )}
                    </span>
                    
                    {/* Efeito shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </Button>
                </form>


              </CardContent>
            </Card>
          </div>

          {/* Informações Adicionais */}
          <div className="lg:col-span-1">
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-200/50 dark:border-white/20">
              <CardContent className="p-10">
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-4xl font-black text-slate-800 dark:text-white mb-6">
                      Por que fazer login?
                    </h3>
                    <p className="text-slate-600 dark:text-white/80 text-xl font-medium">
                      Acesse todos os recursos exclusivos da plataforma
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 group">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Acesso Completo</h4>
                        <p className="text-slate-600 dark:text-white/70 text-lg leading-relaxed">
                          Tenha acesso a todas as funcionalidades da plataforma
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 group">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Dados Seguros</h4>
                        <p className="text-slate-600 dark:text-white/70 text-lg leading-relaxed">
                          Seus dados estão protegidos com criptografia
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 group">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-800 dark:from-blue-800 dark:to-blue-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Sincronização</h4>
                        <p className="text-slate-600 dark:text-white/70 text-lg leading-relaxed">
                          Seu progresso é salvo automaticamente
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
