import { NextResponse } from "next/server";
import { getMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const m = await getMembership();
  if (!m) return NextResponse.json({ items: [] }, { status: 401 });
  const sb = await createClient();
  const { data } = await sb.from("catalog_items").select("id, name, image_url").eq("tenant_id", m.tenant.id).eq("active", true).order("sort_order").limit(80);
  const items = (data ?? []).map((x) => ({ id: x.id, name: x.name, hasPhoto: !!x.image_url })).sort((a, b) => Number(a.hasPhoto) - Number(b.hasPhoto));
  return NextResponse.json({ items, tenantId: m.tenant.id });
}
