import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
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
  TrendingDown, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Brain,
  Calendar,
  BarChart3,
  Star,
  Zap,
  BookOpen,
  FileText,
  Award
} from 'lucide-react';
// import AIGoalService from '@/services/AIGoalService';
// import type { Goal, GoalTemplate, GoalAnalysis, StudyPlan } from '@/services/AIGoalService';

// Interfaces temporárias para evitar dependências
interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'study_time' | 'simulados' | 'redacoes' | 'subjects' | 'performance' | 'habits';
  category: 'daily' | 'weekly' | 'monthly' | 'long_term';
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'paused' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
  milestones: Milestone[];
  aiRecommendations: string[];
  progressHistory: ProgressEntry[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  completedAt?: Date;
}

interface ProgressEntry {
  date: Date;
  value: number;
  notes?: string;
}

interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  type: Goal['type'];
  category: Goal['category'];
  defaultTarget: number;
  defaultUnit: string;
  defaultDuration: number; // em dias
  difficulty: Goal['difficulty'];
  tags: string[];
  aiPrompt: string;
}

interface GoalAnalysis {
  performance: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
  nextMilestone: string;
  estimatedCompletion: Date;
  completionRate: number;
  averageProgress: number;
  obstacles: string[];
}

interface StudyPlan {
  id: string;
  name: string;
  description: string;
  goals: Goal[];
  schedule: StudySession[];
  duration: number; // em semanas
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subjects: string[];
  createdAt: Date;
  updatedAt: Date;
  aiGenerated?: boolean;
  progress?: number;
  estimatedHours?: number;
}

interface StudySession {
  id: string;
  day: number;
  time: string;
  duration: number; // em minutos
  subject: string;
  topic: string;
  type: 'theory' | 'practice' | 'review' | 'test';
  goals: string[];
  resources: string[];
}

interface GoalManagerProps {
  className?: string;
}

