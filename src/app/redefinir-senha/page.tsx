"use client";
import { Suspense } from "react";
import RedefinirSenha from "@/components/pages/RedefinirSenha";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

function RedefinirSenhaContent() {
  return <RedefinirSenha />;
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RedefinirSenhaContent />
    </Suspense>
  );
}
