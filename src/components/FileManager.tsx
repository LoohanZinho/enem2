import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  Upload, 
  File, 
  FileText, 
  Folder, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Eye,
  MoreVertical,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ResumoFile {
  id: string;
  nome: string;
  descricao: string;
  materia: string;
  nivel: 'Básico' | 'Intermediário' | 'Avançado';
  tags: string[];
  arquivo: File | null;
  tamanho: number;
  tipo: 'pdf' | 'doc' | 'docx' | 'txt' | 'md';
  dataUpload: string;
  status: 'uploading' | 'success' | 'error';
}

interface FileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  materia: string;
  onFileUpload: (file: ResumoFile) => void;
  existingFiles?: ResumoFile[];
}

const FileManager = ({ isOpen, onClose, materia, onFileUpload, existingFiles = [] }: FileManagerProps) => {
  const [files, setFiles] = useState<ResumoFile[]>(existingFiles);
  const [newFile, setNewFile] = useState<Partial<ResumoFile>>({
    nome: '',
    descricao: '',
    materia: materia,
    nivel: 'Básico',
    tags: [],
    arquivo: null,
    tamanho: 0,
    tipo: 'pdf',
    status: 'success'
  });
  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase() as ResumoFile['tipo'];
      const validTypes = ['pdf', 'doc', 'docx', 'txt', 'md'];
      
      if (validTypes.includes(fileType)) {
        setNewFile(prev => ({
          ...prev,
          nome: file.name.split('.')[0],
          arquivo: file,
          tamanho: file.size / (1024 * 1024), // Convert to MB
          tipo: fileType,
          status: 'success'
        }));
      } else {
        alert('Tipo de arquivo não suportado. Use PDF, DOC, DOCX, TXT ou MD.');
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newFile.tags?.includes(newTag.trim())) {
      setNewFile(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewFile(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleUpload = async () => {
    if (!newFile.nome || !newFile.arquivo) {
      alert('Preencha todos os campos obrigatórios e selecione um arquivo.');
      return;
    }

    setIsUploading(true);
    
    // Simular upload
    const uploadedFile: ResumoFile = {
      id: Date.now().toString(),
      nome: newFile.nome,
      descricao: newFile.descricao || '',
      materia: newFile.materia || materia,
      nivel: newFile.nivel || 'Básico',
      tags: newFile.tags || [],
      arquivo: newFile.arquivo,
      tamanho: newFile.tamanho || 0,
      tipo: newFile.tipo || 'pdf',
      dataUpload: new Date().toLocaleDateString('pt-BR'),
      status: 'success'
    };

    // Simular delay de upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setFiles(prev => [...prev, uploadedFile]);
    onFileUpload(uploadedFile);
    
    // Reset form
    setNewFile({
      nome: '',
      descricao: '',
      materia: materia,
      nivel: 'Básico',
      tags: [],
      arquivo: null,
      tamanho: 0,
      tipo: 'pdf',
      status: 'success'
    });
    setIsUploading(false);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="h-5 w-5 text-blue-500" />;
      case 'txt':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'md':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Gerenciar Arquivos - {materia}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Faça upload e organize os resumos da matéria
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col p-6 pt-0">
          <Tabs defaultValue="upload" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
              <TabsTrigger value="files">Arquivos Existentes ({files.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="flex-1 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Novo Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Upload de Arquivo */}
                  <div className="space-y-2">
                    <Label>Arquivo</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.md"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="mb-4"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Arquivo
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Formatos aceitos: PDF, DOC, DOCX, TXT, MD
                      </p>
                      {newFile.arquivo && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            {getFileIcon(newFile.tipo || 'pdf')}
                            <span className="font-medium">{newFile.arquivo.name}</span>
                            <span className="text-sm text-muted-foreground">
                              ({formatFileSize(newFile.tamanho || 0)})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações do Arquivo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Resumo *</Label>
                      <Input
                        id="nome"
                        value={newFile.nome || ''}
                        onChange={(e) => setNewFile(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: Funções Quadráticas"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nivel">Nível</Label>
                      <Select 
                        value={newFile.nivel || 'Básico'} 
                        onValueChange={(value: 'Básico' | 'Intermediário' | 'Avançado') => 
                          setNewFile(prev => ({ ...prev, nivel: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Básico">Básico</SelectItem>
                          <SelectItem value="Intermediário">Intermediário</SelectItem>
                          <SelectItem value="Avançado">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={newFile.descricao || ''}
                      onChange={(e) => setNewFile(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva o conteúdo do resumo..."
                      rows={3}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Adicionar tag..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newFile.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Botão de Upload */}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleUpload} 
                      disabled={!newFile.nome || !newFile.arquivo || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Fazer Upload
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="flex-1 mt-6">
              <div className="space-y-4">
                {files.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum arquivo encontrado</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Faça upload do primeiro resumo na aba "Upload de Arquivo"
                    </p>
                  </div>
                ) : (
                  files.map((file) => (
                    <Card key={file.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.tipo)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-foreground dark:text-slate-100 mb-1">
                                  {file.nome}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {file.descricao || 'Sem descrição'}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                  <span>{file.materia}</span>
                                  <span>•</span>
                                  <Badge variant={file.nivel === 'Básico' ? 'default' : file.nivel === 'Intermediário' ? 'secondary' : 'destructive'}>
                                    {file.nivel}
                                  </Badge>
                                  <span>•</span>
                                  <span>{formatFileSize(file.tamanho)}</span>
                                  <span>•</span>
                                  <span>{file.dataUpload}</span>
                                </div>
                                
                                {file.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {file.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileManager;
