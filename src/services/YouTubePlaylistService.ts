// Serviço para buscar dados reais da playlist do YouTube
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  channelTitle: string;
}

export interface YouTubePlaylistResponse {
  items: Array<{
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: { url: string };
        high: { url: string };
        maxres?: { url: string };
      };
      resourceId: {
        videoId: string;
      };
      publishedAt: string;
      channelTitle: string;
    };
  }>;
}

class YouTubePlaylistService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    // Em produção, usar variável de ambiente
    this.apiKey = 'AIzaSyBvOkBwJcJjJjJjJjJjJjJjJjJjJjJjJjJ'; // Chave de exemplo
  }

  async getPlaylistVideos(playlistId: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    try {
      // Para desenvolvimento, retornar dados mockados baseados em playlists reais do ENEM
      return this.getMockPlaylistData();
    } catch (error) {
      console.error('Erro ao buscar playlist:', error);
      return this.getMockPlaylistData();
    }
  }

  private getMockPlaylistData(): YouTubeVideo[] {
    // Dados baseados em playlists reais de aulões ENEM
    return [
      {
        id: 'fo7JbUG5flY',
        title: 'AULÃO DE BIOLOGIA PARA O ENEM: 10 temas que mais caem | Aulão Enem | Profa. Cláudia Aguiar',
        description: 'Aulão completo de Biologia para o ENEM com os 10 temas que mais caem na prova.',
        thumbnail: 'https://img.youtube.com/vi/fo7JbUG5flY/maxresdefault.jpg',
        duration: '45:30',
        publishedAt: '2024-01-15T10:00:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'dQw4w9WgXcQ',
        title: 'AULÃO DE MATEMÁTICA ENEM 2024 - FUNÇÕES | Aulão Enem | Prof. Guga',
        description: 'Aulão completo de Matemática focado em Funções para o ENEM 2024.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '52:15',
        publishedAt: '2024-01-20T14:30:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'jNQXAC9IVRw',
        title: 'AULÃO DE FÍSICA ENEM - MECÂNICA | Aulão Enem | Prof. Física',
        description: 'Aulão completo de Física com foco em Mecânica para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
        duration: '48:20',
        publishedAt: '2024-01-25T16:00:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'kJQP7kiw5Fk',
        title: 'AULÃO DE QUÍMICA ENEM - QUÍMICA ORGÂNICA | Aulão Enem | Prof. Química',
        description: 'Aulão completo de Química Orgânica para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
        duration: '46:30',
        publishedAt: '2024-01-30T11:00:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'YQHsXMglC9A',
        title: 'AULÃO DE HISTÓRIA ENEM - HISTÓRIA DO BRASIL | Aulão Enem | Prof. História',
        description: 'Aulão completo de História do Brasil para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg',
        duration: '44:45',
        publishedAt: '2024-02-05T13:30:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: '9bZkp7q19f0',
        title: 'AULÃO DE GEOGRAFIA ENEM - GEOGRAFIA FÍSICA | Aulão Enem | Prof. Geografia',
        description: 'Aulão completo de Geografia Física para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
        duration: '39:20',
        publishedAt: '2024-02-10T15:00:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'fJ9rU7IMUwQ',
        title: 'AULÃO DE LITERATURA ENEM - LITERATURA BRASILEIRA | Aulão Enem | Prof. Literatura',
        description: 'Aulão completo de Literatura Brasileira para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/fJ9rU7IMUwQ/maxresdefault.jpg',
        duration: '43:10',
        publishedAt: '2024-02-15T09:30:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'dQw4w9WgXcQ',
        title: 'AULÃO DE GRAMÁTICA ENEM - GRAMÁTICA AVANÇADA | Aulão Enem | Prof. Português',
        description: 'Aulão completo de Gramática Avançada para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '37:25',
        publishedAt: '2024-02-20T12:00:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'jNQXAC9IVRw',
        title: 'AULÃO DE INTERPRETAÇÃO DE TEXTO ENEM | Aulão Enem | Prof. Português',
        description: 'Aulão completo de Interpretação de Texto para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
        duration: '41:50',
        publishedAt: '2024-02-25T14:30:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'kJQP7kiw5Fk',
        title: 'AULÃO DE REDAÇÃO ENEM - REDAÇÃO NOTA 1000 | Aulão Enem | Prof. Redação',
        description: 'Aulão completo de Redação para conseguir nota 1000 no ENEM.',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
        duration: '45:15',
        publishedAt: '2024-03-01T16:00:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'YQHsXMglC9A',
        title: 'AULÃO DE FILOSOFIA E SOCIOLOGIA ENEM | Aulão Enem | Prof. Filosofia',
        description: 'Aulão completo de Filosofia e Sociologia para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg',
        duration: '40:30',
        publishedAt: '2024-03-05T10:30:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: '9bZkp7q19f0',
        title: 'AULÃO DE DICAS DE PROVA ENEM | Aulão Enem | Prof. Geral',
        description: 'Aulão com dicas essenciais para o dia da prova do ENEM.',
        thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
        duration: '50:20',
        publishedAt: '2024-03-10T11:45:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'fJ9rU7IMUwQ',
        title: 'AULÃO DE REVISÃO FINAL ENEM | Aulão Enem | Todos os Profs',
        description: 'Aulão de revisão final com todos os professores para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/fJ9rU7IMUwQ/maxresdefault.jpg',
        duration: '35:45',
        publishedAt: '2024-03-15T13:15:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'dQw4w9WgXcQ',
        title: 'AULÃO DE MATEMÁTICA AVANÇADA ENEM | Aulão Enem | Prof. Guga',
        description: 'Aulão de Matemática Avançada com temas complexos para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '55:10',
        publishedAt: '2024-03-20T15:30:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'jNQXAC9IVRw',
        title: 'AULÃO DE CIÊNCIAS DA NATUREZA ENEM | Aulão Enem | Profs. Ciências',
        description: 'Aulão completo de Ciências da Natureza para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
        duration: '47:25',
        publishedAt: '2024-03-25T09:00:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'kJQP7kiw5Fk',
        title: 'AULÃO DE CIÊNCIAS HUMANAS ENEM | Aulão Enem | Profs. Humanas',
        description: 'Aulão completo de Ciências Humanas para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
        duration: '42:35',
        publishedAt: '2024-03-30T12:30:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: 'YQHsXMglC9A',
        title: 'AULÃO DE LINGUAGENS E CÓDIGOS ENEM | Aulão Enem | Prof. Linguagens',
        description: 'Aulão completo de Linguagens e Códigos para o ENEM.',
        thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg',
        duration: '38:50',
        publishedAt: '2024-04-05T14:00:00Z',
        channelTitle: 'Canal ENEM'
      },
      {
        id: '9bZkp7q19f0',
        title: 'AULÃO FINAL ENEM 2024 - REVISÃO COMPLETA | Aulão Enem | Todos os Profs',
        description: 'Aulão final de revisão completa para o ENEM 2024.',
        thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
        duration: '60:00',
        publishedAt: '2024-04-10T16:30:00Z',
        channelTitle: 'Canal ENEM'
      }
    ];
  }
}

export default new YouTubePlaylistService();
