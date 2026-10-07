// Preguntas del formulario para Ingrid. Para agregar una, sumá una línea acá.
export type Question =
  | { key: string; label: string; help?: string; type: "text" | "long" }
  | { key: string; label: string; help?: string; type: "choice"; options: string[] }
  | { key: string; label: string; help?: string; type: "multi"; options: string[] };

export const INTAKE_SECTIONS: { title: string; intro?: string; questions: Question[] }[] = [
  {
    title: "Sobre vos",
    intro: "Todo es opcional y con tus palabras. Lo que escribas es lo que va a figurar en la web, así que contá solo lo que quieras compartir.",
    questions: [
      { key: "bio", type: "long", label: "Contanos quién sos y cómo empezaste", help: "Tu historia, qué te gusta de tu trabajo, qué te distingue." },
      { key: "formacion", type: "long", label: "Tu formación y títulos", help: "Si querés que figure tu número de matrícula, escribilo acá." },
      { key: "experiencia", type: "text", label: "¿Cuántos años de experiencia tenés?" },
      { key: "forma_de_trabajo", type: "long", label: "¿Cómo trabajás con cada persona y qué querés que sientan cuando vienen?" },
    ],
  },
  {
    title: "El gabinete",
    questions: [
      { key: "horarios", type: "long", label: "Días y horarios de atención", help: "Ej: lunes a viernes de 9 a 13 y de 16 a 20; sábados de 9 a 13." },
      { key: "medios_pago", type: "multi", label: "Medios de pago que aceptás", options: ["Transferencia", "Efectivo", "Tarjeta de débito", "Tarjeta de crédito", "Mercado Pago"] },
      { key: "cuotas", type: "text", label: "¿Ofrecés cuotas o descuentos por pagar en efectivo o transferencia?" },
      { key: "alias", type: "text", label: "Alias de la cuenta para las transferencias de la tienda" },
      { key: "titular", type: "text", label: "Nombre del titular de esa cuenta", help: "Se muestra al cliente cuando va a transferir." },
      { key: "atencion", type: "choice", label: "¿A quiénes atendés?", options: ["A todas las personas", "Solo mujeres", "Otra respuesta (la escribo en observaciones)"] },
      { key: "acceso", type: "text", label: "¿Hay estacionamiento o algo para saber al llegar?", help: "Timbre, piso, referencia para encontrar el lugar." },
      { key: "email", type: "text", label: "Email de contacto (si querés mostrar uno)" },
    ],
  },
  {
    title: "Tienda de productos",
    questions: [
      {
        key: "tienda_modo",
        type: "choice",
        label: "¿Cómo preferís vender los productos?",
        options: [
          "Solo mostrarlos: que consulten precio y compren todo por WhatsApp",
          "Con carrito: que la persona arme su pedido y lo termine por WhatsApp, donde yo confirmo disponibilidad, paso el pago y coordinamos el retiro",
        ],
        help: "La segunda opción ya está armada en la web. Con la primera, los productos se ven pero sin carrito ni precio.",
      },
      { key: "tienda_envios", type: "long", label: "¿Hacés envíos o solo retiro en el gabinete?", help: "Por ejemplo: envío dentro de la ciudad a coordinar por WhatsApp, o solo retiro." },
      { key: "tienda_cambios", type: "long", label: "¿Qué pasa si alguien quiere cambiar o devolver un producto?", help: "Plazo y condiciones, para dejarlo claro en la tienda." },
      { key: "tienda_precios", type: "long", label: "¿Querés mostrar el precio de cada producto en la web?", help: "Si sí, los precios se cargan en la sección de cada producto más abajo." },
    ],
  },
  {
    title: "Promos, packs y vouchers",
    questions: [
      { key: "vouchers", type: "long", label: "¿Cómo funcionan los vouchers?", help: "¿Se pueden regalar? ¿Cómo se compran? ¿Para qué tratamientos sirven?" },
      { key: "packs", type: "long", label: "¿Cómo funcionan los packs?", help: "Cantidad de sesiones, cómo se pagan y qué pasa si se vence." },
      { key: "mostrar_precios", type: "choice", label: "¿Querés mostrar precios en la web?", options: ["Sí, todos", "Solo algunos", "No, prefiero que consulten por WhatsApp"] },
    ],
  },
  {
    title: "Para terminar",
    questions: [
      { key: "hifu_nombre", type: "text", label: "En una de tus historias aparece \"Hifu 12D Max\": ¿el tratamiento en la web debe llamarse Hifu 7D, Hifu 12D Max o tener los dos nombres?" },
      { key: "google_resenas", type: "text", label: "¿Cuántas reseñas tenés en Google Maps?", help: "Para poder decir, por ejemplo, \"5 estrellas (X reseñas)\"." },
      { key: "no_mostrar", type: "long", label: "¿Hay algo que NO quieras que aparezca en la web?" },
      { key: "falta", type: "long", label: "¿Falta algo que te gustaría que tenga la web?" },
      { key: "observaciones", type: "long", label: "Observaciones" },
    ],
  },
];

// Preguntas que se repiten por cada tratamiento o producto.
export const PER_TREATMENT: { key: string; label: string; type: "text" | "long" }[] = [
  { key: "duracion", type: "text", label: "Duración de la sesión" },
  { key: "sesiones", type: "text", label: "Cantidad de sesiones recomendada" },
  { key: "precio", type: "text", label: "Precio (opcional)" },
  { key: "descripcion", type: "long", label: "Descripción: qué es, para qué sirve, cómo es la sesión" },
  { key: "cuidados", type: "long", label: "Cuidados y a quién no se recomienda" },
];

export const PER_PRODUCT: { key: string; label: string; type: "text" | "long" }[] = [
  { key: "piel", type: "text", label: "Para qué tipo de piel es" },
  { key: "mejora", type: "text", label: "Qué mejora o para qué sirve" },
  { key: "precio", type: "text", label: "Precio (opcional)" },
  { key: "descripcion", type: "long", label: "Descripción y modo de uso" },
];
