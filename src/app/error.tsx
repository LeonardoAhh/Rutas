'use client';

import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center bg-canvas px-base text-center">
      <h2 className="font-serif text-display-lg font-light text-ink">
        Algo salió mal
      </h2>
      <p className="mt-md max-w-[50ch] text-body-md text-body">
        {error.message || 'Ha ocurrido un error inesperado.'}
      </p>
      <div className="mt-lg">
        <Button variant="primary" onClick={reset}>
          Intentar de nuevo
        </Button>
      </div>
    </section>
  );
}
