// Filtros de la tienda, como en las tiendas de cosmética profesionales:
// tipo de piel, qué querés mejorar y tipo de producto.
export const SKIN_TYPES = ["Todo tipo de piel", "Normal", "Seca", "Mixta", "Grasa", "Sensible", "Madura"] as const;
export const CONCERNS = [
  "Hidratación",
  "Acné e impurezas",
  "Manchas",
  "Arrugas y firmeza",
  "Rojeces y sensibilidad",
  "Poros y textura",
  "Luminosidad",
  "Cuerpo",
] as const;
export const PRODUCT_TYPES = [
  "Limpieza",
  "Tónicos",
  "Sérums",
  "Hidratantes",
  "Protector solar",
  "Mascarillas",
  "Exfoliantes",
  "Contorno de ojos",
  "Corporales",
  "Kits",
] as const;

export const ALL_SKINS = "Todo tipo de piel";

// Un producto "para todo tipo de piel" aparece con cualquier tipo de piel elegido.
export function matchesSkin(productSkins: string[] | undefined, chosen: string) {
  const s = productSkins ?? [];
  return s.includes(chosen) || s.includes(ALL_SKINS);
}
