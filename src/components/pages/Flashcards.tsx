
"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  Brain,
  Target,
  Clock,
  Star,
  TrendingUp,
  BarChart3,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  FileText,
  Timer,
  Zap,
  Award,
  Flame,
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  ChevronRight,
  FolderOpen,
  GraduationCap,
  Calculator,
  Atom,
  Dna,
  Globe,
  ScrollText,
  Mountain,
  Lightbulb,
  Users,
  Palette,
  PenTool,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import FlashcardAIService from '@/services/FlashcardAIService';
import type { FlashcardData } from '@/services/FlashcardAIService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';

interface Flashcard extends FlashcardData {
  incorrectCount: number;
  quality: number;
  isActive: boolean;
  nextReview: Date | null;
  isNew: boolean;
}

interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  cardsStudied: number;
  correctAnswers: number;
  totalTime: number;
  currentStreak: number;
  bestStreak: number;
}

interface Module {
  id: string;
  name: string;
  subject: string;
  description: string;
  color: string;
  progress: number;
  subModules: SubModule[];
}

interface SubModule {
  id: string;
  name: string;
  description: string;
  progress: number;
  cardCount: number;
  cards: Flashcard[];
}

// Componente de Carta com Animação 3D Perfeita
interface FlashcardCardProps {
  card: Flashcard;
  onAnswer?: (correct: boolean) => void;
  isStudyMode?: boolean;
}

