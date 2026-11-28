"use server";

import { requireMembership } from "@/lib/auth";
import { deleteRows, insertRow, updateRows } from "@/lib/db";
import { revalidatePath } from "next/cache";

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

export async function addCatalogItem(formData: FormData) {
  const membership = await requireMembership();

  const priceRaw = String(formData.get("price") || "").replace(",", ".");
  const durationRaw = String(formData.get("duration_minutes") || "");

  await insertRow("catalog_items", {
    tenant_id: membership.tenant.id,
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || "") || null,
    price: priceRaw ? Number(priceRaw) : null,
    duration_minutes: durationRaw ? Number(durationRaw) : null,
    category: String(formData.get("category") || "") || null,
    image_url: String(formData.get("image_url") || "") || null,
    gallery_urls: formData.getAll("gallery_urls").map(String).filter(Boolean),
    skin_types: formData.getAll("skin_types").map(String),
    concerns: formData.getAll("concerns").map(String),
    product_type: String(formData.get("product_type") || "") || null,
    benefits: lines(formData.get("benefits")),
    good_to_know: lines(formData.get("good_to_know")),
  });

  revalidatePath("/panel/catalogo");
  revalidatePath("/");
  revalidatePath("/tienda");
  revalidatePath("/tratamientos", "layout");
}

export async function toggleCatalogItem(itemId: string, active: boolean) {
  const membership = await requireMembership();

  await updateRows("catalog_items", { active }, { id: itemId, tenant_id: membership.tenant.id });

  revalidatePath("/panel/catalogo");
  revalidatePath("/");
  revalidatePath("/tienda");
}

export async function deleteCatalogItem(itemId: string) {
  const membership = await requireMembership();

  await deleteRows("catalog_items", { id: itemId, tenant_id: membership.tenant.id });

  revalidatePath("/panel/catalogo");
  revalidatePath("/");
  revalidatePath("/tienda");
}

export async function updateCatalogItem(itemId: string, formData: FormData) {
  const membership = await requireMembership();

  const priceRaw = String(formData.get("price") || "").replace(",", ".");
  const durationRaw = String(formData.get("duration_minutes") || "");

  await updateRows(
    "catalog_items",
    {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || "") || null,
      price: priceRaw ? Number(priceRaw) : null,
      duration_minutes: durationRaw ? Number(durationRaw) : null,
      category: String(formData.get("category") || "") || null,
      image_url: String(formData.get("image_url") || "") || null,
      gallery_urls: formData.getAll("gallery_urls").map(String).filter(Boolean),
      skin_types: formData.getAll("skin_types").map(String),
      concerns: formData.getAll("concerns").map(String),
      product_type: String(formData.get("product_type") || "") || null,
      benefits: lines(formData.get("benefits")),
      good_to_know: lines(formData.get("good_to_know")),
    },
    { id: itemId, tenant_id: membership.tenant.id },
  );

  revalidatePath("/panel/catalogo");
  revalidatePath("/");
  revalidatePath("/tienda");
}

export async function toggleSoldOut(itemId: string, sold_out: boolean) {
  const membership = await requireMembership();

  await updateRows("catalog_items", { sold_out }, { id: itemId, tenant_id: membership.tenant.id });

  revalidatePath("/panel/catalogo");
  revalidatePath("/");
  revalidatePath("/tienda");
}
