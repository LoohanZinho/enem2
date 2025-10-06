import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Target, 
  BookOpen, 
  Brain, 
  FileText,
  Edit,
  Save,
  X
} from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

// Função para extrair iniciais do nome
const getInitials = (name: string | undefined): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2); // Máximo 2 iniciais
};

const Perfil = () => {
  const router = useRouter();
  const { user, logout, isLoading, updateUser } = useAuth();
  
  // Todos os hooks devem estar no topo, antes de qualquer return condicional
  const [isEditing, setIsEditing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "Estudante dedicado ao ENEM 2024",
    location: "São Paulo, SP",
    phone: user?.phone || ""
  });

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Atualizar formData quando user mudar
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: "Estudante dedicado ao ENEM 2024",
        location: "São Paulo, SP",
        phone: user.phone || ""
      });
    }
  }, [user]);

  // Efeito de animação quando o nome mudar
  useEffect(() => {
    if (isEditing) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.name, isEditing]);

  const handleSave = async () => {
    try {
      if (!user) return;

      const success = await updateUser({
        name: formData.name,
        phone: formData.phone
      });

      if (success) {
        console.log("Perfil atualizado com sucesso!");
        setIsEditing(false);
      } else {
        console.error("Erro ao salvar perfil");
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
  };

  const handleCancel = () => {
    if (user) {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          bio: "Estudante dedicado ao ENEM 2024",
          location: "São Paulo, SP",
          phone: user.phone || ""
        });
    }
    setIsEditing(false);
  };

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário, não renderizar nada (será redirecionado)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="text-center space-y-6 mb-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white rounded-full text-sm font-semibold shadow-lg">
                <User className="h-5 w-5" />
                Perfil do Usuário
              </div>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">
                Meu <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Perfil</span> 2025
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-xl leading-relaxed max-w-3xl mx-auto">
                Gerencie suas informações pessoais, acompanhe seu progresso e personalize sua experiência de estudo.
              </p>
            </div>
            
            {/* Avatar e Info Básica */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <div className="relative">
                  <Avatar className={`h-32 w-32 border-4 border-white/30 shadow-2xl ring-4 ring-white/20 transition-all duration-500 ${isAnimating ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}`}>
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className={`bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white text-4xl font-black tracking-wider transition-all duration-500 ${isAnimating ? 'animate-pulse' : ''}`}>
                      {getInitials(formData.name) || <User className="h-12 w-12" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-all duration-300">
                  {formData.name || "Usuário"} - 2025
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg mb-4 transition-all duration-300">
                  {formData.email || "usuario@email.com"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Badge className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 text-sm font-bold rounded-full">
                    {user?.role || "Estudante"}
                  </Badge>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">Nível 12</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Membro desde 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Pessoais */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        Informações Pessoais
                      </CardTitle>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Gerencie seus dados pessoais
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    {isEditing ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="group space-y-3">
                    <Label htmlFor="name" className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg"></div>
                      Nome Completo
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`h-14 px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl ${isAnimating ? 'animate-pulse bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        placeholder="Digite seu nome completo"
                      />
                    ) : (
                      <div className="h-14 px-6 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 dark:from-slate-700/50 dark:via-slate-800/50 dark:to-slate-700/50 rounded-2xl border-2 border-slate-200 dark:border-slate-600 flex items-center group-hover:border-blue-300 dark:group-hover:border-blue-600 group-hover:shadow-xl transition-all duration-300">
                        <span className="text-slate-900 dark:text-white font-bold text-lg">{formData.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="group space-y-3">
                    <Label htmlFor="email" className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg"></div>
                      E-mail
                    </Label>
                    <div className="h-14 px-6 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 dark:from-slate-700/50 dark:via-slate-800/50 dark:to-slate-700/50 rounded-2xl border-2 border-slate-200 dark:border-slate-600 flex items-center group-hover:border-green-300 dark:group-hover:border-green-600 group-hover:shadow-xl transition-all duration-300">
                      <span className="text-slate-900 dark:text-white font-bold text-lg">{formData.email}</span>
                    </div>
                  </div>
                  <div className="group space-y-3">
                    <Label htmlFor="phone" className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg"></div>
                      Telefone
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="h-14 px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <div className="h-14 px-6 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 dark:from-slate-700/50 dark:via-slate-800/50 dark:to-slate-700/50 rounded-2xl border-2 border-slate-200 dark:border-slate-600 flex items-center group-hover:border-purple-300 dark:group-hover:border-purple-600 group-hover:shadow-xl transition-all duration-300">
                        <span className="text-slate-900 dark:text-white font-bold text-lg">{formData.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="group space-y-3">
                    <Label htmlFor="location" className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg"></div>
                      Localização
                    </Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="h-14 px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
                        placeholder="Cidade, Estado"
                      />
                    ) : (
                      <div className="h-14 px-6 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 dark:from-slate-700/50 dark:via-slate-800/50 dark:to-slate-700/50 rounded-2xl border-2 border-slate-200 dark:border-slate-600 flex items-center group-hover:border-orange-300 dark:group-hover:border-orange-600 group-hover:shadow-xl transition-all duration-300">
                        <span className="text-slate-900 dark:text-white font-bold text-lg">{formData.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="group space-y-3">
                  <Label htmlFor="bio" className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full shadow-lg"></div>
                    Biografia
                  </Label>
                  {isEditing ? (
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full h-32 p-6 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all duration-300 font-semibold text-lg resize-none shadow-lg hover:shadow-xl"
                      placeholder="Conte um pouco sobre você..."
                    />
                  ) : (
                    <div className="h-32 p-6 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 dark:from-slate-700/50 dark:via-slate-800/50 dark:to-slate-700/50 rounded-2xl border-2 border-slate-200 dark:border-slate-600 flex items-start group-hover:border-pink-300 dark:group-hover:border-pink-600 group-hover:shadow-xl transition-all duration-300">
                      <span className="text-slate-900 dark:text-white font-bold text-lg leading-relaxed">{formData.bio}</span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-6 pt-8 border-t-2 border-slate-200 dark:border-slate-600">
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white rounded-2xl font-black shadow-2xl hover:shadow-3xl transition-all duration-300 px-10 py-5 text-lg transform hover:scale-105"
                    >
                      <Save className="h-6 w-6 mr-3" />
                      Salvar Alterações
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all duration-300 px-10 py-5 text-lg transform hover:scale-105"
                    >
                      <X className="h-6 w-6 mr-3" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Estatísticas */}
          <div className="space-y-8">
            {/* Estatísticas Principais */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white hover:shadow-2xl transition-all duration-300">
              <CardHeader className="p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">
                      Estatísticas
                    </CardTitle>
                    <p className="text-slate-300 text-sm">Seu progresso no ENEM</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-300">Aulas Assistidas</p>
                        <p className="text-xs text-slate-400">Últimos 30 dias</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">24</p>
                      <p className="text-xs text-green-400 font-semibold">+12%</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-300">Flashcards</p>
                        <p className="text-xs text-slate-400">Criados e estudados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">156</p>
                      <p className="text-xs text-green-400 font-semibold">+8%</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-300">Redações</p>
                        <p className="text-xs text-slate-400">Escritas e corrigidas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">8</p>
                      <p className="text-xs text-green-400 font-semibold">+3%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Perfil;
