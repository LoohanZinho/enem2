import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RotateCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BookOpen, 
  Target,
  TrendingUp,
  Play,
  Pause,
  Square,
  Plus,
  Settings,
  BarChart3,
  Star
} from 'lucide-react';
import FlashcardService, { Flashcard, StudySession, StudyStats } from '@/services/FlashcardService';

interface FlashcardStudyProps {
  className?: string;
}

const FlashcardStudy: React.FC<FlashcardStudyProps> = ({ className }) => {
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [cardsToReview, setCardsToReview] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [session, setSession] = useState<StudySession | null>(null);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isStudying, setIsStudying] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  const flashcardService = FlashcardService.getInstance();

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (isStudying && currentCard) {
      setStartTime(Date.now());
    }
  }, [currentCard, isStudying]);

  const loadStats = () => {
    const studyStats = flashcardService.getStudyStats();
    setStats(studyStats);
  };

  const startStudySession = (subject: string) => {
    const cards = subject === 'all' ? 
      flashcardService.getCardsForReview() : 
      flashcardService.getCardsForReview(subject);
    
    if (cards.length === 0) {
      alert('Nenhum card disponível para estudo no momento!');
      return;
    }

    const newSession = flashcardService.startStudySession(subject);
    setSession(newSession);
    setCardsToReview(cards);
    setCurrentIndex(0);
    setCurrentCard(cards[0]);
    setIsStudying(true);
    setShowAnswer(false);
    setIsFlipped(false);
  };

  const endStudySession = () => {
    if (session) {
      flashcardService.endStudySession();
      setSession(null);
      setIsStudying(false);
      setCurrentCard(null);
      setCardsToReview([]);
      setCurrentIndex(0);
      loadStats();
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    if (!showAnswer) {
      setShowAnswer(true);
    }
  };

  const answerCard = (quality: number) => {
    if (!currentCard || !session) return;

    const timeSpent = Date.now() - startTime;
    flashcardService.answerCard(currentCard.id, quality, timeSpent);

    // Próximo card
    const nextIndex = currentIndex + 1;
    if (nextIndex < cardsToReview.length) {
      setCurrentIndex(nextIndex);
      setCurrentCard(cardsToReview[nextIndex]);
      setShowAnswer(false);
      setIsFlipped(false);
      setResponseTime(0);
    } else {
      // Sessão concluída
      endStudySession();
    }
  };

  const createFlashcard = (formData: any) => {
    const newCard = flashcardService.createFlashcard({
      front: formData.front,
      back: formData.back,
      subject: formData.subject,
      topic: formData.topic,
      difficulty: formData.difficulty,
      tags: formData.tags.split(',').map((tag: string) => tag.trim())
    });

    setShowCreateCard(false);
    loadStats();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualityButtons = () => [
    { quality: 0, label: 'Muito Difícil', color: 'bg-red-500 hover:bg-red-600', icon: '😵' },
    { quality: 1, label: 'Difícil', color: 'bg-orange-500 hover:bg-orange-600', icon: '😰' },
    { quality: 2, label: 'Regular', color: 'bg-yellow-500 hover:bg-yellow-600', icon: '😐' },
    { quality: 3, label: 'Fácil', color: 'bg-blue-500 hover:bg-blue-600', icon: '😊' },
    { quality: 4, label: 'Muito Fácil', color: 'bg-green-500 hover:bg-green-600', icon: '😄' },
    { quality: 5, label: 'Perfeito', color: 'bg-purple-500 hover:bg-purple-600', icon: '🤩' }
  ];

  if (isStudying && currentCard) {
    return (
      <div className={className}>
        <Card className="p-6">
          {/* Header da Sessão */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={endStudySession}>
                <Square className="h-4 w-4 mr-2" />
                Parar
              </Button>
              <div className="text-sm text-muted-foreground">
                Card {currentIndex + 1} de {cardsToReview.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentCard.subject}</Badge>
              <Badge className={getDifficultyColor(currentCard.difficulty)}>
                {currentCard.difficulty}
              </Badge>
            </div>
          </div>

          {/* Progresso */}
          <div className="mb-6">
            <Progress 
              value={(currentIndex / cardsToReview.length) * 100} 
              className="h-2" 
            />
          </div>

          {/* Card */}
          <div className="mb-6">
            <Card 
              className={`p-8 min-h-[300px] flex items-center justify-center cursor-pointer transition-transform duration-300 ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={flipCard}
            >
              <div className="text-center">
                <div className="text-lg font-medium mb-4">
                  {isFlipped ? 'Resposta:' : 'Pergunta:'}
                </div>
                <div className="text-xl">
                  {isFlipped ? currentCard.back : currentCard.front}
                </div>
                {currentCard.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4 justify-center">
                    {currentCard.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Botões de Resposta */}
          {showAnswer && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                Como foi sua resposta?
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {getQualityButtons().map(button => (
                  <Button
                    key={button.quality}
                    className={`${button.color} text-white`}
                    onClick={() => answerCard(button.quality)}
                  >
                    <span className="mr-2">{button.icon}</span>
                    {button.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!showAnswer && (
            <div className="text-center">
              <Button onClick={flipCard} size="lg">
                <RotateCw className="h-4 w-4 mr-2" />
                Mostrar Resposta
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="study" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="study">Estudar</TabsTrigger>
          <TabsTrigger value="create">Criar</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="library">Biblioteca</TabsTrigger>
        </TabsList>

        <TabsContent value="study" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Iniciar Sessão de Estudo</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Matéria</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Matérias</SelectItem>
                    <SelectItem value="Matemática">Matemática</SelectItem>
                    <SelectItem value="Física">Física</SelectItem>
                    <SelectItem value="Química">Química</SelectItem>
                    <SelectItem value="Biologia">Biologia</SelectItem>
                    <SelectItem value="História">História</SelectItem>
                    <SelectItem value="Geografia">Geografia</SelectItem>
                    <SelectItem value="Português">Português</SelectItem>
                    <SelectItem value="Literatura">Literatura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={() => startStudySession(selectedSubject)}
                className="w-full"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Começar Estudo
              </Button>
            </div>
          </Card>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalCards}</div>
                <div className="text-sm text-muted-foreground">Total de Cards</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.cardsStudied}</div>
                <div className="text-sm text-muted-foreground">Estudados</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(stats.correctRate * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Taxa de Acerto</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.streak}</div>
                <div className="text-sm text-muted-foreground">Sequência</div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Criar Novo Flashcard</h3>
            <CreateFlashcardForm onSubmit={createFlashcard} />
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {stats && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Estatísticas Gerais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Progresso</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cards Estudados</span>
                        <span>{stats.cardsStudied}/{stats.totalCards}</span>
                      </div>
                      <Progress value={(stats.cardsStudied / stats.totalCards) * 100} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taxa de Acerto</span>
                        <span>{Math.round(stats.correctRate * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tempo Médio</span>
                        <span>{Math.round(stats.averageResponseTime)}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Por Matéria</h3>
                <div className="space-y-4">
                  {Array.from(stats.subjectStats.entries()).map(([subject, subjectStats]) => (
                    <div key={subject} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {subjectStats.studied}/{subjectStats.totalCards} cards
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{Math.round(subjectStats.correctRate * 100)}%</div>
                        <div className="text-sm text-muted-foreground">acerto</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Biblioteca de Cards</h3>
            <div className="space-y-4">
              {Array.from(flashcardService['flashcards'].values()).map(card => (
                <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{card.front}</div>
                    <div className="text-sm text-muted-foreground mt-1">{card.back}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{card.subject}</Badge>
                      <Badge className={getDifficultyColor(card.difficulty)}>
                        {card.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {card.reviewCount} revisões
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente para criar flashcard
const CreateFlashcardForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    subject: '',
    topic: '',
    difficulty: 'medium',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      front: '',
      back: '',
      subject: '',
      topic: '',
      difficulty: 'medium',
      tags: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Pergunta</label>
        <Textarea
          value={formData.front}
          onChange={(e) => setFormData({ ...formData, front: e.target.value })}
          placeholder="Digite a pergunta..."
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Resposta</label>
        <Textarea
          value={formData.back}
          onChange={(e) => setFormData({ ...formData, back: e.target.value })}
          placeholder="Digite a resposta..."
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Matéria</label>
          <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a matéria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Matemática">Matemática</SelectItem>
              <SelectItem value="Física">Física</SelectItem>
              <SelectItem value="Química">Química</SelectItem>
              <SelectItem value="Biologia">Biologia</SelectItem>
              <SelectItem value="História">História</SelectItem>
              <SelectItem value="Geografia">Geografia</SelectItem>
              <SelectItem value="Português">Português</SelectItem>
              <SelectItem value="Literatura">Literatura</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Tópico</label>
          <Input
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="Ex: Geometria, Álgebra..."
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Dificuldade</label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Fácil</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="hard">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Tags</label>
          <Input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Ex: geometria, área, círculo"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Criar Flashcard
      </Button>
    </form>
  );
};

export default FlashcardStudy;
