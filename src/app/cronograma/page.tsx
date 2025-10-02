
"use client";
import { useState, useEffect } from "react";
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
import { userDataService, UserData } from "@/services/UserDataService";

interface Activity {
  id: string;
  time: string;
  subject: string;
  topic: string;
  type: 'aula' | 'exercicio' | 'redacao' | 'resumo' | 'revisao' | 'descanso';
  duration: string; // duration in format '1h', '30min'
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  completedAt?: string;
  startedAt?: string;
  elapsedSeconds?: number;
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

const CronogramaEstudos = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  useEffect(() => {
    const loadUserSchedule = async () => {
      if (isDataLoaded) return;
      const savedSchedule = await userDataService.loadSchedule();
      if (savedSchedule && savedSchedule.length > 0) {
        setWeeks(savedSchedule);
      } else {
        initializeDefaultWeeks();
      }
      setIsDataLoaded(true);
    };

    loadUserSchedule();
  }, [isDataLoaded]);

  useEffect(() => {
    if (weeks.length > 0 && isDataLoaded) {
      userDataService.saveSchedule(weeks);
    }
  }, [weeks, isDataLoaded]);

  const initializeDefaultWeeks = () => {
    const defaultWeeks = generateWeeks(true);
    setWeeks(defaultWeeks);
  };
  
