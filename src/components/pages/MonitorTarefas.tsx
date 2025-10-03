
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userDataService } from "@/services/UserDataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Calculator,
  FileText,
  Brain,
  Zap,
  Search,
  Star,
  History,
  TestTube,
  Paintbrush,
  Languages,
  PenTool,
  Microscope,
  Beaker,
  BarChart3,
  ClipboardList,
  GraduationCap,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  XCircle,
  PlayCircle,
  Loader2
} from "lucide-react";
import Header from "@/components/Header";

interface Task {
  id: string;
  materia: string;
  descricao: string;
  tipoTarefa: string;
  prazo: string;
  status: string;
  dataCriacao: string;
  prioridade: 'baixa' | 'media' | 'alta';
  favorita?: boolean;
}

interface Materia {
  id: string;
  nome: string;
  icone: React.ReactNode;
  cor: string;
  corClara: string;
}

interface TipoTarefa {
  id: string;
  nome: string;
  icone: React.ReactNode;
  cor: string;
  corClara: string;
}

interface Status {
  id: string;
  nome: string;
  icone: React.ReactNode;
  cor: string;
  corClara: string;
}

const materias: Materia[] = [
  { id: 'matematica', nome: 'Matemática e suas Tecnologias', icone: <Calculator className="h-5 w-5" />, cor: 'bg-blue-500', corClara: 'bg-blue-50 dark:bg-blue-950' },
  { id: 'linguagens', nome: 'Linguagens, Códigos e suas Tecnologias', icone: <Languages className="h-5 w-5" />, cor: 'bg-green-500', corClara: 'bg-green-50 dark:bg-green-950' },
  { id: 'ciencias_natureza', nome: 'Ciências da Natureza e suas Tecnologias', icone: <TestTube className="h-5 w-5" />, cor: 'bg-red-500', corClara: 'bg-red-50 dark:bg-red-950' },
  { id: 'ciencias_humanas', nome: 'Ciências Humanas e suas Tecnologias', icone: <History className="h-5 w-5" />, cor: 'bg-purple-500', corClara: 'bg-purple-50 dark:bg-purple-950' },
  { id: 'redacao', nome: 'Redação', icone: <PenTool className="h-5 w-5" />, cor: 'bg-orange-500', corClara: 'bg-orange-50 dark:bg-orange-950' }
];

const tiposTarefa: TipoTarefa[] = [
  { id: 'exercicios', nome: 'Folha de exercícios', icone: <FileText className="h-5 w-5" />, cor: 'bg-purple-500', corClara: 'bg-purple-50 dark:bg-purple-950' },
  { id: 'projeto', nome: 'Projeto', icone: <ClipboardList className="h-5 w-5" />, cor: 'bg-blue-500', corClara: 'bg-blue-50 dark:bg-blue-950' },
  { id: 'criativo', nome: 'Trabalho criativo', icone: <Paintbrush className="h-5 w-5" />, cor: 'bg-red-500', corClara: 'bg-red-50 dark:bg-red-950' },
  { id: 'redacao', nome: 'Redação', icone: <PenTool className="h-5 w-5" />, cor: 'bg-green-500', corClara: 'bg-green-50 dark:bg-green-950' },
  { id: 'estudo', nome: 'Estudo para prova', icone: <Brain className="h-5 w-5" />, cor: 'bg-pink-500', corClara: 'bg-pink-50 dark:bg-pink-950' },
  { id: 'pesquisa', nome: 'Pesquisa', icone: <Search className="h-5 w-5" />, cor: 'bg-cyan-500', corClara: 'bg-cyan-50 dark:bg-cyan-950' },
  { id: 'apresentacao', nome: 'Apresentação', icone: <BarChart3 className="h-5 w-5" />, cor: 'bg-amber-500', corClara: 'bg-amber-50 dark:bg-amber-950' },
  { id: 'laboratorio', nome: 'Laboratório', icone: <Microscope className="h-5 w-5" />, cor: 'bg-emerald-500', corClara: 'bg-emerald-50 dark:bg-emerald-950' }
];

