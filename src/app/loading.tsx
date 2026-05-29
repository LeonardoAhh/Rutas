export default function Loading() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-canvas">
      <div className="flex flex-col items-center space-y-md">
        <div className="h-xl w-xl animate-spin rounded-full border-2 border-hairline border-t-ink-primary" />
        <p className="text-body-sm text-muted">Cargando...</p>
      </div>
    </section>
  );
}
