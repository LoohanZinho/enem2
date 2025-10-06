"use client";
import Header from "@/components/Header";
import { BookOpen } from "lucide-react";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            Em Breve
          </h1>
          <p className="mt-6 text-base leading-7 text-slate-600 dark:text-slate-400">
            A funcionalidade de flashcards está sendo aprimorada e estará disponível em breve.
          </p>
        </div>
      </main>
    </div>
  );
}
