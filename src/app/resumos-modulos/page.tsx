"use client";
import { Suspense } from "react";
import ResumosModulos from "@/components/pages/ResumosModulos";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

function ResumosModulosContent() {
  return <ResumosModulos />;
}

export default function ResumosModulosPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResumosModulosContent />
    </Suspense>
  );
}
