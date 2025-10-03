"use client";
import Planilha from "@/components/pages/Planilha";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

export default function PlanilhaPage() {
  return <Planilha />;
}
