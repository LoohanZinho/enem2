import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Crown, 
  Award,
  TrendingUp,
  Users,
  Clock,
  BookOpen,
  FileText,
  BarChart3
} from 'lucide-react';
import GamificationService, { Badge as BadgeType, Level } from '@/services/GamificationService';

interface GamificationPanelProps {
  className?: string;
}

const GamificationPanel: React.FC<GamificationPanelProps> = ({ className }) => {
  const [userStats, setUserStats] = useState<any>(null);
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [nextLevelProgress, setNextLevelProgress] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const gamificationService = GamificationService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stats = gamificationService.getUserStats();
    const badges = gamificationService.getAllBadges();
    const level = gamificationService.getCurrentLevelInfo();
    const progress = gamificationService.getNextLevelProgress();
    const board = gamificationService.getLeaderboard();

    setUserStats(stats);
    setAllBadges(badges);
    setCurrentLevel(level);
    setNextLevelProgress(progress);
    setLeaderboard(board);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'study': return <BookOpen className="h-4 w-4" />;
      case 'achievement': return <Award className="h-4 w-4" />;
      case 'streak': return <Zap className="h-4 w-4" />;
      case 'simulado': return <BarChart3 className="h-4 w-4" />;
      case 'redacao': return <FileText className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  if (!userStats || !currentLevel) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={className}>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Nível Atual */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{currentLevel.icon}</div>
                <div>
                  <h3 className="text-xl font-bold">{currentLevel.name}</h3>
                  <p className="text-sm text-muted-foreground">Nível {currentLevel.level}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{userStats.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Pontos Totais</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para o próximo nível</span>
                <span>{nextLevelProgress.current}/{nextLevelProgress.required} pontos</span>
              </div>
              <Progress value={nextLevelProgress.percentage} className="h-2" />
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Benefícios do Nível Atual:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {currentLevel.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.studyStreak}</div>
              <div className="text-sm text-muted-foreground">Sequência Atual</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.simuladosCompleted}</div>
              <div className="text-sm text-muted-foreground">Simulados</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{userStats.redacoesWritten}</div>
              <div className="text-sm text-muted-foreground">Redações</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{userStats.badges.length}</div>
              <div className="text-sm text-muted-foreground">Badges</div>
            </Card>
          </div>

          {/* Badges Recentes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Badges Recentes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userStats.badges.slice(0, 8).map((badge: BadgeType) => (
                <div key={badge.id} className="text-center p-3 rounded-lg border">
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <div className="text-sm font-medium">{badge.name}</div>
                  <Badge className={`text-xs mt-1 ${getRarityColor(badge.rarity)}`}>
                    {badge.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allBadges.map((badge) => {
              const isUnlocked = userStats.badges.find((b: BadgeType) => b.id === badge.id);
              return (
                <Card 
                  key={badge.id} 
                  className={`p-4 transition-all hover:shadow-md ${
                    isUnlocked ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{badge.name}</h4>
                        <Badge className={`text-xs ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(badge.category)}
                          <span className="text-xs text-muted-foreground capitalize">
                            {badge.category}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-primary">
                          +{badge.points} pts
                        </div>
                      </div>

                      {isUnlocked && (
                        <div className="mt-2 text-xs text-green-600">
                          Desbloqueado em {new Date(isUnlocked.unlockedAt!).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Conquistas Especiais</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                <div className="text-3xl">🏆</div>
                <div className="flex-1">
                  <h4 className="font-semibold">Primeiro Lugar</h4>
                  <p className="text-sm text-muted-foreground">Fique em primeiro lugar no ranking semanal</p>
                </div>
                <Badge variant="outline">Raro</Badge>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <div className="text-3xl">💎</div>
                <div className="flex-1">
                  <h4 className="font-semibold">Diamante</h4>
                  <p className="text-sm text-muted-foreground">Mantenha uma sequência de 30 dias</p>
                </div>
                <Badge variant="outline">Épico</Badge>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                <div className="text-3xl">⚡</div>
                <div className="flex-1">
                  <h4 className="font-semibold">Velocidade da Luz</h4>
                  <p className="text-sm text-muted-foreground">Complete um simulado em menos de 2 horas</p>
                </div>
                <Badge variant="outline">Lendário</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ranking Geral</h3>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' :
                    index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200' :
                    index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200' :
                    'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">Nível {user.level}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">{user.points.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">pontos</div>
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

export default GamificationPanel;
