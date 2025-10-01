import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipBack,
  SkipForward,
  Volume2, 
  VolumeX, 
  Maximize,
  List,
  Clock,
  CheckCircle,
  PlayCircle,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import YouTubePlaylistService, { YouTubeVideo } from '@/services/YouTubePlaylistService';

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  progress: number;
  completed: boolean;
  description?: string;
  publishedAt?: string;
  channelTitle?: string;
}

interface YouTubePlaylistPlayerProps {
  playlistId: string;
  onProgressUpdate: (videoId: string, progress: number) => void;
  onVideoChange: (videoId: string) => void;
  initialProgress?: { [key: string]: number };
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubePlaylistPlayer = ({ 
  playlistId, 
  onProgressUpdate, 
  onVideoChange,
  initialProgress = {} 
}: YouTubePlaylistPlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playlist, setPlaylist] = useState<VideoItem[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  // Carregar API do YouTube
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }
  }, []);

  // Listener para detectar saída do modo tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const initializePlayer = () => {
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: isFullscreen ? '100vh' : '85vh',
      width: '100%',
      playerVars: {
        listType: 'playlist',
        list: playlistId,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        fs: 1,
        cc_load_policy: 0,
        playsinline: 1,
        hd: 1,
        vq: 'hd1080',
        quality: 'hd1080',
        autoplay: 0,
        mute: 0,
        loop: 0,
        start: 0,
        end: 0,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  };

  const onPlayerReady = (event: any) => {
    setIsLoading(false);
    const player = event.target;
    setDuration(player.getDuration());
    setCurrentVideoId(player.getVideoData().video_id);
    
    // Forçar a melhor qualidade disponível
    try {
      const qualities = player.getAvailableQualityLevels();
      setAvailableQualities(qualities);
      console.log('Qualidades disponíveis:', qualities);
      
      // Tentar definir para 1080p, depois 720p, depois 480p
      if (qualities.includes('hd1080')) {
        player.setPlaybackQuality('hd1080');
        setCurrentQuality('hd1080');
      } else if (qualities.includes('hd720')) {
        player.setPlaybackQuality('hd720');
        setCurrentQuality('hd720');
      } else if (qualities.includes('large')) {
        player.setPlaybackQuality('large');
        setCurrentQuality('large');
      } else if (qualities.includes('medium')) {
        player.setPlaybackQuality('medium');
        setCurrentQuality('medium');
      }
      
      console.log('Qualidade definida para:', player.getPlaybackQuality());
    } catch (error) {
      console.log('Não foi possível definir qualidade automaticamente:', error);
    }
    
    loadPlaylistInfo();
  };

  const onPlayerStateChange = (event: any) => {
    const player = event.target;
    const state = event.data;
    
    if (state === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startProgressTracking();
    } else if (state === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (state === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      handleVideoComplete();
    }
  };

  const onPlayerError = (event: any) => {
    console.error('Erro no player do YouTube:', event.data);
    setIsLoading(false);
  };

  const startProgressTracking = () => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        
        setCurrentTime(current);
        
        if (total > 0) {
          const progress = (current / total) * 100;
          setProgressBarWidth(progress);
          onProgressUpdate(currentVideoId, progress);
        }
      } else {
        clearInterval(interval);
      }
    }, 100); // Atualizar a cada 100ms para tempo real
  };

  const loadPlaylistInfo = async () => {
    try {
      // Buscar dados reais da playlist do YouTube
      const youtubeVideos = await YouTubePlaylistService.getPlaylistVideos(playlistId);
      
      // Converter para formato VideoItem
      const playlistData: VideoItem[] = youtubeVideos.map((video: YouTubeVideo) => ({
        id: video.id,
        title: video.title,
        duration: video.duration,
        thumbnail: video.thumbnail,
        progress: initialProgress[video.id] || 0,
        completed: (initialProgress[video.id] || 0) >= 95,
        description: video.description,
        publishedAt: video.publishedAt,
        channelTitle: video.channelTitle
      }));
      
      setPlaylist(playlistData);
    } catch (error) {
      console.error('Erro ao carregar playlist:', error);
      // Fallback para dados mockados em caso de erro
      const fallbackPlaylist: VideoItem[] = [
        {
          id: 'fo7JbUG5flY',
          title: 'AULÃO DE BIOLOGIA PARA O ENEM: 10 temas que mais caem',
          duration: '45:30',
          thumbnail: 'https://img.youtube.com/vi/fo7JbUG5flY/maxresdefault.jpg',
          progress: initialProgress['fo7JbUG5flY'] || 0,
          completed: (initialProgress['fo7JbUG5flY'] || 0) >= 95
        }
      ];
      setPlaylist(fallbackPlaylist);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const nextVideo = () => {
    if (playerRef.current && currentVideoIndex < playlist.length - 1) {
      playerRef.current.nextVideo();
      setCurrentVideoIndex(prev => prev + 1);
    }
  };

  const previousVideo = () => {
    if (playerRef.current && currentVideoIndex > 0) {
      playerRef.current.previousVideo();
      setCurrentVideoIndex(prev => prev - 1);
    }
  };

  const seekForward = (seconds: number = 10) => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime + seconds);
    }
  };

  const seekBackward = (seconds: number = 10) => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(0, currentTime - seconds));
    }
  };

  const selectVideo = (index: number) => {
    if (playerRef.current) {
      playerRef.current.playVideoAt(index);
      setCurrentVideoIndex(index);
    }
  };

  const handleVideoComplete = () => {
    const currentVideo = playlist[currentVideoIndex];
    if (currentVideo) {
      onProgressUpdate(currentVideo.id, 100);
      onVideoChange(currentVideo.id);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    if (!duration || !currentTime) return '0:00';
    const remaining = duration - currentTime;
    return formatTime(remaining);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate);
      setPlaybackRate(rate);
    }
  };

  const changeQuality = (quality: string) => {
    if (playerRef.current) {
      try {
        playerRef.current.setPlaybackQuality(quality);
        setCurrentQuality(quality);
        console.log('Qualidade alterada para:', quality);
      } catch (error) {
        console.error('Erro ao alterar qualidade:', error);
      }
    }
  };

  const getQualityLabel = (quality: string) => {
    const labels: { [key: string]: string } = {
      'hd1080': '1080p',
      'hd720': '720p',
      'large': '480p',
      'medium': '360p',
      'small': '240p',
      'tiny': '144p',
      'auto': 'Auto'
    };
    return labels[quality] || quality;
  };

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);
    setProgressBarWidth(percentage * 100);
  };

  const handleProgressBarMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !duration) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    
    setCurrentTime(newTime);
    setProgressBarWidth(percentage * 100);
  };

  const handleProgressBarMouseDown = () => {
    setIsDragging(true);
  };

  const handleProgressBarMouseUp = () => {
    if (isDragging && playerRef.current) {
      const newTime = (progressBarWidth / 100) * duration;
      playerRef.current.seekTo(newTime);
      setCurrentTime(newTime);
    }
    setIsDragging(false);
  };

  const currentVideo = playlist[currentVideoIndex];

  return (
    <div className="space-y-6">
      {/* Player Principal */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="p-0">
          <div className="relative bg-black rounded-t-xl overflow-hidden">
                  <div ref={containerRef} className={`w-full ${isFullscreen ? 'h-[100vh]' : 'h-[85vh] min-h-[700px]'}`} />
            
            {isLoading && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Carregando playlist...</p>
                </div>
              </div>
            )}

            {/* Barra de Progresso */}
            {!isLoading && (
              <div className="absolute bottom-16 left-4 right-4">
                <div className="relative">
                  <div 
                    className="w-full h-1 bg-white/30 rounded-full cursor-pointer hover:h-2 transition-all duration-200 group"
                    onClick={handleProgressBarClick}
                    onMouseMove={handleProgressBarMouseMove}
                    onMouseDown={handleProgressBarMouseDown}
                    onMouseUp={handleProgressBarMouseUp}
                    onMouseLeave={handleProgressBarMouseUp}
                  >
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all duration-100 relative"
                      style={{ width: `${progressBarWidth}%` }}
                    >
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                  
                  {/* Indicador de tempo na barra */}
                  <div className="absolute -top-8 left-0 transform -translate-x-1/2 pointer-events-none">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {formatTime(currentTime)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Controles Overlay */}
            {!isLoading && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={previousVideo}
                      disabled={currentVideoIndex === 0}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={() => seekBackward(10)}
                      title="Voltar 10 segundos"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 bg-white/20"
                      onClick={togglePlay}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={() => seekForward(10)}
                      title="Adiantar 10 segundos"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={nextVideo}
                      disabled={currentVideoIndex === playlist.length - 1}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-sm">
                      <span className="font-mono text-white/90">
                        {formatTime(currentTime)}
                      </span>
                      <span className="text-white/60">/</span>
                      <span className="font-mono text-white/70">
                        {currentVideo?.duration || '0:00'}
                      </span>
                    </div>
                    <div className="text-xs text-white/60">
                      -{getRemainingTime()}
                    </div>
                    <div className="text-xs text-white/60">
                      {Math.round(progressBarWidth)}%
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => seekBackward(30)}
                        title="Voltar 30 segundos"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span className="text-xs ml-1">30s</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => seekForward(30)}
                        title="Adiantar 30 segundos"
                      >
                        <RotateCw className="h-3 w-3" />
                        <span className="text-xs ml-1">30s</span>
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-white/80">Velocidade:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-white hover:bg-white/20 ${playbackRate === 0.5 ? 'bg-white/30' : ''}`}
                        onClick={() => changePlaybackRate(0.5)}
                        title="0.5x"
                      >
                        0.5x
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-white hover:bg-white/20 ${playbackRate === 1 ? 'bg-white/30' : ''}`}
                        onClick={() => changePlaybackRate(1)}
                        title="1x"
                      >
                        1x
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-white hover:bg-white/20 ${playbackRate === 1.25 ? 'bg-white/30' : ''}`}
                        onClick={() => changePlaybackRate(1.25)}
                        title="1.25x"
                      >
                        1.25x
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-white hover:bg-white/20 ${playbackRate === 1.5 ? 'bg-white/30' : ''}`}
                        onClick={() => changePlaybackRate(1.5)}
                        title="1.5x"
                      >
                        1.5x
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-white hover:bg-white/20 ${playbackRate === 2 ? 'bg-white/30' : ''}`}
                        onClick={() => changePlaybackRate(2)}
                        title="2x"
                      >
                        2x
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-white/80">Qualidade:</span>
                      {availableQualities.length > 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-white hover:bg-white/20 ${currentQuality === 'auto' ? 'bg-white/30' : ''}`}
                            onClick={() => changeQuality('auto')}
                            title="Automática"
                          >
                            Auto
                          </Button>
                          {availableQualities.includes('hd1080') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`text-white hover:bg-white/20 ${currentQuality === 'hd1080' ? 'bg-white/30' : ''}`}
                              onClick={() => changeQuality('hd1080')}
                              title="1080p"
                            >
                              1080p
                            </Button>
                          )}
                          {availableQualities.includes('hd720') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`text-white hover:bg-white/20 ${currentQuality === 'hd720' ? 'bg-white/30' : ''}`}
                              onClick={() => changeQuality('hd720')}
                              title="720p"
                            >
                              720p
                            </Button>
                          )}
                          {availableQualities.includes('large') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`text-white hover:bg-white/20 ${currentQuality === 'large' ? 'bg-white/30' : ''}`}
                              onClick={() => changeQuality('large')}
                              title="480p"
                            >
                              480p
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={() => setShowPlaylist(!showPlaylist)}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={toggleFullscreen}
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {currentVideo?.title || 'Carregando...'}
              </h3>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {currentVideoIndex + 1} de {playlist.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista da Playlist */}
      {showPlaylist && (
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <h4 className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <List className="h-4 w-4 text-primary" />
              </div>
              Playlist do Aulão ENEM
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playlist.map((video, index) => (
                <div
                  key={video.id}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    index === currentVideoIndex 
                      ? 'bg-primary/10 border-2 border-primary/20 shadow-md' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                  }`}
                  onClick={() => selectVideo(index)}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-20 h-14 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                      {video.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <PlayCircle className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <h5 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2">
                      {video.title}
                    </h5>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{video.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YouTubePlaylistPlayer;
