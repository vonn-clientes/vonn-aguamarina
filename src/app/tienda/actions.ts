"use server";

import { createClient } from "@supabase/supabase-js";
import { SITE } from "@/lib/site";
import { waDigits } from "@/lib/seo";

// Crea el pedido de la tienda. Los precios se leen acá de la base de datos
// (nunca se confía en lo que manda el navegador) y el mensaje de WhatsApp se
// arma en el servidor con los datos ya validados.

type Input = {
  items: { id: string; qty: number }[];
  name: string;
  phone: string;
  website?: string; // trampa para robots: una persona real la deja vacía
};

type Result = { ok: true; code: string; total: number; waUrl: string } | { ok: false; error: string };

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

export async function placeOrder(input: Input): Promise<Result> {
  if (input.website) return { ok: false, error: "No pudimos procesar el pedido." };

  const name = input.name.trim().replace(/\s+/g, " ");
  const phone = input.phone.replace(/[^\d+]/g, "");
  if (name.length < 5 || !name.includes(" ")) return { ok: false, error: "Escribí tu nombre y apellido completos." };
  if (phone.replace(/\D/g, "").length < 8) return { ok: false, error: "Revisá tu WhatsApp: falta algún número." };

  const wanted = new Map<string, number>();
  for (const l of input.items ?? []) {
    if (typeof l?.id !== "string" || !Number.isInteger(l.qty) || l.qty < 1 || l.qty > 20) continue;
    wanted.set(l.id, (wanted.get(l.id) ?? 0) + l.qty);
  }
  if (wanted.size === 0 || wanted.size > 30) return { ok: false, error: "Tu carrito está vacío." };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { ok: false, error: "La tienda no está disponible en este momento." };
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", SITE.slug).eq("status", "activo").maybeSingle();
  if (!tenant) return { ok: false, error: "La tienda no está disponible en este momento." };

  const { data: products } = await supabase
    .from("catalog_items")
    .select("id,name,price,sold_out,active")
    .eq("tenant_id", tenant.id)
    .in("id", [...wanted.keys()]);

  const lines: { id: string; name: string; qty: number; price: number }[] = [];
  for (const [id, qty] of wanted) {
    const p = products?.find((x) => x.id === id);
    if (!p || !p.active || p.sold_out || p.price == null) {
      return { ok: false, error: `${p?.name ?? "Un producto"} ya no está disponible. Sacalo del carrito para seguir.` };
    }
    lines.push({ id, name: p.name, qty, price: Number(p.price) });
  }
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  const orderId = crypto.randomUUID();
  const code = orderId.slice(0, 8).toUpperCase();

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    tenant_id: tenant.id,
    customer_name: name,
    customer_phone: phone,
    payment_method: "transferencia",
    status: "pendiente",
    total,
    notes: `Retira en el gabinete. Pedido ${code}`,
  });
  if (orderError) return { ok: false, error: "No pudimos guardar tu pedido. Probá de nuevo en un momento." };

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_id: orderId,
      catalog_item_id: l.id,
      item_name: l.name,
      quantity: l.qty,
      unit_price: l.price,
      subtotal: l.price * l.qty,
    }))
  );
  if (itemsError) return { ok: false, error: "No pudimos guardar tu pedido. Probá de nuevo en un momento." };

  const { data: content } = await supabase
    .from("site_content")
    .select("whatsapp_number")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  const message = [
    "Hola! Quiero comprar estos productos de la tienda de Aguamarina.",
    "",
    `Pedido #${code}`,
    `Nombre: ${name}`,
    `WhatsApp: ${phone}`,
    "",
    "Productos:",
    ...lines.map((l) => `- ${l.qty} x ${l.name}: ${money(l.price * l.qty)}`),
    "",
    `Total: ${money(total)}`,
    "Retiro en el gabinete (Lorenzo Sartorio 784).",
    "",
    "¿Me confirmás que está todo disponible y cómo te lo pago? Gracias!",
  ].join("\n");

  const wa = waDigits(content?.whatsapp_number);
  return { ok: true, code, total, waUrl: `https://wa.me/${wa}?text=${encodeURIComponent(message)}` };
}
