import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Upload, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  BookOpen,
  Target,
  Lightbulb,
  Award,
  Download,
  Share2,
  RefreshCw
} from "lucide-react";
import Header from "@/components/Header";
import type { CorrecaoRedacao as CorrecaoRedacaoType } from "@/services/RedacaoAIService";
import { RedacaoAIService, COMPETENCIAS_ENEM } from "@/services/RedacaoAIService";
import { HistoricoCorrecoesService } from "@/services/HistoricoCorrecoesService";

const CorrecaoRedacao = () => {
  const [texto, setTexto] = useState("");
  const [tema, setTema] = useState("");
  const [correcao, setCorrecao] = useState<CorrecaoRedacaoType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("correcao");
  const [historico, setHistorico] = useState<CorrecaoRedacaoType[]>([]);
  const [correcaoSelecionada, setCorrecaoSelecionada] = useState<CorrecaoRedacaoType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const redacaoService = RedacaoAIService.getInstance();
  const historicoService = HistoricoCorrecoesService.getInstance();

  const carregarHistorico = useCallback(() => {
    const historicoData = historicoService.obterHistorico();
    setHistorico(historicoData);
  }, [historicoService]);

  // Carregar histórico ao montar o componente
  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const handleCorrigir = async () => {
    if (!texto.trim() || !tema.trim()) {
      setError("Por favor, insira o texto da redação e o tema.");
      return;
    }

    setIsLoading(true);
    setError("");
    setActiveTab("resultado");

    try {
      const resultado = await redacaoService.corrigirRedacao(texto, tema);
      setCorrecao(resultado);
      // Salvar no histórico
      historicoService.salvarCorrecao(resultado);
      carregarHistorico();
    } catch (err) {
      setError("Erro ao processar a redação. Tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCorrigirDupla = async () => {
    if (!texto.trim() || !tema.trim()) {
      setError("Por favor, insira o texto da redação e o tema.");
      return;
    }

    setIsLoading(true);
    setError("");
    setActiveTab("resultado");

    try {
      const resultado = await redacaoService.corrigirRedacaoDupla(texto, tema);
      setCorrecao(resultado);
      // Salvar no histórico
      historicoService.salvarCorrecao(resultado);
      carregarHistorico();
    } catch (err) {
      setError("Erro ao processar a redação. Tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Aqui você implementaria o OCR para extrair texto da imagem
      // Por enquanto, apenas simula a leitura
      setTexto("Texto extraído da imagem via OCR...");
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

  const getCompetenciaColor = (nota: number) => {
    if (nota >= 180) return 'text-green-600';
    if (nota >= 140) return 'text-blue-600';
    if (nota >= 100) return 'text-yellow-600';
    if (nota >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <FileText className="h-10 w-10 text-primary" />
            Correção Automática de Redações ENEM
          </h1>
          <p className="text-xl text-muted-foreground">
            Sistema de IA que corrige redações seguindo exatamente os critérios oficiais do ENEM
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="correcao">Corrigir Redação</TabsTrigger>
            <TabsTrigger value="resultado" disabled={!correcao}>Resultado</TabsTrigger>
            <TabsTrigger value="minhas-correcoes">Minhas Correções</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="correcao" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Entrada de Dados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Dados da Redação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tema">Tema da Redação</Label>
                    <Input
                      id="tema"
                      placeholder="Digite o tema da redação..."
                      value={tema}
                      onChange={(e) => setTema(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="texto">Texto da Redação</Label>
                    <Textarea
                      id="texto"
                      placeholder="Digite ou cole o texto da sua redação aqui..."
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      className="min-h-[300px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload de Imagem
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Tirar Foto
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCorrigir}
                      disabled={isLoading || !texto.trim() || !tema.trim()}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Corrigir Redação
                    </Button>
                    <Button
                      onClick={handleCorrigirDupla}
                      disabled={isLoading || !texto.trim() || !tema.trim()}
                      variant="outline"
                      className="flex-1"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Dupla Correção
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Informações sobre o Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Como Funciona
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Análise por Competências</h4>
                        <p className="text-sm text-muted-foreground">
                          Avalia cada uma das 5 competências do ENEM com notas de 0 a 200 pontos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Feedback Detalhado</h4>
                        <p className="text-sm text-muted-foreground">
                          Explica erros, acertos e sugere melhorias específicas para cada competência
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">Relatórios Completos</h4>
                        <p className="text-sm text-muted-foreground">
                          Gera relatórios de evolução e comparação com médias nacionais
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Competências Avaliadas:</h4>
                    <div className="space-y-2">
                      {COMPETENCIAS_ENEM.map((competencia) => (
                        <div key={competencia.numero} className="flex items-center gap-2">
                          <Badge variant="outline">C{competencia.numero}</Badge>
                          <span className="text-sm">{competencia.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resultado" className="space-y-6">
            {correcao && (
              <>
                {/* Resumo da Correção */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Resumo da Correção
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {correcao.notaFinal}/1000
                        </div>
                        <div className="text-sm text-muted-foreground">Nota Final ENEM</div>
                        <Badge className={`mt-2 ${getNivelColor(correcao.nivel)}`}>
                          {correcao.nivel}
                        </Badge>
                      </div>

                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                          {correcao.notaTotal}/1000
                        </div>
                        <div className="text-sm text-muted-foreground">Nota Total ENEM</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {correcao.avaliadores} avaliador(es)
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {correcao.competencias.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Competências</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {correcao.discrepancia ? 'Com discrepância' : 'Sem discrepância'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Feedback Geral:</h4>
                      <p className="text-muted-foreground">{correcao.feedbackGeral}</p>
                    </div>

                    {/* Aviso de Penalização */}
                    {correcao.competencias.some(comp => comp.nota < 160) && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertCircle className="h-5 w-5" />
                          <h4 className="font-semibold">Aviso de Penalização</h4>
                        </div>
                        <p className="text-sm text-yellow-700 mt-2">
                          ⚠️ <strong>Regra ENEM:</strong> Competências com mais de 3 erros recebem penalização de 40 pontos.
                          Verifique os detalhes de cada competência abaixo.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Detalhamento por Competências */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Análise por Competências
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {correcao.competencias.map((comp) => (
                        <div key={comp.competencia} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold">
                                C{comp.competencia} - {COMPETENCIAS_ENEM[comp.competencia - 1]?.nome}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {COMPETENCIAS_ENEM[comp.competencia - 1]?.descricao}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getCompetenciaColor(comp.nota)}`}>
                                {comp.nota}/200
                                {comp.nota < 160 && (
                                  <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                    -40 pts
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">pontos ENEM</div>
                            </div>
                          </div>

                          <Progress value={(comp.nota / 200) * 100} className="mb-4" />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-green-600 mb-2">Pontos Fortes:</h5>
                              <ul className="text-sm space-y-1">
                                {comp.pontosFortes.map((ponto, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    {ponto}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className="font-medium text-red-600 mb-2">Pontos de Melhoria:</h5>
                              <ul className="text-sm space-y-1">
                                {comp.pontosFracos.map((ponto, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                    {ponto}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Justificativa:</h5>
                            <p className="text-sm text-muted-foreground mb-3">{comp.justificativa}</p>
                            
                            <h5 className="font-medium mb-2">Sugestões:</h5>
                            <ul className="text-sm space-y-1">
                              {comp.sugestoes.map((sugestao, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Lightbulb className="h-3 w-3 text-yellow-600" />
                                  {sugestao}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Ações */}
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Relatório
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button onClick={() => setActiveTab("correcao")}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Nova Correção
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="minhas-correcoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Minhas Correções
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historico.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma correção salva ainda. Faça sua primeira correção!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historico.map((correcaoItem) => (
                      <Card 
                        key={correcaoItem.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          correcaoSelecionada?.id === correcaoItem.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setCorrecaoSelecionada(correcaoItem)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{correcaoItem.tema}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(correcaoItem.dataCorrecao).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                {correcaoItem.notaFinal}/1000
                              </div>
                              <Badge className={getNivelColor(correcaoItem.nivel)}>
                                {correcaoItem.nivel}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                            {correcaoItem.competencias.map((comp) => (
                              <div key={comp.competencia} className="text-center">
                                <div className="text-sm font-medium">C{comp.competencia}</div>
                                <div className={`text-lg font-bold ${getCompetenciaColor(comp.nota)}`}>
                                  {comp.nota}/200
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>{correcaoItem.estatisticas.totalPalavras} palavras</span>
                            <span>{correcaoItem.estatisticas.totalParagrafos} parágrafos</span>
                            <span>{correcaoItem.estatisticas.tempoCorrecao}s</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalhes da correção selecionada */}
            {correcaoSelecionada && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Detalhes da Correção</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCorrecaoSelecionada(null)}
                    >
                      Fechar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Tema: {correcaoSelecionada.tema}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {correcaoSelecionada.feedbackGeral}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {correcaoSelecionada.competencias.map((comp) => (
                        <div key={comp.competencia} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold">
                              C{comp.competencia} - {COMPETENCIAS_ENEM[comp.competencia - 1]?.nome}
                            </h5>
                            <div className={`text-lg font-bold ${getCompetenciaColor(comp.nota)}`}>
                              {comp.nota}/200
                            </div>
                          </div>
                          <Progress value={(comp.nota / 200) * 100} className="mb-3" />
                          <p className="text-sm text-muted-foreground mb-2">{comp.justificativa}</p>
                          
                          <div className="space-y-2">
                            <div>
                              <h6 className="text-sm font-medium text-green-600">Pontos Fortes:</h6>
                              <ul className="text-xs space-y-1">
                                {comp.pontosFortes.map((ponto, index) => (
                                  <li key={index} className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    {ponto}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h6 className="text-sm font-medium text-red-600">Pontos de Melhoria:</h6>
                              <ul className="text-xs space-y-1">
                                {comp.pontosFracos.map((ponto, index) => (
                                  <li key={index} className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                    {ponto}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Histórico de Redações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma redação corrigida ainda. Faça sua primeira correção!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CorrecaoRedacao;
