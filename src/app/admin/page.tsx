"use client";
import Admin from "@/components/pages/Admin";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return <Admin />;
}
