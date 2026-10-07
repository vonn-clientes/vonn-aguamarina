// Tipos compartidos entre el sitio público y el panel. Reflejan las tablas
// de supabase/schema.sql — si cambiás el schema, actualizá esto también.

export type BusinessMode = "turnos" | "pedidos" | "ninguno";

export interface HorarioDia {
  abierto: boolean;
  desde: string; // "HH:MM"
  hasta: string; // "HH:MM"
}

export type HorarioAtencion = Record<
  "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo",
  HorarioDia
>;

export interface Tenant {
  id: string;
  slug: string;
  business_name: string;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  business_mode: BusinessMode;
  status: "activo" | "pausado" | "cancelado";
  horario_atencion: HorarioAtencion | null;
  cupo_simultaneo: number;
}

export interface SiteContent {
  tenant_id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  about_text: string | null;
  address: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  schedule: Record<string, string>;
}

export interface CatalogItem {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  category: string | null;
  duration_minutes: number | null;
  active: boolean;
  sort_order: number;
}

export interface ContactMessage {
  id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface TenantMember {
  id: string;
  tenant_id: string;
  invited_email: string;
  role: "owner" | "empleado";
  status: "invitado" | "activo" | "revocado";
}

export interface Booking {
  id: string;
  tenant_id: string;
  catalog_item_id: string | null;
  customer_name: string;
  customer_phone: string;
  scheduled_at: string;
  status: "pendiente" | "confirmado" | "cancelado" | "completado";
  notes: string | null;
}

export interface Order {
  id: string;
  tenant_id: string;
  customer_name: string;
  customer_phone: string;
  status: "pendiente" | "preparando" | "listo" | "entregado" | "cancelado";
  total: number;
  notes: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  tenant_id: string;
  category: string | null;
  description: string;
  status: "abierto" | "en_progreso" | "resuelto";
  created_at: string;
}
