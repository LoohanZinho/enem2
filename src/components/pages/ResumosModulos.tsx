
"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  CheckCircle, 
  Circle,
  Search,
  Filter,
  Star,
  Users,
  Award,
  Download,
  Share2,
  ArrowLeft,
  Calculator,
  Languages,
  TestTube,
  History,
  PenTool,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  FileText,
  Upload,
  File,
  Folder,
  Eye,
  MoreVertical
} from "lucide-react";
import Header from "@/components/Header";
import FileManager from "@/components/FileManager";
import { useAuth } from "@/hooks/useAuth";

interface Resumo {
  id: string;
  titulo: string;
  materia: string;
  autor: string;
  tamanho: number; // em MB
  descricao: string;
  nivel: 'Básico' | 'Intermediário' | 'Avançado';
  visualizacoes: number;
  avaliacao: number;
  arquivoUrl: string;
  lido: boolean;
  progresso: number;
  dataPublicacao: string;
  tags: string[];
  tipoArquivo: 'pdf' | 'doc' | 'docx' | 'txt' | 'md';
}

interface Materia {
  id: string;
  nome: string;
  cor: string;
  icone: React.ReactNode;
  backgroundPattern: string;
  totalResumos: number;
  resumosLidos: number;
  progresso: number;
}

interface SubMateria {
  id: string;
  nome: string;
  resumos: Resumo[];
}

