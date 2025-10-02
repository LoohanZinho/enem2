"use client";
import React, { useState } from 'react';
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import SubjectModule from "@/components/SubjectModule";
import VideoModal from "@/components/VideoModal";

// Dados de exemplo (substituir por dados reais da API/serviços)
const materiaExemplo = {
  title: 'Matemática',
  description: 'Módulo completo de Matemática para o ENEM, abordando desde conceitos básicos até os mais avançados.',
  image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
  color: 'primary' as const,
  progress: 65,
  totalLessons: 15,
  completedLessons: 10
};

const modulosExemplo = [
  {
    id: '1',
    titulo: 'Álgebra Básica',
    descricao: 'Fundamentos de álgebra, equações e funções.',
    totalAulas: 5,
    aulasConcluidas: 4,
    progresso: 80,
    aulas: [
      { id: '1-1', titulo: 'Introdução à Álgebra', duracao: 45, assistida: true, progresso: 100, videoUrl: 'URL_VIDEO_1', nivel: 'Básico' as const, visualizacoes: 1200, avaliacao: 4.5, descricao: '...', tags: [] },
      { id: '1-2', titulo: 'Equações de 1º Grau', duracao: 60, assistida: true, progresso: 100, videoUrl: 'URL_VIDEO_2', nivel: 'Básico' as const, visualizacoes: 1100, avaliacao: 4.6, descricao: '...', tags: [] },
      { id: '1-3', titulo: 'Sistemas de Equações', duracao: 75, assistida: true, progresso: 100, videoUrl: 'URL_VIDEO_3', nivel: 'Intermediário' as const, visualizacoes: 950, avaliacao: 4.7, descricao: '...', tags: [] },
      { id: '1-4', titulo: 'Funções e Gráficos', duracao: 50, assistida: true, progresso: 100, videoUrl: 'URL_VIDEO_4', nivel: 'Intermediário' as const, visualizacoes: 1050, avaliacao: 4.8, descricao: '...', tags: [] },
      { id: '1-5', titulo: 'Inequações', duracao: 65, assistida: false, progresso: 20, videoUrl: 'URL_VIDEO_5', nivel: 'Avançado' as const, visualizacoes: 780, avaliacao: 4.4, descricao: '...', tags: [] }
    ]
  },
  {
    id: '2',
    titulo: 'Geometria Plana',
    descricao: 'Estudo das formas geométricas no plano.',
    totalAulas: 4,
    aulasConcluidas: 2,
    progresso: 50,
    aulas: [
      { id: '2-1', titulo: 'Ângulos e Triângulos', duracao: 55, assistida: true, progresso: 100, videoUrl: 'URL_VIDEO_6', nivel: 'Básico' as const, visualizacoes: 1300, avaliacao: 4.6, descricao: '...', tags: [] },
      { id: '2-2', titulo: 'Quadriláteros e Polígonos', duracao: 70, assistida: true, progresso: 100, videoUrl: 'URL_VIDEO_7', nivel: 'Intermediário' as const, visualizacoes: 1150, avaliacao: 4.7, descricao: '...', tags: [] },
      { id: '2-3', titulo: 'Círculo e Circunferência', duracao: 60, assistida: false, progresso: 0, videoUrl: 'URL_VIDEO_8', nivel: 'Intermediário' as const, visualizacoes: 980, avaliacao: 4.5, descricao: '...', tags: [] },
      { id: '2-4', titulo: 'Áreas de Figuras Planas', duracao: 80, assistida: false, progresso: 0, videoUrl: 'URL_VIDEO_9', nivel: 'Avançado' as const, visualizacoes: 850, avaliacao: 4.8, descricao: '...', tags: [] }
    ]
  }
];

const ConteudoEstudo = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const handleAulaClick = (aula: any) => {
    setSelectedVideo({
      ...aula,
      materia: materiaExemplo.title,
      professor: 'Prof. Exemplo',
      dataPublicacao: '01/01/2024'
    });
    setVideoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <BackButton />
        </div>

        <SubjectModule 
          materia={materiaExemplo} 
          modulos={modulosExemplo} 
          onAulaClick={handleAulaClick}
        />
      </main>

      <VideoModal 
        isOpen={videoModalOpen} 
        onClose={() => setVideoModalOpen(false)} 
        video={selectedVideo}
      />
    </div>
  );
};

export default ConteudoEstudo;
