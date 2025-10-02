"use client";
import { Suspense } from "react";
import RedefinirSenha from "@/components/pages/RedefinirSenha";

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
