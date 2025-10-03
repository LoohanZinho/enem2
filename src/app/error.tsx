'use client'; // Componentes de erro precisam ser Client Components

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log o erro para um serviço de reporte
    console.error(error);
  }, [error]);

  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h2>Algo deu errado!</h2>
      <p>Ocorreu um erro inesperado na aplicação.</p>
      <button
        onClick={
          // Tenta se recuperar renderizando o segmento novamente
          () => reset()
        }
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        }}
      >
        Tentar Novamente
      </button>
    </div>
  );
}