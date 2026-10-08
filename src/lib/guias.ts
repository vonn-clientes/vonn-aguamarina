// Guías (blog) de Aguamarina: contestan preguntas reales que la gente busca en Google
// y llevan, con links internos, a los productos y tratamientos. Sin precios de tratamientos.

export type Seccion = { h: string; p: string[]; ul?: string[] };
export type Guia = {
  slug: string;
  seo: string; // <title>, hasta ~60 caracteres
  titulo: string;
  desc: string;
  fecha: string;
  tiempo: string;
  secciones: Seccion[];
  faq: { q: string; a: string }[];
  enlaces: { label: string; href: string }[];
};

export const GUIAS: Guia[] = [
  {
    slug: "rutina-de-skincare-paso-a-paso",
    seo: "Rutina de skincare paso a paso: mañana y noche",
    titulo: "Rutina de skincare paso a paso: qué usar de mañana y de noche",
    desc: "Cómo armar una rutina de cuidado de la piel simple y efectiva: limpieza, hidratación, antioxidante, retinol y protector solar, en el orden correcto.",
    fecha: "2026-10-08",
    tiempo: "5 min",
    secciones: [
      { h: "Una rutina corta que se sostiene gana a una larga que abandonás", p: ["No hace falta usar diez productos. Lo que da resultados es la constancia con pocos pasos bien elegidos. La base es siempre la misma: limpiar, tratar, hidratar y proteger del sol."] },
      {
        h: "Por la mañana",
        p: ["La mañana es para proteger la piel de lo que va a pasar durante el día."],
        ul: ["Limpieza suave (gel si tu piel es mixta o grasa, crema si es seca o sensible).", "Bruma o sérum de vitamina C, un antioxidante que ayuda a proteger del estrés ambiental y aporta luminosidad.", "Crema hidratante.", "Protector solar FPS 50+: es el paso que más cambia la piel a largo plazo."],
      },
      {
        h: "Por la noche",
        p: ["De noche la piel se renueva: es el mejor momento para los tratamientos."],
        ul: ["Limpieza, con doble limpieza si usaste maquillaje o protector solar.", "Sérum de ácido hialurónico para hidratar, o retinol si ya lo incorporaste de forma gradual.", "Crema hidratante para sellar."],
      },
      { h: "Cómo sumar activos sin irritar", p: ["Incorporá un producto nuevo por vez y esperá un par de semanas antes de sumar otro. Si la piel arde, se pone roja o descama mucho, frená y consultá con una profesional. Una cosmiatra puede ayudarte a armar la rutina según tu tipo de piel."] },
    ],
    faq: [
      { q: "¿Cuál es el orden correcto de los productos?", a: "De lo más liviano a lo más espeso: limpieza, bruma o sérum, crema y, de día, protector solar al final." },
      { q: "¿Cuánto tarda en notarse una rutina?", a: "La hidratación y la luminosidad se notan en pocos días; el tono, la textura y las líneas finas suelen necesitar varias semanas de uso constante." },
    ],
    enlaces: [
      { label: "HidraCLEAN Gel", href: "/tienda/hidraclean-gel-limpieza-que-equilibra" },
      { label: "HidraCLEAN Cream", href: "/tienda/hidraclean-cream-crema-de-limpieza" },
      { label: "Sérum Vitamina C", href: "/tienda/serum-vitamina-c-aox-5-5" },
      { label: "Sérum Ácido Hialurónico", href: "/tienda/serum-acido-hialuronico-2ha" },
    ],
  },
  {
    slug: "retinol-como-empezar-sin-irritar-la-piel",
    seo: "Retinol: cómo empezar a usarlo sin irritar la piel",
    titulo: "Retinol: cómo empezar a usarlo sin irritar la piel",
    desc: "Guía para empezar con retinol: con qué frecuencia usarlo, cuándo aplicarlo, la técnica sándwich y por qué el protector solar es obligatorio.",
    fecha: "2026-10-08",
    tiempo: "4 min",
    secciones: [
      { h: "Qué hace el retinol", p: ["El retinol es una forma de vitamina A que favorece la renovación celular. Con uso constante ayuda a mejorar la textura, la luminosidad, las líneas finas y las manchas. Funciona, pero necesita un período de adaptación."] },
      {
        h: "Cómo empezar de a poco",
        p: ["La clave es la gradualidad. Un cronograma habitual para una piel que lo empieza a usar:"],
        ul: ["Semanas 1 y 2: 1 o 2 noches por semana.", "Semanas 3 y 4: 3 noches por semana, en días alternos.", "Desde el segundo mes: noche por medio o todas las noches, si la piel lo tolera."],
      },
      {
        h: "Cómo aplicarlo",
        p: ["Usá 2 o 3 gotas sobre la piel limpia y seca, solo de noche, en rostro, cuello y escote, evitando el contorno de ojos. Para mejorar la tolerancia podés aplicarlo después de la crema hidratante (la técnica «sándwich»)."],
      },
      { h: "Lo que no se negocia: protector solar", p: ["Mientras uses retinol, el protector solar FPS 50+ es obligatorio todos los días y conviene evitar el sol directo. Si estás embarazada o amamantando, consultá con tu médico antes de usarlo."] },
    ],
    faq: [
      { q: "¿Desde qué edad se usa el retinol?", a: "Como prevención y tratamiento inicial suele recomendarse desde alrededor de los 35 años. En adolescentes, solo con indicación médica." },
      { q: "¿Se puede usar en verano?", a: "Sí, siempre con protección solar estricta durante el día." },
      { q: "¿Cuándo se ven los resultados?", a: "Los primeros cambios pueden notarse desde las 4 semanas de uso constante, con mejoras progresivas." },
    ],
    enlaces: [{ label: "Sérum Retinol 0,15% [B3]", href: "/tienda/serum-retinol-0-15-b3" }],
  },
  {
    slug: "vitamina-c-en-la-piel-manana-o-noche",
    seo: "Vitamina C en la piel: ¿de mañana o de noche?",
    titulo: "Vitamina C en la piel: ¿se usa de mañana o de noche?",
    desc: "Para qué sirve la vitamina C en el rostro, en qué momento del día aplicarla y por qué siempre va con protector solar. Guía simple para empezar.",
    fecha: "2026-10-08",
    tiempo: "3 min",
    secciones: [
      { h: "Para qué sirve", p: ["La vitamina C es un antioxidante: ayuda a proteger la piel del estrés oxidativo y de la contaminación, aporta luminosidad, ayuda a unificar el tono y acompaña la producción de colágeno."] },
      { h: "¿Mañana o noche?", p: ["Se puede usar en los dos momentos. De mañana suma protección antioxidante para el día, y es el paso que más rinde junto al protector solar. De noche, aplicada después de la limpieza y antes de la crema, acompaña la renovación de la piel. Podés usarla todos los días según la tolerancia de tu piel."] },
      { h: "Cómo aplicarla", p: ["Colocá 3 o 4 gotas sobre la piel limpia, masajeá hasta que se absorba y seguí con la crema. Si la usás de mañana, terminá siempre con protector solar FPS 50+."] },
      { h: "¿Para quién es?", p: ["Es útil para tono apagado, manchas leves, falta de luminosidad y como prevención desde los 20 o 25 años. Las fórmulas con ceramidas y ácido hialurónico, como el sérum de Aguamarina, ayudan a que la piel la tolere mejor."] },
    ],
    faq: [
      { q: "¿Se puede usar vitamina C con retinol?", a: "Sí, pero en momentos distintos: vitamina C de mañana y retinol de noche es una combinación muy usada." },
      { q: "¿Sirve para piel sensible?", a: "El sérum Natceuticals está indicado para todo tipo de piel, incluso sensible. Empezá igual de a poco." },
    ],
    enlaces: [{ label: "Sérum Vitamina C [AOX] 5,5%", href: "/tienda/serum-vitamina-c-aox-5-5" }, { label: "Bruma HidrAOX [B3]", href: "/tienda/bruma-hidraox-b3" }],
  },
  {
    slug: "como-elegir-limpiador-facial-segun-tu-tipo-de-piel",
    seo: "Cómo elegir el limpiador facial según tu piel",
    titulo: "Cómo elegir el limpiador facial según tu tipo de piel",
    desc: "Gel, crema o leche: cuál es el mejor limpiador para piel seca, mixta, grasa o sensible, y cómo hacer una doble limpieza correctamente.",
    fecha: "2026-10-08",
    tiempo: "4 min",
    secciones: [
      { h: "La limpieza es la base de todo", p: ["Una piel bien limpia absorbe mejor lo que le aplicás después. Pero limpiar de más o con productos agresivos reseca y debilita la barrera de la piel."] },
      {
        h: "Gel o crema: cuál te conviene",
        p: ["Depende de cómo se siente tu piel después de lavarla."],
        ul: ["Piel mixta o grasa, o con brillo: un gel de limpieza que equilibra, liviano y de enjuague fácil.", "Piel seca, sensible o que tira después de lavarla: una crema de limpieza con enjuague, que no reseca.", "Piel normal: cualquiera de los dos; podés alternar."],
      },
      { h: "Doble limpieza", p: ["Si usás maquillaje, protector solar o vivís en un lugar con contaminación, hacé dos pasos: primero un aceite o bálsamo, o una crema de limpieza, y después un gel. Si tu piel es muy seca o sensible, alcanza con la crema sola."] },
      { h: "Errores comunes", p: ["Usar agua muy caliente, frotar fuerte o lavarse la cara más de dos veces por día suele empeorar la sensación de tirantez o el brillo."] },
    ],
    faq: [
      { q: "¿Hay que enjuagar la crema de limpieza?", a: "Sí, siempre. A diferencia de una leche limpiadora, se enjuaga con agua tibia o se retira con un paño húmedo." },
    ],
    enlaces: [{ label: "HidraCLEAN Gel", href: "/tienda/hidraclean-gel-limpieza-que-equilibra" }, { label: "HidraCLEAN Cream", href: "/tienda/hidraclean-cream-crema-de-limpieza" }],
  },
  {
    slug: "hifu-que-es-y-cuando-se-notan-los-resultados",
    seo: "HIFU: qué es y cuándo se notan los resultados",
    titulo: "HIFU: qué es, cómo funciona y cuándo se notan los resultados",
    desc: "El HIFU es un tratamiento de ultrasonido focalizado para la firmeza de la piel. Qué esperar de la sesión, cuándo se ven los cambios y quién puede hacérselo.",
    fecha: "2026-10-08",
    tiempo: "4 min",
    secciones: [
      { h: "Qué es el HIFU", p: ["HIFU significa ultrasonido focalizado de alta intensidad. Es un tratamiento no invasivo de aparatología que aplica energía en capas profundas de la piel para estimular la producción de colágeno y atenuar los signos de envejecimiento facial. También se usa para el remodelado corporal."] },
      { h: "Qué esperar de la sesión", p: ["Es un procedimiento sin cortes. La profesional evalúa tu piel, define las zonas y aplica el equipo. Cada persona percibe la sesión de forma distinta y puede sentir sensaciones de calor o cosquilleo en la zona."] },
      { h: "Cuándo se notan los resultados", p: ["Como estimula tu propio colágeno, los cambios son graduales y suelen notarse a lo largo de las semanas siguientes. La cantidad de sesiones y la duración del efecto dependen de cada piel, de la edad y de los hábitos, por eso se define en la evaluación."] },
      { h: "Antes de hacértelo", p: ["No todas las personas pueden realizarse el tratamiento. En el gabinete se hace una evaluación previa para confirmar que sea adecuado para vos. La atención es siempre con turno previo."] },
    ],
    faq: [
      { q: "¿Duele el HIFU?", a: "La sensación varía de una persona a otra. Se trabaja con una profesional que te acompaña durante toda la sesión." },
      { q: "¿Dónde me lo puedo hacer en Concepción del Uruguay?", a: "En Aguamarina Estética y Bienestar, con turno previo por WhatsApp." },
    ],
    enlaces: [{ label: "Tratamiento Hifu 7D", href: "/tratamientos/hifu-7d" }],
  },
  {
    slug: "depilacion-definitiva-que-saber-antes-de-empezar",
    seo: "Depilación definitiva: qué saber antes de empezar",
    titulo: "Depilación definitiva: qué tenés que saber antes de empezar",
    desc: "Cómo funciona la depilación definitiva, por qué se hacen varias sesiones, cuidados antes y después y cuándo conviene consultar primero.",
    fecha: "2026-10-08",
    tiempo: "4 min",
    secciones: [
      { h: "Qué es en realidad", p: ["La depilación definitiva es una reducción progresiva del vello mediante tecnología de aparatología. No es de una sola vez: el vello crece en ciclos y por eso las sesiones se espacian en el tiempo para alcanzarlo en cada fase."] },
      { h: "Antes de empezar", p: ["En una primera consulta se evalúa el tipo de piel, el vello y la zona. Es importante avisar si tomás medicación, si estás embarazada o si tenés alguna condición de la piel, porque puede cambiar la indicación."] },
      {
        h: "Cuidados generales",
        p: ["Las recomendaciones exactas te las da la profesional, pero en general:"],
        ul: ["Evitar el sol directo y el bronceado en la zona a tratar.", "Usar protector solar después de las sesiones.", "No depilar con cera ni arrancar el vello entre sesiones; sí se puede rasurar, según indicación."],
      },
      { h: "Qué resultados esperar", p: ["El vello se va reduciendo con las sesiones. La cantidad necesaria depende de la zona, del tipo de vello y de cada persona, y se define en la evaluación inicial."] },
    ],
    faq: [
      { q: "¿Cuántas sesiones necesito?", a: "Depende de la zona y de cada persona. Se define en la evaluación inicial." },
      { q: "¿Puedo hacerme depilación definitiva en Concepción del Uruguay?", a: "Sí, en Aguamarina Estética y Bienestar, con turno previo por WhatsApp." },
    ],
    enlaces: [{ label: "Depilación definitiva", href: "/tratamientos/depilacion-definitiva" }],
  },
];
