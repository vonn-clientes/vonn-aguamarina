import { NextResponse } from "next/server";
import { getMembership } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const m = await getMembership();
  if (!m) return NextResponse.json({ items: [] }, { status: 401 });
  const data = await query<{ id: string; name: string; image_url: string | null }>(
    "select id, name, image_url from catalog_items where tenant_id = $1 and active = true order by sort_order limit 80",
    [m.tenant.id],
  );
  const items = data.map((x) => ({ id: x.id, name: x.name, hasPhoto: !!x.image_url })).sort((a, b) => Number(a.hasPhoto) - Number(b.hasPhoto));
  return NextResponse.json({ items, tenantId: m.tenant.id });
}
