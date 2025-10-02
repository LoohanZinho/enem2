import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  BookOpen, 
  Target,
  ChevronLeft,
  ChevronRight,
  Play,
  FileText,
  Award,
  AlertCircle,
  CheckCircle2,
  Star,
  Zap,
  MoreVertical,
  X
} from "lucide-react";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { userDataService, UserData } from "@/services/UserDataService";

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  tipo: 'estudo' | 'simulado' | 'revisao' | 'prova' | 'outro';
  materia: string;
  duracao: number; // em minutos
  concluido: boolean;
  prioridade: 'baixa' | 'media' | 'alta';
}

interface DiaCalendario {
  data: Date;
  eventos: Evento[];
  isCurrentMonth?: boolean;
}

const tiposEvento = [
  { value: 'estudo', label: 'Estudo' },
  { value: 'simulado', label: 'Simulado' },
  { value: 'revisao', label: 'Revisão' },
  { value: 'prova', label: 'Prova' },
  { value: 'outro', label: 'Outro' }
];

const materias = [
  "Matemática", "Português", "História", "Geografia", 
  "Física", "Química", "Biologia", "Filosofia", 
  "Sociologia", "Artes", "Educação Física", "Redação"
];

const Calendario = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [dataAtual, setDataAtual] = useState(new Date());
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [eventoHovered, setEventoHovered] = useState<string | null>(null);
  const [eventoParaExcluir, setEventoParaExcluir] = useState<Evento | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    tipo: 'estudo' as Evento['tipo'],
    materia: '',
    duracao: 60,
    prioridade: 'media' as Evento['prioridade'],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await userDataService.loadUserData();
        if (userData && userData.calendar) {
          setEventos(userData.calendar);
        }
      } catch (error) {
        console.error("Failed to load calendar data:", error);
      }
    };
    loadData();
  }, []);

  const saveToLocalStorage = (newEventos: Evento[]) => {
    userDataService.updateUserData({ calendar: newEventos });
    setEventos(newEventos);
  };

  const adicionarEvento = () => {
    if (!formData.titulo || !formData.data) return;

    const novoEvento: Evento = {
      id: Date.now().toString(),
      titulo: formData.titulo,
      descricao: formData.descricao,
      data: formData.data,
      hora: formData.hora,
      tipo: formData.tipo,
      materia: formData.materia,
      duracao: formData.duracao,
      concluido: false,
      prioridade: formData.prioridade
    };

    const novosEventos = [...eventos, novoEvento];
    saveToLocalStorage(novosEventos);
    resetForm();
    setIsDialogOpen(false);
  };

  const editarEvento = (evento: Evento) => {
    setEventoSelecionado(evento);
    setFormData({
      titulo: evento.titulo,
      descricao: evento.descricao,
      data: evento.data,
      hora: evento.hora,
      tipo: evento.tipo,
      materia: evento.materia,
      duracao: evento.duracao,
      prioridade: evento.prioridade
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const salvarEdicao = () => {
    if (!eventoSelecionado) return;

    const eventosAtualizados = eventos.map(e => 
      e.id === eventoSelecionado.id 
        ? { ...e, ...formData, id: e.id, concluido: e.concluido } as Evento
        : e
    );

    saveToLocalStorage(eventosAtualizados);
    resetForm();
    setIsDialogOpen(false);
  };

  const excluirEvento = (id: string) => {
    const eventosAtualizados = eventos.filter(e => e.id !== id);
    saveToLocalStorage(eventosAtualizados);
    setEventoParaExcluir(null);
  };

  const confirmarExclusao = (evento: Evento) => {
    setEventoParaExcluir(evento);
  };

  const cancelarExclusao = () => {
    setEventoParaExcluir(null);
  };

  const toggleConcluido = (id: string) => {
    const eventosAtualizados = eventos.map(e => 
      e.id === id ? { ...e, concluido: !e.concluido } : e
    );
    saveToLocalStorage(eventosAtualizados);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      data: '',
      hora: '',
      tipo: 'estudo',
      materia: '',
      duracao: 60,
      prioridade: 'media'
    });
    setIsEditing(false);
    setEventoSelecionado(null);
  };

  const getEventosDoDia = (data: Date) => {
    const dataStr = data.toISOString().split('T')[0];
    return eventos.filter(e => e.data === dataStr);
  };

  const getEventosDaSemana = (): DiaCalendario[] => {
    const inicioSemana = new Date(dataAtual);
    inicioSemana.setDate(dataAtual.getDate() - dataAtual.getDay());
    
    const eventosSemana: DiaCalendario[] = [];
    for (let i = 0; i < 7; i++) {
      const data = new Date(inicioSemana);
      data.setDate(inicioSemana.getDate() + i);
      eventosSemana.push({
        data: data,
        eventos: getEventosDoDia(data)
      });
    }
    return eventosSemana;
  };

  const getEventosDoMes = (): DiaCalendario[] => {
    const primeiroDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
    const ultimoDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
    const primeiroDiaSemana = primeiroDia.getDay();
    const diasNoMes = ultimoDia.getDate();
    
    const dias: DiaCalendario[] = [];
    
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const data = new Date(primeiroDia);
      data.setDate(data.getDate() - i - 1);
      dias.push({
        data: data,
        eventos: getEventosDoDia(data),
        isCurrentMonth: false
      });
    }
    
    for (let i = 1; i <= diasNoMes; i++) {
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), i);
      dias.push({
        data: data,
        eventos: getEventosDoDia(data),
        isCurrentMonth: true
      });
    }
    
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, i);
      dias.push({
        data: data,
        eventos: getEventosDoDia(data),
        isCurrentMonth: false
      });
    }
    
    return dias;
  };

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    const novaData = new Date(dataAtual);
    if (direcao === 'anterior') {
      novaData.setMonth(novaData.getMonth() - 1);
    } else {
      novaData.setMonth(novaData.getMonth() + 1);
    }
    setDataAtual(novaData);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'estudo': return <BookOpen className="h-4 w-4" />;
      case 'simulado': return <FileText className="h-4 w-4" />;
      case 'revisao': return <Target className="h-4 w-4" />;
      case 'prova': return <Award className="h-4 w-4" />;
      case 'outro': return <CalendarIcon className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'media': return <Star className="h-3 w-3 text-yellow-500" />;
      case 'baixa': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      default: return <Zap className="h-3 w-3 text-gray-500" />;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'estudo': return 'bg-blue-500';
      case 'simulado': return 'bg-purple-500';
      case 'revisao': return 'bg-green-500';
      case 'prova': return 'bg-red-500';
      case 'outro': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const eventosSemana = getEventosDaSemana();
  const eventosHoje = getEventosDoDia(new Date());
  const eventosPendentes = eventos.filter(e => !e.concluido && new Date(e.data) >= new Date()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <BackButton 
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            />
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <CalendarIcon className="h-4 w-4" />
              Organização de Estudos
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent mb-4">
              Calendário de Estudos
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-3xl mx-auto">
              Organize sua rotina de estudos, defina metas e acompanhe seu progresso de forma eficiente
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <CalendarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium">Eventos Hoje</p>
                  <p className="text-3xl font-bold text-white">{eventosHoje.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium">Pendentes</p>
                  <p className="text-3xl font-bold text-white">{eventosPendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium">Total Eventos</p>
                  <p className="text-3xl font-bold text-white">{eventos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-medium">Concluídos</p>
                  <p className="text-3xl font-bold text-white">{eventos.filter(e => e.concluido).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Adicionar Evento */}
        <div className="mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { resetForm(); setIsDialogOpen(true); }}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md border-0 shadow-2xl bg-white dark:bg-slate-800">
              <DialogHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    {isEditing ? 'Editar Evento' : 'Novo Evento'}
                  </DialogTitle>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Ex: Revisão de Matemática"
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Detalhes do evento..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hora">Hora</Label>
                    <Input
                      id="hora"
                      type="time"
                      value={formData.hora}
                      onChange={(e) => setFormData({...formData, hora: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(value: Evento['tipo']) => setFormData({...formData, tipo: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEvento.map(tipo => (
                          <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="materia">Matéria</Label>
                    <Select value={formData.materia} onValueChange={(value) => setFormData({...formData, materia: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {materias.map(materia => (
                          <SelectItem key={materia} value={materia}>{materia}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duracao">Duração (min)</Label>
                    <Input
                      id="duracao"
                      type="number"
                      value={formData.duracao}
                      onChange={(e) => setFormData({...formData, duracao: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select value={formData.prioridade} onValueChange={(value: Evento['prioridade']) => setFormData({...formData, prioridade: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  {isEditing ? (
                    <Button 
                      onClick={salvarEdicao} 
                      className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Salvar
                    </Button>
                  ) : (
                    <Button 
                      onClick={adicionarEvento} 
                      className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Adicionar
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-semibold"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Controles de Visualização */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'month' ? 'week' : 'month')}
              >
                {viewMode === 'month' ? 'Visualização Semanal' : 'Visualização Mensal'}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navegarMes('anterior')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDataAtual(new Date())}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navegarMes('proximo')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {viewMode === 'month' ? (
          // Calendário Mensal
          <Card className="mb-8 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                  <div key={dia} className="p-3 text-center font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    {dia}
                  </div>
                ))}
              </div>
              
              {/* Grade do calendário */}
              <div className="grid grid-cols-7 gap-1">
                {getEventosDoMes().map((dia, index) => (
                  <div
                    key={index}
                    className={`
                      min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all hover:bg-muted/50
                      ${!dia.isCurrentMonth ? 'opacity-40 bg-muted/20' : 'bg-background'}
                      ${dia.data.toDateString() === new Date().toDateString() ? 'ring-2 ring-primary bg-primary/5' : ''}
                    `}
                    onClick={() => {
                      const dataStr = dia.data.toISOString().split('T')[0];
                      setFormData({...formData, data: dataStr});
                      setIsDialogOpen(true);
                    }}
                  >
                    {/* Número do dia */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-lg font-semibold ${
                        !dia.isCurrentMonth ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {dia.data.getDate()}
                      </span>
                      {dia.data.toDateString() === new Date().toDateString() && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    
                    {/* Eventos do dia */}
                    <div className="space-y-1">
                      {dia.eventos.slice(0, 3).map((evento) => (
                        <div
                          key={evento.id}
                          className={`
                            relative p-2 rounded text-xs cursor-pointer transition-all hover:scale-105 group
                            ${getTipoColor(evento.tipo)} text-white
                            ${evento.concluido ? 'opacity-60 line-through' : ''}
                          `}
                          onMouseEnter={() => setEventoHovered(evento.id)}
                          onMouseLeave={() => setEventoHovered(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            editarEvento(evento);
                          }}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            {getTipoIcon(evento.tipo)}
                            {getPrioridadeIcon(evento.prioridade)}
                          </div>
                          <p className="font-medium truncate">{evento.titulo}</p>
                          {evento.hora && (
                            <p className="text-xs opacity-80">{evento.hora}</p>
                          )}
                          
                          {/* Botões de ação no hover */}
                          {eventoHovered === evento.id && (
                            <div className="absolute top-1 right-1 flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editarEvento(evento);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmarExclusao(evento);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                      {dia.eventos.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dia.eventos.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Calendário Semanal */
          <Card className="mb-8 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <CalendarIcon className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Calendário Semanal</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {eventosSemana.map((dia, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-center">
                      <p className="font-semibold">
                        {dia.data.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dia.data.getDate()}/{dia.data.getMonth() + 1}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {dia.eventos.map((evento) => (
                        <div
                          key={evento.id}
                          className={`
                            relative p-2 rounded text-xs cursor-pointer transition-all hover:scale-105 group
                            ${getTipoColor(evento.tipo)} text-white
                            ${evento.concluido ? 'opacity-50 line-through' : ''}
                          `}
                          onMouseEnter={() => setEventoHovered(evento.id)}
                          onMouseLeave={() => setEventoHovered(null)}
                          onClick={() => editarEvento(evento)}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            {getTipoIcon(evento.tipo)}
                            {getPrioridadeIcon(evento.prioridade)}
                          </div>
                          <p className="font-medium truncate">{evento.titulo}</p>
                          {evento.hora && (
                            <p className="text-xs opacity-80">{evento.hora}</p>
                          )}
                          
                          {eventoHovered === evento.id && (
                            <div className="absolute top-1 right-1 flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editarEvento(evento);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmarExclusao(evento);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Eventos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Próximos Eventos
          </h2>
          {eventos
            .filter(e => new Date(e.data) >= new Date())
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
            .map((evento) => (
            <Card key={evento.id} className={`transition-all hover:shadow-md ${
              evento.concluido ? 'opacity-60' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${getTipoColor(evento.tipo)} text-white`}>
                        {getTipoIcon(evento.tipo)}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg ${evento.concluido ? 'line-through opacity-50' : ''}`}>
                          {evento.titulo}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getTipoColor(evento.tipo)} text-white`}>
                            {tiposEvento.find(t => t.value === evento.tipo)?.label}
                          </Badge>
                          <Badge className={`${getPrioridadeColor(evento.prioridade)} text-white`}>
                            {evento.prioridade}
                          </Badge>
                          {evento.concluido && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Concluído
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {evento.descricao && (
                      <p className="text-sm text-muted-foreground mb-3">{evento.descricao}</p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(evento.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {evento.hora && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{evento.hora}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{evento.duracao}min</span>
                      </div>
                      {evento.materia && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{evento.materia}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleConcluido(evento.id)}
                      className={evento.concluido ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
                    >
                      {evento.concluido ? <CheckCircle2 className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editarEvento(evento)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmarExclusao(evento)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {eventos.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum evento agendado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando eventos para organizar sua rotina de estudos
              </p>
            </CardContent>
          </Card>
        )}

        {/* Modal de Confirmação de Exclusão */}
        <Dialog open={!!eventoParaExcluir} onOpenChange={() => setEventoParaExcluir(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Confirmar Exclusão
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Tem certeza que deseja excluir o evento <strong>"{eventoParaExcluir?.titulo}"</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={cancelarExclusao}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => eventoParaExcluir && excluirEvento(eventoParaExcluir.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Calendario;
