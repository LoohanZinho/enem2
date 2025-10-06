import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PenTool, 
  FileText, 
  Award,
  Send,
  BookOpen,
  Target,
  History,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Eye,
  Download,
  Plus,
  Edit,
  Trash2,
  Copy,
  Settings,
  Brain,
  Loader2,
  X
} from "lucide-react";
import Header from "@/components/Header";
import HandwrittenEssayUpload from "@/components/HandwrittenEssayUpload";
import BackButton from "@/components/BackButton";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from 'jspdf';
import { RedacaoAIService } from "@/services/RedacaoAIService";
import type { CorrecaoRedacao, PontuacaoCompetencia } from "@/services/RedacaoAIService";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { userDataService } from "@/services/UserDataService";

// Tipos
interface ModeloRedacao {
  id: string;
  titulo: string;
  tema: string;
  categoria: string;
  dificuldade: 'Fácil' | 'Médio' | 'Difícil';
  texto: string;
  observacoes: string;
  dataCriacao: string;
  autor: string;
}

interface AdicionarModeloFormProps {
  onSubmit: (modelo: Omit<ModeloRedacao, 'id' | 'dataCriacao' | 'autor'>) => void;
  onCancel: () => void;
  initialData?: Omit<ModeloRedacao, 'id' | 'dataCriacao' | 'autor'>;
}

const AdicionarModeloForm = ({ onSubmit, onCancel, initialData }: AdicionarModeloFormProps) => {
  const [formData, setFormData] = useState(initialData || {
    titulo: '',
    tema: '',
    categoria: '',
    dificuldade: 'Médio' as 'Fácil' | 'Médio' | 'Difícil',
    texto: '',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.titulo && formData.tema && formData.texto) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="titulo">Título do Modelo</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            placeholder="Ex: Modelo Dissertativo-Argumentativo"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="tema">Tema</Label>
          <Input
            id="tema"
            value={formData.tema}
            onChange={(e) => setFormData(prev => ({ ...prev, tema: e.target.value }))}
            placeholder="Ex: Desafios da educação digital"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Input
            id="categoria"
            value={formData.categoria}
            onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
            placeholder="Ex: Educação, Meio Ambiente"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="dificuldade">Dificuldade</Label>
          <Select value={formData.dificuldade} onValueChange={(value: 'Fácil' | 'Médio' | 'Difícil') => 
            setFormData(prev => ({ ...prev, dificuldade: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fácil">Fácil</SelectItem>
              <SelectItem value="Médio">Média</SelectItem>
              <SelectItem value="Difícil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="texto">Texto do Modelo</Label>
        <Textarea
          id="texto"
          value={formData.texto}
          onChange={(e) => setFormData(prev => ({ ...prev, texto: e.target.value }))}
          placeholder="Cole aqui o texto completo do modelo de redação..."
          className="min-h-64"
          required
        />
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
          placeholder="Adicione observações sobre o modelo, dicas de uso, etc."
          className="min-h-20"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Modelo
        </Button>
      </div>
    </form>
  );
};


const Redacao = () => {
  const [selectedTheme, setSelectedTheme] = useState<number | null>(null);
  const [essayText, setEssayText] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correcaoAtual, setCorrecaoAtual] = useState<CorrecaoRedacao | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [redacoesRecentes, setRedacoesRecentes] = useState<CorrecaoRedacao[]>([]);
  const [modelosRedacao, setModelosRedacao] = useState<ModeloRedacao[]>([]);
  const [showAdicionarModelo, setShowAdicionarModelo] = useState(false);
  const [showVisualizarModelo, setShowVisualizarModelo] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] = useState<ModeloRedacao | null>(null);
  const [editingModelo, setEditingModelo] = useState<ModeloRedacao | null>(null);

  const redacaoService = RedacaoAIService.getInstance();

  useEffect(() => {
    const loadModelos = async () => {
      const modelos = await userDataService.loadRedacaoModelos();
      setModelosRedacao(modelos);
    };
    loadModelos();
  }, []);

  const themes = [
    {
      title: "Desafios da educação digital no Brasil",
      category: "Educação",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta os principais desafios enfrentados pela educação digital no Brasil e proponha soluções viáveis."
    },
    {
      title: "O impacto das redes sociais na saúde mental dos jovens",
      category: "Saúde",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Analise como as redes sociais afetam a saúde mental dos jovens e proponha estratégias de proteção."
    },
    {
      title: "A importância da preservação da Amazônia para o planeta",
      category: "Meio Ambiente",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Aborde a importância da preservação da Amazônia para o equilíbrio climático global e a biodiversidade."
    },
  ];

  const stats = {
    totalRedacoes: 18,
    mediaNotas: 820,
    melhorNota: 920,
  };

  const adicionarModelo = async (novoModelo: Omit<ModeloRedacao, 'id' | 'dataCriacao' | 'autor'>) => {
    const modeloCompleto: ModeloRedacao = {
      ...novoModelo,
      id: Date.now().toString(),
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Usuário" // ou pegar do usuário logado
    };
    const novosModelos = [...modelosRedacao, modeloCompleto];
    await userDataService.saveRedacaoModelos(novosModelos);
    setModelosRedacao(novosModelos);
    setShowAdicionarModelo(false);
  };
  
  const editarModelo = async (id: string, modeloEditado: Omit<ModeloRedacao, 'id' | 'dataCriacao' | 'autor'>) => {
    const novosModelos = modelosRedacao.map(m =>
      m.id === id ? { ...m, ...modeloEditado } : m
    );
    await userDataService.saveRedacaoModelos(novosModelos);
    setModelosRedacao(novosModelos);
    setEditingModelo(null);
    setShowAdicionarModelo(false);
  };
  
  const excluirModelo = async (id: string) => {
    const novosModelos = modelosRedacao.filter(m => m.id !== id);
    await userDataService.saveRedacaoModelos(novosModelos);
    setModelosRedacao(novosModelos);
  };
  
  const usarModelo = (modelo: ModeloRedacao) => {
    setEssayText(modelo.texto);
    setShowVisualizarModelo(false);
    // Idealmente, também navegaria para a aba "Escrever"
  };
  
  const visualizarModelo = (modelo: ModeloRedacao) => {
    setModeloSelecionado(modelo);
    setShowVisualizarModelo(true);
  };
  
  const copiarModelo = (texto: string) => {
    navigator.clipboard.writeText(texto);
    // Idealmente, mostraria um toast de sucesso
  };
  
  const baixarModeloPDF = (modelo: ModeloRedacao) => {
    const doc = new jsPDF();
    doc.text(modelo.titulo, 10, 10);
    doc.text(modelo.texto, 10, 20);
    doc.save(`${modelo.titulo}.pdf`);
  };

  const handleCorrect = async () => {
    if (!essayText.trim() || selectedTheme === null) return;
    setIsCorrecting(true);
    setShowCorrection(false);
    try {
      const themeTitle = themes[selectedTheme].title;
      const correction = await redacaoService.corrigirRedacao(essayText, themeTitle);
      setCorrecaoAtual(correction);
      setShowCorrection(true);
      setRedacoesRecentes(prev => [correction, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error("Erro ao corrigir redação:", error);
    } finally {
      setIsCorrecting(false);
    }
  };

  const getNivelColorClass = (nivel: string) => {
    switch (nivel) {
      case 'Excelente': return 'text-green-500';
      case 'Muito Bom': return 'text-blue-500';
      case 'Bom': return 'text-yellow-500';
      case 'Regular': return 'text-orange-500';
      case 'Insuficiente': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <BackButton 
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            />
          </div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <PenTool className="h-4 w-4" />
              Plataforma de Redação
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent mb-4">
              Redação ENEM
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Pratique, aprimore e corrija suas redações com nossa plataforma inteligente e receba notas precisas
            </p>
          </div>
        </div>

        <Tabs defaultValue="escrever" className="w-full mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-slate-200 dark:border-slate-700">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-transparent">
              <TabsTrigger 
                value="escrever" 
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
              >
                <PenTool className="h-4 w-4 mr-2" />
                Escrever
              </TabsTrigger>
              <TabsTrigger 
                value="upload"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
              >
                <FileText className="h-4 w-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger 
                value="modelos"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Modelos
              </TabsTrigger>
              <TabsTrigger 
                value="recentes"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
              >
                <History className="h-4 w-4 mr-2" />
                Recentes
              </TabsTrigger>
              <TabsTrigger 
                value="estatisticas"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Estatísticas
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="escrever" className="space-y-8 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="p-6 lg:col-span-1 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Temas Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {themes.map((theme, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${selectedTheme === index ? 'border-primary shadow-lg' : 'border-slate-200 dark:border-slate-700'}`}>
                      <h4 className="font-semibold">{theme.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">{theme.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{theme.category}</Badge>
                          <Badge variant="secondary">{theme.difficulty}</Badge>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedTheme(index)}
                          variant={selectedTheme === index ? 'default' : 'outline'}
                        >
                          {selectedTheme === index ? 'Selecionado' : 'Selecionar'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="p-6 lg:col-span-2 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <PenTool className="h-5 w-5 text-primary" />
                    Área de Escrita
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {selectedTheme !== null ? (
                    <div className="space-y-6">
                       <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          <h3 className="font-semibold text-lg">{themes[selectedTheme].title}</h3>
                       </div>
                       <Textarea 
                          value={essayText}
                          onChange={(e) => setEssayText(e.target.value)}
                          placeholder="Comece a escrever sua redação aqui..."
                          className="min-h-[400px] text-base"
                       />
                       <Button 
                          onClick={handleCorrect}
                          disabled={isCorrecting || !essayText.trim()}
                          size="lg"
                          className="w-full"
                        >
                          {isCorrecting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Corrigindo...</> : <><Send className="h-4 w-4 mr-2"/>Corrigir Redação</>}
                       </Button>
                    </div>
                  ) : (
                    <div className="min-h-[400px] flex items-center justify-center text-center text-slate-500 border-2 border-dashed rounded-lg">
                      <p>Selecione um tema para começar a escrever.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-8 mt-6">
            <HandwrittenEssayUpload onTextExtracted={(text, confidence) => setEssayText(text)} />
          </TabsContent>
          
          <TabsContent value="modelos" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Modelos de Redação</h2>
              <Button onClick={() => { setEditingModelo(null); setShowAdicionarModelo(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Modelo
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modelosRedacao.map((modelo) => (
                <Card key={modelo.id} className="p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold">{modelo.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{modelo.tema}</p>
                    <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{modelo.categoria}</Badge>
                        <Badge variant="secondary">{modelo.dificuldade}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => visualizarModelo(modelo)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                    </Button>
                    <Button size="sm" onClick={() => usarModelo(modelo)}>
                        <PenTool className="h-4 w-4 mr-2" />
                        Usar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingModelo(modelo); setShowAdicionarModelo(true);}}>
                        <Edit className="h-4 w-4" />
                    </Button>
                     <Button size="sm" variant="destructive" onClick={() => excluirModelo(modelo.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {modelosRedacao.length === 0 && <p>Nenhum modelo cadastrado.</p>}
            </div>
          </TabsContent>

          <TabsContent value="recentes" className="space-y-6 mt-6">
             {/* Conteúdo das redações recentes */}
          </TabsContent>

          <TabsContent value="estatisticas" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total de Redações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.totalRedacoes}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Média Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.mediaNotas}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Melhor Nota</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{stats.melhorNota}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Modal de Correção */}
        {showCorrection && correcaoAtual && (
          <Dialog open={showCorrection} onOpenChange={setShowCorrection}>
            <DialogContent className="max-w-4xl h-full max-h-[90vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Resultado da Correção</DialogTitle>
                 <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setShowCorrection(false)}><X className="h-4 w-4" /></Button>
              </DialogHeader>
              <div className="flex-grow overflow-y-auto pr-6 space-y-6">
                <div className="text-center">
                  <p className="text-lg font-medium text-muted-foreground">Nota Final</p>
                  <p className={`text-6xl font-bold ${getNivelColorClass(correcaoAtual.nivel)}`}>{correcaoAtual.notaFinal}</p>
                  <p className={`font-semibold ${getNivelColorClass(correcaoAtual.nivel)}`}>{correcaoAtual.nivel}</p>
                </div>
                <Tabs defaultValue="resumo" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="resumo">Resumo</TabsTrigger>
                    <TabsTrigger value="c1">C1</TabsTrigger>
                    <TabsTrigger value="c2">C2</TabsTrigger>
                    <TabsTrigger value="c3">C3</TabsTrigger>
                    <TabsTrigger value="c4">C4</TabsTrigger>
                    <TabsTrigger value="c5">C5</TabsTrigger>
                  </TabsList>
                  <TabsContent value="resumo" className="p-4">
                     <h3 className="font-bold text-lg mb-2">Feedback Geral</h3>
                     <p>{correcaoAtual.feedbackGeral}</p>
                  </TabsContent>
                  {correcaoAtual.competencias.map(comp => (
                     <TabsContent key={comp.competencia} value={`c${comp.competencia}`} className="p-4 space-y-4">
                       <div className="flex justify-between items-center">
                         <h3 className="font-bold text-lg">Competência {comp.competencia}</h3>
                         <p className="text-2xl font-bold">{comp.nota}</p>
                       </div>
                       <div>
                         <h4 className="font-semibold">Justificativa:</h4>
                         <p className="text-sm">{comp.justificativa}</p>
                       </div>
                       <div>
                         <h4 className="font-semibold text-green-600">Pontos Fortes:</h4>
                         <ul className="list-disc list-inside text-sm">
                            {comp.pontosFortes.map((p, i) => <li key={i}>{p}</li>)}
                         </ul>
                       </div>
                       <div>
                         <h4 className="font-semibold text-red-600">Pontos a Melhorar:</h4>
                         <ul className="list-disc list-inside text-sm">
                            {comp.pontosFracos.map((p, i) => <li key={i}>{p}</li>)}
                         </ul>
                       </div>
                       <div>
                         <h4 className="font-semibold text-blue-600">Sugestões:</h4>
                         <ul className="list-disc list-inside text-sm">
                            {comp.sugestoes.map((s, i) => <li key={i}>{s}</li>)}
                         </ul>
                       </div>
                     </TabsContent>
                  ))}
                </Tabs>
              </div>
             </DialogContent>
          </Dialog>
        )}

        {/* Modal para adicionar/editar modelo */}
        <Dialog open={showAdicionarModelo} onOpenChange={setShowAdicionarModelo}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingModelo ? 'Editar Modelo' : 'Adicionar Novo Modelo'}</DialogTitle>
                </DialogHeader>
                <AdicionarModeloForm 
                    onSubmit={editingModelo ? (data) => editarModelo(editingModelo.id, data) : adicionarModelo}
                    onCancel={() => { setShowAdicionarModelo(false); setEditingModelo(null); }}
                    initialData={editingModelo ? {
                      titulo: editingModelo.titulo,
                      tema: editingModelo.tema,
                      categoria: editingModelo.categoria,
                      dificuldade: editingModelo.dificuldade,
                      texto: editingModelo.texto,
                      observacoes: editingModelo.observacoes
                    } : undefined}
                />
            </DialogContent>
        </Dialog>

        {/* Modal para visualizar modelo */}
        {modeloSelecionado && (
            <Dialog open={showVisualizarModelo} onOpenChange={setShowVisualizarModelo}>
                <DialogContent className="max-w-4xl h-full max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{modeloSelecionado.titulo}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                        <p><strong>Tema:</strong> {modeloSelecionado.tema}</p>
                        <p><strong>Categoria:</strong> {modeloSelecionado.categoria}</p>
                        <p><strong>Dificuldade:</strong> {modeloSelecionado.dificuldade}</p>
                        <Card>
                            <CardHeader><CardTitle>Texto do Modelo</CardTitle></CardHeader>
                            <CardContent><pre className="whitespace-pre-wrap">{modeloSelecionado.texto}</pre></CardContent>
                        </Card>
                        {modeloSelecionado.observacoes && (
                            <Card>
                                <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
                                <CardContent>{modeloSelecionado.observacoes}</CardContent>
                            </Card>
                        )}
                        <div className="flex gap-2">
                           <Button onClick={() => usarModelo(modeloSelecionado)}>Usar este Modelo</Button>
                           <Button variant="outline" onClick={() => copiarModelo(modeloSelecionado.texto)}>Copiar Texto</Button>
                           <Button variant="secondary" onClick={() => baixarModeloPDF(modeloSelecionado)}>Baixar PDF</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )}

      </main>
    </div>
  );
};

export default Redacao;
