"use client";
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
      height: '100%',
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
    <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
      {/* Player Principal */}
      <div className="lg:col-span-2">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl w-full">
            <CardContent className="p-0">
                <div ref={containerRef} className="w-full aspect-video rounded-t-xl overflow-hidden bg-black" />
            </CardContent>
        </Card>
      </div>

      {/* Lista da Playlist */}
      <div className="lg:col-span-1">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg h-full">
          <CardHeader className="pb-4">
            <h4 className="text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <List className="h-4 w-4 text-primary" />
              </div>
              Playlist do Aulão
            </h4>
          </CardHeader>
          <CardContent className="max-h-[60vh] lg:max-h-full overflow-y-auto">
            <div className="space-y-3">
              {playlist.map((video, index) => (
                <div
                  key={video.id}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
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
                  
                  <div className="flex-1 min-w-0 space-y-1">
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
      </div>
    </div>
  );
};

export default YouTubePlaylistPlayer;
