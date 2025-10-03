"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bell,
  Menu,
  BookOpen,
  Target,
  User,
  CheckSquare,
  FileText,
  Brain,
  Award,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronDown,
  X
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from 'next/link';
import { useAuth } from "@/hooks/useAuth.tsx";

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

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path) ?? false;
  };

  const navLinks = [
    { href: "/cronograma", label: "Cronograma" },
    { href: "/aulas", label: "Aulas" },
    { href: "/resumos", label: "Resumos", icon: <FileText className="h-4 w-4 mr-2" /> },
    { href: "/flashcards", label: "Flashcards", icon: <Brain className="h-4 w-4 mr-2" /> },
    { href: "/redacao", label: "Redação" },
    { href: "/calendario", label: "Calendário" },
    { href: "/monitor-tarefas", label: "Tarefas", icon: <CheckSquare className="h-4 w-4 mr-1" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 relative group">
            {/* Logo Icon com efeitos melhorados */}
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <BookOpen className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              {/* Efeito de brilho */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Sombra interna */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-black/20"></div>
            </div>
            
            {/* Texto da logo com gradiente melhorado */}
            <div className="relative">
              <span className="font-black text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-indigo-600 transition-all duration-300">
                EnemPro
              </span>
              {/* Efeito de brilho no texto */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent opacity-0 group-hover:opacity-30 blur-sm transition-all duration-300">
                EnemPro
              </div>
            </div>
            
            {/* Indicador de página ativa melhorado */}
            {isActive('/') && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-background animate-pulse shadow-lg"></div>
            )}
          </div>
          
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map(link => (
              <div className="relative" key={link.href}>
                <Button 
                  variant={isActive(link.href) ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => router.push(link.href)}
                  className={`transition-all duration-200 ${isActive(link.href) ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground"}`}
                >
                  {link.icon}{link.label}
                </Button>
                {isActive(link.href) && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-background animate-pulse"></div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <NotificationCenter />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{user.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-warning" />
                  <span className="text-xs text-muted-foreground">Nível 12</span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:shadow-lg"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar || "/placeholder-avatar.jpg"} />
                      <AvatarFallback className="bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold">
                        {getInitials(user.name) || <UserIcon className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-warning" />
                          <span className="text-xs text-muted-foreground">Nível 12</span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => router.push('/perfil')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => router.push('/configuracoes')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/login')}
              >
                Entrar
              </Button>
            </div>
          )}

          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg">
                           <BookOpen className="h-6 w-6 text-white" />
                         </div>
                         <span className="font-black text-2xl bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                          EnemPro
                        </span>
                      </div>
                       <SheetClose asChild>
                        <Button variant="ghost" size="icon">
                          <X className="h-5 w-5" />
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 p-6 space-y-3">
                  {navLinks.map(link => (
                    <SheetClose asChild key={link.href}>
                      <Button 
                        variant={isActive(link.href) ? "default" : "ghost"} 
                        onClick={() => {
                          router.push(link.href);
                          setIsSheetOpen(false);
                        }}
                        className="w-full justify-start text-base py-6"
                      >
                        {link.icon}{link.label}
                      </Button>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
