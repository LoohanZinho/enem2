import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause } from 'lucide-react';

interface YouTubeVideoProps {
  videoId: string;
  playlistId?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  showControls?: boolean;
  className?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubeVideo = ({ 
  videoId, 
  playlistId,
  title = "Vídeo do YouTube",
  width = "100%",
  height = "400px",
  autoplay = false,
  showControls = true,
  className = ""
}: YouTubeVideoProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);

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
  }, [videoId, playlistId]);

  const initializePlayer = () => {
    if (playerRef.current) return;

    const playerVars: any = {
      controls: 0, // Remove controles nativos do YouTube
      modestbranding: 1, // Remove logo do YouTube
      rel: 0, // Remove vídeos relacionados
      showinfo: 0, // Remove informações do vídeo
      iv_load_policy: 3, // Remove anotações
      fs: 0, // Remove botão de tela cheia nativo
      cc_load_policy: 0, // Remove legendas automáticas
      playsinline: 1,
      autoplay: autoplay ? 1 : 0,
      mute: 0,
      loop: 0,
      enablejsapi: 1,
      origin: window.location.origin,
      disablekb: 1, // Desabilita controles do teclado
      start: 0,
      end: 0,
      wmode: 'transparent', // Remove bordas
      allowfullscreen: false, // Remove tela cheia nativa
      frameborder: 0 // Remove bordas do iframe
    };

    // Configurar para playlist se playlistId for fornecido
    if (playlistId) {
      playerVars.listType = 'playlist';
      playerVars.list = playlistId;
      playerVars.index = 0; // Começar do primeiro vídeo da playlist
    } else {
      playerVars.videoId = videoId;
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: height,
      width: width,
      playerVars: playerVars,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  };

  const onPlayerReady = (event: any) => {
    setIsLoading(false);
  };

  const onPlayerStateChange = (event: any) => {
    const state = event.data;
    
    if (state === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (state === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (state === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
    }
  };

  const onPlayerError = (event: any) => {
    console.error('Erro no player do YouTube:', event.data);
    setIsLoading(false);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      if (!videoStarted) {
        setVideoStarted(true);
      }
      playerRef.current.playVideo();
    }
  };

  return (
    <Card className={`overflow-hidden border-0 shadow-2xl ${className}`}>
      <CardContent className="p-0">
        <div 
          className="relative bg-black rounded-lg overflow-hidden"
          onMouseEnter={() => setShowOverlay(true)}
          onMouseLeave={() => setShowOverlay(false)}
        >
          
          <div ref={containerRef} className="w-full" />
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Carregando vídeo...</p>
              </div>
            </div>
          )}

          {/* Controles simplificados - apenas Play/Pause */}
          {showControls && showOverlay && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={togglePlay}
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white rounded-full w-20 h-20 shadow-2xl opacity-90 hover:opacity-100 transition-opacity"
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubeVideo;