import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  BarChart3, 
  Download, 
  Calendar,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Trophy,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  FileText,
  PieChart,
  LineChart
} from "lucide-react";
import Header from "@/components/Header";
import { RelatoriosService, RelatorioEvolucao, CorrecaoRedacao } from "@/services/RelatoriosService";

const Relatorios = () => {
  const [relatorio, setRelatorio] = useState<RelatorioEvolucao | null>(null);
  const [estatisticas, setEstatisticas] = useState<{
    totalRedacoes: number;
    mediaGeral: number;
    melhorNota: number;
    ultimaRedacao: CorrecaoRedacao | null;
    tendencia: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d' | '1a'>('30d');
  
  const relatoriosService = RelatoriosService.getInstance();

  const carregarDados = useCallback(() => {
    relatoriosService.carregarDados();
    const stats = relatoriosService.obterEstatisticasResumidas();
    setEstatisticas(stats);
  }, [relatoriosService]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);


  const gerarRelatorio = async () => {
    setIsLoading(true);
    
    try {
      const dataFim = new Date();
      const dataInicio = new Date();
      
      switch (periodo) {
        case '7d':
          dataInicio.setDate(dataInicio.getDate() - 7);
          break;
        case '30d':
          dataInicio.setDate(dataInicio.getDate() - 30);
          break;
        case '90d':
          dataInicio.setDate(dataInicio.getDate() - 90);
          break;
        case '1a':
          dataInicio.setFullYear(dataInicio.getFullYear() - 1);
          break;
      }

      const novoRelatorio = relatoriosService.gerarRelatorioEvolucao(dataInicio, dataFim);
      setRelatorio(novoRelatorio);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportarCSV = () => {
    const csvContent = relatoriosService.exportarDadosCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_redacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescimento':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'declinio':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'crescimento':
        return 'text-green-600 bg-green-100';
      case 'declinio':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Excelente': return 'text-green-600 bg-green-100';
      case 'Muito Bom': return 'text-blue-600 bg-blue-100';
      case 'Bom': return 'text-yellow-600 bg-yellow-100';
      case 'Regular': return 'text-orange-600 bg-orange-100';
      case 'Insuficiente': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-primary" />
            Relatórios e Métricas
          </h1>
          <p className="text-xl text-muted-foreground">
            Acompanhe sua evolução e performance nas redações
          </p>
        </div>

        {/* Estatísticas Resumidas */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Redações</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.totalRedacoes}</div>
                <p className="text-xs text-muted-foreground">
                  Redações corrigidas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.mediaGeral}</div>
                <p className="text-xs text-muted-foreground">
                  Pontos de média
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Melhor Nota</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.melhorNota}</div>
                <p className="text-xs text-muted-foreground">
                  Sua melhor performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tendência</CardTitle>
                {getTendenciaIcon(estatisticas.tendencia)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{estatisticas.tendencia}</div>
                <p className="text-xs text-muted-foreground">
                  Últimas redações
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controles */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <Button
              variant={periodo === '7d' ? 'default' : 'outline'}
              onClick={() => setPeriodo('7d')}
            >
              7 dias
            </Button>
            <Button
              variant={periodo === '30d' ? 'default' : 'outline'}
              onClick={() => setPeriodo('30d')}
            >
              30 dias
            </Button>
            <Button
              variant={periodo === '90d' ? 'default' : 'outline'}
              onClick={() => setPeriodo('90d')}
            >
              90 dias
            </Button>
            <Button
              variant={periodo === '1a' ? 'default' : 'outline'}
              onClick={() => setPeriodo('1a')}
            >
              1 ano
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={gerarRelatorio} disabled={isLoading}>
              {isLoading ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
            <Button variant="outline" onClick={exportarCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Relatório Detalhado */}
        {relatorio && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="competencias">Competências</TabsTrigger>
              <TabsTrigger value="evolucao">Evolução</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Resumo do Período */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Performance Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {relatorio.mediaGeral}
                      </div>
                      <p className="text-muted-foreground">Média do período</p>
                      <Badge className={`mt-2 ${getTendenciaColor(relatorio.estatisticas.tendencia)}`}>
                        {relatorio.estatisticas.tendencia}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Comparação Nacional
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {relatorio.comparacaoNacional.posicaoPercentil}%
                      </div>
                      <p className="text-muted-foreground">Percentil nacional</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Média nacional: {relatorio.comparacaoNacional.mediaNacional}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Ranking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        #{relatorio.comparacaoNacional.ranking.toLocaleString()}
                      </div>
                      <p className="text-muted-foreground">Posição nacional</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        De {relatorio.comparacaoNacional.totalParticipantes.toLocaleString()} participantes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas Detalhadas */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas do Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{relatorio.estatisticas.totalRedacoes}</div>
                      <p className="text-sm text-muted-foreground">Redações</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{relatorio.estatisticas.mediaUltimoMes}</div>
                      <p className="text-sm text-muted-foreground">Média último mês</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{relatorio.estatisticas.melhorNota}</div>
                      <p className="text-sm text-muted-foreground">Melhor nota</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{relatorio.estatisticas.piorNota}</div>
                      <p className="text-sm text-muted-foreground">Pior nota</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competencias" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5].map(comp => {
                  const notas = relatorio.evolucaoCompetencias[comp] || [];
                  const media = notas.length > 0 ? Math.round(notas.reduce((soma, nota) => soma + nota, 0) / notas.length) : 0;
                  const nomes = {
                    1: 'Norma Culta',
                    2: 'Compreensão',
                    3: 'Seleção/Organização',
                    4: 'Mecanismos Linguísticos',
                    5: 'Proposta de Intervenção'
                  };

                  return (
                    <Card key={comp}>
                      <CardHeader>
                        <CardTitle className="text-lg">C{comp} - {nomes[comp as keyof typeof nomes]}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-primary">{media}</div>
                          <p className="text-sm text-muted-foreground">Média</p>
                        </div>
                        <Progress value={(media / 200) * 100} className="mb-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>0</span>
                          <span>200</span>
                        </div>
                        <div className="mt-4 text-center">
                          <Badge variant="outline">
                            {notas.length} redação{notas.length !== 1 ? 'ões' : ''}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="evolucao" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução das Competências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Gráfico de evolução será implementado em breve
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Competência Mais Forte
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        C{relatorio.insights.competenciaMaisForte}
                      </div>
                      <p className="text-muted-foreground">
                        Continue desenvolvendo esta competência
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Competência Mais Fraca
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        C{relatorio.insights.competenciaMaisFraca}
                      </div>
                      <p className="text-muted-foreground">
                        Foque seus estudos nesta área
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Sugestões Personalizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatorio.insights.sugestoes.map((sugestao, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{sugestao}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {relatorio.insights.metas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Metas de Evolução
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {relatorio.insights.metas.map((meta) => (
                        <div key={meta.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">C{meta.competencia}</h4>
                            <Badge variant={meta.status === 'concluida' ? 'default' : 'secondary'}>
                              {meta.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-sm text-muted-foreground">
                              {meta.notaAtual} → {meta.notaMeta}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Prazo: {meta.prazo.toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <Progress value={meta.progresso} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Relatorios;
