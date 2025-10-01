import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Camera, 
  FileImage, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download,
  RotateCcw,
  Settings
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import AdvancedOCRService, { OCRResult } from '@/services/AdvancedOCRService';

interface HandwrittenEssayUploadProps {
  onTextExtracted: (text: string, confidence: number) => void;
  className?: string;
}

const HandwrittenEssayUpload: React.FC<HandwrittenEssayUploadProps> = ({ 
  onTextExtracted, 
  className 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    enhanceContrast: true,
    removeNoise: true,
    deskew: true,
    resize: true,
    confidence: 0.7
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const ocrService = AdvancedOCRService.getInstance();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setOcrResult(null);

    try {
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      // Processar com OCR
      const result = await ocrService.processImage(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setOcrResult(result);
      
      // Processar texto extraído
      const processed = ocrService.processExtractedText(result);
      
      // Chamar callback com resultado
      onTextExtracted(processed.cleanText, result.confidence);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar imagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const retryProcessing = () => {
    if (fileInputRef.current?.files?.[0]) {
      processImage(fileInputRef.current.files[0]);
    }
  };

  const downloadText = () => {
    if (ocrResult) {
      const blob = new Blob([ocrResult.text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'redacao-extraida.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    ocrService.updateConfig({
      preprocessing: {
        enhanceContrast: newConfig.enhanceContrast,
        removeNoise: newConfig.removeNoise,
        deskew: newConfig.deskew,
        resize: newConfig.resize,
        targetWidth: 1200,
        targetHeight: 1600
      }
    });
  };

  return (
    <div className={className}>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Redação Manuscrita</h3>
            <p className="text-sm text-muted-foreground">
              Faça upload de uma foto da sua redação manuscrita para correção automática
            </p>
          </div>
          
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações de OCR</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Melhorar Contraste</label>
                  <Switch
                    checked={config.enhanceContrast}
                    onCheckedChange={(checked) => updateConfig('enhanceContrast', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Remover Ruído</label>
                  <Switch
                    checked={config.removeNoise}
                    onCheckedChange={(checked) => updateConfig('removeNoise', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Corrigir Inclinação</label>
                  <Switch
                    checked={config.deskew}
                    onCheckedChange={(checked) => updateConfig('deskew', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Redimensionar Imagem</label>
                  <Switch
                    checked={config.resize}
                    onCheckedChange={(checked) => updateConfig('resize', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confiança Mínima: {Math.round(config.confidence * 100)}%
                  </label>
                  <Slider
                    value={[config.confidence]}
                    onValueChange={([value]) => updateConfig('confidence', value)}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {!previewImage ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">Upload de Arquivo</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione uma imagem da sua redação
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Escolher Arquivo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">Capturar Foto</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Tire uma foto da sua redação
                </p>
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Abrir Câmera
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                />
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Dicas para melhor resultado:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Use boa iluminação e evite sombras</li>
                  <li>• Mantenha a câmera paralela ao papel</li>
                  <li>• Certifique-se de que o texto está legível</li>
                  <li>• Evite reflexos e dobras no papel</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processando imagem...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={retryProcessing}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Tentar Novamente
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {ocrResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Texto Extraído com Sucesso!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {Math.round(ocrResult.confidence * 100)}% confiança
                    </Badge>
                    <Badge variant="outline">
                      {ocrResult.provider}
                    </Badge>
                  </div>
                </div>

                <Tabs defaultValue="preview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="preview">Visualizar</TabsTrigger>
                    <TabsTrigger value="text">Texto Extraído</TabsTrigger>
                    <TabsTrigger value="analysis">Análise</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="space-y-4">
                    <div className="relative">
                      <img 
                        src={previewImage!} 
                        alt="Redação manuscrita" 
                        className="w-full max-h-96 object-contain rounded-lg border"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPreviewImage(null)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Nova Imagem
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Texto Extraído</h4>
                      <Button variant="outline" size="sm" onClick={downloadText}>
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">
                        {ocrResult.text}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {ocrResult.text.split(/\s+/).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Palavras</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {ocrResult.text.split('\n\n').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Parágrafos</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {Math.round(ocrResult.confidence * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Confiança</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {ocrResult.processingTime}ms
                        </div>
                        <div className="text-sm text-muted-foreground">Tempo</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default HandwrittenEssayUpload;
