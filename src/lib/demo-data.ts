// Contenido de ejemplo que se muestra cuando todavía no hay un proyecto de
// Supabase conectado. Sirve para que la plantilla se pueda ver y probar de
// entrada, y como referencia visual de qué datos completa cada cliente.
import type { Tenant, SiteContent, CatalogItem } from "@/lib/types";

export const demoTenant: Tenant = {
  id: "demo",
  slug: "demo",
  business_name: "Barbería Ejemplo",
  logo_url: null,
  primary_color: "#0066CC",
  accent_color: "#FF9500",
  business_mode: "turnos",
  status: "activo",
  horario_atencion: {
    lunes: { abierto: true, desde: "09:00", hasta: "18:00" },
    martes: { abierto: true, desde: "09:00", hasta: "18:00" },
    miercoles: { abierto: true, desde: "09:00", hasta: "18:00" },
    jueves: { abierto: true, desde: "09:00", hasta: "18:00" },
    viernes: { abierto: true, desde: "09:00", hasta: "18:00" },
    sabado: { abierto: false, desde: "09:00", hasta: "13:00" },
    domingo: { abierto: false, desde: "09:00", hasta: "13:00" },
  },
  cupo_simultaneo: 1,
};

export const demoSiteContent: SiteContent = {
  tenant_id: "demo",
  hero_title: "Cortes prolijos, sin vueltas",
  hero_subtitle: "Reservá tu turno en un minuto, desde el celular.",
  hero_image_url: null,
  about_text:
    "Este es un texto de ejemplo. Acá el dueño del comercio cuenta brevemente de qué se trata su negocio, hace cuánto está en el barrio y qué lo distingue.",
  address: "San Martín 123, Concepción del Uruguay, Entre Ríos",
  whatsapp_number: "3442000000",
  instagram_url: "https://instagram.com",
  facebook_url: null,
  schedule: {
    lunes_a_viernes: "9 a 13 y 17 a 20",
    sabado: "9 a 13",
    domingo: "Cerrado",
  },
};

export const demoCatalog: CatalogItem[] = [
  { id: "1", tenant_id: "demo", name: "Corte clásico", description: "Corte + lavado", price: 6000, image_url: null, category: "Cortes", duration_minutes: 30, active: true, sort_order: 1 },
  { id: "2", tenant_id: "demo", name: "Corte + barba", description: "Corte, arreglo de barba y toalla caliente", price: 9500, image_url: null, category: "Cortes", duration_minutes: 45, active: true, sort_order: 2 },
  { id: "3", tenant_id: "demo", name: "Afeitado clásico", description: "Con navaja, toalla caliente y after shave", price: 5500, image_url: null, category: "Barba", duration_minutes: 25, active: true, sort_order: 3 },
];
