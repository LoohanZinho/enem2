import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  BookOpen, 
  FileText,
  ExternalLink,
  Save,
  Check
} from "lucide-react";
import { useState } from "react";

interface Link {
  id: string;
  titulo: string;
  url: string;
  tipo: 'video' | 'documento' | 'simulado' | 'resumo';
  descricao?: string;
  ativo: boolean;
  ordem: number;
}

interface LinkManagerProps {
  isOpen: boolean;
  onClose: () => void;
  subMateriaId: string;
  subMateriaNome: string;
  links: Link[];
  onSave: (subMateriaId: string, links: Link[]) => void;
}

const LinkManager = ({ 
  isOpen, 
  onClose, 
  subMateriaId, 
  subMateriaNome, 
  links, 
  onSave 
}: LinkManagerProps) => {
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Link>>({
    titulo: '',
    url: '',
    tipo: 'video',
    descricao: '',
    ativo: true,
    ordem: 0
  });

  const handleCreate = () => {
    setIsCreating(true);
    setEditingLink(null);
    setFormData({
      titulo: '',
      url: '',
      tipo: 'video',
      descricao: '',
      ativo: true,
      ordem: links.length
    });
  };

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setIsCreating(false);
    setFormData(link);
  };

  const handleSave = () => {
    if (!formData.titulo || !formData.url) return;

    const newLink: Link = {
      id: editingLink?.id || `link-${Date.now()}`,
      titulo: formData.titulo,
      url: formData.url,
      tipo: formData.tipo || 'video',
      descricao: formData.descricao,
      ativo: formData.ativo ?? true,
      ordem: formData.ordem ?? links.length
    };

    let updatedLinks: Link[];
    if (editingLink) {
      updatedLinks = links.map(link => 
        link.id === editingLink.id ? newLink : link
      );
    } else {
      updatedLinks = [...links, newLink];
    }

    onSave(subMateriaId, updatedLinks);
    setEditingLink(null);
    setIsCreating(false);
    setFormData({
      titulo: '',
      url: '',
      tipo: 'video',
      descricao: '',
      ativo: true,
      ordem: 0
    });
  };

  const handleDelete = (linkId: string) => {
    const updatedLinks = links.filter(link => link.id !== linkId);
    onSave(subMateriaId, updatedLinks);
  };

  const handleCancel = () => {
    setEditingLink(null);
    setIsCreating(false);
    setFormData({
      titulo: '',
      url: '',
      tipo: 'video',
      descricao: '',
      ativo: true,
      ordem: 0
    });
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'documento': return <BookOpen className="h-4 w-4" />;
      case 'simulado': return <FileText className="h-4 w-4" />;
      case 'resumo': return <BookOpen className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'video': return 'bg-red-100 text-red-700 border-red-200';
      case 'documento': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'simulado': return 'bg-green-100 text-green-700 border-green-200';
      case 'resumo': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Gerenciar Links - {subMateriaNome}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione e gerencie os links de conteúdo para esta submatéria
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 pt-0 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Links Existentes</h3>
                <Button onClick={handleCreate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Link
                </Button>
              </div>

              <div className="space-y-3">
                {links.map((link) => (
                  <Card key={link.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded ${getTipoColor(link.tipo)}`}>
                        {getTipoIcon(link.tipo)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{link.titulo}</h4>
                          <Badge 
                            variant={link.ativo ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {link.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {link.url}
                        </p>
                        {link.descricao && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {link.descricao}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(link)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(link.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {links.length === 0 && (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Nenhum link adicionado ainda</p>
                    <Button onClick={handleCreate} className="mt-2" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Link
                    </Button>
                  </Card>
                )}
              </div>
            </div>

            {/* Formulário de Edição/Criação */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {isCreating ? "Adicionar Novo Link" : "Editar Link"}
              </h3>

              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título do Link</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo || ''}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Ex: Aula 1 - Introdução"
                    />
                  </div>

                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={formData.url || ''}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo de Conteúdo</Label>
                    <Select
                      value={formData.tipo || 'video'}
                      onValueChange={(value: string) => setFormData({ ...formData, tipo: value as Link['tipo'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Vídeo</SelectItem>
                        <SelectItem value="documento">Documento</SelectItem>
                        <SelectItem value="simulado">Simulado</SelectItem>
                        <SelectItem value="resumo">Resumo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição (Opcional)</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao || ''}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Breve descrição do conteúdo..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ordem">Ordem de Exibição</Label>
                    <Input
                      id="ordem"
                      type="number"
                      value={formData.ordem || 0}
                      onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ativo"
                      checked={formData.ativo ?? true}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                    />
                    <Label htmlFor="ativo">Link ativo</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={!formData.titulo || !formData.url}>
                      <Save className="h-4 w-4 mr-2" />
                      {isCreating ? "Adicionar" : "Salvar"}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkManager;
