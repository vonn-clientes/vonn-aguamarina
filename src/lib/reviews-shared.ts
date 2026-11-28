import type { Review } from "@/lib/types";

// Parte de las opiniones que no toca la base: se puede importar desde
// componentes de navegador (reviews.ts usa la base y es solo de servidor).
export function summarize(reviews: Review[]) {
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { count, avg: Math.round(avg * 10) / 10 };
}

export type ShowcaseReview = { id: string; author: string; rating: number; comment: string; source: "google" | "web"; detail?: string };
