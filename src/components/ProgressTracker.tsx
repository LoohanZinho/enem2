import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

interface ProgressData {
  totalProgress: number;
  completedVideos: number;
  totalVideos: number;
  totalTimeWatched: number;
  totalTimeAvailable: number;
  lastWatchedVideo: string;
  streak: number;
}

interface ProgressTrackerProps {
  progressData: ProgressData;
  onProgressUpdate: (videoId: string, progress: number) => void;
}

const ProgressTracker = ({ progressData, onProgressUpdate }: ProgressTrackerProps) => {
  const [localProgress, setLocalProgress] = useState(progressData);

  useEffect(() => {
    setLocalProgress(progressData);
  }, [progressData]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    if (progress >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBadgeVariant = (progress: number) => {
    if (progress >= 80) return 'default';
    if (progress >= 60) return 'secondary';
    if (progress >= 40) return 'outline';
    return 'destructive';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Progresso Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Progresso Geral
            </h3>
            <Badge variant={getProgressBadgeVariant(localProgress.totalProgress)}>
              {Math.round(localProgress.totalProgress)}% Concluído
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={localProgress.totalProgress} className="h-4" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {localProgress.completedVideos}
                </div>
                <div className="text-sm text-muted-foreground">Vídeos Concluídos</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {localProgress.totalVideos}
                </div>
                <div className="text-sm text-muted-foreground">Total de Vídeos</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatTime(localProgress.totalTimeWatched)}
                </div>
                <div className="text-sm text-muted-foreground">Tempo Assistido</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {localProgress.streak}
                </div>
                <div className="text-sm text-muted-foreground">Sequência (dias)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tempo de Estudo */}
        <Card>
          <CardHeader>
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Tempo de Estudo
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tempo Assistido:</span>
                <span className="font-medium">{formatTime(localProgress.totalTimeWatched)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tempo Total:</span>
                <span className="font-medium">{formatTime(localProgress.totalTimeAvailable)}</span>
              </div>
              <Progress 
                value={(localProgress.totalTimeWatched / localProgress.totalTimeAvailable) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card>
          <CardHeader>
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Conquistas
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {localProgress.completedVideos > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  {localProgress.completedVideos > 0 ? 'Primeiro vídeo assistido!' : 'Assista seu primeiro vídeo'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {localProgress.totalProgress >= 25 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  {localProgress.totalProgress >= 25 ? '25% concluído!' : 'Complete 25% do curso'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {localProgress.totalProgress >= 50 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  {localProgress.totalProgress >= 50 ? '50% concluído!' : 'Complete 50% do curso'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {localProgress.totalProgress >= 100 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  {localProgress.totalProgress >= 100 ? 'Curso completo!' : 'Complete 100% do curso'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Último Vídeo Assistido */}
      {localProgress.lastWatchedVideo && (
        <Card>
          <CardHeader>
            <h4 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              Último Vídeo Assistido
            </h4>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{localProgress.lastWatchedVideo}</p>
                <p className="text-sm text-muted-foreground">Continue de onde parou</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTracker;
