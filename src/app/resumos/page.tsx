"use client";
import Resumos from "@/components/pages/Resumos";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

export default function ResumosPage() {
  return <Resumos />;
}
