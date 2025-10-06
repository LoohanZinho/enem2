"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Sparkles, 
  FileText, 
  Loader2, 
  Wand2,
  Save,
  Trash2,
  Lightbulb
} from "lucide-react";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import FlashcardAIService, { FlashcardData } from "@/services/FlashcardAIService";
import { useToast } from "@/hooks/use-toast";

const Flashcards = () => {
  const [inputText, setInputText] = useState("Exemplo: A equação do segundo grau é ax² + bx + c = 0, onde a ≠ 0. O discriminante é calculado por Δ = b² - 4ac. A fórmula de Bhaskara é x = (-b ± √Δ) / 2a. Quando Δ > 0, a equação tem duas raízes reais distintas. Quando Δ = 0, tem uma raiz real dupla. Quando Δ < 0, não tem raízes reais...");
  const [generatedCards, setGeneratedCards] = useState<Omit<FlashcardData, "incorrectCount" | "quality" | "isActive">[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("gerador");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Texto vazio",
        description: "Por favor, cole um texto para gerar os flashcards.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedCards([]);

    try {
      const flashcardService = FlashcardAIService;
      const cards = await flashcardService.generateFlashcards(inputText);
      setGeneratedCards(cards);
      toast({
        title: "Flashcards Gerados!",
        description: `${cards.length} cards foram criados com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao gerar flashcards:", error);
      toast({
        title: "Erro na Geração",
        description: "Não foi possível gerar os flashcards. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <BackButton />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            Sistema Inteligente de Memorização
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
            Flashcards <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 bg-clip-text text-transparent">Inteligentes</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Crie, organize e estude com flashcards gerados por IA. Sistema de repetição espaçada para memorização eficiente e duradoura.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 gap-2 bg-transparent p-0">
                <TabsTrigger 
                  value="gerador" 
                  className="px-6 py-3 rounded-xl data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-xl font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Gerador IA
                </TabsTrigger>
                <TabsTrigger 
                  value="meus-flashcards"
                  className="px-6 py-3 rounded-xl data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-xl font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Meus Flashcards
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Gerador Automático de Flashcards */}
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl">
          <CardHeader className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                   <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                   <CardTitle className="text-xl font-bold">Gerador Automático de Flashcards</CardTitle>
                   <p className="text-sm text-muted-foreground">Cole qualquer texto e nossa IA irá analisar e gerar flashcards perfeitos.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                 <Button variant="destructive" size="sm" onClick={() => setInputText('')}><Trash2 className="h-4 w-4 mr-2" /> Limpar</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="materia">Selecione a Matéria</Label>
                <Select defaultValue="auto">
                  <SelectTrigger id="materia">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Detectar Automaticamente</SelectItem>
                    <SelectItem value="matematica">Matemática</SelectItem>
                    <SelectItem value="portugues">Português</SelectItem>
                    <SelectItem value="historia">História</SelectItem>
                    <SelectItem value="geografia">Geografia</SelectItem>
                    <SelectItem value="fisica">Física</SelectItem>
                    <SelectItem value="quimica">Química</SelectItem>
                    <SelectItem value="biologia">Biologia</SelectItem>
                    <SelectItem value="redacao">Redação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dificuldade">Dificuldade Preferida</Label>
                <Select defaultValue="geral">
                  <SelectTrigger id="dificuldade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Revisão Geral</SelectItem>
                    <SelectItem value="basico">Conceitos Básicos</SelectItem>
                    <SelectItem value="aprofundado">Aprofundado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="texto-ia">Cole seu texto aqui:</Label>
              <Textarea
                id="texto-ia"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Cole aqui resumos de aulas, artigos, anotações ou qualquer texto para estudo..."
                className="min-h-[250px] text-base leading-relaxed bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4"/> Dicas para melhores resultados:</h4>
                  <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300 list-disc list-inside">
                     <li>Cole textos de livros, resumos ou anotações completas</li>
                     <li>A IA detecta automaticamente a matéria e o módulo</li>
                     <li>Textos mais longos geram flashcards mais precisos</li>
                     <li>Inclua definições, fórmulas e conceitos importantes</li>
                  </ul>
               </div>
               <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4"/> Recursos da IA:</h4>
                  <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300 list-disc list-inside">
                     <li>Análise semântica do conteúdo</li>
                     <li>Geração de perguntas inteligentes</li>
                     <li>Classificação automática por dificuldade</li>
                     <li>Organização por matéria e módulo</li>
                  </ul>
               </div>
            </div>

            <div className="text-center pt-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                size="lg"
                className="w-full max-w-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-lg font-bold shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Gerando Flashcards...</>
                ) : (
                  <><Wand2 className="h-5 w-5 mr-2" /> Gerar Flashcards</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Flashcards;
