import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  FileSpreadsheet, 
  Users, 
  Settings, 
  BarChart3,
  Download,
  Upload,
  Save,
  RefreshCw
} from "lucide-react";
import Header from "@/components/Header";
import InteractiveSpreadsheet from "@/components/InteractiveSpreadsheet";
import type { RowData } from "@/services/DatabaseService";


interface User {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  color: string;
  lastSeen: Date;
}

interface CellData {
  value: string | number;
  type: 'text' | 'number' | 'formula';
  formula?: string;
}

interface SpreadsheetTemplate {
  id: string;
  name: string;
  description: string;
  data: RowData[];
  columns: string[];
}

const Planilha = () => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-1',
    name: 'Administrador',
    role: 'admin',
    color: '#3B82F6',
    lastSeen: new Date()
  });

  const [users, setUsers] = useState<User[]>([
    {
      id: 'user-1',
      name: 'Administrador',
      role: 'admin',
      color: '#3B82F6',
      lastSeen: new Date()
    },
    {
      id: 'user-2',
      name: 'Professor João',
      role: 'editor',
      color: '#10B981',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000) // 5 minutos atrás
    },
    {
      id: 'user-3',
      name: 'Aluna Maria',
      role: 'viewer',
      color: '#F59E0B',
      lastSeen: new Date(Date.now() - 2 * 60 * 1000) // 2 minutos atrás
    }
  ]);

  const [templates] = useState<SpreadsheetTemplate[]>([
    {
      id: 'template-1',
      name: 'Controle de Aulas',
      description: 'Acompanhamento de aulas e presença dos alunos',
      data: [
        { 'Nome do Aluno': {value: 'João Silva', type: 'text'}, 'Aula': {value: 'Matemática', type: 'text'}, 'Presença': {value: 'Presente', type: 'text'}, 'Nota': {value: 8.5, type: 'number'}, 'Data': {value: new Date().toISOString().split('T')[0], type: 'text'} },
        { 'Nome do Aluno': {value: 'Maria Santos', type: 'text'}, 'Aula': {value: 'Português', type: 'text'}, 'Presença': {value: 'Presente', type: 'text'}, 'Nota': {value: 9.2, type: 'number'}, 'Data': {value: new Date().toISOString().split('T')[0], type: 'text'} },
        { 'Nome do Aluno': {value: 'Pedro Costa', type: 'text'}, 'Aula': {value: 'Física', type: 'text'}, 'Presença': {value: 'Falta', type: 'text'}, 'Nota': {value: 7.0, type: 'number'}, 'Data': {value: new Date().toISOString().split('T')[0], type: 'text'} }
      ],
      columns: ['Nome do Aluno', 'Aula', 'Presença', 'Nota', 'Data']
    },
    {
      id: 'template-2',
      name: 'Cronograma de Estudos',
      description: 'Planejamento de estudos por matéria',
      data: [
        { 'Matéria': {value: 'Matemática', type: 'text'}, 'Tópico': {value: 'Álgebra', type: 'text'}, 'Horas': {value: 4, type: 'number'}, 'Status': {value: 'Concluído', type: 'text'}, 'Data': {value: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'text'} },
        { 'Matéria': {value: 'Português', type: 'text'}, 'Tópico': {value: 'Literatura', type: 'text'}, 'Horas': {value: 3, type: 'number'}, 'Status': {value: 'Em Andamento', type: 'text'}, 'Data': {value: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'text'} },
        { 'Matéria': {value: 'Física', type: 'text'}, 'Tópico': {value: 'Mecânica', type: 'text'}, 'Horas': {value: 5, type: 'number'}, 'Status': {value: 'Pendente', type: 'text'}, 'Data': {value: new Date().toISOString().split('T')[0], type: 'text'} }
      ],
      columns: ['Matéria', 'Tópico', 'Horas', 'Status', 'Data']
    },
    {
      id: 'template-3',
      name: 'Gestão de Conteúdo',
      description: 'Controle de vídeos e materiais didáticos',
      data: [
        { 'Título': {value: 'Aula 1 - Introdução', type: 'text'}, 'Matéria': {value: 'Matemática', type: 'text'}, 'Duração': {value: '45min', type: 'text'}, 'Status': {value: 'Publicado', type: 'text'}, 'Visualizações': {value: 150, type: 'number'} },
        { 'Título': {value: 'Aula 2 - Exercícios', type: 'text'}, 'Matéria': {value: 'Matemática', type: 'text'}, 'Duração': {value: '60min', type: 'text'}, 'Status': {value: 'Rascunho', type: 'text'}, 'Visualizações': {value: 0, type: 'number'} },
        { 'Título': {value: 'Resumo - Literatura', type: 'text'}, 'Matéria': {value: 'Português', type: 'text'}, 'Duração': {value: '30min', type: 'text'}, 'Status': {value: 'Publicado', type: 'text'}, 'Visualizações': {value: 89, type: 'number'} }
      ],
      columns: ['Título', 'Matéria', 'Duração', 'Status', 'Visualizações']
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<SpreadsheetTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('planilha');

  const handleDataChange = (data: RowData[]) => {
    // Dados alterados - implementar lógica de salvamento
  };

  const handleUserPermissionChange = (userId: string, permission: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, role: permission as 'admin' | 'editor' | 'viewer' }
          : user
      )
    );
  };

  const handleTemplateSelect = (template: SpreadsheetTemplate) => {
    setSelectedTemplate(template);
    setActiveTab('planilha');
  };

  const handleExportAll = () => {
    // Implementar exportação de todas as planilhas
  };

  const handleImportData = () => {
    // Implementar importação de dados
  };

  const handleSaveData = () => {
    // Implementar salvamento automático
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <FileSpreadsheet className="h-10 w-10 text-primary" />
            Planilha Interativa
          </h1>
          <p className="text-xl text-muted-foreground">
            Gerencie dados de forma colaborativa com permissões automáticas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="planilha" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Planilha
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Modelos
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planilha" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold">
                  {selectedTemplate ? selectedTemplate.name : 'Planilha Padrão'}
                </h2>
                {selectedTemplate && (
                  <Badge variant="outline">
                    {selectedTemplate.description}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSaveData}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" size="sm" onClick={handleImportData}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportAll}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            <InteractiveSpreadsheet
              title={selectedTemplate?.name || 'Planilha Padrão'}
              initialData={selectedTemplate?.data as any}
              users={users}
              currentUser={currentUser}
              onDataChange={handleDataChange}
              onUserPermissionChange={handleUserPermissionChange}
            />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Modelos de Planilha</h2>
              <Button>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Criar Novo Modelo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Colunas:</span>
                        <Badge variant="outline">{template.columns.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Linhas:</span>
                        <Badge variant="outline">{template.data.length}</Badge>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Usar Modelo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-6">
            <h2 className="text-2xl font-semibold">Gerenciamento de Usuários</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <Badge 
                          variant={user.role === 'admin' ? 'default' : user.role === 'editor' ? 'secondary' : 'outline'}
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Última atividade: {user.lastSeen.toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: user.color }}
                        />
                        Status: {user.lastSeen > new Date(Date.now() - 5 * 60 * 1000) ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-6">
            <h2 className="text-2xl font-semibold">Configurações da Planilha</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Salvamento Automático</label>
                    <p className="text-sm text-muted-foreground">
                      Salva alterações automaticamente a cada 30 segundos
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Histórico de Versões</label>
                    <p className="text-sm text-muted-foreground">
                      Mantém histórico das últimas 50 alterações
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notificações</label>
                    <p className="text-sm text-muted-foreground">
                      Notifica sobre alterações de outros usuários
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usuários Ativos</span>
                    <Badge variant="outline">{users.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Modelos Disponíveis</span>
                    <Badge variant="outline">{templates.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Última Atualização</span>
                    <Badge variant="outline">{new Date().toLocaleDateString()}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Planilha;

    