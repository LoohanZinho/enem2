import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Play, 
  FileText, 
  Brain, 
  CheckCircle, 
  Clock, 
  Star,
  Download,
  Eye,
  Award,
  Target,
  Zap,
  Shield,
  Crown,
  ArrowLeft,
  LogOut,
  Bell,
  Moon,
  User,
  Calendar,
  Timer,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Target as TargetIcon,
  BookOpen as BookIcon,
  Clock as ClockIcon
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const ConteudoEstudo = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accessCode, setAccessCode] = useState<string>('');

  useEffect(() => {
    // Verificar se o usuário tem acesso
    const userData = localStorage.getItem('enem_pro_user');
    const completedFlow = localStorage.getItem('enem_pro_completed_flow');
    
    if (!completedFlow) {
      router.push('/');
      return;
    }

    // Se não tem dados do usuário, criar dados básicos
    if (!userData) {
      const basicUser = {
        name: 'João Miguel Santos Da Silva',
        email: 'joao@exemplo.com',
        id: Date.now().toString(),
        level: 12
      };
      localStorage.setItem('enem_pro_user', JSON.stringify(basicUser));
      setUser(basicUser);
    } else {
      setUser(JSON.parse(userData));
    }
    
    // Gerar ou buscar código de acesso
    let code = localStorage.getItem('enem_pro_access_code');
    if (!code) {
      code = generateAccessCode();
      localStorage.setItem('enem_pro_access_code', code);
    }
    setAccessCode(code);
  }, [router]);

  const generateAccessCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ENEM${timestamp}${random}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('enem_pro_user');
    localStorage.removeItem('enem_pro_completed_flow');
    localStorage.removeItem('enem_pro_access_code');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e Nome */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EnemPro</span>
            </div>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-purple-400 font-medium">Cronograma</a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">Aulas</a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">Resumos</a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">Flashcards</a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">Redação</a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">Calendário</a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">Tarefas</a>
            </nav>
            
            {/* User Info e Icons */}
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-slate-300" />
              <Moon className="h-5 w-5 text-slate-300" />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                      user
                    </Badge>
                    <span className="text-xs text-slate-400">Nível {user.level || 12}</span>
                  </div>
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">JM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voltar Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Cronograma de Estudos - Large Card */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Cronograma de Estudos</h2>
                    <p className="text-slate-300">Planejamento estratégico para o ENEM</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-slate-300">14 semanas planejadas</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-300">De 22/09/2025 até 28/12/2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progresso Geral - Medium Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 h-full">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">0%</h3>
                  <p className="text-slate-300 mb-4">Progresso Geral</p>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-slate-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Atividade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Horas Concluídas */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">HORAS CONCLUÍDAS</span>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white">2h</h3>
                <p className="text-sm text-blue-400">de 560h totais</p>
              </div>
            </CardContent>
          </Card>

          {/* Meta Semanal */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">META SEMANAL</span>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <TargetIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white">40h</h3>
                <p className="text-sm text-green-400">por semana</p>
              </div>
            </CardContent>
          </Card>

          {/* Atividades */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">ATIVIDADES</span>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <BookIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white">3</h3>
                <p className="text-sm text-purple-400">esta semana</p>
              </div>
            </CardContent>
          </Card>

          {/* Cronômetro */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">CRONÔMETRO</span>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white">00:00:00</h3>
                <p className="text-sm text-orange-400">tempo ativo</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Semana Atual */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-white">SEMANA ATUAL</h2>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Semana 1</h3>
                <p className="text-slate-300 mb-4">22/09/2025 a 28/09/2025</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300">2h concluídas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-300">40h planejadas</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Semana Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  Próxima Semana
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ConteudoEstudo;
