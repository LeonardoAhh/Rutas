import Link from "next/link";

export default function Home() {
  return (
    <section className="relative overflow-hidden bg-canvas py-section">
      <div className="container mx-auto px-xl text-center">
        {/* Gradiente Atmosférico Decorativo */}
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-gradient-sky opacity-20 blur-[100px]" />
        </div>

        {/* Contenido del Hero */}
        <div className="relative z-10">
          <h1 className="font-serif text-display-mega text-ink">
            Bienvenido a Route Planner
          </h1>
          <p className="mx-auto mt-md max-w-[60ch] text-body-md text-body">
            Tu herramienta definitiva para planificar y visualizar tus viajes con
            una estética editorial y una precisión inigualable.
          </p>
          <div className="mt-lg">
            <Link
              href="/routes"
              className="inline-block rounded-pill bg-ink-primary px-8 py-3 text-button font-medium text-on-primary transition-colors hover:bg-ink-primary-active"
            >
              Comenzar a Planificar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
