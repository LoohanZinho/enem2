// Sistema de Chat em Tempo Real para ENEM Pro
// Chat com tutores, IA e outros estudantes

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'tutor' | 'ai' | 'system';
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'question' | 'answer';
  subject?: string;
  isRead: boolean;
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'tutor' | 'group' | 'ai' | 'subject';
  subject?: string;
  participants: ChatParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'student' | 'tutor' | 'ai' | 'moderator';
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Tutor {
  id: string;
  name: string;
  avatar?: string;
  subjects: string[];
  rating: number;
  totalStudents: number;
  isOnline: boolean;
  specialties: string[];
  bio: string;
}

export class ChatService {
  private static instance: ChatService;
  private messages: Map<string, Message[]> = new Map();
  private rooms: ChatRoom[] = [];
  private tutors: Tutor[] = [];
  private currentRoomId: string | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  constructor() {
    this.initializeData();
  }

  // Inicializar dados de exemplo
  private initializeData(): void {
    // Tutores disponíveis
    this.tutors = [
      {
        id: 'tutor1',
        name: 'Prof. Ana Silva',
        avatar: '/avatars/ana-silva.jpg',
        subjects: ['Matemática', 'Física'],
        rating: 4.9,
        totalStudents: 150,
        isOnline: true,
        specialties: ['Álgebra', 'Geometria', 'Cálculo'],
        bio: 'Professora com 10 anos de experiência em preparação para ENEM'
      },
      {
        id: 'tutor2',
        name: 'Prof. Carlos Lima',
        avatar: '/avatars/carlos-lima.jpg',
        subjects: ['Português', 'Literatura'],
        rating: 4.8,
        totalStudents: 120,
        isOnline: true,
        specialties: ['Redação', 'Interpretação de Texto', 'Gramática'],
        bio: 'Especialista em redação ENEM e literatura brasileira'
      },
      {
        id: 'tutor3',
        name: 'Prof. Maria Santos',
        avatar: '/avatars/maria-santos.jpg',
        subjects: ['História', 'Geografia'],
        rating: 4.7,
        totalStudents: 100,
        isOnline: false,
        specialties: ['História do Brasil', 'Geografia Física', 'Atualidades'],
        bio: 'Mestra em História e especialista em questões de atualidades'
      }
    ];

    // Salas de chat
    this.rooms = [
      {
        id: 'ai-chat',
        name: 'Assistente IA',
        type: 'ai',
        participants: [
          {
            id: 'ai',
            name: 'Assistente IA',
            avatar: '/avatars/ai.jpg',
            role: 'ai',
            isOnline: true
          }
        ],
        unreadCount: 0,
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'math-group',
        name: 'Matemática - Grupo de Estudos',
        type: 'group',
        subject: 'Matemática',
        participants: [
          {
            id: 'user1',
            name: 'João Silva',
            avatar: '/avatars/joao.jpg',
            role: 'student',
            isOnline: true
          },
          {
            id: 'user2',
            name: 'Maria Costa',
            avatar: '/avatars/maria.jpg',
            role: 'student',
            isOnline: false
          }
        ],
        unreadCount: 2,
        isActive: true,
        createdAt: new Date()
      }
    ];

    // Mensagens de exemplo
    this.messages.set('ai-chat', [
      {
        id: 'msg1',
        content: 'Olá! Sou seu assistente de estudos. Como posso ajudar você hoje?',
        sender: 'ai',
        senderName: 'Assistente IA',
        senderAvatar: '/avatars/ai.jpg',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
        isRead: true
      }
    ]);

    this.messages.set('math-group', [
      {
        id: 'msg2',
        content: 'Alguém pode me ajudar com essa questão de geometria?',
        sender: 'user',
        senderName: 'João Silva',
        senderAvatar: '/avatars/joao.jpg',
        timestamp: new Date(Date.now() - 1800000),
        type: 'question',
        subject: 'Matemática',
        isRead: true
      },
      {
        id: 'msg3',
        content: 'Claro! Qual é a questão?',
        sender: 'user',
        senderName: 'Maria Costa',
        senderAvatar: '/avatars/maria.jpg',
        timestamp: new Date(Date.now() - 1200000),
        type: 'text',
        isRead: false
      }
    ]);
  }

  // Obter todas as salas
  getRooms(): ChatRoom[] {
    return this.rooms;
  }

  // Obter sala atual
  getCurrentRoom(): ChatRoom | null {
    if (!this.currentRoomId) return null;
    return this.rooms.find(room => room.id === this.currentRoomId) || null;
  }

