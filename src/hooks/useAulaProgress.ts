"use client";
import { useState, useEffect } from 'react';

interface VideoProgress {
  videoId: string;
  title: string;
  progress: number;
  lastWatchedTime: number;
  completed: boolean;
  totalTime: number;
  duration: string;
}

interface AulaProgress {
  totalProgress: number;
  completedVideos: number;
  totalVideos: number;
  totalTimeWatched: number;
  totalTimeAvailable: number;
  lastWatchedVideo: string;
  streak: number;
  videos: VideoProgress[];
  currentVideoIndex: number;
}

const STORAGE_KEY = 'aula-progress';

export const useAulaProgress = () => {
  const [progress, setProgress] = useState<AulaProgress>({
    totalProgress: 0,
    completedVideos: 0,
    totalVideos: 5, // Aulão ENEM tem 5 vídeos na playlist
    totalTimeWatched: 0,
    totalTimeAvailable: 0,
    lastWatchedVideo: '',
    streak: 0,
    videos: [],
    currentVideoIndex: 0
  });

  // Carregar progresso do localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress && savedProgress !== 'undefined' && savedProgress !== 'null') {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
      } catch (error) {
        console.error('Erro ao carregar progresso:', error);
      }
    }
  }, []);

  // Salvar progresso no localStorage
  const saveProgress = (newProgress: AulaProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  // Atualizar progresso de um vídeo específico
  const updateVideoProgress = (videoId: string, videoProgress: number, totalTime: number, title?: string, duration?: string) => {
    const newProgress = { ...progress };
    
    // Encontrar ou criar entrada do vídeo
    let videoIndex = newProgress.videos.findIndex(v => v.videoId === videoId);
    
    if (videoIndex === -1) {
      newProgress.videos.push({
        videoId,
        title: title || `Vídeo ${videoId}`,
        progress: videoProgress,
        lastWatchedTime: Date.now(),
        completed: videoProgress >= 95, // Considera completo com 95% ou mais
        totalTime,
        duration: duration || '0:00'
      });
      videoIndex = newProgress.videos.length - 1;
    } else {
      newProgress.videos[videoIndex] = {
        ...newProgress.videos[videoIndex],
        title: title || newProgress.videos[videoIndex].title,
        progress: videoProgress,
        lastWatchedTime: Date.now(),
        completed: videoProgress >= 95,
        totalTime,
        duration: duration || newProgress.videos[videoIndex].duration
      };
    }

    // Calcular estatísticas gerais
    const completedVideos = newProgress.videos.filter(v => v.completed).length;
    const totalTimeWatched = newProgress.videos.reduce((acc, v) => 
      acc + (v.totalTime * v.progress / 100), 0
    );
    const totalTimeAvailable = newProgress.videos.reduce((acc, v) => acc + v.totalTime, 0);
    const totalProgress = newProgress.videos.length > 0 
      ? newProgress.videos.reduce((acc, v) => acc + v.progress, 0) / newProgress.videos.length
      : 0;

    // Encontrar último vídeo assistido
    const lastWatched = newProgress.videos
      .sort((a, b) => b.lastWatchedTime - a.lastWatchedTime)[0];

    // Calcular streak (dias consecutivos)
    const today = new Date().toDateString();
    const lastWatchDate = lastWatched ? new Date(lastWatched.lastWatchedTime).toDateString() : null;
    const streak = lastWatchDate === today ? (progress.streak + 1) : 0;

    newProgress.totalProgress = totalProgress;
    newProgress.completedVideos = completedVideos;
    newProgress.totalTimeWatched = totalTimeWatched;
    newProgress.totalTimeAvailable = totalTimeAvailable;
    newProgress.lastWatchedVideo = lastWatched ? `${lastWatched.title} - ${Math.round(lastWatched.progress)}%` : '';
    newProgress.streak = streak;

    saveProgress(newProgress);
  };

  // Obter progresso de um vídeo específico
  const getVideoProgress = (videoId: string): VideoProgress | null => {
    return progress.videos.find(v => v.videoId === videoId) || null;
  };

  // Resetar progresso
  const resetProgress = () => {
    const resetData: AulaProgress = {
      totalProgress: 0,
      completedVideos: 0,
      totalVideos: 1,
      totalTimeWatched: 0,
      totalTimeAvailable: 0,
      lastWatchedVideo: '',
      streak: 0,
      videos: [],
      currentVideoIndex: 0,
    };
    saveProgress(resetData);
  };

  // Marcar vídeo como completo
  const markVideoComplete = (videoId: string) => {
    const video = progress.videos.find(v => v.videoId === videoId);
    if (video) {
      updateVideoProgress(videoId, 100, video.totalTime, video.title, video.duration);
    }
  };

  // Atualizar índice do vídeo atual
  const setCurrentVideoIndex = (index: number) => {
    const newProgress = { ...progress, currentVideoIndex: index };
    saveProgress(newProgress);
  };

  // Obter progresso de todos os vídeos
  const getAllVideosProgress = () => {
    return progress.videos;
  };

  // Obter progresso da playlist como um todo
  const getPlaylistProgress = () => {
    const totalVideos = progress.totalVideos;
    const completedVideos = progress.completedVideos;
    const overallProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    
    return {
      overallProgress,
      completedVideos,
      totalVideos,
      remainingVideos: totalVideos - completedVideos
    };
  };

  return {
    progress,
    updateVideoProgress,
    getVideoProgress,
    resetProgress,
    markVideoComplete,
    setCurrentVideoIndex,
    getAllVideosProgress,
    getPlaylistProgress
  };
};