const ResumosModulos = () => {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState<Materia | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('Todos');
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [selectedSubMateria, setSelectedSubMateria] = useState<SubMateria | null>(null);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'admin');
    }
  }, [user]);

  const materiasData = useMemo((): Materia[] => [
    {
      id: 'matematica',
      nome: 'Matemática',
      cor: '#3B82F6',
      icone: <Calculator className="h-8 w-8" />,
      backgroundPattern: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
      totalResumos: 24,
      resumosLidos: 8,
      progresso: 33
    },
    {
      id: 'portugues',
      nome: 'Linguagens e Códigos',
      cor: '#10B981',
      icone: <Languages className="h-8 w-8" />,
      backgroundPattern: 'radial-gradient(circle at 30% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
      totalResumos: 18,
      resumosLidos: 12,
      progresso: 67
    },
    {
      id: 'ciencias',
      nome: 'Ciências da Natureza',
      cor: '#F59E0B',
      icone: <TestTube className="h-8 w-8" />,
      backgroundPattern: 'radial-gradient(circle at 25% 30%, rgba(245, 158, 11, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 70%, rgba(245, 158, 11, 0.1) 0%, transparent 50%), radial-gradient(circle at 60% 10%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
      totalResumos: 22,
      resumosLidos: 15,
      progresso: 68
    },
    {
      id: 'humanas',
      nome: 'Ciências Humanas',
      cor: '#8B5CF6',
      icone: <History className="h-8 w-8" />,
      backgroundPattern: 'radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 20% 60%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
      totalResumos: 20,
      resumosLidos: 6,
      progresso: 30
    },
    {
      id: 'redacao',
      nome: 'Redação',
      cor: '#EF4444',
      icone: <PenTool className="h-8 w-8" />,
      backgroundPattern: 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)',
      totalResumos: 15,
      resumosLidos: 9,
      progresso: 60
    }
  ], []);

  const resumosData = useMemo((): Resumo[] => [
    // MATEMÁTICA
    {
      id: '1',
      titulo: 'Funções Quadráticas - Teoria Completa',
      materia: 'Matemática',
      autor: 'Prof. Carlos Silva',
      tamanho: 2.4,
      descricao: 'Resumo completo sobre funções quadráticas com exemplos práticos e exercícios resolvidos.',
      nivel: 'Intermediário' as const,
      visualizacoes: 1247,
      avaliacao: 4.8,
      arquivoUrl: '/resumos/funcoes-quadraticas.pdf',
      lido: false,
      progresso: 0,
      dataPublicacao: '15/01/2024',
      tags: ['funções', 'quadrática', 'gráficos'],
      tipoArquivo: 'pdf' as const
    },
    {
      id: '2',
      titulo: 'Geometria Plana - Fórmulas Essenciais',
      materia: 'Matemática',
      autor: 'Prof. Ana Santos',
      tamanho: 1.8,
      descricao: 'Todas as fórmulas de geometria plana organizadas por temas.',
      nivel: 'Básico' as const,
      visualizacoes: 2103,
      avaliacao: 4.9,
      arquivoUrl: '/resumos/geometria-plana.pdf',
      lido: true,
      progresso: 100,
      dataPublicacao: '12/01/2024',
      tags: ['geometria', 'fórmulas', 'área'],
      tipoArquivo: 'pdf' as const
    },
    // LINGUAGENS
    {
      id: '3',
      titulo: 'Literatura Brasileira - Movimentos',
      materia: 'Linguagens e Códigos',
      autor: 'Prof. Maria Oliveira',
      tamanho: 3.2,
      descricao: 'Panorama dos principais movimentos literários brasileiros.',
      nivel: 'Avançado' as const,
      visualizacoes: 892,
      avaliacao: 4.7,
      arquivoUrl: '/resumos/literatura-brasileira.pdf',
      lido: false,
      progresso: 0,
      dataPublicacao: '18/01/2024',
      tags: ['literatura', 'movimentos', 'brasileira'],
      tipoArquivo: 'pdf' as const
    },
    // CIÊNCIAS DA NATUREZA
    {
      id: '4',
      titulo: 'Química Orgânica - Hidrocarbonetos',
      materia: 'Ciências da Natureza',
      autor: 'Prof. João Costa',
      tamanho: 2.1,
      descricao: 'Estudo dos hidrocarbonetos e suas propriedades.',
      nivel: 'Intermediário' as const,
      visualizacoes: 1567,
      avaliacao: 4.6,
      arquivoUrl: '/resumos/quimica-organica.pdf',
      lido: true,
      progresso: 100,
      dataPublicacao: '20/01/2024',
      tags: ['química', 'orgânica', 'hidrocarbonetos'],
      tipoArquivo: 'pdf' as const
    },
    // CIÊNCIAS HUMANAS
    {
      id: '5',
      titulo: 'História do Brasil - República',
      materia: 'Ciências Humanas',
      autor: 'Prof. Pedro Lima',
      tamanho: 2.8,
      descricao: 'Período republicano brasileiro desde 1889 até os dias atuais.',
      nivel: 'Intermediário' as const,
      visualizacoes: 1345,
      avaliacao: 4.5,
      arquivoUrl: '/resumos/historia-brasil-republica.pdf',
      lido: false,
      progresso: 0,
      dataPublicacao: '22/01/2024',
      tags: ['história', 'brasil', 'república'],
      tipoArquivo: 'pdf' as const
    },
    // REDAÇÃO
    {
      id: '6',
      titulo: 'Redação ENEM - Estrutura Dissertativa',
      materia: 'Redação',
      autor: 'Prof. Ana Paula Silva',
      tamanho: 1.5,
      descricao: 'Guia completo para estruturação de redações dissertativas.',
      nivel: 'Básico' as const,
      visualizacoes: 2890,
      avaliacao: 4.9,
      arquivoUrl: '/resumos/redacao-estrutura.pdf',
      lido: true,
      progresso: 100,
      dataPublicacao: '25/01/2024',
      tags: ['redação', 'dissertativa', 'estrutura'],
      tipoArquivo: 'pdf' as const
    }
  ], []);

  const subMateriasData = useMemo((): SubMateria[] => [
    {
      id: 'matematica-algebra',
      nome: 'Álgebra',
      resumos: resumosData.filter(r => r.materia === 'Matemática' && r.tags.includes('funções'))
    },
    {
      id: 'matematica-geometria',
      nome: 'Geometria',
      resumos: resumosData.filter(r => r.materia === 'Matemática' && r.tags.includes('geometria'))
    },
    {
      id: 'portugues-literatura',
      nome: 'Literatura',
      resumos: resumosData.filter(r => r.materia === 'Linguagens e Códigos' && r.tags.includes('literatura'))
    },
    {
      id: 'ciencias-quimica',
      nome: 'Química',
      resumos: resumosData.filter(r => r.materia === 'Ciências da Natureza' && r.tags.includes('química'))
    },
    {
      id: 'humanas-historia',
      nome: 'História',
      resumos: resumosData.filter(r => r.materia === 'Ciências Humanas' && r.tags.includes('história'))
    },
    {
      id: 'redacao-estrutura',
      nome: 'Estrutura',
      resumos: resumosData.filter(r => r.materia === 'Redação' && r.tags.includes('estrutura'))
    }
  ], [resumosData]);

  const filteredResumos = useMemo(() => {
    return resumosData.filter(resumo => {
      const matchesSearch = resumo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resumo.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resumo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesMateria = !materiaSelecionada || resumo.materia === materiaSelecionada.nome;
      const matchesNivel = selectedNivel === 'Todos' || resumo.nivel === selectedNivel;
      
      return matchesSearch && matchesMateria && matchesNivel;
    });
  }, [resumosData, searchTerm, materiaSelecionada, selectedNivel]);

  const handleMateriaClick = (materia: Materia) => {
    setMateriaSelecionada(materia);
    if (isAdmin) {
      const subMateria = subMateriasData.find(sm => sm.id.startsWith(materia.id));
      if (subMateria) {
        setSelectedSubMateria(subMateria);
        setIsFileManagerOpen(true);
      }
    } else {
      alert('Apenas administradores podem gerenciar arquivos de resumos.');
    }
  };

  const handleVoltar = () => {
    setMateriaSelecionada(null);
    setSelectedSubMateria(null);
    setIsFileManagerOpen(false);
  };

  const getFileIcon = (tipoArquivo: string) => {
    switch (tipoArquivo) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="h-5 w-5 text-blue-500" />;
      case 'txt':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'md':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  if (materiaSelecionada) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header da Matéria */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={handleVoltar}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground dark:text-slate-100">
                {materiaSelecionada.nome}
              </h1>
              <p className="text-muted-foreground dark:text-slate-400 mt-2">
                {materiaSelecionada.totalResumos} resumos disponíveis • {materiaSelecionada.resumosLidos} lidos
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsFileManagerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Gerenciar Arquivos
              </Button>
            )}
          </div>

          {/* Progresso Geral */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Progresso Geral</h3>
                <span className="text-sm text-muted-foreground">
                  {materiaSelecionada.resumosLidos}/{materiaSelecionada.totalResumos} resumos
                </span>
              </div>
              <Progress value={materiaSelecionada.progresso} className="h-3" />
            </CardContent>
          </Card>

          {/* Lista de Resumos */}
          <div className="grid gap-4">
            {filteredResumos.map((resumo) => (
              <Card key={resumo.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(resumo.tipoArquivo)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground dark:text-slate-100 mb-2">
                            {resumo.titulo}
                          </h3>
                          <p className="text-sm text-muted-foreground dark:text-slate-400 mb-3">
                            {resumo.descricao}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>{resumo.autor}</span>
                            <span>•</span>
                            <span>{formatFileSize(resumo.tamanho)}</span>
                            <span>•</span>
                            <Badge variant={resumo.nivel === 'Básico' ? 'default' : resumo.nivel === 'Intermediário' ? 'secondary' : 'destructive'}>
                              {resumo.nivel}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {resumo.visualizacoes.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              {resumo.avaliacao}
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {resumo.dataPublicacao}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {resumo.lido ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                          
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </Button>
                          
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground dark:text-slate-100 mb-4">
            Resumos por Matéria
          </h1>
          <p className="text-xl text-muted-foreground dark:text-slate-400 max-w-2xl mx-auto">
            Acesse resumos organizados por matéria do ENEM. Faça upload de seus próprios materiais e organize seu estudo.
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar resumos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedNivel} onValueChange={setSelectedNivel}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os níveis</SelectItem>
                  <SelectItem value="Básico">Básico</SelectItem>
                  <SelectItem value="Intermediário">Intermediário</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Matérias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materiasData.map((materia) => (
            <Card 
              key={materia.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
              onClick={() => handleMateriaClick(materia)}
            >
              {/* Background Pattern */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{ background: materia.backgroundPattern }}
              />
              
              {/* Floating Particles Effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-4 left-4 w-2 h-2 bg-current opacity-20 rounded-full animate-pulse" />
                <div className="absolute top-8 right-6 w-1 h-1 bg-current opacity-30 rounded-full animate-pulse delay-1000" />
                <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-current opacity-25 rounded-full animate-pulse delay-2000" />
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-current opacity-35 rounded-full animate-pulse delay-500" />
              </div>

              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${materia.cor}20`, color: materia.cor }}
                  >
                    {materia.icone}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: materia.cor }}>
                      {materia.totalResumos}
                    </div>
                    <div className="text-sm text-muted-foreground">resumos</div>
                  </div>
                </div>
                
                <CardTitle className="text-xl font-bold text-foreground dark:text-slate-100 mb-2">
                  {materia.nome}
                </CardTitle>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium" style={{ color: materia.cor }}>
                      {materia.progresso}%
                    </span>
                  </div>
                  <Progress 
                    value={materia.progresso} 
                    className="h-2"
                    style={{ 
                      '--progress-background': materia.cor,
                    } as React.CSSProperties}
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{materia.resumosLidos} lidos</span>
                    <span>{materia.totalResumos - materia.resumosLidos} restantes</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>Resumos disponíveis</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {isAdmin ? (
                      <Unlock className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estatísticas Gerais */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-center">Estatísticas dos Resumos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {resumosData.length}
                </div>
                <div className="text-sm text-muted-foreground">Total de Resumos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {resumosData.filter(r => r.lido).length}
                </div>
                <div className="text-sm text-muted-foreground">Resumos Lidos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  {resumosData.reduce((acc, r) => acc + r.visualizacoes, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Visualizações</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-500 mb-2">
                  {(resumosData.reduce((acc, r) => acc + r.avaliacao, 0) / resumosData.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avaliação Média</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Manager Modal */}
        {isAdmin && isFileManagerOpen && materiaSelecionada && (
            <FileManager
              isOpen={isFileManagerOpen}
              onClose={() => setIsFileManagerOpen(false)}
              materia={materiaSelecionada.nome}
              onFileUpload={(file) => {
                console.log('Arquivo enviado:', file);
                // Aqui você pode adicionar a lógica para salvar o arquivo
              }}
            />
        )}
      </main>
    </div>
  );
};

export default ResumosModulos;
