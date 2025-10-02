import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  BarChart3,
  Brain,
  FileText,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { userDataService } from '@/services/UserDataService';
import { Label } from "@/components/ui/label";

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'study_time' | 'simulados' | 'redacoes' | 'subjects' | 'performance' | 'habits';
  category: 'daily' | 'weekly' | 'monthly' | 'long_term';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'paused' | 'completed' | 'failed';
}

const GoalManager: React.FC<{ className?: string }> = ({ className }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Omit<Goal, 'id' | 'current' | 'status'>>>({
    title: '',
    description: '',
    type: 'study_time',
    category: 'weekly',
    target: 10,
    unit: 'horas',
    deadline: '',
    priority: 'medium'
  });

  useEffect(() => {
    const fetchGoals = async () => {
      const loadedGoals = await userDataService.loadGoals();
      setGoals(loadedGoals);
    };
    fetchGoals();
  }, []);

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const goalToAdd: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description || '',
      type: newGoal.type || 'study_time',
      category: newGoal.category || 'weekly',
      target: newGoal.target,
      current: 0,
      unit: newGoal.unit || 'unidades',
      deadline: newGoal.deadline,
      priority: newGoal.priority || 'medium',
      status: 'active',
    };

    const updatedGoals = [...goals, goalToAdd];
    setGoals(updatedGoals);
    await userDataService.saveGoals(updatedGoals);

    setShowCreateGoal(false);
    setNewGoal({
      title: '',
      description: '',
      type: 'study_time',
      category: 'weekly',
      target: 10,
      unit: 'horas',
      deadline: '',
      priority: 'medium'
    });
  };

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, current: Math.min(newProgress, goal.target) }
        : goal
    );
    setGoals(updatedGoals);
    await userDataService.saveGoals(updatedGoals);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'study_time': return <Clock className="h-5 w-5" />;
      case 'simulados': return <BarChart3 className="h-5 w-5" />;
      case 'redacoes': return <FileText className="h-5 w-5" />;
      case 'subjects': return <BookOpen className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Gerenciador de Metas
          </CardTitle>
          <Dialog open={showCreateGoal} onOpenChange={setShowCreateGoal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Meta</Label>
                  <Input id="title" value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} placeholder="Ex: Estudar 10h de Matemática" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target">Alvo</Label>
                    <Input id="target" type="number" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidade</Label>
                    <Input id="unit" value={newGoal.unit} onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})} placeholder="Ex: horas, simulados" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo Final</Label>
                  <Input id="deadline" type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={newGoal.type} onValueChange={(v: Goal['type']) => setNewGoal({...newGoal, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study_time">Tempo de Estudo</SelectItem>
                      <SelectItem value="simulados">Simulados</SelectItem>
                      <SelectItem value="redacoes">Redações</SelectItem>
                      <SelectItem value="subjects">Matérias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateGoal} className="w-full">
                  Criar Meta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.map(goal => (
            <Card key={goal.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getGoalIcon(goal.type)}
                  <h4 className="font-medium">{goal.title}</h4>
                </div>
                <Badge variant={goal.status === 'completed' ? 'default' : 'outline'}>
                  {goal.status}
                </Badge>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{goal.current}/{goal.target} {goal.unit}</span>
                </div>
                <Progress value={(goal.current / goal.target) * 100} className="h-2" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newProgress = prompt(`Progresso atual: ${goal.current}. Novo valor:`);
                    if (newProgress !== null && !isNaN(Number(newProgress))) {
                      handleUpdateProgress(goal.id, Number(newProgress));
                    }
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Atualizar
                </Button>
              </div>
            </Card>
          ))}
          {goals.length === 0 && (
             <div className="text-center py-4 text-muted-foreground">
                <p>Nenhuma meta definida ainda. Crie sua primeira meta!</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalManager;
