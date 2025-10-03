"use client";
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Settings, Clock, Star, AlertTriangle, BookOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import NotificationService, { Notification, NotificationPreferences } from '@/services/NotificationService';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, []);

  const loadNotifications = () => {
    setNotifications(notificationService.getNotifications());
  };

  const loadPreferences = () => {
    setPreferences(notificationService.getPreferences());
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleDeleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
    loadNotifications();
  };

  const handleClearAll = () => {
    notificationService.clearAllNotifications();
    loadNotifications();
  };

  const handleUpdatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    if (preferences) {
      const updated = { ...preferences, ...newPreferences };
      notificationService.updatePreferences(updated);
      setPreferences(updated);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'achievement': return <Star className="h-4 w-4" />;
      case 'study': return <BookOpen className="h-4 w-4" />;
      case 'simulado': return <Target className="h-4 w-4" />;
      case 'motivation': return <Star className="h-4 w-4" />;
      case 'deadline': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configurações de Notificação</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {preferences && (
                        <>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Lembretes de Estudo</label>
                            <Switch
                              checked={preferences.studyReminders}
                              onCheckedChange={(checked) => 
                                handleUpdatePreferences({ studyReminders: checked })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Alertas de Conquistas</label>
                            <Switch
                              checked={preferences.achievementAlerts}
                              onCheckedChange={(checked) => 
                                handleUpdatePreferences({ achievementAlerts: checked })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Lembretes de Simulado</label>
                            <Switch
                              checked={preferences.simuladoReminders}
                              onCheckedChange={(checked) => 
                                handleUpdatePreferences({ simuladoReminders: checked })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Mensagens Motivacionais</label>
                            <Switch
                              checked={preferences.motivationMessages}
                              onCheckedChange={(checked) => 
                                handleUpdatePreferences({ motivationMessages: checked })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Alertas de Prazo</label>
                            <Switch
                              checked={preferences.deadlineAlerts}
                              onCheckedChange={(checked) => 
                                handleUpdatePreferences({ deadlineAlerts: checked })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Frequência</label>
                            <Select
                              value={preferences.frequency}
                              onValueChange={(value: 'low' | 'medium' | 'high') => 
                                handleUpdatePreferences({ frequency: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="medium">Média</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-96">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`p-3 transition-all hover:shadow-md ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Marcar
                              </Button>
                            )}
                            
                            {notification.actionUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                  window.location.href = notification.actionUrl!;
                                  setIsOpen(false);
                                }}
                              >
                                {notification.actionText || 'Abrir'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <>
              <Separator />
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Todas
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationCenter;
