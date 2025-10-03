"use client";
import LandingPage from "@/components/pages/LandingPage";

// Adicione esta linha para forçar a renderização dinâmica
export const dynamic = 'force-dynamic';

export default function Home() {
  return <LandingPage />;
}
