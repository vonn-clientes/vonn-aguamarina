"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export type ContactFormState = {
  ok: boolean;
  message: string;
};

// Guarda un mensaje del formulario de contacto público. Cualquiera puede
// escribir (la política de RLS "contact_messages: cualquiera puede
// escribir" lo permite), pero solo los miembros del tenant lo pueden leer
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

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Este es un sitio de demostración: todavía no está conectado a una base de datos real.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    tenant_id: tenantId,
    name,
    phone: phone || null,
    email: email || null,
    message,
  });

  if (error) {
    return { ok: false, message: "No se pudo enviar el mensaje. Probá de nuevo en un momento." };
  }

  return { ok: true, message: "¡Gracias! Tu mensaje fue enviado." };
}