  const generateWeeks = (includeExamples: boolean = true) => {
    const weeks: WeekSchedule[] = [];
    const today = new Date();
    const threeMonthsFromNow = new Date(today);
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    const currentDate = new Date(today);
    let weekNumber = 1;
    
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
        
        if (includeExamples && weekNumber === 1 && i < 3) {
          if (i === 0) {
            activities.push({
              id: `${weekNumber}-${i}-1`, time: "08:00", subject: "Matemática", topic: "Funções Quadráticas",
              type: "aula", duration: "2h", status: 'completed', priority: 'high', completedAt: new Date().toISOString()
            });
          }
          if (i === 1) {
            activities.push({
              id: `${weekNumber}-${i}-1`, time: "09:00", subject: "Física", topic: "Mecânica - Cinemática",
              type: "aula", duration: "2h", status: 'pending', priority: 'high'
            });
          }
          if (i === 2) {
            activities.push({
              id: `${weekNumber}-${i}-1`, time: "14:00", subject: "Português", topic: "Interpretação de Texto",
              type: "exercicio", duration: "1h", status: 'pending', priority: 'medium'
            });
          }
        }
        
        days.push({ day: dayNames[i], date: dayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), activities });
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
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  };

  const getCurrentWeek = () => weeks[currentWeek] || weeks[0];
  
  const goToPreviousWeek = () => setCurrentWeek(prev => Math.max(0, prev - 1));
  const goToNextWeek = () => setCurrentWeek(prev => Math.min(weeks.length - 1, prev + 1));
  
  const getTotalStudyHours = () => weeks.reduce((acc, week) => acc + week.totalHours, 0);
  const getCompletedStudyHours = () => weeks.reduce((acc, week) => acc + week.completedHours, 0);
  const getStudyProgress = () => (getTotalStudyHours() > 0 ? (getCompletedStudyHours() / getTotalStudyHours()) * 100 : 0);
  
  const handleAddActivity = async () => {
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
      notes: newActivity.notes,
      elapsedSeconds: 0
    };
    
    await userDataService.addActivity(currentWeek, selectedDayIndex, activity);
    
    const updatedWeeks = [...weeks];
    if (!updatedWeeks[currentWeek].days[selectedDayIndex].activities) {
        updatedWeeks[currentWeek].days[selectedDayIndex].activities = [];
    }
    updatedWeeks[currentWeek].days[selectedDayIndex].activities.push(activity);
    updatedWeeks[currentWeek].days[selectedDayIndex].activities.sort((a,b) => a.time.localeCompare(b.time));
    setWeeks(updatedWeeks);
    
    setNewActivity({ time: '', subject: '', topic: '', type: 'aula', duration: '1h', status: 'pending', priority: 'medium' });
    setIsAddModalOpen(false);
  };

  const handleEditActivity = async () => {
    if(!editingActivity) return;
    
    const dayIndex = weeks[currentWeek].days.findIndex(d => d.activities.some(a => a.id === editingActivity.id));
    if (dayIndex > -1) {
        await userDataService.updateActivity(currentWeek, dayIndex, editingActivity.id, editingActivity);
        const newWeeks = [...weeks];
        const activityIndex = newWeeks[currentWeek].days[dayIndex].activities.findIndex(a => a.id === editingActivity!.id);
        if (activityIndex > -1) {
            newWeeks[currentWeek].days[dayIndex].activities[activityIndex] = editingActivity;
            newWeeks[currentWeek].days[dayIndex].activities.sort((a,b) => a.time.localeCompare(b.time));
            setWeeks(newWeeks);
        }
    }

    setEditingActivity(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteActivity = async (activityId: string, dayIndex: number) => {
    await userDataService.deleteActivity(currentWeek, dayIndex, activityId);
    const newWeeks = [...weeks];
    newWeeks[currentWeek].days[dayIndex].activities = newWeeks[currentWeek].days[dayIndex].activities.filter(a => a.id !== activityId);
    setWeeks(newWeeks);
  };

  const handleStartActivity = (activity: Activity) => {
    if (activeTimer === activity.id) { // Pausing
      setActiveTimer(null);
      const dayIndex = weeks[currentWeek].days.findIndex(d => d.activities.some(a => a.id === activity.id));
      if (dayIndex > -1) {
        const updatedActivity = { ...activity, elapsedSeconds: timerSeconds };
        userDataService.updateActivity(currentWeek, dayIndex, activity.id, updatedActivity);
        
        const newWeeks = [...weeks];
        const activityIndex = newWeeks[currentWeek].days[dayIndex].activities.findIndex(a => a.id === activity.id);
        if (activityIndex > -1) {
            newWeeks[currentWeek].days[dayIndex].activities[activityIndex] = updatedActivity;
            setWeeks(newWeeks);
        }
      }
    } else { // Starting
      setActiveTimer(activity.id);
      setTimerSeconds(activity.elapsedSeconds || 0);
    }
  };
  
  const parseDurationToHours = (duration: string): number => {
    if (duration.includes('h') && duration.includes('min')) {
        const parts = duration.split('h');
        const hours = parseFloat(parts[0]);
        const minutes = parseFloat(parts[1].replace('min', ''));
        return hours + minutes / 60;
    } else if (duration.includes('h')) {
        return parseFloat(duration.replace('h', ''));
    } else if (duration.includes('min')) {
        return parseFloat(duration.replace('min', '')) / 60;
    }
    return 0;
  };

  const handleCompleteActivity = async (activityId: string, dayIndex: number) => {
    const activity = weeks[currentWeek].days[dayIndex].activities.find(a => a.id === activityId);
    if (activity) {
        const durationHours = parseDurationToHours(activity.duration);
        const newStatus = activity.status === 'completed' ? 'pending' : 'completed';
        const completedHoursUpdate = newStatus === 'completed' ? durationHours : -durationHours;
        
        const updatedActivity: Activity = { 
            ...activity, 
            status: newStatus, 
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined 
        };
        
        await userDataService.updateActivity(currentWeek, dayIndex, activityId, updatedActivity);
        
        const newWeeks = [...weeks];
        const activityIndex = newWeeks[currentWeek].days[dayIndex].activities.findIndex(a => a.id === activityId);
        newWeeks[currentWeek].days[dayIndex].activities[activityIndex] = updatedActivity;
        newWeeks[currentWeek].completedHours = Math.max(0, (newWeeks[currentWeek].completedHours || 0) + completedHoursUpdate);

        setWeeks(newWeeks);
    }
  };

  const schedule = getCurrentWeek()?.days || [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // Domingo = 0, Segunda = 1, ...
  const currentDayName = schedule[dayOfWeek === 0 ? 6 : dayOfWeek - 1]?.day || schedule[0]?.day;

  const getTypeColor = (type: string) => ({aula: "primary", exercicio: "success", redacao: "accent", resumo: "secondary", revisao: "outline", descanso: "outline"}[type as 'aula'|'exercicio'|'redacao'|'resumo'|'revisao'|'descanso'] || "outline");
  const getTypeIcon = (type: string) => ({aula: <BookOpen className="h-4 w-4" />, exercicio: <Target className="h-4 w-4" />, redacao: <Edit className="h-4 w-4" />, resumo: <BookOpen className="h-4 w-4" />, revisao: <TrendingUp className="h-4 w-4" />, descanso: <Circle className="h-4 w-4" />}[type as 'aula'|'exercicio'|'redacao'|'resumo'|'revisao'|'descanso'] || <BookOpen className="h-4 w-4" />);
  const getStatusColor = (status: string) => ({completed: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400', in_progress: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400', pending: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'}[status as 'completed'|'in_progress'|'pending'] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400');
  const getStatusIcon = (status: string) => ({completed: <CheckCircle className="h-4 w-4" />, in_progress: <Play className="h-4 w-4" />, pending: <Circle className="h-4 w-4" />}[status as 'completed'|'in_progress'|'pending'] || <Circle className="h-4 w-4" />);
  const getPriorityColor = (priority: string) => ({high: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400', medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400', low: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'}[priority as 'high'|'medium'|'low'] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400');

  const ActivityCard = ({ activity, dayIndex }: { activity: Activity; dayIndex: number }) => (
    <Card className="p-4 bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-lg transition-shadow flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <Badge variant={getTypeColor(activity.type) as any} className="text-xs">{activity.type}</Badge>
        <Badge className={`text-xs ${getPriorityColor(activity.priority)}`}>{activity.priority}</Badge>
      </div>
      <div className="flex-grow">
          <p className="font-semibold text-base break-words">{activity.subject}</p>
          <p className="text-sm text-muted-foreground mb-3 break-words">{activity.topic}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground mb-3">
        <span>{activity.time} - {activity.duration}</span>
        <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
          {getStatusIcon(activity.status)} <span className="ml-1">{activity.status}</span>
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button size="sm" variant="ghost" className="justify-start" onClick={() => handleStartActivity(activity)}>
          {activeTimer === activity.id ? <Pause size={16} className="mr-2"/> : <Play size={16} className="mr-2"/>}
          {activeTimer === activity.id ? 'Pausar' : 'Iniciar'}
        </Button>
        <Button size="sm" variant="ghost" className="justify-start" onClick={() => handleCompleteActivity(activity.id, dayIndex)}>
          <CheckCircle size={16} className="mr-2"/>
          {activity.status === 'completed' ? 'Refazer' : 'Concluir'}
        </Button>
        <Button size="sm" variant="ghost" className="justify-start" onClick={() => {setEditingActivity(activity); setIsEditModalOpen(true);}}>
          <Edit size={16} className="mr-2"/>
          Editar
        </Button>
        <Button size="sm" variant="destructive" className="justify-start" onClick={() => handleDeleteActivity(activity.id, dayIndex)}>
          <Trash2 size={16} className="mr-2"/>
          Excluir
        </Button>
      </div>
       {activeTimer === activity.id && <div className="text-base font-semibold mt-2 text-primary">{formatTime(timerSeconds)}</div>}
       {activity.elapsedSeconds && activity.elapsedSeconds > 0 && activeTimer !== activity.id && (
         <div className="text-sm text-muted-foreground mt-2">Tempo focado: {formatTime(activity.elapsedSeconds)}</div>
       )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Cronograma de Estudos</h1>
          <Button onClick={() => { setSelectedDayIndex(new Date().getDay() -1); setIsAddModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nova Atividade
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Progresso Total</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={getStudyProgress()} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {getCompletedStudyHours().toFixed(1)}h de {getTotalStudyHours()}h concluídas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Meta Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{studyGoal} horas</p>
              <p className="text-sm text-muted-foreground">de estudo por semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cronômetro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatTime(timerSeconds)}</p>
              <p className="text-sm text-muted-foreground">Tempo de estudo focado</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button onClick={goToPreviousWeek} disabled={currentWeek === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <div className="text-center">
              <h2 className="text-xl font-semibold">Semana {getCurrentWeek()?.weekNumber}</h2>
              <p className="text-sm text-muted-foreground">{getCurrentWeek()?.startDate} - {getCurrentWeek()?.endDate}</p>
            </div>
            <Button onClick={goToNextWeek} disabled={!weeks || currentWeek === weeks.length - 1}>
              Próxima <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="hidden md:grid md:grid-cols-7 gap-4">
            {schedule.map((day, dayIndex) => (
              <div key={dayIndex} className="bg-card/50 dark:bg-slate-800/50 p-4 rounded-lg min-h-[200px]">
                <div className="text-center mb-4">
                  <p className="font-semibold">{day.day}</p>
                  <p className="text-xs text-muted-foreground">{day.date}</p>
                </div>
                <div className="space-y-3">
                  {day.activities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} dayIndex={dayIndex} />
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => {
                    setSelectedDayIndex(dayIndex);
                    setIsAddModalOpen(true);
                  }}>
                    <Plus size={14} className="mr-1" /> Adicionar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="md:hidden">
            <Tabs defaultValue={currentDayName} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {schedule.slice(0, 4).map((day) => (
                  <TabsTrigger key={day.day} value={day.day}>{day.day.substring(0,3)}</TabsTrigger>
                ))}
              </TabsList>
              <TabsList className="grid w-full grid-cols-3 mt-1">
                {schedule.slice(4).map((day) => (
                  <TabsTrigger key={day.day} value={day.day}>{day.day.substring(0,3)}</TabsTrigger>
                ))}
              </TabsList>
              {schedule.map((day, dayIndex) => (
                <TabsContent key={day.day} value={day.day}>
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>{day.day} - {day.date}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {day.activities.length > 0 ? day.activities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} dayIndex={dayIndex} />
                      )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade agendada.</p>
                      )}
                      <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => {
                        setSelectedDayIndex(dayIndex);
                        setIsAddModalOpen(true);
                      }}>
                        <Plus size={14} className="mr-1" /> Adicionar Atividade
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Nova Atividade</DialogTitle>
                </DialogHeader>
                 <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="new-time">Horário</Label>
                            <Input id="new-time" type="time" value={newActivity.time} onChange={(e) => setNewActivity({...newActivity, time: e.target.value})} />
                        </div>
                        <div>
                            <Label htmlFor="new-duration">Duração</Label>
                            <Select value={newActivity.duration} onValueChange={(v) => setNewActivity({...newActivity, duration: v})}>
                                <SelectTrigger id="new-duration"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30min">30 min</SelectItem>
                                    <SelectItem value="1h">1 hora</SelectItem>
                                    <SelectItem value="1h30min">1h 30min</SelectItem>
                                    <SelectItem value="2h">2 horas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="new-subject">Matéria</Label>
                        <Input id="new-subject" value={newActivity.subject} onChange={(e) => setNewActivity({...newActivity, subject: e.target.value})} placeholder="Ex: Matemática" />
                    </div>
                    <div>
                        <Label htmlFor="new-topic">Tópico</Label>
                        <Input id="new-topic" value={newActivity.topic} onChange={(e) => setNewActivity({...newActivity, topic: e.target.value})} placeholder="Ex: Funções Quadráticas" />
                    </div>
                     <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddActivity}>Adicionar</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Atividade</DialogTitle>
                </DialogHeader>
                {editingActivity && (
                     <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-time">Horário</Label>
                                <Input id="edit-time" type="time" value={editingActivity.time} onChange={(e) => setEditingActivity({...editingActivity, time: e.target.value})} />
                            </div>
                            <div>
                                <Label htmlFor="edit-duration">Duração</Label>
                                <Select value={editingActivity.duration} onValueChange={(v) => setEditingActivity({...editingActivity!, duration: v})}>
                                    <SelectTrigger id="edit-duration"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="30min">30 min</SelectItem>
                                        <SelectItem value="1h">1 hora</SelectItem>
                                        <SelectItem value="1h30min">1h 30min</SelectItem>
                                        <SelectItem value="2h">2 horas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-subject">Matéria</Label>
                            <Input id="edit-subject" value={editingActivity.subject} onChange={(e) => setEditingActivity({...editingActivity, subject: e.target.value})} />
                        </div>
                        <div>
                            <Label htmlFor="edit-topic">Tópico</Label>
                            <Input id="edit-topic" value={editingActivity.topic} onChange={(e) => setEditingActivity({...editingActivity, topic: e.target.value})} />
                        </div>
                         <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleEditActivity}>Salvar</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>

        <GoalManager />
      </main>
    </div>
  );
};

export default function CronogramaPage() {
  return <CronogramaEstudos />;
}
