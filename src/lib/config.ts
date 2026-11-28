// ¿Hay base de datos configurada? Mientras no, el sitio público muestra
// contenido de ejemplo y el panel avisa que falta conectar la base.
export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
