"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Video,
  Play
} from "lucide-react";
import Header from "@/components/Header";
import YouTubePlaylistPlayer from "@/components/YouTubePlaylistPlayer";
import { useAulaProgress } from "@/hooks/useAulaProgress";

// Dados do módulo único
const aulaoData = {
  id: 'aulao-enem',
  title: 'Aulão ENEM',
  description: 'Playlist completa com todas as matérias do ENEM em formato de aulão',
  progress: 0,
  cor: '#6366F1',
  playlistId: 'PLQVUQftDIJQFonlbsVZP0_uIFIaHw0VXO', // ID da playlist do YouTube
  videoUrl: 'https://www.youtube.com/watch?v=fo7JbUG5flY&list=PLQVUQftDIJQFonlbsVZP0_uIFIaHw0VXO',
  duration: 7200, // 2 horas em segundos
    subMaterias: [
      { 
      nome: 'Aulão ENEM Completo', 
      progress: 0, 
        links: [
        { 
          nome: 'Playlist Aulão ENEM - Todas as Matérias', 
          url: 'https://www.youtube.com/watch?v=fo7JbUG5flY&list=PLQVUQftDIJQFonlbsVZP0_uIFIaHw0VXO', 
          tipo: 'playlist' 
        }
      ] 
    }
  ]
};

