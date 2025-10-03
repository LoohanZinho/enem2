"use client";
import Perfil from "@/components/pages/Perfil";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

export default function PerfilPage() {
  return <Perfil />;
}
