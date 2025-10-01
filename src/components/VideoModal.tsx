import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Clock, 
  Users, 
  Star,
  Download,
  Share2
} from "lucide-react";
import { useState } from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    titulo: string;
    materia: string;
    professor: string;
    duracao: number;
    descricao: string;
    nivel: 'Básico' | 'Intermediário' | 'Avançado';
    visualizacoes: number;
    avaliacao: number;
    videoUrl: string;
    assistida: boolean;
    progresso: number;
    dataPublicacao: string;
    tags: string[];
  } | null;
}

const VideoModal = ({ isOpen, onClose, video }: VideoModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  if (!video) return null;

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    setVolume(isMuted ? 100 : 0);
  };

  const getVideoEmbedUrl = (url: string) => {
    // Converte URL do YouTube para embed
    const videoId = url.includes('youtube.com/watch?v=') 
      ? url.split('v=')[1]?.split('&')[0]
      : url.includes('youtu.be/')
      ? url.split('youtu.be/')[1]?.split('?')[0]
      : url;
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=1&disablekb=1&iv_load_policy=3&cc_load_policy=0&controls=1&showinfo=0`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{video.titulo}</DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{video.professor}</span>
                <span>•</span>
                <span>{video.materia}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {video.duracao} min
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col p-6 pt-0">
          {/* Player de Vídeo */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-6">
            <div className="aspect-video">
              <iframe
                src={getVideoEmbedUrl(video.videoUrl)}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen"
                frameBorder="0"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                loading="lazy"
              />
            </div>
            
            {/* Controles do Player */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  onClick={handleTogglePlay}
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${video.progresso}%` }}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleToggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-20"
                  />
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da Aula */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground">{video.descricao}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Estatísticas</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{video.visualizacoes.toLocaleString()} visualizações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span>{video.avaliacao} de 5.0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{video.duracao} minutos</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Progresso</h3>
                <div className="space-y-2">
                  <Progress value={video.progresso} className="h-2" />
                  <p className="text-sm text-muted-foreground">{video.progresso}% concluído</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;

