import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Target, 
  Calendar,
  Trophy,
  Flame,
  Clock
} from "lucide-react";

const ProgressSection = () => {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-orange-200">Sequência</p>
                <p className="text-2xl font-bold text-warning dark:text-orange-400">15 dias</p>
              </div>
              <Flame className="h-8 w-8 text-warning dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-green-200">Horas Estudadas</p>
                <p className="text-2xl font-bold text-success dark:text-green-400">127h</p>
              </div>
              <Clock className="h-8 w-8 text-success dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-blue-200">Média Simulados</p>
                <p className="text-2xl font-bold text-primary dark:text-blue-400">742</p>
              </div>
              <Trophy className="h-8 w-8 text-primary dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-purple-200">Meta ENEM</p>
                <p className="text-2xl font-bold text-accent dark:text-purple-400">850</p>
              </div>
              <Target className="h-8 w-8 text-accent dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card bg-card dark:bg-slate-800 border-border dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-slate-200">
              <TrendingUp className="h-5 w-5 text-success dark:text-green-400" />
              Progresso Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground dark:text-slate-200">Matemática</span>
                <span className="text-sm text-muted-foreground dark:text-slate-400">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground dark:text-slate-200">Linguagens</span>
                <span className="text-sm text-muted-foreground dark:text-slate-400">72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground dark:text-slate-200">Ciências da Natureza</span>
                <span className="text-sm text-muted-foreground dark:text-slate-400">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground dark:text-slate-200">Ciências Humanas</span>
                <span className="text-sm text-muted-foreground dark:text-slate-400">79%</span>
              </div>
              <Progress value={79} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground dark:text-slate-200">Redação</span>
                <span className="text-sm text-muted-foreground dark:text-slate-400">65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-card dark:bg-slate-800 border-border dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-slate-200">
              <Calendar className="h-5 w-5 text-primary dark:text-blue-400" />
              Cronograma de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 dark:bg-green-900/20 border border-success/20 dark:border-green-800">
              <div className="h-2 w-2 rounded-full bg-success dark:bg-green-400"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground dark:text-slate-200">Matemática - Funções</p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">45 min • Concluído</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 dark:bg-blue-900/20 border border-primary/20 dark:border-blue-800">
              <div className="h-2 w-2 rounded-full bg-primary dark:bg-blue-400"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground dark:text-slate-200">Português - Interpretação</p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">60 min • Em andamento</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 dark:bg-slate-700/50">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/50 dark:bg-slate-400"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">Química - Orgânica</p>
                <p className="text-xs text-muted-foreground dark:text-slate-500">50 min • Pendente</p>
              </div>
            </div>
            
            <div className="pt-2">
              <Button variant="outline" className="w-full border-border dark:border-slate-600 hover:bg-muted dark:hover:bg-slate-700 text-foreground dark:text-slate-200">
                Ver cronograma completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressSection;