"use server";

import { query } from "@/lib/db";
import { isDbConfigured } from "@/lib/config";

export type ContactFormState = {
  ok: boolean;
  message: string;
};

// Guarda un mensaje del formulario de contacto público. Cualquiera puede
// escribir (se valida que el tenant exista y esté activo), pero solo los miembros del tenant lo pueden leer
// después, desde el panel.
export async function sendContactMessage(
  tenantId: string,
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !message) {
    return { ok: false, message: "Completá al menos tu nombre y el mensaje." };
  }

  if (!isDbConfigured()) {
    return {
      ok: false,
      message: "Este es un sitio de demostración: todavía no está conectado a una base de datos real.",
    };
  }

  try {
    const rows = await query<{ id: string }>(
      `insert into contact_messages (tenant_id, name, phone, email, message)
       select t.id, $2, $3, $4, $5 from tenants t where t.id = $1 and t.status = 'activo'
       returning id`,
      [tenantId, name.slice(0, 120), phone.slice(0, 40) || null, email.slice(0, 160) || null, message.slice(0, 4000)],
    );
    if (!rows.length) throw new Error("tenant");
  } catch {
    return { ok: false, message: "No se pudo enviar el mensaje. Probá de nuevo en un momento." };
  }

  return { ok: true, message: "¡Gracias! Tu mensaje fue enviado." };
}
