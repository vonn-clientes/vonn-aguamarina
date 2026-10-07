export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-line">
      <h1 className="vonn-text-titulo">{title}</h1>
      {description && <p className="vonn-text-cuerpo text-ink-muted mt-1">{description}</p>}
    </div>
  );
}
