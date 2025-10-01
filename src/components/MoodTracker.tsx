import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Smile, 
  Frown, 
  Meh, 
  Battery, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Heart,
  Brain,
  Target,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Calendar,
  BarChart3
} from 'lucide-react';
import MoodAnalysisService, { MoodEntry, MoodTrend, WellbeingRecommendation, StressIndicator } from '@/services/MoodAnalysisService';

interface MoodTrackerProps {
  className?: string;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ className }) => {
  const [currentMood, setCurrentMood] = useState<Partial<MoodEntry>>({});
  const [moodTrends, setMoodTrends] = useState<MoodTrend | null>(null);
  const [recommendations, setRecommendations] = useState<WellbeingRecommendation[]>([]);
  const [stressIndicator, setStressIndicator] = useState<StressIndicator | null>(null);
  const [showMoodEntry, setShowMoodEntry] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  const moodService = MoodAnalysisService.getInstance();

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = () => {
    const trends = moodService.getMoodTrends(selectedPeriod);
    const recs = moodService.generateRecommendations();
    const stress = moodService.assessStress();

    setMoodTrends(trends);
    setRecommendations(recs);
    setStressIndicator(stress);
  };

  const handleMoodSubmit = () => {
    if (!currentMood.mood || !currentMood.energy || !currentMood.stress || !currentMood.motivation || !currentMood.confidence) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    moodService.recordMoodEntry(currentMood as Omit<MoodEntry, 'id' | 'timestamp'>);
    setCurrentMood({});
    setShowMoodEntry(false);
    loadData();
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'very_happy': return '😄';
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'sad': return '😔';
      case 'very_sad': return '😢';
      default: return '😐';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'very_happy': return 'text-green-600';
      case 'happy': return 'text-green-500';
      case 'neutral': return 'text-yellow-500';
      case 'sad': return 'text-orange-500';
      case 'very_sad': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'very_high': return <Zap className="h-5 w-5 text-green-600" />;
      case 'high': return <Battery className="h-5 w-5 text-green-500" />;
      case 'medium': return <Battery className="h-5 w-5 text-yellow-500" />;
      case 'low': return <Battery className="h-5 w-5 text-orange-500" />;
      case 'very_low': return <Battery className="h-5 w-5 text-red-500" />;
      default: return <Battery className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStressLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={className}>
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="methods">Métodos de Estudos</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Métodos de Estudos Recomendados</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Técnica Pomodoro</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    25 minutos de foco + 5 minutos de pausa
                  </p>
                  <Button size="sm" variant="outline">Aplicar</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Mapas Mentais</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Organize informações visualmente
                  </p>
                  <Button size="sm" variant="outline">Aplicar</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Repetição Espaçada</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Revise em intervalos crescentes
                  </p>
                  <Button size="sm" variant="outline">Aplicar</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Estudo Ativo</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Faça perguntas e explique o conteúdo
                  </p>
                  <Button size="sm" variant="outline">Aplicar</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tendências de Humor</h3>
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Hoje</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {moodTrends && (
              <div className="space-y-6">
                {/* Resumo das Tendências */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{moodTrends.averageMood.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Humor</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{moodTrends.averageEnergy.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Energia</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{moodTrends.averageStress.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Estresse</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{moodTrends.averageMotivation.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Motivação</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{moodTrends.averageConfidence.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Confiança</div>
                  </div>
                </div>

                {/* Tendência Geral */}
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  {getTrendIcon(moodTrends.trend)}
                  <span className="font-medium">
                    Tendência: {moodTrends.trend === 'improving' ? 'Melhorando' : 
                              moodTrends.trend === 'declining' ? 'Declinando' : 'Estável'}
                  </span>
                </div>

                {/* Insights */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Insights
                  </h4>
                  <div className="space-y-2">
                    {moodTrends.insights.map((insight, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recomendações */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recomendações
                  </h4>
                  <div className="space-y-2">
                    {moodTrends.recommendations.map((recommendation, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recomendações de Bem-estar</h3>
            
            <div className="space-y-4">
              {recommendations.map(rec => (
                <div key={rec.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                    <Badge className={`${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{rec.estimatedTime} min</span>
                      <span className="capitalize">{rec.difficulty}</span>
                      <span>{rec.category}</span>
                    </div>
                    
                    <Button
                      size="sm"
                      variant={rec.isCompleted ? "outline" : "default"}
                      onClick={() => {
                        moodService.completeRecommendation(rec.id);
                        loadData();
                      }}
                    >
                      {rec.isCompleted ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluído
                        </>
                      ) : (
                        'Fazer'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default MoodTracker;
