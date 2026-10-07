// Chequeo simple: ¿ya se cargaron las credenciales reales de Supabase?
// Mientras no estén, el sitio público muestra contenido de ejemplo y el
// panel avisa que falta conectar la base — así el proyecto siempre corre,
// incluso antes de tener un proyecto de Supabase creado.
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("tu-proyecto"));
}
