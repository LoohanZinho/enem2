import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Star, 
  User, 
  Calendar, 
  FileText, 
  Eye, 
  BookOpen,
  Target,
  Clock,
  Award,
  TrendingUp,
  Share2,
  Heart,
  Bookmark,
  ExternalLink
} from 'lucide-react';

interface ResumoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  resumo: {
    id: string;
    title: string;
    description: string;
    topic: string;
    materia: string;
    difficulty: string;
    pages: number;
    rating: number;
    downloads: number;
    tags: string[];
    author: string;
    lastUpdated: string;
    module?: string;
    subModule?: string;
  } | null;
}

const ResumoViewer: React.FC<ResumoViewerProps> = ({ isOpen, onClose, resumo }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!resumo) return null;

  const handleDownload = () => {
    // Simular download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${resumo.title}.pdf`;
    link.click();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resumo.title,
        text: resumo.description,
        url: window.location.href,
      });
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleOpenInNewTab = () => {
    window.open('#', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {resumo.title}
          </DialogTitle>
          <p className="text-slate-600 dark:text-slate-400">
            {resumo.description}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{resumo.difficulty}</Badge>
            <Badge variant="outline">{resumo.materia}</Badge>
            {resumo.module && <Badge variant="outline">{resumo.module}</Badge>}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Páginas:</span> {resumo.pages}
            </div>
            <div>
              <span className="font-semibold">Avaliação:</span> {resumo.rating}/5
            </div>
            <div>
              <span className="font-semibold">Downloads:</span> {resumo.downloads.toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Autor:</span> {resumo.author}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Tags:</h4>
            <div className="flex flex-wrap gap-1">
              {resumo.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumoViewer;
