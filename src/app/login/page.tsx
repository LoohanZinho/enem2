"use client";
import Login from "@/components/pages/Login";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <Login />;
}
