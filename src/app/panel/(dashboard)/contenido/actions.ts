"use server";

import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveSiteContent(formData: FormData) {
  const membership = await requireMembership();

  const scheduleDays = ["lunes_a_viernes", "sabado", "domingo"];
  const schedule: Record<string, string> = {};
  for (const day of scheduleDays) {
    const value = String(formData.get(`schedule_${day}`) || "").trim();
    if (value) schedule[day] = value;
  }

  await query(
    `insert into site_content (tenant_id, hero_title, hero_subtitle, about_text, address, whatsapp_number, instagram_url,
       about_image_url, transfer_alias, transfer_holder, schedule, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, now())
     on conflict (tenant_id) do update set hero_title = excluded.hero_title, hero_subtitle = excluded.hero_subtitle,
       about_text = excluded.about_text, address = excluded.address, whatsapp_number = excluded.whatsapp_number,
       instagram_url = excluded.instagram_url, about_image_url = excluded.about_image_url,
       transfer_alias = excluded.transfer_alias, transfer_holder = excluded.transfer_holder,
       schedule = excluded.schedule, updated_at = now()`,
    [
      membership.tenant.id,
      String(formData.get("hero_title") || ""),
      String(formData.get("hero_subtitle") || ""),
      String(formData.get("about_text") || ""),
      String(formData.get("address") || ""),
      String(formData.get("whatsapp_number") || ""),
      String(formData.get("instagram_url") || ""),
      String(formData.get("about_image_url") || "") || null,
      String(formData.get("transfer_alias") || "").trim() || null,
      String(formData.get("transfer_holder") || "").trim() || null,
      JSON.stringify(schedule),
    ],
  );

  revalidatePath("/panel/contenido");
  revalidatePath("/");
  revalidatePath("/tienda");
  revalidatePath("/tienda/carrito");
}
