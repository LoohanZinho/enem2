// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers"; // Importe o novo componente
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EnemPro - Plataforma de Estudos para o ENEM 2025",
  description: "Plataforma completa de estudos para o ENEM com vídeo-aulas, simulados, resumos e cronograma personalizado. Conquiste a nota dos seus sonhos!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <Providers> {/* Envolva os children com o novo Providers */}
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}