const FlashcardCard = ({ card, onAnswer, isStudyMode = false }: FlashcardCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFlip = () => {
    if (cardRef.current) {
      cardRef.current.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(16, 185, 129, 0.4)';
      cardRef.current.style.transform = isFlipped ? 'rotateY(0deg) scale(1.05)' : 'rotateY(180deg) scale(1.05)';
      
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.boxShadow = '';
          cardRef.current.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
        }
      }, 700);
    }
    setIsFlipped(!isFlipped);
  };
  
  const handleAnswer = (e: React.MouseEvent, correct: boolean) => {
    e.stopPropagation();
    if(onAnswer) onAnswer(correct);
  };

  const getDifficultyColor = (difficulty: Flashcard['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'from-slate-500 to-slate-600';
      case 'medium': return 'from-slate-600 to-slate-700';
      case 'hard': return 'from-slate-700 to-slate-800';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getDifficultyText = (difficulty: Flashcard['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return 'N/A';
    }
  };

  return (
    <div className="perspective-1000 w-full h-80 relative" onClick={handleFlip}>
      <div 
        ref={cardRef}
        className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ease-in-out cursor-pointer`}
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Frente da Carta */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-2xl border-0"
        >
          <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-center items-center p-8 text-center">
            <Badge className={`absolute top-6 right-6 bg-gradient-to-r ${getDifficultyColor(card.difficulty)} text-white border-0 px-4 py-2 rounded-full font-semibold shadow-lg`}>
              {getDifficultyText(card.difficulty)}
            </Badge>
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-center gap-3 text-slate-300 text-sm font-medium">
                <span>{card.subject}</span>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <span>{card.module}</span>
              </div>
              <div className="text-2xl font-bold text-white leading-relaxed">{card.front}</div>
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                <Eye className="h-4 w-4" />
                <span>Clique para ver a resposta</span>
              </div>
            </div>
            {card.streak > 0 && (
              <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm px-3 py-2 rounded-full">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-orange-300 font-semibold text-sm">{card.streak}</span>
              </div>
            )}
          </div>
        </div>

        {/* Verso da Carta */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-2xl border-0"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl relative overflow-hidden flex flex-col justify-center items-center p-8 text-center">
            <Badge className="absolute top-6 right-6 bg-white/20 text-white border-0 px-4 py-2 rounded-full font-semibold shadow-lg backdrop-blur-sm">
              Resposta
            </Badge>
            <div className="space-y-6 max-w-2xl">
              <div className="text-2xl font-bold text-white leading-relaxed">{card.back}</div>
              {isStudyMode && onAnswer && (
                <div className="flex gap-4 mt-8">
                  <Button onClick={(e) => handleAnswer(e, false)} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:-translate-y-1">
                    <XCircle className="h-5 w-5 mr-2" /> Errei
                  </Button>
                  <Button onClick={(e) => handleAnswer(e, true)} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:-translate-y-1">
                    <CheckCircle className="h-5 w-5 mr-2" /> Acertei
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const Flashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [inputText, setInputText] = useState('');
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('modules');
  
  const [studyModeCards, setStudyModeCards] = useState<Flashcard[]>([]);
  
  const [gameMode, setGameMode] = useState(false);
  const [gameCards, setGameCards] = useState<Flashcard[]>([]);
  const [currentGameCardIndex, setCurrentGameCardIndex] = useState(0);
  const [gameScore, setGameScore] = useState({ correct: 0, total: 0 });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getSubjectIcon = (subject: string): JSX.Element => {
    const icons: { [key: string]: React.ElementType } = {
      'Matemática': Calculator, 'Física': Atom, 'Química': Atom, 'Biologia': Dna,
      'História': ScrollText, 'Geografia': Globe, 'Português': BookOpen, 'Literatura': BookOpen,
      'Filosofia': Lightbulb, 'Sociologia': Users, 'Artes': Palette, 'Redação': PenTool
    };
    const IconComponent = icons[subject] || GraduationCap;
    return <IconComponent />;
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
        'Matemática': 'from-blue-500 to-blue-600',
        'Física': 'from-indigo-500 to-indigo-600',
        'Química': 'from-purple-500 to-purple-600',
        'Biologia': 'from-green-500 to-green-600',
        'História': 'from-yellow-500 to-yellow-600',
        'Geografia': 'from-teal-500 to-teal-600',
        'Português': 'from-pink-500 to-pink-600',
        'Literatura': 'from-rose-500 to-rose-600',
        'Filosofia': 'from-gray-500 to-gray-600',
        'Sociologia': 'from-slate-500 to-slate-600',
        'Artes': 'from-red-500 to-red-600',
        'Redação': 'from-orange-500 to-orange-600'
    };
    return colors[subject] || 'from-gray-500 to-gray-600';
  };
  
  const organizeFlashcardsBySubject = (cards: Flashcard[]): Module[] => {
    const subjectGroups: { [key: string]: Flashcard[] } = {};
    cards.forEach(card => {
      if (!subjectGroups[card.subject]) {
        subjectGroups[card.subject] = [];
      }
      subjectGroups[card.subject].push(card);
    });

    return Object.entries(subjectGroups).map(([subject, subjectCards]) => {
      const completed = subjectCards.filter(c => c.reviewCount > 0).length;
      const progress = subjectCards.length > 0 ? Math.round((completed / subjectCards.length) * 100) : 0;
      return {
        id: `module-${subject}`,
        name: subject,
        subject: subject,
        description: `Flashcards de ${subject}`,
        color: getSubjectColor(subject),
        progress: progress,
        subModules: [{
          id: `${subject}-all`, name: 'Todos', description: '', progress: progress,
          cardCount: subjectCards.length, cards: subjectCards
        }]
      };
    });
  };

  useEffect(() => {
    const sampleCards: Flashcard[] = [
      { id: '1', front: 'Qual é a fórmula de Bhaskara?', back: 'x = (-b ± √Δ) / 2a', subject: 'Matemática', module: 'Álgebra', subModule: 'Equações', difficulty: 'easy', category: 'Fórmula', tags: ['fórmula', 'bhaskara'], createdAt: new Date(), lastReviewed: null, reviewCount: 0, correctCount: 0, incorrectCount: 0, easeFactor: 2.5, interval: 1, quality: 0, isActive: true, isNew: true, nextReview: new Date(), streak: 0 },
      { id: '2', front: 'O que é a segunda lei de Newton?', back: 'F = m × a', subject: 'Física', module: 'Mecânica', subModule: 'Leis de Newton', difficulty: 'medium', category: 'Lei', tags: ['física', 'leis de newton'], createdAt: new Date(), lastReviewed: null, reviewCount: 0, correctCount: 0, incorrectCount: 0, easeFactor: 2.5, interval: 1, quality: 0, isActive: true, isNew: true, nextReview: new Date(), streak: 0 },
      { id: '3', front: 'Quem foi o autor de "Dom Casmurro"?', back: 'Machado de Assis', subject: 'Literatura', module: 'Realismo', subModule: 'Autores', difficulty: 'easy', category: 'Autor', tags: ['literatura', 'machado de assis'], createdAt: new Date(), lastReviewed: null, reviewCount: 0, correctCount: 0, incorrectCount: 0, easeFactor: 2.5, interval: 1, quality: 0, isActive: true, isNew: true, nextReview: new Date(), streak: 0 },
    ];
    setFlashcards(sampleCards);
    setModules(organizeFlashcardsBySubject(sampleCards));
  }, []);

  const updateCardWithSRS = (card: Flashcard, correct: boolean): Flashcard => {
    const now = new Date();
    const newReviewCount = card.reviewCount + 1;
    const newCorrectCount = correct ? card.correctCount + 1 : card.correctCount;
    let newInterval: number;
    let newEaseFactor: number;

    if (correct) {
      if (card.reviewCount === 0) newInterval = 1;
      else if (card.reviewCount === 1) newInterval = 6;
      else newInterval = Math.round(card.interval * card.easeFactor);
      newEaseFactor = Math.max(1.3, card.easeFactor + 0.1);
    } else {
      newInterval = 1;
      newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
    }
    
    const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
    
    return { ...card, lastReviewed: now, reviewCount: newReviewCount, correctCount: newCorrectCount, nextReview, interval: newInterval, easeFactor: newEaseFactor, streak: correct ? (card.streak || 0) + 1 : 0 };
  };

  const startStudy = (cards: Flashcard[]) => {
    const toStudy = cards.filter(c => !c.nextReview || new Date(c.nextReview) <= new Date());
    if (toStudy.length === 0) {
      alert("Não há cards para revisar neste módulo no momento.");
      return;
    }
    setStudyModeCards(toStudy);
    setIsStudyMode(true);
    setCurrentCardIndex(0);
    setSessionTime(0);
    intervalRef.current = setInterval(() => setSessionTime(p => p + 1), 1000);
  };

  const endStudy = () => {
    setIsStudyMode(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleCardAnswer = (correct: boolean) => {
    const currentCard = studyModeCards[currentCardIndex];
    if (!currentCard) return;
    
    const updatedCard = updateCardWithSRS(currentCard, correct);
    setFlashcards(prev => prev.map(card => card.id === updatedCard.id ? updatedCard : card));
    setStudyModeCards(prev => prev.map(card => card.id === updatedCard.id ? updatedCard : card));

    if (currentCardIndex < studyModeCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      endStudy();
    }
  };

  const startGame = (cards: Flashcard[]) => {
    if (cards.length === 0) {
      alert("Não há cards neste módulo para iniciar o jogo.");
      return;
    }
    setGameCards(cards);
    setGameMode(true);
    setCurrentGameCardIndex(0);
    setGameScore({ correct: 0, total: 0 });
  };
  
  const endGame = () => {
    setGameMode(false);
  };

  const handleGameAnswer = (correct: boolean) => {
    setGameScore(prev => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      total: prev.total + 1
    }));

    if (currentGameCardIndex < gameCards.length - 1) {
      setCurrentGameCardIndex(prev => prev + 1);
    } else {
      setTimeout(() => {
        alert(`Fim de jogo! Você acertou ${gameScore.correct + (correct ? 1 : 0)} de ${gameCards.length}.`);
        endGame();
      }, 500);
    }
  };

  const generateFlashcardsFromText = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    try {
      const cards = await FlashcardAIService.generateFlashcards(inputText);
      const newCards: Flashcard[] = cards.map(card => ({
        ...card, incorrectCount: 0, quality: 0, isActive: true, nextReview: new Date(), isNew: true,
      }));
      setGeneratedCards(newCards);
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addGeneratedCards = () => {
    const updatedFlashcards = [...flashcards, ...generatedCards];
    setFlashcards(updatedFlashcards);
    setModules(organizeFlashcardsBySubject(updatedFlashcards));
    setGeneratedCards([]);
    setInputText('');
    setShowAIGenerator(false);
    setActiveTab('modules');
  };

  const deleteCard = (cardId: string) => {
    setFlashcards(prev => prev.filter(card => card.id !== cardId));
    setModules(organizeFlashcardsBySubject(flashcards.filter(card => card.id !== cardId)));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentStudyCard = studyModeCards[currentCardIndex];
  const currentGameCard = gameCards[currentGameCardIndex];

  if (isStudyMode) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4 text-white">
            <h2 className="text-xl font-bold">Modo Estudo</h2>
            <div className="flex items-center gap-4">
              <span className="font-semibold">{currentCardIndex + 1} / {studyModeCards.length}</span>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{formatTime(sessionTime)}</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={endStudy}><X/></Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Encerrar Estudo</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Progress value={((currentCardIndex + 1) / studyModeCards.length) * 100} className="mb-8"/>
          {currentStudyCard && <FlashcardCard card={currentStudyCard} onAnswer={handleCardAnswer} isStudyMode />}
          <div className="flex justify-center gap-4 mt-8">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => setCurrentCardIndex(p => Math.max(0, p - 1))} disabled={currentCardIndex === 0}><SkipBack/></Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Card Anterior</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => setCurrentCardIndex(p => Math.min(studyModeCards.length - 1, p + 1))} disabled={currentCardIndex === studyModeCards.length - 1}><SkipForward/></Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Próximo Card</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
  
  if (gameMode) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl">
           <div className="flex justify-between items-center mb-4 text-white">
             <h2 className="text-xl font-bold">Modo Jogo</h2>
             <div className="flex items-center gap-4">
               <span>Score: {gameScore.correct} / {gameScore.total}</span>
               <span>{currentGameCardIndex + 1} / {gameCards.length}</span>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={endGame}><X/></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Encerrar Jogo</p>
                    </TooltipContent>
                </Tooltip>
             </div>
           </div>
          {currentGameCard && <FlashcardCard card={currentGameCard} onAnswer={handleGameAnswer} isStudyMode />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Meus Flashcards</h1>
            <p className="text-muted-foreground">Revise e gerencie seus baralhos de estudo.</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
                <Button onClick={() => setActiveTab('generator')}>
                    <Brain className="h-4 w-4 mr-2" />
                    Gerar com IA
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Crie flashcards automaticamente a partir de um texto.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modules">Meus Módulos</TabsTrigger>
            <TabsTrigger value="generator">Gerador IA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules" className="mt-6">
            <div className="mb-6">
              <Input placeholder="Buscar módulos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm"/>
            </div>
            {selectedModule ? (
              <div>
                <Button variant="ghost" onClick={() => setSelectedModule(null)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/> Voltar aos Módulos</Button>
                <h2 className="text-2xl font-bold mb-4">{selectedModule.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedModule.subModules[0].cards.map(card => (
                      <Card key={card.id}>
                          <CardHeader>
                              <CardTitle>{card.front}</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <p>{card.back}</p>
                              <div className="flex justify-end mt-4">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="sm" variant="destructive" onClick={() => deleteCard(card.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Excluir Card</p>
                                    </TooltipContent>
                                </Tooltip>
                              </div>
                          </CardContent>
                      </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map(module => (
                  <Card key={module.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{module.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{module.subModules[0].cardCount} cards</p>
                        </div>
                        <div className={`p-3 rounded-lg text-white bg-gradient-to-br ${module.color}`}>
                          {getSubjectIcon(module.subject)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                      <div>
                        <Progress value={module.progress} className="mb-4"/>
                        <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button className="flex-1" onClick={() => startStudy(module.subModules[0].cards)}>
                                <Play className="h-4 w-4 mr-2"/> Estudar
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Iniciar modo de estudo com repetição espaçada.</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button className="flex-1" variant="secondary" onClick={() => startGame(module.subModules[0].cards)}>
                                <Zap className="h-4 w-4 mr-2"/> Jogo Rápido
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Teste seus conhecimentos de forma rápida.</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                           <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedModule(module)}>
                                <FolderOpen className="h-4 w-4"/>
                                </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                                <p>Ver todos os cards deste módulo.</p>
                           </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="generator" className="mt-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Gerador de Flashcards com IA</CardTitle>
                      <p className="text-muted-foreground">Cole um texto e a IA criará flashcards para você.</p>
                  </CardHeader>
                  <CardContent>
                      <Textarea 
                          placeholder="Cole seu texto aqui..." 
                          className="min-h-[200px] mb-4"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                      />
                      <Button onClick={generateFlashcardsFromText} disabled={isGenerating}>
                          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Brain className="mr-2 h-4 w-4" />}
                          {isGenerating ? 'Gerando...' : 'Gerar Flashcards'}
                      </Button>
                  </CardContent>
              </Card>

              {generatedCards.length > 0 && (
                  <Dialog open={generatedCards.length > 0} onOpenChange={() => setGeneratedCards([])}>
                      <DialogContent className="max-w-4xl">
                          <DialogHeader>
                              <DialogTitle>Flashcards Gerados</DialogTitle>
                          </DialogHeader>
                          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
                              {generatedCards.map(card => (
                                  <Card key={card.id}>
                                      <CardContent className="p-4">
                                          <p><strong>Frente:</strong> {card.front}</p>
                                          <p><strong>Verso:</strong> {card.back}</p>
                                      </CardContent>
                                  </Card>
                              ))}
                          </div>
                          <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setGeneratedCards([])}>Descartar</Button>
                              <Button onClick={addGeneratedCards}>Adicionar à Coleção</Button>
                          </div>
                      </DialogContent>
                  </Dialog>
              )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Flashcards;
