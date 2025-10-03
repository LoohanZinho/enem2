
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Server, Clock, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';

interface WebhookLog {
  id: string;
  receivedAt: string;
  body: any;
}

const WebhookPage = () => {
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Acessar o localStorage é seguro dentro de um useEffect
    const storedWebhooks = localStorage.getItem('webhook_logs');
    if (storedWebhooks) {
      setWebhooks(JSON.parse(storedWebhooks));
    }
    setIsLoading(false);
  }, []);

  const clearWebhooks = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os registros de webhook?')) {
      localStorage.removeItem('webhook_logs');
      setWebhooks([]);
    }
  };

  const getEventName = (body: any): string => {
    const webhookData = Array.isArray(body) ? body[0] : body;
    return webhookData?.event || 'Evento Desconhecido';
  }

  const getStatusColor = (body: any): string => {
    const webhookData = Array.isArray(body) ? body[0] : body;
    const status = webhookData?.data?.status;

    switch (status) {
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <BackButton />
                <div>
                    <h1 className="text-3xl font-bold">Monitor de Webhooks</h1>
                    <p className="text-muted-foreground">Visualize as requisições recebidas em tempo real.</p>
                </div>
            </div>
          <Button onClick={clearWebhooks} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Tudo
          </Button>
        </div>

        {isLoading ? (
          <p>Carregando webhooks...</p>
        ) : webhooks.length === 0 ? (
          <Card className="text-center p-12 border-dashed">
            <CardHeader>
                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Server className="h-8 w-8 text-slate-500" />
                </div>
                <CardTitle>Nenhum Webhook Recebido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aguardando notificações do sistema de pagamento (Cakto). <br/>
                Realize um pagamento de teste para ver os dados aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="shadow-lg overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 border-b">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-sm">
                        {webhook.id}
                    </Badge>
                    <Badge className={getStatusColor(webhook.body)}>
                        {getEventName(webhook.body)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(webhook.receivedAt).toLocaleString('pt-BR')}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                    <pre className="w-full overflow-x-auto bg-slate-900 text-white p-6 text-sm rounded-b-lg">
                        <code>{JSON.stringify(webhook.body, null, 2)}</code>
                    </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WebhookPage;
