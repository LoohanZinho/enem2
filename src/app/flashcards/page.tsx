"use client";
import Flashcards from "@/components/pages/Flashcards";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

export default function FlashcardsPage() {
  return <Flashcards />;
}
