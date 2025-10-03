"use client";
import Calendario from "@/components/pages/Calendario";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

export default function CalendarioPage() {
  return <Calendario />;
}