function AulasContent() {
  const searchParams = useSearchParams();
  const [selectedMateria, setSelectedMateria] = useState<string | null>(searchParams.get('materia'));

  const { 
    progress, 
    updateVideoProgress, 
    getVideoProgress, 
    getAllVideosProgress,
    setCurrentVideoIndex
  } = useAulaProgress();

  // Dados da matéria selecionada
  const selectedMateriaData = selectedMateria ? aulaoData : null;

  const handleMateriaClick = (materiaId: string) => {
    setSelectedMateria(materiaId);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('materia', materiaId);
    window.history.pushState(null, '', `?${newSearchParams.toString()}`);
  };

  const handleVideoProgress = (videoId: string, videoProgress: number) => {
    // Converter duração estimada para segundos (exemplo: 45:30 -> 2730 segundos)
    const durationInSeconds = 45 * 60; // 45 minutos por vídeo
    updateVideoProgress(videoId, videoProgress, durationInSeconds);
  };

  const handleVideoChange = (videoId: string) => {
    // Atualizar índice do vídeo atual quando mudar
    const videos = getAllVideosProgress();
    const videoIndex = videos.findIndex(v => v.videoId === videoId);
    if (videoIndex !== -1) {
      setCurrentVideoIndex(videoIndex);
    }
  };

  const allVideosProgress = getAllVideosProgress();
  const initialProgress = allVideosProgress.reduce((acc, video) => {
    acc[video.videoId] = video.progress;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
          </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                Aulão Completo
              </div>
              
              <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                Aulão ENEM
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Prepare-se para o ENEM com nossa playlist completa de todas as matérias
              </p>
            </div>
        </div>

        {!selectedMateria ? (
          <>
            {/* Card Principal do Aulão ENEM */}
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
                <Card 
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-700 transform hover:scale-[1.01] border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                  onClick={() => handleMateriaClick(aulaoData.id)}
                >
                  <CardHeader className="relative overflow-hidden p-0">
                    <div className="h-80 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                      {/* Overlay sutil */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      {/* Elementos decorativos minimalistas */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Grid pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="h-full w-full" style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                            backgroundSize: '20px 20px'
                          }}></div>
                        </div>
                        
                        {/* Ícone principal */}
                        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-24 h-24 text-white/20">
                          <Play className="w-full h-full drop-shadow-2xl" />
                        </div>
                        
                        {/* Texto principal */}
                        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 text-white/10 text-6xl font-black">
                          ENEM
                        </div>

                        {/* Frases de motivação flutuantes - bem distribuídas */}
                        <div className="absolute top-6 left-6 text-white/40 text-sm font-semibold animate-float-slow">
                          Você é incrível!
                        </div>
                        <div className="absolute top-6 right-6 text-white/35 text-xs font-medium animate-float-medium">
                          Você consegue!
                        </div>
                        
                        <div className="absolute top-20 left-8 text-white/30 text-sm font-semibold animate-float-fast">
                          Foco e determinação!
                        </div>
                        <div className="absolute top-20 right-12 text-white/40 text-xs font-medium animate-float-slow">
                          Seu futuro começa aqui!
                        </div>
                        
                        <div className="absolute top-40 left-4 text-white/35 text-sm font-semibold animate-float-medium">
                          Acredite em você!
                        </div>
                        <div className="absolute top-40 right-8 text-white/30 text-xs font-medium animate-float-fast">
                          Conhecimento é poder!
                        </div>
                        
                        <div className="absolute top-60 left-12 text-white/40 text-sm font-semibold animate-float-slow">
                          Você vai arrasar!
                        </div>
                        <div className="absolute top-60 right-16 text-white/35 text-xs font-medium animate-float-medium">
                          Persistência é a chave!
                        </div>
                        
                        <div className="absolute top-80 left-6 text-white/30 text-xs font-medium animate-float-fast">
                          Sua dedicação vale ouro!
                        </div>
                        <div className="absolute top-80 right-10 text-white/40 text-sm font-semibold animate-float-slow">
                          Sonhos se realizam!
                        </div>
                        
                        <div className="absolute top-100 left-16 text-white/35 text-xs font-medium animate-float-medium">
                          Você tem potencial!
                        </div>
                        <div className="absolute top-100 right-4 text-white/30 text-xs font-medium animate-float-fast">
                          Cada esforço conta!
                        </div>
                        
                        <div className="absolute top-120 left-2 text-white/40 text-sm font-semibold animate-float-slow">
                          Continue assim!
                        </div>
                        <div className="absolute top-120 right-20 text-white/35 text-xs font-medium animate-float-medium">
                          Você está no caminho certo!
                        </div>
                        
                        <div className="absolute top-140 left-20 text-white/30 text-xs font-medium animate-float-fast">
                          Não desista!
                        </div>
                        <div className="absolute top-140 right-6 text-white/40 text-sm font-semibold animate-float-slow">
                          Sua jornada importa!
                        </div>
                        
                        <div className="absolute top-160 left-8 text-white/35 text-xs font-medium animate-float-medium">
                          Você é capaz!
                        </div>
                        <div className="absolute top-160 right-14 text-white/30 text-xs font-medium animate-float-fast">
                          Mantenha o foco!
                        </div>
                        
                        <div className="absolute top-180 left-4 text-white/40 text-sm font-semibold animate-float-slow">
                          Sucesso está chegando!
                        </div>
                        <div className="absolute top-180 right-8 text-white/35 text-xs font-medium animate-float-medium">
                          Você é especial!
                        </div>
                      </div>
                      
                      <div className="absolute bottom-8 left-8 right-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-300 text-sm font-medium">Disponível</span>
                          </div>
                          
                          <h3 className="text-5xl font-black text-white mb-2">{aulaoData.title}</h3>
                          <p className="text-white/90 text-xl font-medium max-w-2xl">{aulaoData.description}</p>
                          
                          <div className="flex items-center gap-3 text-white/80">
                            <BookOpen className="h-5 w-5" />
                            <span className="font-medium">18 vídeos • Playlist completa</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-12">
                    <div className="text-center space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-3xl font-bold text-slate-900 dark:text-white">
                          Prepare-se para o ENEM
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-3xl mx-auto">
                          Acesse nossa playlist completa com todas as matérias do ENEM. 
                          Ideal para revisão geral e preparação final para o exame.
                        </p>
                      </div>
                      

                      <div className="pt-4">
                        <Button
                          size="lg" 
                          className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-lg px-12 py-6 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                        >
                          <Play className="h-6 w-6 mr-3" />
                          Iniciar Aulão
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">

            {/* Player de Vídeo Principal - Tela Cheia */}
            <div className="mb-12">
              <Card className="overflow-hidden shadow-2xl border-0">
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Player Container */}
                           <div className="aspect-[16/9] bg-slate-900 relative" style={{ height: '85vh', minHeight: '700px' }}>
                      {selectedMateriaData && (
                        <YouTubePlaylistPlayer
                          playlistId={selectedMateriaData.playlistId}
                          onProgressUpdate={handleVideoProgress}
                          onVideoChange={handleVideoChange}
                          initialProgress={initialProgress}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


          </div>
        )}
        </div>
      </main>
    </div>
  );
}

const Aulas = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AulasContent />
    </Suspense>
  );
};

export default Aulas;