const GoalManager: React.FC<GoalManagerProps> = ({ className }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalAnalysis, setGoalAnalysis] = useState<GoalAnalysis | null>(null);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: '',
    category: '',
    subject: '',
    target: '',
    deadline: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Dados mockados para demonstração
    const mockGoals: Goal[] = [
      {
        id: '1',
        title: 'Estudar 4 horas por dia',
        description: 'Meta diária de estudo para manter o ritmo',
        type: 'study_time',
        category: 'daily',
        target: 4,
        current: 2.5,
        unit: 'horas',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        difficulty: 'medium',
        tags: ['estudo', 'rotina'],
        milestones: [],
        aiRecommendations: ['Mantenha o foco nas matérias mais difíceis'],
        progressHistory: []
      }
    ];
    
    const mockTemplates: GoalTemplate[] = [
      {
        id: '1',
        name: 'Meta de Estudo Diário',
        description: 'Template para metas de estudo diário',
        type: 'study_time',
        category: 'daily',
        defaultTarget: 4,
        defaultUnit: 'horas',
        defaultDuration: 30,
        difficulty: 'medium',
        tags: ['estudo', 'diário'],
        aiPrompt: 'Crie uma meta de estudo diário personalizada'
      }
    ];
    
    const mockPlans: StudyPlan[] = [
      {
        id: '1',
        name: 'Plano Intensivo ENEM',
        description: 'Plano de estudo intensivo para o ENEM',
        goals: [],
        schedule: [],
        duration: 12,
        difficulty: 'advanced',
        subjects: ['Matemática', 'Português', 'Física', 'Química'],
        createdAt: new Date(),
        updatedAt: new Date(),
        aiGenerated: true,
        progress: 25,
        estimatedHours: 120,
      }
    ];
    
    setGoals(mockGoals);
    setTemplates(mockTemplates);
    setStudyPlans(mockPlans);
  };

  const handleCreateGoal = () => {
    if (!newGoal.type || !newGoal.category) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const preferences = {
      subject: newGoal.subject,
      target: parseInt(newGoal.target) || undefined,
      deadline: newGoal.deadline ? new Date(newGoal.deadline) : undefined,
      priority: newGoal.priority
    };

    const newGoalData: Goal = {
      id: Date.now().toString(),
      title: `Meta de ${newGoal.type}`,
      description: `Meta personalizada para ${newGoal.subject || 'estudos'}`,
      type: newGoal.type as Goal['type'],
      category: newGoal.category as Goal['category'],
      target: parseInt(newGoal.target) || 1,
      current: 0,
      unit: 'unidades',
      deadline: newGoal.deadline ? new Date(newGoal.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: newGoal.priority as Goal['priority'],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      difficulty: 'medium',
      tags: [newGoal.subject || 'estudo'],
      milestones: [],
      aiRecommendations: [],
      progressHistory: []
    };

    setGoals(prev => [...prev, newGoalData]);
    setShowCreateGoal(false);
    setNewGoal({
      type: '',
      category: '',
      subject: '',
      target: '',
      deadline: '',
      priority: 'medium'
    });
  };

  const handleUpdateProgress = (goalId: string, progress: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, current: Math.min(progress, goal.target), updatedAt: new Date() }
        : goal
    ));
  };

  const handleAnalyzeGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    const analysis: GoalAnalysis = {
      performance: (goal.current / goal.target) * 100,
      trend: goal.current > goal.target * 0.8 ? 'improving' : 'stable',
      insights: ['Continue mantendo o foco nos estudos'],
      recommendations: ['Ajuste seu cronograma se necessário'],
      riskFactors: [],
      nextMilestone: 'Próxima meta',
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      completionRate: (goal.current / goal.target) * 100,
      averageProgress: (goal.current / goal.target) * 100,
      obstacles: ['Falta de tempo', 'Dificuldade na matéria'],
    };
    setGoalAnalysis(analysis);
  };

  const handleCreateStudyPlan = (preferences: any) => {
    const plan: StudyPlan = {
      id: Date.now().toString(),
      name: 'Novo Plano de Estudo',
      description: 'Plano personalizado criado pelo usuário',
      goals: [],
      schedule: [],
      duration: 4,
      difficulty: 'intermediate',
      subjects: ['Matemática', 'Português'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setStudyPlans(prev => [...prev, plan]);
    setShowCreatePlan(false);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'study_time': return <Clock className="h-5 w-5" />;
      case 'simulados': return <BarChart3 className="h-5 w-5" />;
      case 'redacoes': return <FileText className="h-5 w-5" />;
      case 'performance': return <Target className="h-5 w-5" />;
      case 'subjects': return <BookOpen className="h-5 w-5" />;
      case 'habits': return <Award className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className={className}>
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Suas Metas</h3>
            <Dialog open={showCreateGoal} onOpenChange={setShowCreateGoal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Meta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tipo de Meta</label>
                      <Select value={newGoal.type} onValueChange={(value) => setNewGoal({ ...newGoal, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="study_time">Tempo de Estudo</SelectItem>
                          <SelectItem value="simulados">Simulados</SelectItem>
                          <SelectItem value="redacoes">Redações</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="subjects">Matérias</SelectItem>
                          <SelectItem value="habits">Hábitos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Categoria</label>
                      <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diária</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="long_term">Longo Prazo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Matéria (opcional)</label>
                      <Input
                        value={newGoal.subject}
                        onChange={(e) => setNewGoal({ ...newGoal, subject: e.target.value })}
                        placeholder="Ex: Matemática"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Meta (opcional)</label>
                      <Input
                        value={newGoal.target}
                        onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                        placeholder="Ex: 120"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prazo</label>
                      <Input
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prioridade</label>
                      <Select value={newGoal.priority} onValueChange={(value) => setNewGoal({ ...newGoal, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button onClick={handleCreateGoal} className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    Criar Meta com IA
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(goal => (
              <Card key={goal.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getGoalIcon(goal.type)}
                    <h4 className="font-medium">{goal.title}</h4>
                  </div>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{goal.current}/{goal.target} {goal.unit}</span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getPriorityColor(goal.priority)}>
                    {goal.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAnalyzeGoal(goal)}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analisar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const newProgress = prompt(`Progresso atual: ${goal.current}/${goal.target} ${goal.unit}\nNovo valor:`);
                      if (newProgress) {
                        handleUpdateProgress(goal.id, parseInt(newProgress));
                      }
                    }}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Atualizar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <h3 className="text-lg font-semibold">Templates de Metas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">{template.name}</h4>
                  <Badge variant="outline">{template.difficulty}</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">{template.category}</Badge>
                  <Badge variant="outline">{template.type}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button
                  size="sm"
                  onClick={() => {
                    setNewGoal({
                      type: template.type,
                      category: template.category,
                      subject: '',
                      target: '',
                      deadline: '',
                      priority: 'medium'
                    });
                    setShowCreateGoal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Usar Template
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Planos de Estudo</h3>
            <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Plano de Estudo com IA</DialogTitle>
                </DialogHeader>
                <CreateStudyPlanForm onSubmit={handleCreateStudyPlan} />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyPlans.map(plan => (
              <Card key={plan.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">{plan.name}</h4>
                  {plan.aiGenerated && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      <Brain className="h-3 w-3 mr-1" />
                      IA
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{Math.round(plan.progress || 0)}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{plan.estimatedHours || 0}h estimadas</span>
                  <span>{plan.difficulty}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {selectedGoal && goalAnalysis && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Análise da Meta: {selectedGoal.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{Math.round(goalAnalysis.completionRate)}%</div>
                  <div className="text-sm text-muted-foreground">Conclusão</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{Math.round(goalAnalysis.averageProgress)}</div>
                  <div className="text-sm text-muted-foreground">Progresso Médio</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(goalAnalysis.trend)}
                    <span className="text-sm font-medium">
                      {goalAnalysis.trend === 'improving' ? 'Melhorando' : 
                       goalAnalysis.trend === 'declining' ? 'Declinando' : 'Estável'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Recomendações</h4>
                  <div className="space-y-2">
                    {goalAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Obstáculos</h4>
                  <div className="space-y-2">
                    {goalAnalysis.obstacles.map((obstacle, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm">{obstacle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente para criar plano de estudo
const CreateStudyPlanForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    difficulty: 'intermediate',
    subjects: [] as string[],
    estimatedHours: 100
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Nome do Plano</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Plano Intensivo ENEM 2025"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Descrição</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva seus objetivos com este plano..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Duração (dias)</label>
          <Input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            min="1"
            max="365"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Dificuldade</label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Iniciante</SelectItem>
              <SelectItem value="intermediate">Intermediário</SelectItem>
              <SelectItem value="advanced">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Horas Estimadas</label>
        <Input
          type="number"
          value={formData.estimatedHours}
          onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) })}
          min="1"
          max="1000"
        />
      </div>
      
      <Button type="submit" className="w-full">
        <Brain className="h-4 w-4 mr-2" />
        Criar Plano com IA
      </Button>
    </form>
  );
};

export default GoalManager;
