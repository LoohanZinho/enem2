import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Plus,
  Star,
  MessageCircle,
  Users,
  Bot,
  BookOpen,
  Clock
} from 'lucide-react';
import ChatService, { Message, ChatRoom, Tutor } from '@/services/ChatService';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = ChatService.getInstance();

  useEffect(() => {
    loadData();
    setupEventListeners();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = () => {
    const roomsData = chatService.getRooms();
    const tutorsData = chatService.getTutors();
    setRooms(roomsData);
    setTutors(tutorsData);
    
    if (roomsData.length > 0) {
      setCurrentRoom(roomsData[0]);
      setMessages(chatService.getMessages(roomsData[0].id));
    }
  };

  const setupEventListeners = () => {
    chatService.on('messageSent', (message: Message, roomId: string) => {
      if (roomId === currentRoom?.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    chatService.on('messageReceived', (message: Message, roomId: string) => {
      if (roomId === currentRoom?.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    chatService.on('roomChanged', (room: ChatRoom) => {
      setCurrentRoom(room);
      setMessages(chatService.getMessages(room.id));
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentRoom) return;

    const message = chatService.sendMessage(currentRoom.id, newMessage);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRoomSelect = (room: ChatRoom) => {
    chatService.enterRoom(room.id);
    setCurrentRoom(room);
    setMessages(chatService.getMessages(room.id));
  };

  const handleTutorSelect = (tutor: Tutor) => {
    const room = chatService.startTutorChat(tutor.id);
    setRooms(prev => [...prev, room]);
    handleRoomSelect(room);
    setShowTutorModal(false);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'question': return <MessageCircle className="h-4 w-4" />;
      case 'answer': return <Bot className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex h-[600px] ${className}`}>
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Conversas</h3>
            <Dialog open={showTutorModal} onOpenChange={setShowTutorModal}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Escolher Tutor</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {tutors.map(tutor => (
                    <Card 
                      key={tutor.id} 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTutorSelect(tutor)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={tutor.avatar} />
                          <AvatarFallback>{tutor.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{tutor.name}</h4>
                            {tutor.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{tutor.bio}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {tutor.subjects.join(', ')}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {tutor.rating}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredRooms.map(room => (
              <div
                key={room.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentRoom?.id === room.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleRoomSelect(room)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={room.participants[0]?.avatar} />
                      <AvatarFallback>
                        {room.type === 'ai' ? <Bot className="h-5 w-5" /> :
                         room.type === 'group' ? <Users className="h-5 w-5" /> :
                         <MessageCircle className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    {room.participants[0]?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">{room.name}</h4>
                      {room.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {room.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {room.lastMessage?.content || 'Nenhuma mensagem'}
                    </p>
                    {room.lastMessage && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(room.lastMessage.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={currentRoom.participants[0]?.avatar} />
                    <AvatarFallback>
                      {currentRoom.type === 'ai' ? <Bot className="h-5 w-5" /> :
                       currentRoom.type === 'group' ? <Users className="h-5 w-5" /> :
                       <MessageCircle className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{currentRoom.name}</h3>
                    {currentRoom.subject && (
                      <Badge variant="outline" className="text-xs">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {currentRoom.subject}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className={`max-w-[70%] ${
                      message.sender === 'user' ? 'items-end' : 'items-start'
                    } flex flex-col`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.senderName}</span>
                        {getMessageIcon(message.type)}
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      
                      <div className={`rounded-lg px-3 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {message.subject && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {message.subject}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
