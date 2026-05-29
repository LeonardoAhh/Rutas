import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center bg-canvas px-base text-center">
      <h2 className="font-serif text-display-xl font-light text-ink">404</h2>
      <p className="mt-md text-body-md text-body">
        La página que buscas no existe.
      </p>
      <div className="mt-lg">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-pill bg-ink-primary px-md py-[10px] text-button font-medium text-on-primary transition-colors hover:bg-ink-primary-active"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
