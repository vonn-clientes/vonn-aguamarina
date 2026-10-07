// Secciones del sitio que la community manager puede enlazar.
// Cada vez que se agrega una sección nueva a la web, se suma una línea acá
// y aparece sola en /cm.
export const CM_SECTIONS: { name: string; path: string; slug: string; onlyWithProducts?: boolean }[] = [
  { name: "Conocé a Sofi, nuestra asistente virtual (abre el chat directo)", path: "/?sofi=1", slug: "sofi" },
  { name: "Todos los tratamientos", path: "/#tratamientos", slug: "tratamientos" },
  { name: "Todas las promociones", path: "/#promociones", slug: "promociones" },
  { name: "Conocé a Ingrid", path: "/#ingrid", slug: "ingrid" },
  { name: "Tu primera visita, paso a paso", path: "/#turnos", slug: "primera-visita" },
  { name: "Políticas del gabinete (cancelaciones, packs)", path: "/#politicas", slug: "politicas" },
  { name: "Preguntas frecuentes", path: "/#preguntas", slug: "preguntas" },
  { name: "Dónde estamos (mapa y dirección)", path: "/#donde", slug: "donde-estamos" },
  { name: "Pedir asesoramiento", path: "/#asesoramiento", slug: "asesoramiento" },
];
