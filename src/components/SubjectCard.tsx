import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, FileText, PenTool } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubjectCardProps {
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  image: string;
  color: "primary" | "success" | "accent" | "warning";
}

const SubjectCard = ({
  title,
  description,
  progress,
  totalLessons,
  completedLessons,
  image,
  color
}: SubjectCardProps) => {
  const router = useRouter();
  const colorClasses = {
    primary: "from-primary to-primary-hover",
    success: "from-success to-success-light", 
    accent: "from-accent to-accent-light",
    warning: "from-warning to-warning/80"
  };

  return (
    <Card className="overflow-hidden hover:shadow-floating transition-smooth cursor-pointer group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${colorClasses[color]} opacity-75`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <div className="absolute top-4 right-4">
          <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-xs font-medium text-foreground">
              {completedLessons}/{totalLessons} aulas
            </span>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <Progress value={progress} className="h-2 bg-white/20" />
          <p className="text-white/90 text-sm mt-2">{progress}% concluído</p>
        </div>
      </div>
      
      <div className="p-6 bg-card dark:bg-slate-800">
        <p className="text-muted-foreground dark:text-slate-300 mb-4">{description}</p>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-col h-auto py-3 border-border dark:border-slate-600 hover:bg-muted dark:hover:bg-slate-700"
            onClick={() => router.push(`/aulas?materia=${encodeURIComponent(title)}`)}
          >
            <Play className="h-4 w-4 mb-1 text-foreground dark:text-slate-200" />
            <span className="text-xs text-foreground dark:text-slate-200">Vídeos</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-col h-auto py-3 border-border dark:border-slate-600 hover:bg-muted dark:hover:bg-slate-700"
            onClick={() => router.push(`/resumos?materia=${encodeURIComponent(title)}`)}
          >
            <FileText className="h-4 w-4 mb-1 text-foreground dark:text-slate-200" />
            <span className="text-xs text-foreground dark:text-slate-200">Resumos</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-col h-auto py-3 border-border dark:border-slate-600 hover:bg-muted dark:hover:bg-slate-700"
            onClick={() => router.push('/simulados')}
          >
            <PenTool className="h-4 w-4 mb-1 text-foreground dark:text-slate-200" />
            <span className="text-xs text-foreground dark:text-slate-200">Simulados</span>
          </Button>
        </div>
        
        <Button 
          variant="default"
          className="w-full" 
          size="lg"
          onClick={() => router.push('/cronograma')}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Continuar Estudos
        </Button>
      </div>
    </Card>
  );
};

export default SubjectCard;
