"use client";
import ConteudoEstudo from "@/components/pages/ConteudoEstudo";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

export default function ConteudoPage() {
  return <ConteudoEstudo />;
}
