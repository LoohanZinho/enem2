// Serviço para gerenciar conteúdo do usuário (redações, flashcards, etc.)
import DatabaseService, { Essay, Flashcard, Schedule, Note } from './DatabaseService';

class ContentService {
  private static instance: ContentService;
  private db = DatabaseService.getInstance();

  public static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService();
    }
    return ContentService.instance;
  }

  // ===== REDAÇÕES =====

  async createEssay(userId: string, essayData: {
    title: string;
    content: string;
    subject: string;
    grade?: number;
    feedback?: string;
  }): Promise<Essay> {
    return await this.db.createEssay(userId, essayData);
  }

  async getUserEssays(userId: string): Promise<Essay[]> {
    return await this.db.getUserEssays(userId);
  }

  async updateEssay(userId: string, essayId: string, updates: Partial<Essay>): Promise<Essay> {
    return await this.db.updateEssay(userId, essayId, updates);
  }

  async deleteEssay(userId: string, essayId: string): Promise<void> {
    return await this.db.deleteEssay(userId, essayId);
  }

  // ===== FLASHCARDS =====

  async createFlashcard(userId: string, flashcardData: {
    front: string;
    back: string;
    subject: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }): Promise<Flashcard> {
    return await this.db.createFlashcard(userId, flashcardData);
  }

  async getUserFlashcards(userId: string): Promise<Flashcard[]> {
    return await this.db.getUserFlashcards(userId);
  }

  async updateFlashcard(userId: string, flashcardId: string, updates: Partial<Flashcard>): Promise<Flashcard> {
    return await this.db.updateFlashcard(userId, flashcardId, updates);
  }

  async deleteFlashcard(userId: string, flashcardId: string): Promise<void> {
    return await this.db.deleteFlashcard(userId, flashcardId);
  }

  async reviewFlashcard(userId: string, flashcardId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<Flashcard> {
    const flashcard = await this.db.getUserFlashcards(userId).then(flashcards => 
      flashcards.find(f => f.id === flashcardId)
    );

    if (!flashcard) {
      throw new Error('Flashcard não encontrado');
    }

    return await this.db.updateFlashcard(userId, flashcardId, {
      difficulty,
      lastReviewed: new Date().toISOString(),
      reviewCount: flashcard.reviewCount + 1
    });
  }

  // ===== CRONOGRAMA =====

  async createSchedule(userId: string, scheduleData: {
    title: string;
    description: string;
    date: string;
    time: string;
    subject: string;
    completed?: boolean;
  }): Promise<Schedule> {
    return await this.db.createSchedule(userId, {
      ...scheduleData,
      completed: scheduleData.completed || false
    });
  }

  async getUserSchedules(userId: string): Promise<Schedule[]> {
    return await this.db.getUserSchedules(userId);
  }

  async updateSchedule(userId: string, scheduleId: string, updates: Partial<Schedule>): Promise<Schedule> {
    return await this.db.updateSchedule(userId, scheduleId, updates);
  }

  async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
    return await this.db.deleteSchedule(userId, scheduleId);
  }

  async toggleScheduleComplete(userId: string, scheduleId: string): Promise<Schedule> {
    const schedule = await this.db.getUserSchedules(userId).then(schedules => 
      schedules.find(s => s.id === scheduleId)
    );

    if (!schedule) {
      throw new Error('Cronograma não encontrado');
    }

    return await this.db.updateSchedule(userId, scheduleId, {
      completed: !schedule.completed
    });
  }

  // ===== ANOTAÇÕES =====

  async createNote(userId: string, noteData: {
    title: string;
    content: string;
    subject: string;
  }): Promise<Note> {
    return await this.db.createNote(userId, noteData);
  }

  async getUserNotes(userId: string): Promise<Note[]> {
    return await this.db.getUserNotes(userId);
  }

  async updateNote(userId: string, noteId: string, updates: Partial<Note>): Promise<Note> {
    return await this.db.updateNote(userId, noteId, updates);
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    return await this.db.deleteNote(userId, noteId);
  }

  // ===== ESTATÍSTICAS =====

  async getUserStats(userId: string): Promise<{
    essaysCount: number;
    flashcardsCount: number;
    schedulesCount: number;
    notesCount: number;
    completedSchedules: number;
    totalReviews: number;
  }> {
    const [essays, flashcards, schedules, notes] = await Promise.all([
      this.db.getUserEssays(userId),
      this.db.getUserFlashcards(userId),
      this.db.getUserSchedules(userId),
      this.db.getUserNotes(userId)
    ]);

    return {
      essaysCount: essays.length,
      flashcardsCount: flashcards.length,
      schedulesCount: schedules.length,
      notesCount: notes.length,
      completedSchedules: schedules.filter(s => s.completed).length,
      totalReviews: flashcards.reduce((sum, f) => sum + f.reviewCount, 0)
    };
  }

  // ===== BUSCA =====

  async searchContent(userId: string, query: string): Promise<{
    essays: Essay[];
    flashcards: Flashcard[];
    schedules: Schedule[];
    notes: Note[];
  }> {
    const [essays, flashcards, schedules, notes] = await Promise.all([
      this.db.getUserEssays(userId),
      this.db.getUserFlashcards(userId),
      this.db.getUserSchedules(userId),
      this.db.getUserNotes(userId)
    ]);

    const searchTerm = query.toLowerCase();

    return {
      essays: essays.filter(essay => 
        essay.title.toLowerCase().includes(searchTerm) ||
        essay.content.toLowerCase().includes(searchTerm) ||
        essay.subject.toLowerCase().includes(searchTerm)
      ),
      flashcards: flashcards.filter(flashcard => 
        flashcard.front.toLowerCase().includes(searchTerm) ||
        flashcard.back.toLowerCase().includes(searchTerm) ||
        flashcard.subject.toLowerCase().includes(searchTerm)
      ),
      schedules: schedules.filter(schedule => 
        schedule.title.toLowerCase().includes(searchTerm) ||
        schedule.description.toLowerCase().includes(searchTerm) ||
        schedule.subject.toLowerCase().includes(searchTerm)
      ),
      notes: notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm) ||
        note.subject.toLowerCase().includes(searchTerm)
      )
    };
  }

  // ===== BACKUP E RESTAURAÇÃO =====

  async exportUserData(userId: string): Promise<{
    essays: Essay[];
    flashcards: Flashcard[];
    schedules: Schedule[];
    notes: Note[];
    exportDate: string;
  }> {
    const [essays, flashcards, schedules, notes] = await Promise.all([
      this.db.getUserEssays(userId),
      this.db.getUserFlashcards(userId),
      this.db.getUserSchedules(userId),
      this.db.getUserNotes(userId)
    ]);

    return {
      essays,
      flashcards,
      schedules,
      notes,
      exportDate: new Date().toISOString()
    };
  }

  async importUserData(userId: string, data: {
    essays?: Essay[];
    flashcards?: Flashcard[];
    schedules?: Schedule[];
    notes?: Note[];
  }): Promise<void> {
    const promises: Promise<any>[] = [];

    if (data.essays) {
      data.essays.forEach(essay => {
        promises.push(this.db.createEssay(userId, {
          title: essay.title,
          content: essay.content,
          subject: essay.subject,
          grade: essay.grade,
          feedback: essay.feedback
        }));
      });
    }

    if (data.flashcards) {
      data.flashcards.forEach(flashcard => {
        promises.push(this.db.createFlashcard(userId, {
          front: flashcard.front,
          back: flashcard.back,
          subject: flashcard.subject,
          difficulty: flashcard.difficulty
        }));
      });
    }

    if (data.schedules) {
      data.schedules.forEach(schedule => {
        promises.push(this.db.createSchedule(userId, {
          title: schedule.title,
          description: schedule.description,
          date: schedule.date,
          time: schedule.time,
          subject: schedule.subject,
          completed: schedule.completed
        }));
      });
    }

    if (data.notes) {
      data.notes.forEach(note => {
        promises.push(this.db.createNote(userId, {
          title: note.title,
          content: note.content,
          subject: note.subject
        }));
      });
    }

    await Promise.all(promises);
  }
}

export default ContentService;

    