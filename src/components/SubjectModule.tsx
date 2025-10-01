import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  ChevronRight,
  CheckCircle,
  Circle
} from "lucide-react";

interface Aula {
  id: string;
  titulo: string;
  duracao: number;
  assistida: boolean;
  progresso: number;
  videoUrl: string;
  nivel: 'Básico' | 'Intermediário' | 'Avançado';
  visualizacoes: number;
  avaliacao: number;
  descricao: string;
  tags: string[];
}

interface Modulo {
  id: string;
  titulo: string;
  descricao: string;
  totalAulas: number;
  aulasConcluidas: number;
  progresso: number;
  aulas: Aula[];
}

interface SubjectModuleProps {
  materia: {
    title: string;
    description: string;
    image: string;
    color: "primary" | "success" | "accent" | "warning";
    progress: number;
    totalLessons: number;
    completedLessons: number;
  };
  modulos: Modulo[];
  onAulaClick: (aula: Aula) => void;
}

const SubjectModule = ({ materia, modulos, onAulaClick }: SubjectModuleProps) => {
  const colorClasses = {
    primary: "from-primary to-primary-hover",
    success: "from-success to-success-light", 
    accent: "from-accent to-accent-light",
    warning: "from-warning to-warning/80"
  };

  return (
    <div className="space-y-6">
      {/* Header da Matéria */}
      <Card className="overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={materia.image} 
            alt={materia.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${colorClasses[materia.color]} opacity-75`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          <div className="absolute top-4 right-4">
            <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs font-medium text-foreground">
                {materia.completedLessons}/{materia.totalLessons} aulas
              </span>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-3xl font-bold text-white mb-2">{materia.title}</h1>
            <Progress value={materia.progress} className="h-2 bg-white/20 mb-2" />
            <p className="text-white/90 text-sm">{materia.progress}% concluído</p>
          </div>
        </div>
        
        <CardContent className="p-6">
          <p className="text-muted-foreground">{materia.description}</p>
        </CardContent>
      </Card>

      {/* Lista de Módulos */}
      <div className="space-y-4">
        {modulos.map((modulo) => (
          <Card key={modulo.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{modulo.titulo}</CardTitle>
                  <p className="text-sm text-muted-foreground">{modulo.descricao}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {modulo.aulasConcluidas}/{modulo.totalAulas} aulas
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {modulo.progresso}% concluído
                  </div>
                </div>
              </div>
              <Progress value={modulo.progresso} className="h-2 mt-2" />
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {modulo.aulas.map((aula, index) => (
                  <div 
                    key={aula.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => onAulaClick(aula)}
                  >
                    <div className="flex-shrink-0">
                      {aula.assistida ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {aula.titulo}
                        </h4>
                        <Badge 
                          variant={aula.nivel === 'Básico' ? 'secondary' : aula.nivel === 'Intermediário' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {aula.nivel}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {aula.duracao} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {aula.visualizacoes.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {aula.avaliacao}
                        </div>
                      </div>
                      
                      {aula.progresso > 0 && (
                        <div className="mt-2">
                          <Progress value={aula.progresso} className="h-1" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubjectModule;

