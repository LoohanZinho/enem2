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
  Brain
} from "lucide-react";
import Header from "@/components/Header";
import HandwrittenEssayUpload from "@/components/HandwrittenEssayUpload";
import BackButton from "@/components/BackButton";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from 'jspdf';
import { CorrecaoRedacao as CorrecaoRedacaoType, RedacaoAIService } from "@/services/RedacaoAIService";

// Componente para adicionar modelo de redação
interface AdicionarModeloFormProps {
  onSubmit: (modelo: Omit<ModeloRedacao, 'id' | 'dataCriacao' | 'autor'>) => void;
  onCancel: () => void;
}

const AdicionarModeloForm = ({ onSubmit, onCancel }: AdicionarModeloFormProps) => {
  const [formData, setFormData] = useState({
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
            placeholder="Ex: Educação, Meio Ambiente, Sociedade"
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
              <SelectItem value="Médio">Médio</SelectItem>
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
          Adicionar Modelo
        </Button>
      </div>
    </form>
  );
};

interface Competencia {
  id: string;
  nome: string;
  descricao: string;
  peso: number;
  nota: number;
  feedback: string;
  sugestoes: string[];
}

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

const Redacao = () => {
  const [selectedTheme, setSelectedTheme] = useState<number | null>(null);
  const [essayText, setEssayText] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correcaoAtual, setCorrecaoAtual] = useState<CorrecaoRedacaoType | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [redacoesRecentes, setRedacoesRecentes] = useState<CorrecaoRedacaoType[]>([]);
  const [modelosRedacao, setModelosRedacao] = useState<ModeloRedacao[]>([]);
  const [showModelos, setShowModelos] = useState(false);
  const [showAdicionarModelo, setShowAdicionarModelo] = useState(false);
  const [showVisualizarModelo, setShowVisualizarModelo] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] = useState<ModeloRedacao | null>(null);

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
    // Adicionar mais temas conforme necessário
  ];


  const stats = {
    totalRedacoes: 18,
    mediaNotas: 820,
    melhorNota: 920,
  };

  // Modelos de redação de exemplo
  const modelosExemplo: ModeloRedacao[] = [
    {
      id: "1",
      titulo: "Platão + Constituição",
      tema: "Tema a ser definido",
      categoria: "Filosofia",
      dificuldade: "Difícil",
      texto: `Introdução...`,
      observacoes: "Modelo filosófico...",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    },
    // Adicionar mais modelos
  ];

  // Funções para gerenciar modelos de redação
  const adicionarModelo = (novoModelo: Omit<ModeloRedacao, 'id' | 'dataCriacao' | 'autor'>) => {
    //
  };

  const editarModelo = (id: string, modeloEditado: Omit<ModeloRedacao, 'id' | 'dataCriacao' | 'autor'>) => {
    //
  };

  const excluirModelo = (id: string) => {
    //
  };

  const usarModelo = (modelo: ModeloRedacao) => {
    //
  };

  const visualizarModelo = (modelo: ModeloRedacao) => {
    //
  };

  const copiarModelo = (modelo: ModeloRedacao) => {
    //
  };

  const baixarModeloPDF = (modelo: ModeloRedacao) => {
    //
  };

  const corrigirRedacao = async (texto: string, tema: string) => {
    //
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
              Pratique, aprimore e corrija suas redações com nossa plataforma inteligente de correção automática
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

          <TabsContent value="escrever" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="p-6 lg:col-span-1 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                {/* ... conteúdo dos temas ... */}
              </Card>

              <Card className="p-6 lg:col-span-2 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                {/* ... área de escrita ... */}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-8">
            {/* ... conteúdo do upload ... */}
          </TabsContent>
          
          <TabsContent value="modelos" className="space-y-6">
            {/* ... conteúdo dos modelos ... */}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Redacao;
