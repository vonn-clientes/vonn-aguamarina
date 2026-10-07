import type { ShowcaseReview } from "@/lib/reviews";

// Opiniones de Google (Places API). Se activa sola cuando existen GOOGLE_PLACES_API_KEY y GOOGLE_PLACE_ID.
// Se guarda en caché 6 horas para no gastar cuota. Si algo falla, simplemente no muestra nada.
export type GoogleSummary = { reviews: ShowcaseReview[]; rating: number | null; total: number | null; mapsUri: string | null };

export async function getGoogleReviews(): Promise<GoogleSummary | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const id = process.env.GOOGLE_PLACE_ID;
  if (!key || !id) return null;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=es`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews" },
      next: { revalidate: 6 * 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const reviews: ShowcaseReview[] = (j.reviews ?? [])
      .filter((r: { rating?: number; text?: { text?: string }; originalText?: { text?: string } }) => (r.rating ?? 0) >= 4 && (r.text?.text || r.originalText?.text))
      .map((r: { name?: string; rating: number; text?: { text?: string }; originalText?: { text?: string }; authorAttribution?: { displayName?: string }; relativePublishTimeDescription?: string }, i: number) => ({
        id: `g-${r.name ?? i}`,
        author: r.authorAttribution?.displayName ?? "Clienta",
        rating: r.rating,
        comment: (r.text?.text || r.originalText?.text || "").trim(),
        source: "google" as const,
        detail: r.relativePublishTimeDescription,
      }));
    return { reviews, rating: j.rating ?? null, total: j.userRatingCount ?? null, mapsUri: j.googleMapsUri ?? null };
  } catch {
    return null;
  }
}
