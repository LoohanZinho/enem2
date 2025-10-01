import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  Save,
  X,
  Target,
  TrendingUp,
  Timer,
  AlertCircle
} from "lucide-react";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import GoalManager from "@/components/GoalManager";
import { userDataService } from "@/services/UserDataService";
import { useState, useEffect } from "react";

interface Activity {
  id: string;
  time: string;
  subject: string;
  topic: string;
  type: 'aula' | 'exercicio' | 'redacao' | 'resumo' | 'revisao' | 'descanso';
  duration: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  completedAt?: string;
  startedAt?: string;
}

interface DaySchedule {
  day: string;
  date: string;
  activities: Activity[];
}

interface WeekSchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: DaySchedule[];
  totalHours: number;
  completedHours: number;
}

const Cronograma = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [studyGoal, setStudyGoal] = useState(40); // horas por semana
  const [weeks, setWeeks] = useState<WeekSchedule[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    time: '',
    subject: '',
    topic: '',
    type: 'aula',
    duration: '1h',
    status: 'pending',
    priority: 'medium'
  });

  // Carregar dados do cronograma do usuário apenas uma vez
  useEffect(() => {
    if (isDataLoaded) return; // Evita recarregar se já foi carregado

    const loadUserSchedule = () => {
      const savedSchedule = userDataService.loadSchedule();
      if (savedSchedule && savedSchedule.length > 0) {
        setWeeks(savedSchedule);
      } else {
        // Inicializar com dados padrão se não houver dados salvos
        initializeDefaultWeeks();
      }
      setIsDataLoaded(true);
    };

    loadUserSchedule();
  }, [isDataLoaded]); // Dependência do estado de controle

  // Salvar dados do cronograma sempre que houver mudanças (exceto no carregamento inicial)
  useEffect(() => {
    if (weeks.length > 0) {
      userDataService.saveSchedule(weeks);
    }
  }, [weeks]);

  // Inicializar semanas padrão para novos usuários (sem dados de exemplo)
  const initializeDefaultWeeks = () => {
    const defaultWeeks = generateWeeks(false); // false = sem dados de exemplo
    setWeeks(defaultWeeks);
  };

  // Função para gerar semanas com datas atuais
  const generateWeeks = (includeExamples: boolean = true) => {
    const weeks: WeekSchedule[] = [];
    const today = new Date();
    const threeMonthsFromNow = new Date(today);
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    const currentDate = new Date(today);
    let weekNumber = 1;
    
    // Ajustar para começar na segunda-feira da semana atual
    const dayOfWeek = currentDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentDate.setDate(currentDate.getDate() + daysToMonday);
    
    while (currentDate <= threeMonthsFromNow) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const days: DaySchedule[] = [];
      const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
      
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentDate);
        dayDate.setDate(dayDate.getDate() + i);
        
        const activities: Activity[] = [];
        
        // Adicionar algumas atividades de exemplo apenas para a primeira semana (se solicitado)
        if (includeExamples && weekNumber === 1 && i < 3) {
          const subjects = ['Matemática', 'Português', 'Física', 'Química', 'História', 'Geografia', 'Redação'];
          const topics = ['Revisão Geral', 'Exercícios Práticos', 'Teoria', 'Redação'];
          const types = ['aula', 'exercicio', 'redacao', 'revisao'] as const;
          
          if (i === 0) {
            activities.push({
              id: `${weekNumber}-${i}-1`,
              time: "08:00",
              subject: "Matemática",
              topic: "Funções Quadráticas",
              type: "aula",
              duration: "2h",
              status: 'completed',
              priority: 'high',
              completedAt: new Date().toISOString()
            });
          }
          
          if (i === 1) {
            activities.push({
              id: `${weekNumber}-${i}-1`,
              time: "09:00",
              subject: "Física",
              topic: "Mecânica - Cinemática",
              type: "aula",
              duration: "2h",
              status: 'pending',
              priority: 'high'
            });
          }
          
          if (i === 2) {
            activities.push({
              id: `${weekNumber}-${i}-1`,
              time: "14:00",
              subject: "Português",
              topic: "Interpretação de Texto",
              type: "exercicio",
              duration: "1h",
              status: 'pending',
              priority: 'medium'
            });
          }
        }
        
        days.push({
          day: dayNames[i],
          date: dayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          activities
        });
      }
      
      weeks.push({
        weekNumber,
        startDate: weekStart.toLocaleDateString('pt-BR'),
        endDate: weekEnd.toLocaleDateString('pt-BR'),
        days,
        totalHours: 40,
        completedHours: weekNumber === 1 ? 2 : 0
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }
    
    return weeks;
  };

  // Inicializar semanas
  useEffect(() => {
    const initialWeeks = generateWeeks();
    setWeeks(initialWeeks);
  }, []);

  // Timer para cronômetro
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentWeek = () => weeks[currentWeek] || weeks[0];
  
  const goToPreviousWeek = () => {
    setCurrentWeek(prev => Math.max(0, prev - 1));
  };
  
  const goToNextWeek = () => {
    setCurrentWeek(prev => Math.min(weeks.length - 1, prev + 1));
  };
  const getTotalStudyHours = () => weeks.reduce((acc, week) => acc + week.totalHours, 0);
  const getCompletedStudyHours = () => weeks.reduce((acc, week) => acc + week.completedHours, 0);
  const getStudyProgress = () => (getCompletedStudyHours() / getTotalStudyHours()) * 100;

  const handleAddActivity = () => {
    if (!newActivity.time || !newActivity.subject || !newActivity.topic) return;
    
    const activity: Activity = {
      id: Date.now().toString(),
      time: newActivity.time,
      subject: newActivity.subject,
      topic: newActivity.topic,
      type: newActivity.type as Activity['type'],
      duration: newActivity.duration || '1h',
      status: 'pending',
      priority: newActivity.priority as Activity['priority'],
      notes: newActivity.notes
    };

    // Adicionar atividade usando UserDataService
    userDataService.addActivity(currentWeek, selectedDayIndex, activity);
    
    // Atualizar estado local
    const updatedWeeks = [...weeks];
    updatedWeeks[currentWeek].days[selectedDayIndex].activities.push(activity);
    setWeeks(updatedWeeks);
    
    // Limpar formulário
    setNewActivity({
      time: '',
      subject: '',
      topic: '',
      type: 'aula',
      duration: '1h',
      status: 'pending',
      priority: 'medium'
    });
    setIsAddingActivity(false);
  };

  const handleEditActivity = (activityId: string, dayIndex: number, updatedActivity: Partial<Activity>) => {
    // Atualizar usando UserDataService
    userDataService.updateActivity(currentWeek, dayIndex, activityId, updatedActivity);
    
    // Atualizar estado local
    const updatedWeeks = [...weeks];
    const activityIndex = updatedWeeks[currentWeek].days[dayIndex].activities.findIndex(a => a.id === activityId);
    if (activityIndex !== -1) {
      updatedWeeks[currentWeek].days[dayIndex].activities[activityIndex] = {
        ...updatedWeeks[currentWeek].days[dayIndex].activities[activityIndex],
        ...updatedActivity
      };
      setWeeks(updatedWeeks);
    }
    setEditingActivity(null);
  };

  const handleDeleteActivity = (activityId: string, dayIndex: number) => {
    // Excluir usando UserDataService
    userDataService.deleteActivity(currentWeek, dayIndex, activityId);
    
    // Atualizar estado local
    const updatedWeeks = [...weeks];
    updatedWeeks[currentWeek].days[dayIndex].activities = updatedWeeks[currentWeek].days[dayIndex].activities.filter(a => a.id !== activityId);
    setWeeks(updatedWeeks);
  };

  const handleStartActivity = (activityId: string) => {
    if (activeTimer === activityId) {
      setActiveTimer(null);
      setTimerSeconds(0);
    } else {
      setActiveTimer(activityId);
      setTimerSeconds(0);
    }
  };

  const handleCompleteActivity = (activityId: string, dayIndex: number) => {
    const updatedWeeks = [...weeks];
    const activityIndex = updatedWeeks[currentWeek].days[dayIndex].activities.findIndex(a => a.id === activityId);
    if (activityIndex !== -1) {
      const activity = updatedWeeks[currentWeek].days[dayIndex].activities[activityIndex];
      const updatedActivity = { ...activity };
      
      if (activity.status === 'completed') {
        updatedActivity.status = 'pending';
        updatedActivity.completedAt = undefined;
        updatedWeeks[currentWeek].completedHours -= parseFloat(activity.duration);
      } else {
        updatedActivity.status = 'completed';
        updatedActivity.completedAt = new Date().toISOString();
        updatedWeeks[currentWeek].completedHours += parseFloat(activity.duration);
      }
      
      // Atualizar usando UserDataService
      userDataService.updateActivity(currentWeek, dayIndex, activityId, updatedActivity);
      
      // Atualizar estado local
      updatedWeeks[currentWeek].days[dayIndex].activities[activityIndex] = updatedActivity;
      setWeeks(updatedWeeks);
    }
  };

  const schedule = getCurrentWeek()?.days || [];

  const getTypeColor = (type: string) => {
    const colors = {
      aula: "primary",
      exercicio: "success", 
      redacao: "accent",
      resumo: "secondary",
      revisao: "outline",
      descanso: "outline"
    };
    return colors[type as keyof typeof colors] || "outline";
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "aula": return <BookOpen className="h-4 w-4" />;
      case "exercicio": return <Target className="h-4 w-4" />;
      case "redacao": return <Edit className="h-4 w-4" />;
      case "resumo": return <BookOpen className="h-4 w-4" />;
      case "revisao": return <TrendingUp className="h-4 w-4" />;
      case "descanso": return <Circle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'pending': return <Circle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <BackButton 
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            />
          </div>
          
          {/* Header Principal */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-5xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        Cronograma de Estudos
                      </h1>
                      <p className="text-white/90 text-xl font-medium mt-2">Planejamento estratégico para o ENEM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 text-white/90">
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold">{weeks.length} semanas planejadas</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-semibold">De {weeks[0]?.startDate} até {weeks[weeks.length - 1]?.endDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-4xl font-black text-white mb-2">
                      {Math.round(getStudyProgress())}%
                    </div>
                    <div className="text-sm text-white/80 font-medium">Progresso Geral</div>
                    <div className="w-40 h-3 bg-white/20 rounded-full mt-4 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${getStudyProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botão de Nova Atividade */}
          <div className="flex justify-end mt-8">
            <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0"
                >
                  <Plus className="h-5 w-5 mr-3" />
                  Nova Atividade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Atividade</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="time">Horário</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newActivity.time}
                        onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duração</Label>
                      <Select value={newActivity.duration} onValueChange={(value) => setNewActivity({...newActivity, duration: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30min">30 min</SelectItem>
                          <SelectItem value="1h">1 hora</SelectItem>
                          <SelectItem value="1h30">1h30</SelectItem>
                          <SelectItem value="2h">2 horas</SelectItem>
                          <SelectItem value="3h">3 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Matéria</Label>
                    <Input
                      id="subject"
                      value={newActivity.subject}
                      onChange={(e) => setNewActivity({...newActivity, subject: e.target.value})}
                      placeholder="Ex: Matemática"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic">Tópico</Label>
                    <Input
                      id="topic"
                      value={newActivity.topic}
                      onChange={(e) => setNewActivity({...newActivity, topic: e.target.value})}
                      placeholder="Ex: Funções Quadráticas"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Select value={newActivity.type} onValueChange={(value) => setNewActivity({...newActivity, type: value as Activity['type']})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aula">Aula</SelectItem>
                          <SelectItem value="exercicio">Exercício</SelectItem>
                          <SelectItem value="redacao">Redação</SelectItem>
                          <SelectItem value="resumo">Resumo</SelectItem>
                          <SelectItem value="revisao">Revisão</SelectItem>
                          <SelectItem value="descanso">Descanso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select value={newActivity.priority} onValueChange={(value) => setNewActivity({...newActivity, priority: value as Activity['priority']})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={newActivity.notes || ''}
                      onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
                      placeholder="Adicione observações sobre a atividade..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingActivity(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddActivity}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas Premium */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-blue-700/20 hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Horas Concluídas</p>
                  </div>
                  <p className="text-4xl font-black text-blue-900 dark:text-blue-100">{getCompletedStudyHours()}h</p>
                  <p className="text-sm text-blue-600/80 dark:text-blue-400/80 font-medium">de {getTotalStudyHours()}h totais</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-900/30 dark:via-green-800/20 dark:to-green-700/20 hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">Meta Semanal</p>
                  </div>
                  <p className="text-4xl font-black text-green-900 dark:text-green-100">{studyGoal}h</p>
                  <p className="text-sm text-green-600/80 dark:text-green-400/80 font-medium">por semana</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-purple-700/20 hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Atividades</p>
                  </div>
                  <p className="text-4xl font-black text-purple-900 dark:text-purple-100">
                    {getCurrentWeek()?.days.flatMap(d => d.activities).length || 0}
                  </p>
                  <p className="text-sm text-purple-600/80 dark:text-purple-400/80 font-medium">esta semana</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 dark:from-orange-900/30 dark:via-orange-800/20 dark:to-orange-700/20 hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Cronômetro</p>
                  </div>
                  <p className="text-4xl font-black text-orange-900 dark:text-orange-100 font-mono">{formatTime(timerSeconds)}</p>
                  <p className="text-sm text-orange-600/80 dark:text-orange-400/80 font-medium">tempo ativo</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Timer className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navegação de Semanas Premium */}
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 backdrop-blur-sm mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          <CardContent className="relative p-8">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="lg"
                onClick={goToPreviousWeek}
                disabled={currentWeek === 0}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-semibold">Semana Anterior</span>
              </Button>
              
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Semana Atual</span>
                  </div>
                  <h2 className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    Semana {getCurrentWeek()?.weekNumber}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                    {getCurrentWeek()?.startDate} a {getCurrentWeek()?.endDate}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-700 dark:text-green-300 font-bold">
                        {getCurrentWeek()?.completedHours}h concluídas
                      </span>
                    </div>
                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-full">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {getCurrentWeek()?.totalHours}h planejadas
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-96 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ 
                        width: `${((getCurrentWeek()?.completedHours || 0) / (getCurrentWeek()?.totalHours || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={goToNextWeek}
                disabled={currentWeek === weeks.length - 1}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-semibold">Próxima Semana</span>
                <ChevronRight className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grade de Cronograma Semanal Premium */}
        <div className="space-y-8">
          {schedule.map((day, dayIndex) => (
            <Card key={dayIndex} className="group relative overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:scale-[1.01]">
              {/* Header do Dia */}
              <div className="relative bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{day.day}</h3>
                      <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">{day.date}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {day.activities.length} atividades
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => {
                      setSelectedDayIndex(dayIndex);
                      setIsAddingActivity(true);
                    }}
                    className="group/btn bg-white/80 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl px-6 py-3 transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
                    <span className="font-semibold">Adicionar Atividade</span>
                  </Button>
                </div>
              </div>
              
              <div className="p-8">
                {day.activities.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shadow-lg">
                      <Calendar className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-3">Nenhuma atividade agendada</h3>
                    <p className="text-lg text-slate-500 dark:text-slate-500 mb-6">Adicione atividades para este dia</p>
                    <Button 
                      onClick={() => {
                        setSelectedDayIndex(dayIndex);
                        setIsAddingActivity(true);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Criar Primeira Atividade
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {day.activities.map((activity, actIndex) => (
                      <div 
                        key={activity.id} 
                        className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${
                          activity.status === 'completed' 
                            ? 'bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-900/30 dark:via-green-800/20 dark:to-green-700/20 border-green-300 dark:border-green-700 shadow-green-200/50 dark:shadow-green-900/20' 
                            : activity.status === 'in_progress'
                            ? 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-blue-700/20 border-blue-300 dark:border-blue-700 shadow-blue-200/50 dark:shadow-blue-900/20'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 shadow-slate-200/50 dark:shadow-slate-900/20'
                        }`}
                      >
                        <div className="p-8">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-6 flex-1">
                              {/* Horário */}
                              <div className="flex items-center gap-3 min-w-24">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shadow-lg">
                                  <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                  <p className="text-lg font-black text-slate-900 dark:text-slate-100">{activity.time}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">{activity.duration}</p>
                                </div>
                              </div>
                              
                              {/* Conteúdo Principal */}
                              <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                      {getTypeIcon(activity.type)}
                                    </div>
                                    <div>
                                      <h4 className="text-xl font-black text-slate-900 dark:text-slate-100">{activity.subject}</h4>
                                      <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">{activity.topic}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <Badge 
                                      variant={getTypeColor(activity.type) as "default" | "secondary" | "destructive" | "outline"}
                                      className="text-sm font-bold px-4 py-2 rounded-full shadow-lg"
                                    >
                                      {activity.type}
                                    </Badge>
                                    <Badge className={`text-sm font-bold px-4 py-2 rounded-full shadow-lg ${getPriorityColor(activity.priority)}`}>
                                      {activity.priority === 'high' ? 'Alta' : activity.priority === 'medium' ? 'Média' : 'Baixa'}
                                    </Badge>
                                    <Badge className={`text-sm font-bold px-4 py-2 rounded-full shadow-lg ${getStatusColor(activity.status)}`}>
                                      <div className="flex items-center gap-2">
                                        {getStatusIcon(activity.status)}
                                        {activity.status === 'completed' ? 'Concluída' : 
                                         activity.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                                      </div>
                                    </Badge>
                                  </div>
                                </div>
                                
                                {activity.notes && (
                                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-600">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 italic font-medium">"{activity.notes}"</p>
                                  </div>
                                )}
                                
                                {activity.status === 'in_progress' && activeTimer === activity.id && (
                                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-4 border border-blue-300 dark:border-blue-700">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                        <Timer className="h-4 w-4 text-white" />
                                      </div>
                                      <p className="text-lg font-mono text-blue-700 dark:text-blue-300 font-bold">
                                        {formatTime(timerSeconds)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Ações */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <Button 
                                variant="ghost" 
                                size="lg"
                                onClick={() => handleStartActivity(activity.id)}
                                className={`h-12 w-12 p-0 rounded-2xl shadow-lg transition-all duration-300 hover:scale-110 ${
                                  activeTimer === activity.id 
                                    ? 'text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/50' 
                                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                }`}
                              >
                                {activeTimer === activity.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="lg"
                                onClick={() => handleCompleteActivity(activity.id, dayIndex)}
                                className={`h-12 w-12 p-0 rounded-2xl shadow-lg transition-all duration-300 hover:scale-110 ${
                                  activity.status === 'completed' 
                                    ? 'text-white bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/50' 
                                    : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400'
                                }`}
                              >
                                {activity.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="lg"
                                onClick={() => setEditingActivity(activity)}
                                className="h-12 w-12 p-0 rounded-2xl shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all duration-300 hover:scale-110"
                              >
                                <Edit className="h-5 w-5" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="lg"
                                onClick={() => handleDeleteActivity(activity.id, dayIndex)}
                                className="h-12 w-12 p-0 rounded-2xl shadow-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-110"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Study Summary */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Resumo da Semana</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{getCurrentWeek()?.totalHours}h</p>
              <p className="text-sm text-muted-foreground">Total Planejado</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{getCurrentWeek()?.completedHours}h</p>
              <p className="text-sm text-muted-foreground">Concluído</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">
                {getCurrentWeek()?.days.flatMap(d => d.activities).filter(a => a.type === 'exercicio').length}
              </p>
              <p className="text-sm text-muted-foreground">Exercícios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                {getCurrentWeek()?.days.flatMap(d => d.activities).filter(a => a.type === 'redacao').length}
              </p>
              <p className="text-sm text-muted-foreground">Redações</p>
            </div>
          </div>
        </Card>

        {/* Edit Activity Modal */}
        <Dialog open={!!editingActivity} onOpenChange={() => setEditingActivity(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Atividade</DialogTitle>
            </DialogHeader>
            {editingActivity && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-time">Horário</Label>
                    <Input
                      id="edit-time"
                      type="time"
                      value={editingActivity.time}
                      onChange={(e) => setEditingActivity({...editingActivity, time: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-duration">Duração</Label>
                    <Select 
                      value={editingActivity.duration} 
                      onValueChange={(value) => setEditingActivity({...editingActivity, duration: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30min">30 min</SelectItem>
                        <SelectItem value="1h">1 hora</SelectItem>
                        <SelectItem value="1h30">1h30</SelectItem>
                        <SelectItem value="2h">2 horas</SelectItem>
                        <SelectItem value="3h">3 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-subject">Matéria</Label>
                  <Input
                    id="edit-subject"
                    value={editingActivity.subject}
                    onChange={(e) => setEditingActivity({...editingActivity, subject: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-topic">Tópico</Label>
                  <Input
                    id="edit-topic"
                    value={editingActivity.topic}
                    onChange={(e) => setEditingActivity({...editingActivity, topic: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-type">Tipo</Label>
                    <Select 
                      value={editingActivity.type} 
                      onValueChange={(value) => setEditingActivity({...editingActivity, type: value as Activity['type']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aula">Aula</SelectItem>
                        <SelectItem value="exercicio">Exercício</SelectItem>
                        <SelectItem value="redacao">Redação</SelectItem>
                        <SelectItem value="resumo">Resumo</SelectItem>
                        <SelectItem value="revisao">Revisão</SelectItem>
                        <SelectItem value="descanso">Descanso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-priority">Prioridade</Label>
                    <Select 
                      value={editingActivity.priority} 
                      onValueChange={(value) => setEditingActivity({...editingActivity, priority: value as Activity['priority']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-notes">Observações</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingActivity.notes || ''}
                    onChange={(e) => setEditingActivity({...editingActivity, notes: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingActivity(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    if (editingActivity) {
                      const dayIndex = getCurrentWeek()?.days.findIndex(d => 
                        d.activities.some(a => a.id === editingActivity.id)
                      ) || 0;
                      handleEditActivity(editingActivity.id, dayIndex, editingActivity);
                    }
                  }}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Sistema de Metas */}
        <div className="mt-12">
          <GoalManager />
        </div>
      </main>
    </div>
  );
};

export default Cronograma;
