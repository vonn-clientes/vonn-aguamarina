export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-5 sm:px-10 pt-10 pb-6">
      <h1 className="vonn-text-titulo">{title}</h1>
      {description && <p className="vonn-text-cuerpo text-ink-muted mt-2 max-w-2xl">{description}</p>}
    </div>
  );
}
