
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
  PenTool
} from 'lucide-react';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import FlashcardAIService from '@/services/FlashcardAIService';
import type { FlashcardData } from '@/services/FlashcardAIService';

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
  onAnswer: (correct: boolean) => void;
  isStudyMode?: boolean;
}

const FlashcardCard = ({ card, onAnswer, isStudyMode = false }: FlashcardCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFlip = () => {
    // Adicionar efeito de brilho durante a transição
    if (cardRef.current) {
      cardRef.current.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(16, 185, 129, 0.4)';
      cardRef.current.style.transform = 'scale(1.05)';
      
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.boxShadow = '';
          cardRef.current.style.transform = '';
        }
      }, 1000);
    }
    
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

  const handleAnswer = (correct: boolean) => {
    onAnswer(correct);
    // Não resetar automaticamente - deixar o usuário controlar quando voltar
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
    <div className="perspective-1000 w-full h-80 relative">
      {/* Efeito de partículas durante a transição */}
      {isFlipped && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
            <div className="w-1 h-1 bg-emerald-400 rounded-full animate-ping absolute top-2 left-2" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping absolute -top-1 -right-1" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
      
      <div 
        ref={cardRef}
        className={`relative w-full h-full transform-style-preserve-3d transition-all duration-1000 ease-in-out cursor-pointer hover:scale-105 hover:shadow-2xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 1s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.3s ease-in-out'
        }}
        onClick={handleFlip}
      >
        {/* Frente da Carta */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-2xl border-0 transition-opacity duration-500"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            opacity: isFlipped ? 0 : 1
          }}
        >
          <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl relative overflow-hidden">
            {/* Padrão de fundo sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            
            {/* Efeito de ondulação sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse"></div>
            
            <div className="relative h-full flex flex-col justify-center items-center p-8 text-center">
              {/* Header da carta */}
              <div className="absolute top-6 right-6">
                <Badge className={`bg-gradient-to-r ${getDifficultyColor(card.difficulty)} text-white border-0 px-4 py-2 rounded-full font-semibold shadow-lg`}>
                  {getDifficultyText(card.difficulty)}
                </Badge>
              </div>
              
              {/* Conteúdo principal */}
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-center gap-3 text-slate-300 text-sm font-medium">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>{card.subject}</span>
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <span>{card.module}</span>
                </div>
                
                <div className="text-2xl font-bold text-white leading-relaxed transition-all duration-700 transform hover:scale-105">
                  {card.front}
                </div>
                
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                  <Eye className="h-4 w-4" />
                  <span>Clique para girar o card</span>
                </div>
              </div>
              
              {/* Streak indicator */}
              {card.streak && card.streak > 0 && (
                <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm px-3 py-2 rounded-full">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-orange-300 font-semibold text-sm">{card.streak}</span>
                </div>
              )}
              
              {/* Progress indicator */}
              <div className="absolute bottom-6 right-6 flex items-center gap-2 text-slate-400 text-sm">
                <Target className="h-4 w-4" />
                <span>{card.reviewCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verso da Carta */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-2xl border-0 transition-opacity duration-500"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            opacity: isFlipped ? 1 : 0
          }}
        >
          <div className="h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl relative overflow-hidden">
            {/* Padrão de fundo sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            
            {/* Efeito de ondulação sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse"></div>
            
            <div className="relative h-full flex flex-col justify-center items-center p-8 text-center">
              {/* Header da resposta */}
              <div className="absolute top-6 right-6">
                <Badge className="bg-white/20 text-white border-0 px-4 py-2 rounded-full font-semibold shadow-lg backdrop-blur-sm">
                  Resposta
                </Badge>
              </div>
              
              {/* Conteúdo da resposta */}
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-center gap-3 text-emerald-100 text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>{card.subject}</span>
                  <div className="w-1 h-1 bg-emerald-300 rounded-full"></div>
                  <span>{card.module}</span>
                </div>
                
                <div className="text-2xl font-bold text-white leading-relaxed transition-all duration-700 transform hover:scale-105">
                  {card.back}
                </div>
                
                {/* Instrução para clicar novamente */}
                <div className="flex items-center justify-center gap-2 text-emerald-100 text-sm mt-4">
                  <Eye className="h-4 w-4" />
                  <span>Clique para voltar à pergunta</span>
                </div>
                
                {/* Botões de resposta no modo estudo */}
                {isStudyMode && showAnswer && (
                  <div className="flex gap-4 mt-8 animate-fade-in">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnswer(false);
                      }}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Errei
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnswer(true);
                      }}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Acertei
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Estatísticas da resposta */}
              <div className="absolute bottom-6 left-6 flex items-center gap-4 text-emerald-100 text-sm">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{card.reviewCount || 0} revisões</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>{card.correctCount || 0} acertos</span>
                </div>
              </div>
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
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'modules'>('modules');
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0
  });
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [inputText, setInputText] = useState('');
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  const [recentTexts, setRecentTexts] = useState<string[]>([]);
  const [favoriteTexts, setFavoriteTexts] = useState<string[]>([]);
  const [studyMode, setStudyMode] = useState<'review' | 'new' | 'difficult'>('review');
  const [showProgress, setShowProgress] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [gameMode, setGameMode] = useState(false);
  const [gameCards, setGameCards] = useState<Flashcard[]>([]);
  const [currentGameCard, setCurrentGameCard] = useState(0);
  const [gameScore, setGameScore] = useState({ correct: 0, total: 0 });
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sistema de módulos automáticos por matéria
  const getSubjectIcon = (subject: string) => {
    const icons: { [key: string]: any } = {
      'Matemática': Calculator,
      'Física': Atom,
      'Química': Atom,
      'Biologia': Dna,
      'História': ScrollText,
      'Geografia': Globe,
      'Português': BookOpen,
      'Literatura': BookOpen,
      'Filosofia': Lightbulb,
      'Sociologia': Users,
      'Artes': Palette,
      'Educação Física': Zap,
      'Língua Estrangeira': Globe,
      'Redação': PenTool
    };
    return icons[subject] || GraduationCap;
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Matemática': 'from-slate-600 to-slate-700',
      'Física': 'from-slate-700 to-slate-800',
      'Química': 'from-slate-500 to-slate-600',
      'Biologia': 'from-slate-600 to-slate-700',
      'História': 'from-slate-700 to-slate-800',
      'Geografia': 'from-slate-500 to-slate-600',
      'Português': 'from-slate-600 to-slate-700',
      'Literatura': 'from-slate-500 to-slate-600',
      'Filosofia': 'from-slate-700 to-slate-800',
      'Sociologia': 'from-slate-500 to-slate-600',
      'Artes': 'from-slate-400 to-slate-500',
      'Educação Física': 'from-slate-600 to-slate-700',
      'Língua Estrangeira': 'from-slate-500 to-slate-600',
      'Redação': 'from-slate-700 to-slate-800'
    };
    return colors[subject] || 'from-slate-500 to-slate-600';
  };

  // Organizar flashcards automaticamente por matéria e criar módulos
  const organizeFlashcardsBySubject = () => {
    const subjectGroups: { [key: string]: Flashcard[] } = {};
    
    // Agrupar por matéria
    flashcards.forEach(card => {
      if (!subjectGroups[card.subject]) {
        subjectGroups[card.subject] = [];
      }
      subjectGroups[card.subject].push(card);
    });

    // Criar módulos automaticamente
    const autoModules: Module[] = Object.entries(subjectGroups).map(([subject, cards], index) => {
      const IconComponent = getSubjectIcon(subject);
      const colorClass = getSubjectColor(subject);

      return {
        id: `auto-${subject}`,
        name: subject,
        subject: subject,
        description: `Todos os flashcards de ${subject}`,
        color: colorClass,
        progress: Math.round((cards.filter(card => card.reviewCount > 0).length / cards.length) * 100),
        subModules: [{
          id: `${subject}-all`,
          name: 'Todos os Cards',
          description: `Todos os flashcards de ${subject}`,
          progress: Math.round((cards.filter(card => card.reviewCount > 0).length / cards.length) * 100),
          cardCount: cards.length,
          cards: cards
        }]
      };
    });

    setModules(autoModules);
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setSelectedModule(null);
    setFilterModule('all');
    setFilterSubject('all');
    setSearchTerm('');
  };

  // Dados completos do ENEM
  useEffect(() => {
    const sampleCards: Flashcard[] = [
      // MATEMÁTICA - ÁLGEBRA
      {
        id: '1',
        front: 'Qual é a fórmula da equação do segundo grau?',
        back: 'ax² + bx + c = 0, onde a ≠ 0',
        subject: 'Matemática',
        module: 'Álgebra',
        subModule: 'Equações do 2º Grau',
        difficulty: 'medium',
        category: 'Álgebra',
        tags: ['equação', 'segundo grau', 'fórmula'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      {
        id: '2',
        front: 'Como calcular o discriminante?',
        back: 'Δ = b² - 4ac',
        subject: 'Matemática',
        module: 'Álgebra',
        subModule: 'Equações do 2º Grau',
        difficulty: 'easy',
        category: 'Álgebra',
        tags: ['discriminante', 'equação', 'segundo grau'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      {
        id: '3',
        front: 'Qual a fórmula de Bhaskara?',
        back: 'x = (-b ± √Δ) / 2a',
        subject: 'Matemática',
        module: 'Álgebra',
        subModule: 'Equações do 2º Grau',
        difficulty: 'medium',
        category: 'Álgebra',
        tags: ['bhaskara', 'fórmula', 'equação'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      // MATEMÁTICA - GEOMETRIA
      {
        id: '4',
        front: 'Qual a fórmula da área do triângulo?',
        back: 'A = (base × altura) / 2',
        subject: 'Matemática',
        module: 'Geometria',
        subModule: 'Áreas',
        difficulty: 'easy',
        category: 'Geometria',
        tags: ['área', 'triângulo', 'geometria'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      {
        id: '5',
        front: 'Qual a fórmula da área do círculo?',
        back: 'A = π × r²',
        subject: 'Matemática',
        module: 'Geometria',
        subModule: 'Áreas',
        difficulty: 'easy',
        category: 'Geometria',
        tags: ['área', 'círculo', 'pi'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      // PORTUGUÊS - LITERATURA
      {
        id: '6',
        front: 'O que é uma metáfora?',
        back: 'Figura de linguagem que estabelece uma comparação implícita entre dois elementos',
        subject: 'Português',
        module: 'Literatura',
        subModule: 'Figuras de Linguagem',
        difficulty: 'easy',
        category: 'Literatura',
        tags: ['figura de linguagem', 'metáfora'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      {
        id: '7',
        front: 'O que é uma metonímia?',
        back: 'Figura de linguagem que substitui uma palavra por outra com relação de proximidade',
        subject: 'Português',
        module: 'Literatura',
        subModule: 'Figuras de Linguagem',
        difficulty: 'medium',
        category: 'Literatura',
        tags: ['figura de linguagem', 'metonímia'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      // FÍSICA - MECÂNICA
      {
        id: '8',
        front: 'Qual a segunda lei de Newton?',
        back: 'F = m × a (Força = massa × aceleração)',
        subject: 'Física',
        module: 'Mecânica',
        subModule: 'Leis de Newton',
        difficulty: 'medium',
        category: 'Mecânica',
        tags: ['newton', 'força', 'aceleração'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      {
        id: '9',
        front: 'Qual a fórmula da energia cinética?',
        back: 'Ec = (m × v²) / 2',
        subject: 'Física',
        module: 'Mecânica',
        subModule: 'Energia',
        difficulty: 'medium',
        category: 'Mecânica',
        tags: ['energia', 'cinética', 'velocidade'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      // QUÍMICA - GERAL
      {
        id: '10',
        front: 'O que é um ácido de Arrhenius?',
        back: 'Substância que em solução aquosa libera íons H+',
        subject: 'Química',
        module: 'Química Geral',
        subModule: 'Ácidos e Bases',
        difficulty: 'medium',
        category: 'Química Geral',
        tags: ['ácido', 'arrhenius', 'íons'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      // BIOLOGIA - CITOLOGIA
      {
        id: '11',
        front: 'Qual organela é responsável pela respiração celular?',
        back: 'Mitocôndria',
        subject: 'Biologia',
        module: 'Citologia',
        subModule: 'Organelas',
        difficulty: 'easy',
        category: 'Citologia',
        tags: ['mitocôndria', 'respiração', 'organela'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      // HISTÓRIA - BRASIL
      {
        id: '12',
        front: 'Em que ano foi proclamada a Independência do Brasil?',
        back: '1822',
        subject: 'História',
        module: 'História do Brasil',
        subModule: 'Período Imperial',
        difficulty: 'easy',
        category: 'História do Brasil',
        tags: ['independência', '1822', 'imperial'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      },
      // GEOGRAFIA - FÍSICA
      {
        id: '13',
        front: 'Qual o maior bioma brasileiro?',
        back: 'Amazônia',
        subject: 'Geografia',
        module: 'Geografia Física',
        subModule: 'Biomas',
        difficulty: 'easy',
        category: 'Geografia Física',
        tags: ['amazônia', 'bioma', 'brasil'],
        createdAt: new Date(),
        lastReviewed: null,
        nextReview: new Date(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        easeFactor: 2.5,
        interval: 1,
        quality: 0,
        isActive: true,
        isNew: true,
        streak: 0
      }
    ];

    const sampleModules: Module[] = [
      // MATEMÁTICA
      {
        id: '1',
        name: 'Álgebra',
        subject: 'Matemática',
        description: 'Equações, funções e expressões algébricas',
        color: '#3B82F6',
        progress: 75,
        subModules: [
          {
            id: '1-1',
            name: 'Equações do 2º Grau',
            description: 'Fórmulas e resolução de equações quadráticas',
            progress: 80,
            cardCount: 3,
            cards: sampleCards.filter(card => card.subModule === 'Equações do 2º Grau')
          }
        ]
      },
      {
        id: '2',
        name: 'Geometria',
        subject: 'Matemática',
        description: 'Áreas, volumes e formas geométricas',
        color: '#8B5CF6',
        progress: 60,
        subModules: [
          {
            id: '2-1',
            name: 'Áreas',
            description: 'Cálculo de áreas de figuras planas',
            progress: 70,
            cardCount: 2,
            cards: sampleCards.filter(card => card.subModule === 'Áreas')
          }
        ]
      },
      // PORTUGUÊS
      {
        id: '3',
        name: 'Literatura',
        subject: 'Português',
        description: 'Figuras de linguagem e análise textual',
        color: '#10B981',
        progress: 50,
        subModules: [
          {
            id: '3-1',
            name: 'Figuras de Linguagem',
            description: 'Metáfora, metonímia, comparação e outras figuras',
            progress: 70,
            cardCount: 2,
            cards: sampleCards.filter(card => card.subModule === 'Figuras de Linguagem')
          }
        ]
      },
      // FÍSICA
      {
        id: '4',
        name: 'Mecânica',
        subject: 'Física',
        description: 'Leis de Newton, energia e movimento',
        color: '#F59E0B',
        progress: 40,
        subModules: [
          {
            id: '4-1',
            name: 'Leis de Newton',
            description: 'Primeira, segunda e terceira leis de Newton',
            progress: 60,
            cardCount: 1,
            cards: sampleCards.filter(card => card.subModule === 'Leis de Newton')
          },
          {
            id: '4-2',
            name: 'Energia',
            description: 'Energia cinética, potencial e conservação',
            progress: 50,
            cardCount: 1,
            cards: sampleCards.filter(card => card.subModule === 'Energia')
          }
        ]
      },
      // QUÍMICA
      {
        id: '5',
        name: 'Química Geral',
        subject: 'Química',
        description: 'Ácidos, bases, soluções e reações',
        color: '#EF4444',
        progress: 35,
        subModules: [
          {
            id: '5-1',
            name: 'Ácidos e Bases',
            description: 'Teorias de Arrhenius, Bronsted-Lowry e Lewis',
            progress: 45,
            cardCount: 1,
            cards: sampleCards.filter(card => card.subModule === 'Ácidos e Bases')
          }
        ]
      },
      // BIOLOGIA
      {
        id: '6',
        name: 'Citologia',
        subject: 'Biologia',
        description: 'Estrutura e função das células',
        color: '#22C55E',
        progress: 55,
        subModules: [
          {
            id: '6-1',
            name: 'Organelas',
            description: 'Mitocôndrias, ribossomos, retículo endoplasmático',
            progress: 65,
            cardCount: 1,
            cards: sampleCards.filter(card => card.subModule === 'Organelas')
          }
        ]
      },
      // HISTÓRIA
      {
        id: '7',
        name: 'História do Brasil',
        subject: 'História',
        description: 'Período colonial, imperial e republicano',
        color: '#F97316',
        progress: 45,
        subModules: [
          {
            id: '7-1',
            name: 'Período Imperial',
            description: 'Independência, Primeiro e Segundo Reinado',
            progress: 55,
            cardCount: 1,
            cards: sampleCards.filter(card => card.subModule === 'Período Imperial')
          }
        ]
      },
      // GEOGRAFIA
      {
        id: '8',
        name: 'Geografia Física',
        subject: 'Geografia',
        description: 'Clima, relevo, vegetação e hidrografia',
        color: '#06B6D4',
        progress: 30,
        subModules: [
          {
            id: '8-1',
            name: 'Biomas',
            description: 'Amazônia, Cerrado, Caatinga, Mata Atlântica',
            progress: 40,
            cardCount: 1,
            cards: sampleCards.filter(card => card.subModule === 'Biomas')
          }
        ]
      }
    ];

    setFlashcards(sampleCards);
    setModules(sampleModules);
  }, []);

  // Algoritmo de Repetição Espaçada (SM-2)
  const updateCardWithSRS = (card: Flashcard, correct: boolean) => {
    const now = new Date();
    const newReviewCount = card.reviewCount + 1;
    const newCorrectCount = correct ? card.correctCount + 1 : card.correctCount;
    
    let newInterval: number;
    let newEaseFactor: number;
    
    if (correct) {
      if (card.reviewCount === 0) {
        newInterval = 1;
      } else if (card.reviewCount === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(card.interval * card.easeFactor);
      }
      newEaseFactor = Math.max(1.3, card.easeFactor + 0.1);
    } else {
      newInterval = 1;
      newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
    }
    
    const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
    
    return {
      ...card,
      lastReviewed: now,
      reviewCount: newReviewCount,
      correctCount: newCorrectCount,
      nextReview,
      interval: newInterval,
      easeFactor: newEaseFactor,
      streak: correct ? (card.streak || 0) + 1 : 0
    };
  };

  // Funções de estudo
  const startStudySession = () => {
    const session: StudySession = {
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: null,
      cardsStudied: 0,
      correctAnswers: 0,
      totalTime: 0,
      currentStreak: 0,
      bestStreak: 0
    };
    
    setStudySession(session);
    setIsStudyMode(true);
    setCurrentCardIndex(0);
    setStudyStats({ correct: 0, incorrect: 0, streak: 0, bestStreak: 0 });
    setIsSessionActive(true);
    setSessionTime(0);
    
    // Iniciar cronômetro
    intervalRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  };

  const endStudySession = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (studySession) {
      const updatedSession = {
        ...studySession,
        endTime: new Date(),
        cardsStudied: studyStats.correct + studyStats.incorrect,
        correctAnswers: studyStats.correct,
        totalTime: sessionTime,
        currentStreak: studyStats.streak,
        bestStreak: Math.max(studyStats.bestStreak, studyStats.streak)
      };
      setStudySession(updatedSession);
    }
    
    setIsStudyMode(false);
    setIsSessionActive(false);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const handleCardAnswer = (correct: boolean) => {
    if (!studySession) return;
    
    const currentCard = filteredCards[currentCardIndex];
    if (!currentCard) return;
    
    // Atualizar card com algoritmo SRS
    const updatedCard = updateCardWithSRS(currentCard, correct);
    setFlashcards(prev => prev.map(card =>
      card.id === updatedCard.id ? updatedCard : card
    ));
    
    // Atualizar estatísticas
    setStudyStats(prev => {
      const newStats = {
        correct: correct ? prev.correct + 1 : prev.correct,
        incorrect: correct ? prev.incorrect : prev.incorrect + 1,
        streak: correct ? prev.streak + 1 : 0,
        bestStreak: correct ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak
      };
      return newStats;
    });
    
    // Próximo card
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Sessão concluída
      endStudySession();
    }
  };

  const nextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      // Não resetar o showAnswer - deixar o usuário controlar
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      // Não resetar o showAnswer - deixar o usuário controlar
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // Função para deletar flashcard
  const deleteCard = (cardId: string) => {
    if (confirm('Tem certeza que deseja deletar este flashcard?')) {
      setFlashcards(prev => prev.filter(card => card.id !== cardId));
      
      // Atualizar módulos removendo o card
      setModules(prev => prev.map(module => ({
        ...module,
        subModules: module.subModules.map(sub => ({
          ...sub,
          cards: sub.cards.filter(card => card.id !== cardId),
          cardCount: Math.max(0, sub.cardCount - 1)
        }))
      })));
    }
  };

  // Templates rápidos para diferentes matérias
  const quickTemplates = [
    {
      id: 'math',
      title: 'Matemática',
      icon: '🧮',
      template: 'A equação do segundo grau é ax² + bx + c = 0, onde a ≠ 0. O discriminante é calculado por Δ = b² - 4ac. A fórmula de Bhaskara é x = (-b ± √Δ) / 2a. Quando Δ > 0, a equação tem duas raízes reais distintas. Quando Δ = 0, tem uma raiz real dupla. Quando Δ < 0, não tem raízes reais.'
    },
    {
      id: 'physics',
      title: 'Física',
      icon: '⚡',
      template: 'A segunda lei de Newton estabelece que F = m × a, onde F é a força resultante, m é a massa do objeto e a é a aceleração. A energia cinética é calculada por Ec = (m × v²) / 2. A energia potencial gravitacional é Ep = m × g × h. O trabalho é dado por W = F × d × cos(θ).'
    },
    {
      id: 'chemistry',
      title: 'Química',
      icon: '🧪',
      template: 'Um ácido de Arrhenius é uma substância que em solução aquosa libera íons H+. Uma base de Arrhenius é uma substância que em solução aquosa libera íons OH-. O pH é calculado por pH = -log[H+]. A constante de Avogadro é 6,02 × 10²³ mol⁻¹. A molaridade é M = n/V.'
    },
    {
      id: 'biology',
      title: 'Biologia',
      icon: '🧬',
      template: 'A fotossíntese é o processo pelo qual as plantas convertem luz solar em energia química. A equação geral é: 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂. A respiração celular ocorre nas mitocôndrias. O DNA contém as informações genéticas. A mitose é a divisão celular para crescimento.'
    },
    {
      id: 'history',
      title: 'História',
      icon: '📜',
      template: 'A Independência do Brasil foi proclamada em 7 de setembro de 1822 por Dom Pedro I. O período imperial durou de 1822 a 1889. A Lei Áurea foi assinada em 13 de maio de 1888, abolindo a escravidão. A República foi proclamada em 15 de novembro de 1889.'
    },
    {
      id: 'geography',
      title: 'Geografia',
      icon: '🌍',
      template: 'O Brasil possui 5 biomas principais: Amazônia, Cerrado, Caatinga, Mata Atlântica e Pampa. A Amazônia é o maior bioma brasileiro. O clima tropical predomina na maior parte do território. A hidrografia brasileira é rica, com destaque para o Rio Amazonas.'
    }
  ];

  // Função para aplicar template
  const applyTemplate = (template: string) => {
    setInputText(template);
    setShowQuickTemplates(false);
  };

  // Função para salvar texto nos favoritos
  const saveToFavorites = () => {
    if (inputText.trim() && !favoriteTexts.includes(inputText)) {
      setFavoriteTexts(prev => [...prev, inputText]);
    }
  };

  // Função para carregar texto dos favoritos
  const loadFromFavorites = (text: string) => {
    setInputText(text);
  };

  // Função para gerar flashcards automaticamente a partir de texto
  const generateFlashcardsFromText = async () => {
    if (!inputText.trim()) {
      alert('Digite um texto para gerar os flashcards!');
      return;
    }

    setIsGenerating(true);
    
    // Salvar texto recente
    if (!recentTexts.includes(inputText)) {
      setRecentTexts(prev => [inputText, ...prev.slice(0, 4)]);
    }
    
    try {
      // Usar o serviço de IA para gerar flashcards
      const cards = await FlashcardAIService.generateFlashcards(inputText);
      
      // Aplicar matéria selecionada se não for "all"
      const processedCards: Flashcard[] = cards.map(card => ({
        ...card,
        incorrectCount: 0,
        quality: 0,
        isActive: true,
        nextReview: new Date(),
        subject: selectedSubject !== 'all' ? selectedSubject : card.subject,
        difficulty: studyMode === 'difficult' ? 'hard' : 
                   studyMode === 'new' ? 'easy' : card.difficulty,
      }));
      
      setGeneratedCards(processedCards);
      setShowProgress(true);
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
      alert('Erro ao gerar flashcards. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para adicionar cards gerados
  const addGeneratedCards = () => {
    setFlashcards(prev => [...prev, ...generatedCards]);
    
    // Organizar automaticamente após adicionar cards
    setTimeout(() => {
      organizeFlashcardsBySubject();
    }, 100);
    
    setGeneratedCards([]);
    setInputText('');
    setShowAIGenerator(false);
  };

  // Funções do modo jogo
  const startGameMode = (cards: Flashcard[]) => {
    setGameCards(cards);
    setGameMode(true);
    setCurrentGameCard(0);
    setGameScore({ correct: 0, total: 0 });
    setShowAnswer(false);
    setIsFlipped(false); // Sempre começar com a pergunta
  };

  const endGameMode = () => {
    setGameMode(false);
    setCurrentGameCard(0);
    setGameScore({ correct: 0, total: 0 });
    setShowAnswer(false);
    setIsFlipped(false); // Sempre resetar para pergunta
    setGameCards([]);
  };

  const handleGameAnswer = (correct: boolean) => {
    setGameScore(prev => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      total: prev.total + 1
    }));

    // Atualizar o card com algoritmo SRS
    const currentCard = gameCards[currentGameCard];
    if (currentCard) {
      const updatedCard = updateCardWithSRS(currentCard, correct);
      setFlashcards(prev => prev.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      ));
    }

    // Avançar para o próximo card e mostrar a pergunta
    if (currentGameCard < gameCards.length - 1) {
      setCurrentGameCard(prev => prev + 1);
      setIsFlipped(false); // Sempre mostrar a pergunta primeiro
    } else {
      endGameMode();
    }
  };

  const nextGameCard = () => {
    if (currentGameCard < gameCards.length - 1) {
      setCurrentGameCard(prev => prev + 1);
      setIsFlipped(false); // Sempre mostrar a pergunta primeiro
    }
  };

  const previousGameCard = () => {
    if (currentGameCard > 0) {
      setCurrentGameCard(prev => prev - 1);
      setIsFlipped(false); // Sempre mostrar a pergunta primeiro
    }
  };

  // Função para organizar automaticamente todos os flashcards nos módulos
  const organizeAllFlashcards = () => {
    setModules(prev => prev.map(module => {
      // Encontrar todos os flashcards que pertencem a este módulo
      const moduleCards = flashcards.filter(card => card.module === module.name);
      
      // Organizar por submódulos
      const organizedSubModules = module.subModules.map(subModule => {
        const subModuleCards = moduleCards.filter(card => 
          card.subModule === subModule.name || 
          card.subModule === 'Gerado automaticamente' ||
          card.subModule === 'Geral'
        );
        
        return {
          ...subModule,
          cards: subModuleCards,
          cardCount: subModuleCards.length
        };
      });
      
      // Calcular progresso baseado no número de cards
      const totalCards = moduleCards.length;
      const progress = Math.min(100, Math.round((totalCards / 20) * 100)); // 20 cards = 100%
      
      return {
        ...module,
        subModules: organizedSubModules,
        progress: progress
      };
    }));
  };

  // Função para mover flashcard para módulo específico
  const moveFlashcardToModule = (cardId: string, newModule: string, newSubModule: string) => {
    setFlashcards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, module: newModule, subModule: newSubModule }
        : card
    ));
    
    // Reorganizar módulos após mover
    organizeAllFlashcards();
  };

  // Função para criar submódulo automaticamente se não existir
  const createSubModuleIfNotExists = (moduleName: string, subModuleName: string) => {
    setModules(prev => prev.map(module => {
      if (module.name === moduleName) {
        const subModuleExists = module.subModules.some(sub => sub.name === subModuleName);
        
        if (!subModuleExists) {
          const newSubModule: SubModule = {
            id: `${module.id}-${Date.now()}`,
            name: subModuleName,
            description: `Submódulo criado automaticamente para ${subModuleName}`,
            progress: 0,
            cardCount: 0,
            cards: []
          };
          
          return {
            ...module,
            subModules: [...module.subModules, newSubModule]
          };
        }
      }
      return module;
    }));
  };

  const filteredCards = flashcards.filter(card => {
    const matchesSubject = filterSubject === 'all' || card.subject === filterSubject;
    const matchesModule = filterModule === 'all' || card.module === filterModule;
    const matchesSearch = searchTerm === '' || 
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSubject && matchesModule && matchesSearch;
  });

  const cardsToStudy = filteredCards.filter(card => {
    if (!card.nextReview) return true;
    return new Date(card.nextReview) <= new Date() || card.isNew;
  });


  const getDifficultyColor = (difficulty: Flashcard['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const subjects = [...new Set(flashcards.map(card => card.subject))];

  // Cleanup do interval ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Organizar flashcards automaticamente por matéria quando a página carrega
  useEffect(() => {
    if (flashcards.length > 0) {
      organizeFlashcardsBySubject();
    }
  }, [flashcards]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <BackButton 
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Flashcards
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Crie, organize e estude com flashcards gerados por IA.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="gerador-ia" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="gerador-ia">Gerador IA</TabsTrigger>
            <TabsTrigger value="meus-flashcards">Meus Flashcards</TabsTrigger>
          </TabsList>

          <TabsContent value="gerador-ia">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Gerador Automático de Flashcards
                </CardTitle>
                <p className="text-muted-foreground">
                  Cole qualquer texto e nossa IA irá analisar e gerar flashcards perfeitos.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Selecione a Matéria</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Detectar Automaticamente</SelectItem>
                        {subjects.map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dificuldade Preferida</label>
                    <Select value={studyMode} onValueChange={(value) => setStudyMode(value as any)}>
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="review">Revisão Geral</SelectItem>
                         <SelectItem value="new">Conteúdo Novo</SelectItem>
                         <SelectItem value="difficult">Aprofundamento</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Cole seu texto aqui:</label>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Exemplo: A equação do segundo grau é ax² + bx + c = 0, onde a ≠ 0..."
                    className="min-h-[200px]"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => setShowQuickTemplates(true)}>Templates Rápidos</Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => saveToFavorites()}>Salvar</Button>
                    <Button variant="ghost" onClick={() => setInputText('')}>Limpar</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Dicas para melhores resultados:</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li>Cole textos de livros, resumos ou anotações completas</li>
                          <li>A IA detecta automaticamente a matéria e o módulo</li>
                          <li>Textos mais longos geram flashcards mais precisos</li>
                          <li>Inclua definições, fórmulas e conceitos importantes</li>
                        </ul>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                       <h4 className="font-semibold mb-2">Recursos da IA:</h4>
                       <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li>Análise semântica do conteúdo</li>
                          <li>Geração de perguntas inteligentes</li>
                          <li>Classificação automática por dificuldade</li>
                          <li>Organização por matéria e módulo</li>
                        </ul>
                    </div>
                </div>
                
                <Button onClick={generateFlashcardsFromText} disabled={isGenerating} className="w-full">
                  {isGenerating ? 'Gerando...' : 'Gerar Flashcards'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="meus-flashcards">
             <p>Meus flashcards...</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Flashcards;

    