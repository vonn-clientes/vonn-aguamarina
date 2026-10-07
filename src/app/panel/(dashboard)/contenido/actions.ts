"use server";

import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveSiteContent(formData: FormData) {
  const membership = await requireMembership();
  const supabase = await createClient();

  const scheduleDays = ["lunes_a_viernes", "sabado", "domingo"];
  const schedule: Record<string, string> = {};
  for (const day of scheduleDays) {
    const value = String(formData.get(`schedule_${day}`) || "").trim();
    if (value) schedule[day] = value;
  }

  await supabase.from("site_content").upsert({
    tenant_id: membership.tenant.id,
    hero_title: String(formData.get("hero_title") || ""),
    hero_subtitle: String(formData.get("hero_subtitle") || ""),
    about_text: String(formData.get("about_text") || ""),
    address: String(formData.get("address") || ""),
    whatsapp_number: String(formData.get("whatsapp_number") || ""),
    instagram_url: String(formData.get("instagram_url") || ""),
    schedule,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/panel/contenido");
  revalidatePath("/");
}
