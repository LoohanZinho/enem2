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
import { userDataService } from "@/services/UserDataService";

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

const CronogramaEstudos = () => {
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

  useEffect(() => {
    if (isDataLoaded) return;

    const loadUserSchedule = () => {
      const savedSchedule = userDataService.loadSchedule();
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
  const getStudyProgress = () => (getCompletedStudyHours() / (getTotalStudyHours() || 1)) * 100;

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
    
    const updatedWeeks = [...weeks];
    updatedWeeks[currentWeek].days[selectedDayIndex].activities.push(activity);
    setWeeks(updatedWeeks);
    
    setNewActivity({ time: '', subject: '', topic: '', type: 'aula', duration: '1h', status: 'pending', priority: 'medium' });
    setIsAddingActivity(false);
  };

  const handleEditActivity = (activityId: string, dayIndex: number, updatedActivity: Partial<Activity>) => {
    setWeeks(prevWeeks => {
        const newWeeks = [...prevWeeks];
        const activityIndex = newWeeks[currentWeek].days[dayIndex].activities.findIndex(a => a.id === activityId);
        if (activityIndex > -1) {
            newWeeks[currentWeek].days[dayIndex].activities[activityIndex] = {
                ...newWeeks[currentWeek].days[dayIndex].activities[activityIndex],
                ...updatedActivity
            };
        }
        return newWeeks;
    });
    setEditingActivity(null);
  };

  const handleDeleteActivity = (activityId: string, dayIndex: number) => {
    setWeeks(prevWeeks => {
        const newWeeks = [...prevWeeks];
        newWeeks[currentWeek].days[dayIndex].activities = newWeeks[currentWeek].days[dayIndex].activities.filter(a => a.id !== activityId);
        return newWeeks;
    });
  };

  const handleStartActivity = (activityId: string) => {
    setActiveTimer(prev => (prev === activityId ? null : activityId));
    setTimerSeconds(0);
  };

  const handleCompleteActivity = (activityId: string, dayIndex: number) => {
    setWeeks(prevWeeks => {
        const newWeeks = [...prevWeeks];
        const activity = newWeeks[currentWeek].days[dayIndex].activities.find(a => a.id === activityId);
        if (activity) {
            const durationHours = parseFloat(activity.duration.replace('h', ''));
            if (activity.status === 'completed') {
                activity.status = 'pending';
                activity.completedAt = undefined;
                newWeeks[currentWeek].completedHours -= durationHours;
            } else {
                activity.status = 'completed';
                activity.completedAt = new Date().toISOString();
                newWeeks[currentWeek].completedHours += durationHours;
            }
        }
        return newWeeks;
    });
  };

  const schedule = getCurrentWeek()?.days || [];

  const getTypeColor = (type: string) => ({aula: "primary", exercicio: "success", redacao: "accent", resumo: "secondary", revisao: "outline", descanso: "outline"}[type as 'aula'|'exercicio'|'redacao'|'resumo'|'revisao'|'descanso'] || "outline");
  const getTypeIcon = (type: string) => ({aula: <BookOpen className="h-4 w-4" />, exercicio: <Target className="h-4 w-4" />, redacao: <Edit className="h-4 w-4" />, resumo: <BookOpen className="h-4 w-4" />, revisao: <TrendingUp className="h-4 w-4" />, descanso: <Circle className="h-4 w-4" />}[type as 'aula'|'exercicio'|'redacao'|'resumo'|'revisao'|'descanso'] || <BookOpen className="h-4 w-4" />);
  const getStatusColor = (status: string) => ({completed: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400', in_progress: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400', pending: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'}[status as 'completed'|'in_progress'|'pending'] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400');
  const getStatusIcon = (status: string) => ({completed: <CheckCircle className="h-4 w-4" />, in_progress: <Play className="h-4 w-4" />, pending: <Circle className="h-4 w-4" />}[status as 'completed'|'in_progress'|'pending'] || <Circle className="h-4 w-4" />);
  const getPriorityColor = (priority: string) => ({high: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400', medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400', low: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'}[priority as 'high'|'medium'|'low'] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Conteúdo do componente aqui */}
      </main>
    </div>
  );
};

export default function CronogramaPage() {
  return <CronogramaEstudos />;
}
