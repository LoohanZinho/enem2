import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, 
  BookOpen, 
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";

interface SubMateria {
  nome: string;
  progress: number;
  links: {
    nome: string;
    url: string;
    tipo: 'video' | 'documento' | 'simulado' | 'resumo';
  }[];
}

interface SubjectOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  materiaTitle: string;
  subMaterias: SubMateria[];
  onSave: (materiaId: string, subMateriaNome: string, links: { nome: string; url: string; tipo: string }[]) => void;
}

const SubjectOverlay = ({ 
  isOpen, 
  onClose, 
  materiaTitle, 
  subMaterias, 
  onSave
}: SubjectOverlayProps) => {
  const [selectedSubMateria, setSelectedSubMateria] = useState<SubMateria | null>(null);

  if (!isOpen) return null;

  const handleSubMateriaClick = (subMateria: SubMateria) => {
    setSelectedSubMateria(subMateria);
  };

  const handleBackToSubMaterias = () => {
    setSelectedSubMateria(null);
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary text-white">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">{materiaTitle}</DialogTitle>
              <p className="text-muted-foreground mt-1">Escolha uma submateria para ver os links de aulas</p>
            </div>
          </div>
        </DialogHeader>

        {!selectedSubMateria ? (
          <div className="space-y-6">
            {/* Grid de submaterias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subMaterias.map((subMateria, index) => (
                <Card 
                  key={index}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleSubMateriaClick(subMateria)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{subMateria.nome}</h3>
                        <p className="text-sm text-muted-foreground">{subMateria.links.length} aulas disponíveis</p>
                      </div>
                    </div>
                    
                    {/* Progresso */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progresso</span>
                        <span className="text-sm font-bold text-primary">{subMateria.progress}%</span>
                      </div>
                      <Progress value={subMateria.progress} className="h-2" />
                    </div>
                    
                    {/* Botão de ação */}
                    <div className="flex justify-end">
                      <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-4 w-4 mr-2" />
                        Ver Aulas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cabeçalho da submateria */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToSubMaterias}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h2 className="text-xl font-bold">{selectedSubMateria.nome}</h2>
                <p className="text-muted-foreground">{selectedSubMateria.links.length} aulas disponíveis</p>
              </div>
            </div>

            {/* Links das aulas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSubMateria.links.map((link, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Play className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{link.nome}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            YouTube
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {link.tipo}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleLinkClick(link.url)}
                        className="ml-2"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Assistir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubjectOverlay;