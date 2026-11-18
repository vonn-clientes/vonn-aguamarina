import type { ShowcaseReview } from "@/lib/reviews";

// Opiniones de Google Maps copiadas a mano (sin conectar la API, que es paga).
// Se actualizan una vez por mes: copiar las nuevas de Google Maps, con su texto tal cual,
// y actualizar el promedio y la cantidad total. Solo van las que tienen texto escrito.
// Última actualización: noviembre 2026.
export const GOOGLE_RESUMEN = { rating: 5.0, total: 9 };

export const RESENAS_GOOGLE: ShowcaseReview[] = [
  {
    id: "g-julieta-serrano",
    author: "Julieta Rosana Serrano",
    rating: 5,
    comment: "Excelente lugar y con la atención de la mejor esteticista de Concepción del Uruguay!",
    source: "google",
  },
  {
    id: "g-susana-lopez",
    author: "Susana López",
    rating: 5,
    comment: "Excelentes resultados con los tratamientos corporales como faciales.",
    source: "google",
  },
  {
    id: "g-stella-lopez",
    author: "Stella Lopez",
    rating: 5,
    comment: "Exelente!!!",
    source: "google",
  },
];