const statusOptions: Status[] = [
  { id: 'concluido', nome: 'Concluído', icone: <CheckCircle2 className="h-4 w-4" />, cor: 'bg-green-500', corClara: 'bg-green-50 dark:bg-green-950' },
  { id: 'andamento', nome: 'Em andamento', icone: <PlayCircle className="h-4 w-4" />, cor: 'bg-orange-500', corClara: 'bg-orange-50 dark:bg-orange-950' },
  { id: 'pendente', nome: 'Pendente', icone: <Clock3 className="h-4 w-4" />, cor: 'bg-yellow-500', corClara: 'bg-yellow-50 dark:bg-yellow-950' },
  { id: 'atrasado', nome: 'Atrasado', icone: <AlertTriangle className="h-4 w-4" />, cor: 'bg-red-500', corClara: 'bg-red-50 dark:bg-red-950' },
  { id: 'cancelado', nome: 'Cancelado', icone: <XCircle className="h-4 w-4" />, cor: 'bg-gray-500', corClara: 'bg-gray-50 dark:bg-gray-950' }
];

const MonitorTarefas = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    materia: '',
    descricao: '',
    tipoTarefa: '',
    prazo: '',
    status: 'pendente'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof Task | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterMateria, setFilterMateria] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados iniciais do serviço
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      const loadedTasks = await userDataService.loadTasks();
      if (loadedTasks && loadedTasks.length > 0) {
        setTasks(loadedTasks);
      }
      setIsLoading(false);
    };
    fetchTasks();
  }, []);

  const getMateriaInfo = (materiaId: string) => {
    return materias.find(m => m.id === materiaId) || materias[0];
  };

  const getTipoTarefaInfo = (tipoId: string) => {
    return tiposTarefa.find(t => t.id === tipoId) || tiposTarefa[0];
  };

  const getStatusInfo = (statusId: string) => {
    return statusOptions.find(s => s.id === statusId) || statusOptions[0];
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Sem prazo";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const correctedDate = new Date(date.getTime() + userTimezoneOffset);
      const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      return `${correctedDate.getDate()} ${months[correctedDate.getMonth()]}. ${correctedDate.getFullYear()}`;
    } catch (e) {
        return "Data inválida"
    }
  };

  const handleAddTask = async () => {
    if (newTask.materia && newTask.descricao && newTask.tipoTarefa && newTask.prazo) {
      const task: Task = {
        id: Date.now().toString(),
        materia: newTask.materia,
        descricao: newTask.descricao,
        tipoTarefa: newTask.tipoTarefa,
        prazo: newTask.prazo,
        status: newTask.status || 'pendente',
        dataCriacao: new Date().toISOString().split('T')[0],
        prioridade: 'media',
        favorita: false
      };
      await userDataService.addTask(task);
      setTasks([...tasks, task]);
      setNewTask({ materia: '', descricao: '', tipoTarefa: '', prazo: '', status: 'pendente' });
      setShowAddForm(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };
  
  const handleEditField = (taskId: string, field: string) => {
    setEditingField(`${taskId}-${field}`);
  };

  const handleSaveEdit = async () => {
    if (editingTask) {
      await userDataService.updateTask(editingTask.id, editingTask);
      setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
      setEditingTask(null);
      setEditingField(null);
    }
  };

  const handleSaveFieldEdit = async (taskId: string, field: string, value: any) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if(taskToUpdate) {
        const updatedTask = { ...taskToUpdate, [field]: value };
        await userDataService.updateTask(taskId, updatedTask);
        setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    }
    setEditingField(null);
  };
  
  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditingField(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    await userDataService.deleteTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleToggleFavorite = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, favorita: !task.favorita };
      await userDataService.updateTask(taskId, updatedTask);
      setTasks(tasks.map(t => (t.id === taskId ? updatedTask : t)));
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, status: newStatus };
      await userDataService.updateTask(taskId, updatedTask);
      setTasks(tasks.map(t => (t.id === taskId ? updatedTask : t)));
    }
  };

  const handleSort = (column: keyof Task) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (filterStatus !== 'todos' && task.status !== filterStatus) return false;
      if (filterMateria !== 'todas' && task.materia !== filterMateria) return false;
      if (searchTerm && !task.descricao.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;
      
      let aValue: string | number | boolean | undefined = a[sortColumn];
      let bValue: string | number | boolean | undefined = b[sortColumn];
      
      if (sortColumn === 'prazo' || sortColumn === 'dataCriacao') {
        aValue = new Date(a[sortColumn] as string).getTime();
        bValue = new Date(b[sortColumn] as string).getTime();
      }
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (sortDirection === 'asc') {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      } else {
        if (aValue > bValue) return -1;
        if (aValue < bValue) return 1;
        return 0;
      }
    });

  const isOverdue = (prazo: string) => {
    if (!prazo) return false;
    return new Date(prazo) < new Date() && new Date(prazo).toDateString() !== new Date().toDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
    <Header />
      <Card className="max-w-7xl mx-auto shadow-2xl border-0 bg-background/95 dark:bg-slate-900/95 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white">Monitor de Tarefas</CardTitle>
                <p className="text-slate-200">Gerencie suas tarefas escolares de forma inteligente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-200 dark:text-slate-800 dark:hover:bg-slate-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Barra de Pesquisa e Filtros */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-muted/50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Pesquisar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background dark:bg-slate-700 text-foreground dark:text-white border-input dark:border-slate-600 focus:border-slate-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background dark:bg-slate-700 border-input dark:border-slate-600 text-foreground dark:text-white"
                >
                  <option value="todos">Todos os Status</option>
                  {statusOptions.map(status => (
                    <option key={status.id} value={status.id}>{status.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterMateria}
                  onChange={(e) => setFilterMateria(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background dark:bg-slate-700 border-input dark:border-slate-600 text-foreground dark:text-white"
                >
                  <option value="todas">Todas as Matérias</option>
                  {materias.map(materia => (
                    <option key={materia.id} value={materia.id}>{materia.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Formulário de Nova Tarefa */}
          {showAddForm && (
            <Card className="mb-6 border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">Adicionar Nova Tarefa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Matéria</label>
                    <select
                      value={newTask.materia}
                      onChange={(e) => setNewTask({...newTask, materia: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background dark:bg-slate-700 border-input dark:border-slate-600 text-foreground dark:text-white"
                    >
                      <option value="">Selecione</option>
                      {materias.map(materia => (
                        <option key={materia.id} value={materia.id}>{materia.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Tipo de Tarefa</label>
                    <select
                      value={newTask.tipoTarefa}
                      onChange={(e) => setNewTask({...newTask, tipoTarefa: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background dark:bg-slate-700 border-input dark:border-slate-600 text-foreground dark:text-white"
                    >
                      <option value="">Selecione</option>
                      {tiposTarefa.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Prazo</label>
                    <Input
                      type="date"
                      value={newTask.prazo}
                      onChange={(e) => setNewTask({...newTask, prazo: e.target.value})}
                      className="text-sm bg-background dark:bg-slate-700 text-foreground dark:text-white border-input dark:border-slate-600 focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <select
                      value={newTask.status}
                      onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background dark:bg-slate-700 border-input dark:border-slate-600 text-foreground dark:text-white"
                    >
                      {statusOptions.map(status => (
                        <option key={status.id} value={status.id}>{status.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddTask} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-foreground">Descrição</label>
                  <Input
                    value={newTask.descricao}
                    onChange={(e) => setNewTask({...newTask, descricao: e.target.value})}
                    placeholder="Escreva a descrição da sua tarefa/dever de casa aqui"
                    className="mt-1 bg-background dark:bg-slate-700 text-foreground dark:text-white border-input dark:border-slate-600 focus:border-slate-500"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visualização de Tarefas */}
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-background dark:bg-slate-900 rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-muted/50 dark:bg-slate-800 border-b border-border dark:border-slate-700">
                    <th 
                      className="p-4 text-left font-semibold text-foreground cursor-pointer hover:bg-muted dark:hover:bg-slate-700"
                      onClick={() => handleSort('materia')}
                    >
                      <div className="flex items-center gap-2">
                        Matéria
                        {sortColumn === 'materia' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-foreground">Descrição</th>
                    <th 
                      className="p-4 text-left font-semibold text-foreground cursor-pointer hover:bg-muted dark:hover:bg-slate-700"
                      onClick={() => handleSort('tipoTarefa')}
                    >
                      <div className="flex items-center gap-2">
                        Tipo de tarefa
                        {sortColumn === 'tipoTarefa' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="p-4 text-left font-semibold text-foreground cursor-pointer hover:bg-muted dark:hover:bg-slate-700"
                      onClick={() => handleSort('prazo')}
                    >
                      <div className="flex items-center gap-2">
                        Prazo
                        {sortColumn === 'prazo' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="p-4 text-left font-semibold text-foreground cursor-pointer hover:bg-muted dark:hover:bg-slate-700"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortColumn === 'status' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-foreground">Ações</th>
                  </tr>
              </thead>
              <tbody>
                {filteredAndSortedTasks.map((task) => {
                  const materiaInfo = getMateriaInfo(task.materia);
                  const tipoInfo = getTipoTarefaInfo(task.tipoTarefa);
                  const statusInfo = getStatusInfo(task.status);
                  
                  return (
                    <tr key={task.id} className="border-b border-border dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-800/50">
                      <td className="p-4">
                        {editingField === `${task.id}-materia` ? (
                          <select
                            value={editingTask?.materia || task.materia}
                            onChange={(e) => setEditingTask({...editingTask!, materia: e.target.value})}
                            onBlur={() => handleSaveFieldEdit(task.id, 'materia', editingTask?.materia || task.materia)}
                            className="w-full px-2 py-1 border rounded text-sm bg-background dark:bg-slate-700 border-input dark:border-slate-600 text-foreground dark:text-white"
                            autoFocus
                          >
                            {materias.map(materia => (
                              <option key={materia.id} value={materia.id}>{materia.nome}</option>
                            ))}
                          </select>
                        ) : (
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                            onClick={() => {
                              setEditingTask(task);
                              handleEditField(task.id, 'materia');
                            }}
                          >
                            <div className="text-slate-600 dark:text-slate-400">{materiaInfo.icone}</div>
                            <span className="font-medium text-foreground">{materiaInfo.nome}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {editingTask?.id === task.id ? (
                          <Input
                            value={editingTask.descricao}
                            onChange={(e) => setEditingTask({...editingTask, descricao: e.target.value})}
                            className="w-full bg-background dark:bg-slate-700 text-foreground dark:text-white border-input dark:border-slate-600 focus:border-slate-500"
                          />
                        ) : (
                          <span className="text-foreground">{task.descricao}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingField === `${task.id}-tipoTarefa` ? (
                          <select
                            value={editingTask?.tipoTarefa || task.tipoTarefa}
                            onChange={(e) => setEditingTask({...editingTask!, tipoTarefa: e.target.value})}
                            onBlur={() => handleSaveFieldEdit(task.id, 'tipoTarefa', editingTask?.tipoTarefa || task.tipoTarefa)}
                            className="w-full px-2 py-1 border rounded text-sm bg-background dark:bg-slate-700 border-input dark:border-slate-600 text-foreground dark:text-white"
                            autoFocus
                          >
                            {tiposTarefa.map(tipo => (
                              <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                            ))}
                          </select>
                        ) : (
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                            onClick={() => {
                              setEditingTask(task);
                              handleEditField(task.id, 'tipoTarefa');
                            }}
                          >
                            <div className="text-slate-600 dark:text-slate-400">{tipoInfo.icone}</div>
                            <span className="text-sm text-muted-foreground">{tipoInfo.nome}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {editingField === `${task.id}-prazo` ? (
                          <Input
                            type="date"
                            value={editingTask?.prazo || task.prazo}
                            onChange={(e) => setEditingTask({...editingTask!, prazo: e.target.value})}
                            onBlur={() => handleSaveFieldEdit(task.id, 'prazo', editingTask?.prazo || task.prazo)}
                            className="w-full px-2 py-1 text-sm bg-background dark:bg-slate-700 border-input dark:border-slate-600 text-foreground dark:text-white"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                            onClick={() => {
                              setEditingTask(task);
                              handleEditField(task.id, 'prazo');
                            }}
                          >
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={`text-sm ${isOverdue(task.prazo) ? 'text-red-500 dark:text-red-400' : 'text-foreground'}`}>
                              {formatDate(task.prazo)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="text-foreground">{statusInfo.icone}</div>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 text-white ${statusInfo.cor}`}
                          >
                            {statusOptions.map(status => (
                              <option key={status.id} value={status.id} className="bg-background dark:bg-slate-800 text-foreground dark:text-white">
                                {status.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleToggleFavorite(task.id)}
                            className={task.favorita ? 'text-yellow-500 dark:text-yellow-400' : 'text-muted-foreground'}
                          >
                            <Star className={`h-4 w-4 ${task.favorita ? 'fill-current' : ''}`} />
                          </Button>
                          {editingTask?.id === task.id ? (
                            <>
                              <Button size="sm" onClick={handleSaveEdit}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingTask(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEditTask(task)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteTask(task.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {tasks.filter(t => t.status === 'concluido').length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Concluídas</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <PlayCircle className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {tasks.filter(t => t.status === 'andamento').length}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Em Andamento</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <Clock3 className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {tasks.filter(t => t.status === 'pendente').length}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {tasks.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total de Tarefas</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitorTarefas;

    