  // Entrar em uma sala
  enterRoom(roomId: string): void {
    this.currentRoomId = roomId;
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      room.unreadCount = 0;
      this.emit('roomChanged', room);
    }
  }

  // Obter mensagens de uma sala
  getMessages(roomId: string): Message[] {
    return this.messages.get(roomId) || [];
  }

  // Enviar mensagem
  sendMessage(roomId: string, content: string, type: 'text' | 'question' = 'text', subject?: string): Message {
    const message: Message = {
      id: this.generateId(),
      content,
      sender: 'user',
      senderName: 'Você',
      senderAvatar: '/avatars/user.jpg',
      timestamp: new Date(),
      type,
      subject,
      isRead: true
    };

    const roomMessages = this.messages.get(roomId) || [];
    roomMessages.push(message);
    this.messages.set(roomId, roomMessages);

    // Atualizar última mensagem da sala
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      room.lastMessage = message;
    }

    this.emit('messageSent', message, roomId);

    // Simular resposta automática para IA
    if (roomId === 'ai-chat') {
      setTimeout(() => {
        this.sendAIResponse(roomId, content);
      }, 1000);
    }

    return message;
  }

  // Enviar resposta da IA
  private sendAIResponse(roomId: string, userMessage: string): void {
    const aiResponse = this.generateAIResponse(userMessage);
    const message: Message = {
      id: this.generateId(),
      content: aiResponse,
      sender: 'ai',
      senderName: 'Assistente IA',
      senderAvatar: '/avatars/ai.jpg',
      timestamp: new Date(),
      type: 'answer',
      isRead: false
    };

    const roomMessages = this.messages.get(roomId) || [];
    roomMessages.push(message);
    this.messages.set(roomId, roomMessages);

    this.emit('messageReceived', message, roomId);
  }

  // Gerar resposta da IA
  private generateAIResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('matemática') || message.includes('matematica')) {
      return 'Para matemática, recomendo focar em álgebra e geometria. Que tópico específico você gostaria de estudar?';
    }
    
    if (message.includes('redação') || message.includes('redacao')) {
      return 'Para redação, lembre-se da estrutura: introdução, desenvolvimento e conclusão. Qual competência você quer trabalhar?';
    }
    
    if (message.includes('física') || message.includes('fisica')) {
      return 'Física é uma matéria que exige muito exercício. Vamos começar com mecânica ou termodinâmica?';
    }
    
    if (message.includes('história') || message.includes('historia')) {
      return 'História do Brasil é muito cobrada no ENEM. Que período você quer revisar?';
    }
    
    if (message.includes('ajuda') || message.includes('help')) {
      return 'Estou aqui para ajudar! Posso esclarecer dúvidas sobre qualquer matéria do ENEM. O que você gostaria de saber?';
    }
    
    return 'Entendi sua dúvida. Vou te ajudar a encontrar a melhor forma de estudar esse conteúdo. Pode me dar mais detalhes?';
  }

  // Obter tutores disponíveis
  getTutors(): Tutor[] {
    return this.tutors;
  }

  // Obter tutores por matéria
  getTutorsBySubject(subject: string): Tutor[] {
    return this.tutors.filter(tutor => 
      tutor.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))
    );
  }

  // Iniciar chat com tutor
  startTutorChat(tutorId: string): ChatRoom {
    const tutor = this.tutors.find(t => t.id === tutorId);
    if (!tutor) throw new Error('Tutor não encontrado');

    const roomId = `tutor-${tutorId}`;
    const existingRoom = this.rooms.find(r => r.id === roomId);
    
    if (existingRoom) {
      return existingRoom;
    }

    const newRoom: ChatRoom = {
      id: roomId,
      name: `Chat com ${tutor.name}`,
      type: 'tutor',
      participants: [
        {
          id: 'user',
          name: 'Você',
          avatar: '/avatars/user.jpg',
          role: 'student',
          isOnline: true
        },
        {
          id: tutorId,
          name: tutor.name,
          avatar: tutor.avatar,
          role: 'tutor',
          isOnline: tutor.isOnline
        }
      ],
      unreadCount: 0,
      isActive: true,
      createdAt: new Date()
    };

    this.rooms.push(newRoom);
    this.messages.set(roomId, []);

    return newRoom;
  }

  // Criar sala de grupo
  createGroupRoom(name: string, subject: string, participants: ChatParticipant[]): ChatRoom {
    const roomId = this.generateId();
    const newRoom: ChatRoom = {
      id: roomId,
      name,
      type: 'group',
      subject,
      participants,
      unreadCount: 0,
      isActive: true,
      createdAt: new Date()
    };

    this.rooms.push(newRoom);
    this.messages.set(roomId, []);

    return newRoom;
  }

  // Adicionar reação a mensagem
  addReaction(roomId: string, messageId: string, emoji: string, userId: string): void {
    const messages = this.messages.get(roomId);
    if (!messages) return;

    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    if (!message.reactions) {
      message.reactions = [];
    }

    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
      if (existingReaction.users.includes(userId)) {
        // Remover reação
        existingReaction.users = existingReaction.users.filter(id => id !== userId);
        existingReaction.count--;
        if (existingReaction.count === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        // Adicionar reação
        existingReaction.users.push(userId);
        existingReaction.count++;
      }
    } else {
      // Nova reação
      message.reactions.push({
        emoji,
        count: 1,
        users: [userId]
      });
    }

    this.emit('reactionAdded', { roomId, messageId, emoji, userId });
  }

  // Marcar mensagens como lidas
  markAsRead(roomId: string, messageIds: string[]): void {
    const messages = this.messages.get(roomId);
    if (!messages) return;

    messages.forEach(message => {
      if (messageIds.includes(message.id)) {
        message.isRead = true;
      }
    });

    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      room.unreadCount = messages.filter(m => !m.isRead).length;
    }
  }

  // Event listeners
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(...args));
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default ChatService;
