// Nombres de archivo y textos alternativos pensados para el posicionamiento en Google.
// Sin imports de servidor: se usa tanto en el panel (navegador) como en las páginas públicas.

const CITY = "concepcion-del-uruguay";

function slug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// "Hifu 7D" -> "hifu-7d-aguamarina-concepcion-del-uruguay-k3f9a2.webp"
// Google lee el nombre del archivo: palabra clave + marca + ciudad, y un sufijo corto
// para que dos fotos del mismo tratamiento no se pisen.
export function seoImageFileName(hint: string | null | undefined, ext = "webp"): string {
  const base = slug(hint ?? "").slice(0, 60).replace(/-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  const parts = [base || "estetica-y-bienestar", "aguamarina", CITY, suffix];
  return `${parts.join("-")}.${ext}`;
}

// Lee el nombre que se está escribiendo en el formulario (tratamiento o producto).
export function nameFromForm(input: HTMLInputElement | null, fallback?: string): string {
  const el = input?.form?.elements.namedItem("name") as { value?: string } | null | undefined;
  const v = typeof el?.value === "string" ? el.value.trim() : "";
  return v || fallback || "";
}

// Texto alternativo automático: describe la foto con el nombre y el lugar.
export function seoAlt(name: string, kind: "tratamiento" | "producto" | "perfil" = "tratamiento", n?: number): string {
  const suffix = n && n > 1 ? `, foto ${n}` : "";
  if (kind === "producto") return `${name}, producto de cuidado de la piel en Aguamarina Estética y Bienestar${suffix}`;
  if (kind === "perfil") return `${name}, profesional de Aguamarina Estética y Bienestar, Concepción del Uruguay`;
  return `${name} en Aguamarina Estética y Bienestar, Concepción del Uruguay${suffix}`;
}
