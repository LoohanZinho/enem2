import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  BookOpen,
  Brain,
  Download,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Users,
  Award,
  Zap
} from 'lucide-react';
import AdvancedAnalyticsService, { PerformanceMetrics, LearningInsights, ReportData } from '@/services/AdvancedAnalyticsService';

interface AdvancedReportsProps {
  className?: string;
}

const AdvancedReports: React.FC<AdvancedReportsProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  const analyticsService = AdvancedAnalyticsService.getInstance();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = 'current-user'; // Em produção, viria do contexto de autenticação
      const performanceMetrics = await analyticsService.calculatePerformanceMetrics(userId, selectedPeriod);
      const learningInsights = await analyticsService.generateLearningInsights(userId);
      const userReports = analyticsService.getReports(userId);

      setMetrics(performanceMetrics);
      setInsights(learningInsights);
      setReports(userReports);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, [analyticsService, selectedPeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateReport = async (type: 'performance' | 'progress' | 'insights' | 'predictions' | 'comparative') => {
    setIsLoading(true);
    try {
      const userId = 'current-user';
      const report = await analyticsService.generateReport(userId, type, selectedPeriod);
      setReports(prev => [report, ...prev]);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Card className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando dados...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Visão Geral</h3>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setSelectedPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Hoje</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadData} size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </div>

          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{metrics.overallScore}</div>
                    <div className="text-sm text-muted-foreground">Pontuação Geral</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{Math.round(metrics.accuracyRate * 100)}%</div>
                    <div className="text-sm text-muted-foreground">Taxa de Acerto</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{Math.round(metrics.studyTime / 60)}h</div>
                    <div className="text-sm text-muted-foreground">Tempo de Estudo</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{Math.round(metrics.consistencyScore)}%</div>
                    <div className="text-sm text-muted-foreground">Consistência</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Tendências</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Performance Geral</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metrics.trends.overall)}
                      <span className={`text-sm font-medium ${getTrendColor(metrics.trends.overall)}`}>
                        {metrics.trends.overall === 'improving' ? 'Melhorando' : 
                         metrics.trends.overall === 'declining' ? 'Declinando' : 'Estável'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo de Estudo</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metrics.trends.studyTime)}
                      <span className={`text-sm font-medium ${getTrendColor(metrics.trends.studyTime)}`}>
                        {metrics.trends.studyTime === 'improving' ? 'Aumentando' : 
                         metrics.trends.studyTime === 'declining' ? 'Diminuindo' : 'Estável'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Precisão</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metrics.trends.accuracy)}
                      <span className={`text-sm font-medium ${getTrendColor(metrics.trends.accuracy)}`}>
                        {metrics.trends.accuracy === 'improving' ? 'Melhorando' : 
                         metrics.trends.accuracy === 'declining' ? 'Declinando' : 'Estável'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold mb-4">Recomendações</h4>
                <div className="space-y-2">
                  {metrics.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance por Matéria</h3>
            {metrics && (
              <div className="space-y-4">
                {Array.from(metrics.subjectBreakdown.entries()).map(([subject, subjectMetrics]) => (
                  <div key={subject} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{subject}</h4>
                      <Badge variant="outline">
                        {Math.round(subjectMetrics.accuracyRate * 100)}% acerto
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{subjectMetrics.correctAnswers}/{subjectMetrics.questionsAnswered} questões</span>
                      </div>
                      <Progress value={subjectMetrics.accuracyRate * 100} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                      <span>Tempo: {Math.round(subjectMetrics.timeSpent / 60)}h</span>
                      <span>Sequência: {subjectMetrics.studyStreak} dias</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {insights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Perfil de Aprendizado</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estilo de Aprendizado</span>
                    <Badge variant="outline" className="capitalize">
                      {insights.learningStyle}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Horário Ótimo</span>
                    <span className="text-sm font-medium">
                      {insights.optimalStudyTime.start} - {insights.optimalStudyTime.end}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dificuldade Preferida</span>
                    <Badge variant="outline" className="capitalize">
                      {insights.preferredDifficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Retenção</span>
                    <span className="text-sm font-medium">
                      {Math.round(insights.retentionRate * 100)}%
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Lacunas de Conhecimento</h3>
                <div className="space-y-3">
                  {insights.knowledgeGaps.map((gap, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{gap.subject} - {gap.topic}</span>
                        <Badge className={getSeverityColor(gap.severity)}>
                          {gap.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Impacto: {Math.round(gap.impact)}%
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Nível de Domínio</h3>
                <div className="space-y-3">
                  {Array.from(insights.masteryLevel.entries()).map(([subject, level]) => (
                    <div key={subject} className="flex items-center justify-between">
                      <span className="text-sm">{subject}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={level} className="w-20 h-2" />
                        <span className="text-sm font-medium w-12">{level}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Curva do Esquecimento</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>1 dia</span>
                    <span>{Math.round(insights.forgettingCurve.day1 * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>3 dias</span>
                    <span>{Math.round(insights.forgettingCurve.day3 * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>7 dias</span>
                    <span>{Math.round(insights.forgettingCurve.day7 * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>30 dias</span>
                    <span>{Math.round(insights.forgettingCurve.day30 * 100)}%</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {metrics && metrics.predictions && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Previsão ENEM</h3>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(metrics.predictions.predictedENEMScore)}
                    </div>
                    <div className="text-sm text-muted-foreground">Pontuação Prevista</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Confiança: {Math.round(metrics.predictions.confidence * 100)}%
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tempo para Meta</span>
                      <span>{Math.round(metrics.predictions.timeToTarget)} dias</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Probabilidade de Sucesso</span>
                      <span>{Math.round(metrics.predictions.probabilityOfSuccess * 100)}%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Fatores de Risco</h3>
                <div className="space-y-2">
                  {metrics.predictions.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Oportunidades</h3>
                <div className="space-y-2">
                  {metrics.predictions.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{opportunity}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Marcos Futuros</h3>
                <div className="space-y-3">
                  {metrics.predictions.milestones.map((milestone, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{milestone.description}</span>
                        <span className="text-sm text-muted-foreground">
                          {milestone.date.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Meta: {milestone.expectedScore} pontos
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Relatórios</h3>
            <div className="flex gap-2">
              <Button onClick={() => generateReport('performance')} size="sm">
                <BarChart3 className="h-4 w-4 mr-1" />
                Performance
              </Button>
              <Button onClick={() => generateReport('insights')} size="sm">
                <Brain className="h-4 w-4 mr-1" />
                Insights
              </Button>
              <Button onClick={() => generateReport('predictions')} size="sm">
                <Target className="h-4 w-4 mr-1" />
                Previsões
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map(report => (
              <Card key={report.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">{report.title}</h4>
                  <Badge variant="outline">{report.type}</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{report.period}</span>
                  <span>{report.generatedAt.toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReport(report)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Baixar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Relatório */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedReport.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Insights</h4>
                <div className="space-y-2">
                  {selectedReport.insights.map((insight, index) => (
                    <div key={index} className="p-2 bg-blue-50 rounded-lg">
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Recomendações</h4>
                <div className="space-y-2">
                  {selectedReport.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-2 bg-green-50 rounded-lg">
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdvancedReports;
