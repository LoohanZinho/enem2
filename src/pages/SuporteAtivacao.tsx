"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  BookOpen,
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Shield,
  Key,
  User,
  CreditCard
} from "lucide-react";

const SuporteAtivacao = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    transactionId: '',
    paymentDate: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio do formulário
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  const handleWhatsApp = () => {
    const phoneNumber = '5521996170604';
    const message = `Olá! Preciso de ajuda para ativar minha conta EnemPro.

Dados do pagamento:
- Nome: ${formData.fullName}
- Email: ${formData.email}
- Telefone: ${formData.phone}
- ID da transação: ${formData.transactionId}
- Data: ${formData.paymentDate}

Mensagem: ${formData.message}`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = () => {
    const subject = 'Ativação de Conta EnemPro - Suporte';
    const body = `Olá! Preciso de ajuda para ativar minha conta EnemPro.

Dados do pagamento:
- Nome: ${formData.fullName}
- Email: ${formData.email}
- Telefone: ${formData.phone}
- ID da transação: ${formData.transactionId}
- Data: ${formData.paymentDate}

Mensagem: ${formData.message}`;

    const emailUrl = `mailto:suporte1enempro@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <header className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </header>

        {/* Botão Voltar */}
        <Button
          variant="ghost"
          className="absolute top-4 left-4 z-10"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar à Landing Page
        </Button>

        <main className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="text-center space-y-6 mb-12">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Solicitação Enviada!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Sua solicitação de ativação foi enviada com sucesso. Nossa equipe entrará em contato em breve.
            </p>
          </div>

          <Card className="shadow-2xl border-0 bg-white dark:bg-slate-800 rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Shield className="h-6 w-6" />
                Próximos Passos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">1. Análise</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Verificamos seus dados de pagamento
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
                    <Key className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">2. Ativação</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Geramos sua chave de acesso
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">3. Acesso</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Enviamos suas credenciais
                  </p>
                </div>
              </div>

              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Tempo de resposta:</strong> Até 24 horas úteis. Você receberá um email com suas credenciais de acesso assim que sua conta for ativada.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Voltar ao Site
                </Button>
                <Button
                  onClick={handleWhatsApp}
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </header>

      {/* Botão Voltar */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-10"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar à Landing Page
      </Button>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl">
                <Key className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white leading-tight">
            Ativação de <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">Conta</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Preencha os dados do seu pagamento via Cakto para receber sua chave de ativação
          </p>
          
          {/* Badge de Cakto */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800">
            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Pagamento via Cakto</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card className="shadow-2xl border-0 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Key className="h-6 w-6" />
                  Dados do Pagamento
                </CardTitle>
                <p className="text-blue-100 text-sm mt-2">
                  Informe os dados para ativar sua conta
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome Completo *
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                    required
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(21) 99999-9999"
                    className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                    required
                  />
                </div>

                {/* Informação sobre Cakto */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">Pagamento via Cakto</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        Todos os pagamentos são processados através da plataforma Cakto
                      </p>
                    </div>
                  </div>
                </div>

                {/* ID da Transação */}
                <div className="space-y-2">
                  <Label htmlFor="transactionId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ID da Transação *
                  </Label>
                  <Input
                    id="transactionId"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    placeholder="Ex: TXN123456789"
                    className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                    required
                  />
                </div>

                {/* Data do Pagamento */}
                <div className="space-y-2">
                  <Label htmlFor="paymentDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data do Pagamento *
                  </Label>
                  <Input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                    required
                  />
                </div>

                {/* Mensagem Adicional */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mensagem Adicional
                  </Label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Alguma informação adicional sobre seu pagamento..."
                    rows={4}
                    className="w-full px-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                {/* Botão de Envio */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    "Solicitar Ativação"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informações de Suporte */}
          <div className="space-y-6">
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  Precisa de Ajuda?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Nossa equipe de suporte está pronta para ajudar você a ativar sua conta.
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleWhatsApp}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp: (21) 99617-0604
                  </Button>
                  
                  <Button
                    onClick={handleEmail}
                    variant="outline"
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email: suporte1enempro@gmail.com
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-white dark:bg-slate-800 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Processo de Ativação
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Envio dos Dados</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Preencha o formulário com seus dados de pagamento
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Verificação</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Nossa equipe verifica os dados do pagamento
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Ativação</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Sua conta é ativada e você recebe suas credenciais
                      </p>
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

export default SuporteAtivacao;
