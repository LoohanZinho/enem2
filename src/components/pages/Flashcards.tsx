"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brain, 
  Sparkles, 
  FileText, 
  Loader2, 
  Wand2,
  Save,
  Trash2,
  Lightbulb,
  BookOpen,
  Play,
  Gamepad2,
  View,
  SkipBack,
  SkipForward,
  Check,
  X,
  Calculator,
  Languages,
  TestTube,
  History,
  PenTool
} from "lucide-react";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import FlashcardAIService, { FlashcardData } from "@/services/FlashcardAIService";
import { useToast } from "@/components/ui/use-toast";
import FlashcardService from "@/services/FlashcardService";

// Tipos
interface FlashcardCardProps {
  card: any;
  onAnswer?: (quality: 'easy' | 'hard') => void;
  isStudyMode?: boolean;
}

const FlashcardCard: React.FC<FlashcardCardProps> = ({ card, onAnswer, isStudyMode }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full max-w-lg h-80 perspective-1000 mx-auto"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Frente */}
        <div className="absolute w-full h-full backface-hidden rounded-2xl shadow-xl bg-white dark:bg-slate-800 p-8 flex flex-col justify-center items-center text-center">
          <Badge variant="outline" className="absolute top-4 left-4">{card.subject}</Badge>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.front}</p>
        </div>
        
        {/* Verso */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl shadow-xl bg-blue-50 dark:bg-slate-700 p-8 flex flex-col justify-center items-center text-center">
          <p className="text-xl text-slate-800 dark:text-slate-100">{card.back}</p>
          {isStudyMode && onAnswer && (
            <div className="flex gap-4 mt-6">
              <Button onClick={() => onAnswer('hard')} variant="destructive"><X className="mr-2"/>Errei</Button>
              <Button onClick={() => onAnswer('easy')} className="bg-green-500 hover:bg-green-600"><Check className="mr-2"/>Acertei</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const Flashcards = () => {
  const [inputText, setInputText] = useState("Exemplo: A equação do segundo grau é ax² + bx + c = 0, onde a ≠ 0. O discriminante é calculado por Δ = b² - 4ac. A fórmula de Bhaskara é x = (-b ± √Δ) / 2a. Quando Δ > 0, a equação tem duas raízes reais distintas. Quando Δ = 0, tem uma raiz real dupla. Quando Δ < 0, não tem raízes reais...");
  const [generatedCards, setGeneratedCards] = useState<Omit<FlashcardData, "incorrectCount" | "quality" | "isActive">[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("meus-flashcards");
  const { toast } = useToast();
  const flashcardService = useMemo(() => FlashcardService.getInstance(), []);

  const [allDecks, setAllDecks] = useState<any[]>([]);
  const [studyMode, setStudyMode] = useState(false);
  const [gameMode, setGameMode] = useState(false);
  const [studyCards, setStudyCards] = useState<any[]>([]);
  const [gameCards, setGameCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "meus-flashcards") {
      loadDecks();
    }
  };

  const loadDecks = () => {
    const subjects = [...new Set(flashcardService.getCardsForReview().map(c => c.subject))];
    const decks = subjects.map(subject => {
      const subjectCards = flashcardService.getFlashcardsBySubject(subject);
      const studiedCount = subjectCards.filter(c => c.reviewCount > 0).length;
      return {
        id: subject,
        title: subject,
        cardCount: subjectCards.length,
        progress: subjectCards.length > 0 ? (studiedCount / subjectCards.length) * 100 : 0
      };
    });
    setAllDecks(decks);
  };
  
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
      const cards = await FlashcardAIService.generateFlashcards(inputText);
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

  const handleAddCardsToCollection = () => {
    generatedCards.forEach(card => {
      flashcardService.createFlashcard(card);
    });
    setGeneratedCards([]);
    toast({
      title: 'Flashcards Salvos!',
      description: 'Seus novos cards foram adicionados à sua coleção.',
    });
    handleTabChange("meus-flashcards");
  };

  const startStudy = (subject: string) => {
    const cards = flashcardService.getCardsForReview(subject);
    setStudyCards(cards);
    setCurrentCardIndex(0);
    setStudyMode(true);
  };

  const startGame = (subject: string) => {
    const cards = flashcardService.getFlashcardsBySubject(subject);
    setGameCards(cards);
    setCurrentCardIndex(0);
    setGameMode(true);
  };

  const handleCardAnswer = (quality: 'easy' | 'hard') => {
    const card = studyCards[currentCardIndex];
    flashcardService.answerCard(card.id, quality === 'easy' ? 4 : 1, 5000);
    setTimeout(() => {
      if (currentCardIndex < studyCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setStudyMode(false);
        toast({ title: "Sessão de estudo concluída!" });
      }
    }, 300);
  };

  const getSubjectIcon = (subject: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Matemática': <Calculator />,
      'Linguagens e Códigos': <Languages />,
      'Ciências da Natureza': <TestTube />,
      'Ciências Humanas': <History />,
      'Redação': <PenTool />,
    };
    return iconMap[subject] || <BookOpen />;
  };

  const currentCard = studyMode ? studyCards[currentCardIndex] : gameMode ? gameCards[currentCardIndex] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <BackButton />
        </div>

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

        <div className="flex justify-center mb-8">
          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-2 gap-2 bg-transparent p-0">
                <TabsTrigger 
                  value="meus-flashcards"
                  className="px-6 py-3 rounded-xl data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-xl font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Meus Flashcards
                </TabsTrigger>
                <TabsTrigger 
                  value="gerador" 
                  className="px-6 py-3 rounded-xl data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-xl font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Gerador IA
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {activeTab === 'gerador' && (
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
                   <Button variant="destructive" size="sm" onClick={() => { setInputText(''); setGeneratedCards([]); }}>
                     <Trash2 className="h-4 w-4 mr-2" /> Limpar Tudo
                   </Button>
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
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Clique para que a IA gere os flashcards a partir do texto.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              </div>

              {generatedCards.length > 0 && (
                <div className="space-y-4 pt-6">
                  <h3 className="text-xl font-bold text-center">Flashcards Gerados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedCards.map((card, index) => (
                      <Card key={index} className="flex flex-col justify-between">
                        <CardHeader>
                          <CardTitle className="text-sm font-semibold">Pergunta:</CardTitle>
                          <p className="text-sm">{card.front}</p>
                        </CardHeader>
                        <CardContent>
                          <CardTitle className="text-sm font-semibold">Resposta:</CardTitle>
                          <p className="text-sm">{card.back}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Button onClick={handleAddCardsToCollection}>
                             <Save className="h-4 w-4 mr-2" />
                             Adicionar à Coleção
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Salva os cards gerados na sua coleção pessoal.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        )}

        {activeTab === 'meus-flashcards' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Meus Módulos de Flashcards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allDecks.map(deck => (
                <Card key={deck.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                       {getSubjectIcon(deck.title)}
                       <CardTitle>{deck.title}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">{deck.cardCount} cards</p>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-sm mb-2">Progresso:</p>
                      <div className="flex items-center gap-2">
                         <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${deck.progress}%` }}></div>
                         </div>
                         <span className="text-sm font-semibold">{Math.round(deck.progress)}%</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                              <Button className="flex-1" onClick={() => startStudy(deck.title)}>
                                <Play className="h-4 w-4 mr-2"/>
                                Estudar
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Iniciar modo de estudo com repetição espaçada.</p>
                           </TooltipContent>
                         </Tooltip>
                         <Tooltip>
                           <TooltipTrigger asChild>
                              <Button variant="secondary" className="flex-1" onClick={() => startGame(deck.title)}>
                                <Gamepad2 className="h-4 w-4 mr-2"/>
                                Jogo Rápido
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>Faça um quiz rápido para testar seus conhecimentos.</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Study Mode */}
      {studyMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white" onClick={() => setStudyMode(false)}><X/></Button>
            <h2 className="text-2xl font-bold text-center text-white mb-8">Modo Estudo: {studyCards[0]?.subject}</h2>
            {currentCard && <FlashcardCard card={currentCard} onAnswer={handleCardAnswer} isStudyMode />}
          </div>
        </div>
      )}

      {/* Game Mode */}
      {gameMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white" onClick={() => setGameMode(false)}><X/></Button>
            <h2 className="text-2xl font-bold text-center text-white mb-8">Jogo Rápido: {gameCards[0]?.subject}</h2>
            {currentCard && <FlashcardCard card={currentCard} />}
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={() => setCurrentCardIndex(p => Math.max(0, p - 1))}><SkipBack/></Button>
              <Button onClick={() => setCurrentCardIndex(p => Math.min(gameCards.length - 1, p + 1))}><SkipForward/></Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Flashcards;
