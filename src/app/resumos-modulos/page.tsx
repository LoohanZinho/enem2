"use client";
import { Suspense } from "react";
import ResumosModulos from "@/components/pages/ResumosModulos";

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
