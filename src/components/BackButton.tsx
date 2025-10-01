"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
  fallbackPath?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  className = '',
  variant = 'outline',
  size = 'default',
  children = 'Voltar',
  fallbackPath = '/'
}) => {
  const router = useRouter();

  const handleGoBack = () => {
    // A navegação do Next.js não tem um equivalente direto para "history.length > 1"
    // A melhor abordagem é usar o router.back() e deixar o Next.js lidar com isso.
    // Se não houver histórico, ele não fará nada, então o fallback manual não é necessário da mesma forma.
    router.back();
  };

  return (
    <Button
      onClick={handleGoBack}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Button>
  );
};

export default BackButton;
