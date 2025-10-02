"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";

interface ResumoModule {
  id: string;
  name: string;
  materia: string;
  description: string;
  color: string;
  progress: number;
  totalResumos: number;
  resumosCompletados: number;
  subModules: ResumoSubModule[];
  topics: string[];
}

interface ResumoSubModule {
  id: string;
  name: string;
  description: string;
  progress: number;
  resumoCount: number;
  resumos: any[];
}

const Resumos = () => {
  const router = useRouter();

  // Pack de Resumos Completo
  const resumoModules = useMemo((): ResumoModule[] => [
    {
      id: 'pack-completo',
      name: 'Pack de Resumos ENEM',
      materia: 'Todas as Matérias',
      description: 'Pack completo com resumos de todas as matérias do ENEM organizados por pasta',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      progress: 100,
      totalResumos: 10,
      resumosCompletados: 10,
      subModules: [
        { id: 'artes', name: 'Artes', description: 'Resumos de Artes', progress: 100, resumoCount: 1, resumos: [] },
        { id: 'biologia', name: 'Biologia', description: 'Resumos de Biologia', progress: 100, resumoCount: 1, resumos: [] },
        { id: 'filosofia', name: 'Filosofia', description: 'Resumos de Filosofia', progress: 100, resumoCount: 1, resumos: [] },
        { id: 'fisica', name: 'Física', description: 'Resumos de Física', progress: 100, resumoCount: 1, resumos: [] },
        { id: 'geografia', name: 'Geografia', description: 'Resumos de Geografia', progress: 100, resumoCount: 1, resumos: [] },
        { id: 'historia', name: 'História', description: 'Resumos de História', progress: 100, resumoCount: 1, resumos: [] },
        { id: 'literatura', name: 'Literatura', description: 'Resumos de Literatura', progress: 100, resumoCount: 1, resumos: [] },
        { id: 'matematica', name: 'Matemática', description: 'Resumos de Matemática', progress: 100, resumoCount: 1, resumos: [] },
        { id: 'quimica', name: 'Química', description: 'Resumos de Química', progress: 100, resumoCount: 1, resumos: [] },
        { id: 'sociologia', name: 'Sociologia', description: 'Resumos de Sociologia', progress: 100, resumoCount: 1, resumos: [] }
      ],
      topics: ['ENEM', 'resumos', 'completo', 'todas as matérias']
    }
  ], []);

  const handleModuleSelect = (module: ResumoModule) => {
    // Redirecionar para o Google Drive
    window.open('https://drive.google.com/drive/folders/1w47qGyzFdY6jcBIPuLZLYeT7sps-cCpS', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <BackButton 
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-200">
                Resumos
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1 transition-colors duration-200">
                Pack completo de resumos de todas as matérias do ENEM
              </p>
            </div>
          </div>
        </div>

        {/* Card Principal do Pack de Resumos */}
        <div className="mt-6">
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <Card 
                className="group cursor-pointer hover:shadow-2xl transition-all duration-700 transform hover:scale-[1.01] border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                onClick={() => handleModuleSelect(resumoModules[0])}
              >
                <CardHeader className="relative overflow-hidden p-0">
                  <div className="h-80 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    {/* Overlay sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    {/* Elementos decorativos minimalistas */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {/* Grid pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="h-full w-full" style={{
                          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                          backgroundSize: '20px 20px'
                        }}></div>
                      </div>
                      
                      {/* Ícone principal */}
                      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-24 h-24 text-white/20">
                        <FileText className="w-full h-full drop-shadow-2xl" />
                    </div>

                      {/* Texto principal */}
                      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 text-white/10 text-6xl font-black">
                        RESUMOS
                    </div>

                      {/* Elementos decorativos minimalistas */}
                      <div className="absolute top-8 left-8 w-2 h-2 bg-white/20 rounded-full"></div>
                      <div className="absolute top-8 right-8 w-2 h-2 bg-white/20 rounded-full"></div>
                      <div className="absolute top-16 left-12 w-1 h-1 bg-white/30 rounded-full"></div>
                      <div className="absolute top-16 right-12 w-1 h-1 bg-white/30 rounded-full"></div>
                      <div className="absolute top-24 left-16 w-1.5 h-1.5 bg-white/25 rounded-full"></div>
                      <div className="absolute top-24 right-16 w-1.5 h-1.5 bg-white/25 rounded-full"></div>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                          <span className="text-white/80 text-sm font-medium">Disponível</span>
              </div>
              
                        <h3 className="text-5xl font-black text-white mb-2">{resumoModules[0].name}</h3>
                        <p className="text-white/90 text-xl font-medium max-w-2xl">{resumoModules[0].description}</p>
                        
                        <div className="flex items-center gap-3 text-white/80">
                          <FileText className="h-5 w-5" />
                          <span className="font-medium">10 matérias • Pack completo</span>
                        </div>
                      </div>
                    </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-12">
                  <div className="text-center space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Pack Completo de Resumos ENEM
                      </h2>
                      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                        Resumos organizados de todas as matérias do ENEM. 
                        Acesso direto via Google Drive para download imediato.
                      </p>
                    </div>

                    {/* Botão de Download */}
                    <div className="pt-6">
                      <Button 
                          size="lg"
                          className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-12 py-6 text-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg"
                          onClick={() => handleModuleSelect(resumoModules[0])}
                        >
                          <Download className="h-5 w-5 mr-3" />
                          Acessar Pack de Resumos
                      </Button>
                    </div>
                    </div>
                  </CardContent>
                </Card>
            </div>
                </div>
              </div>
      </main>
    </div>
  );
};

export default Resumos;
