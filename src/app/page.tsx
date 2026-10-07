import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSite } from "@/lib/public-data";
import { SITE, FULL_ADDRESS, MAPS_EMBED_URL, MAPS_LINK } from "@/lib/site";
import {
  FAQ,
  businessJsonLd,
  faqJsonLd,
  groupByCategory,
  phoneDisplay,
  slugify,
  trimDescription,
  waLink,
  websiteJsonLd,
} from "@/lib/seo";
import { seoAlt } from "@/lib/seo-image";
import { Advice, JsonLd, Medallion, SiteFooter, SiteHeader, TurnoButton } from "@/components/public/ag";
import { ProductCard } from "@/components/tienda/ProductCard";
import { TreatmentCard } from "@/components/public/TreatmentCard";

// La página se genera una vez y se refresca sola cada 60 segundos: rápida
// para quien visita, y los cambios que haga la dueña desde el panel se ven
// en menos de un minuto.
export const revalidate = 60;

const CATEGORY_HEADLINES: Record<string, string> = {
  Faciales: "Tu piel, bien cuidada.",
  Corporales: "Tu cuerpo, en equilibrio.",
  "Manos y estilo": "Manos, maquillaje y peinados.",
};

const POLICIES = [
  { title: "Turnos en día y horario", text: "Los turnos se respetan en el día y el horario acordados." },
  { title: "Si no podés venir", text: "Avisanos con 24 horas de anticipación. Si no, se abona el 50% de la sesión." },
  { title: "Tiempo de espera", text: "Con aviso previo, 15 minutos. Sin aviso, se aguardan 10 minutos y el turno se da por cancelado." },
  { title: "Packs", text: "Tienen una duración de 1 mes y medio." },
  { title: "Vouchers", text: "Tienen vigencia de 1 mes." },
];

const CREDENTIALS = ["Cosmetología y cosmiatría", "Esteticista", "Maquilladora profesional", "Manicura", "Aparatología"];

export default async function Home() {
  const site = await getPublicSite();
  if (!site) notFound();
  const { content, services, products, promos } = site;
  const groups = groupByCategory(services);
  const wa = content?.whatsapp_number ?? null;

  return (
    <div className="ag">
      <a className="ag-skip" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader whatsapp={wa} showProducts={products.length > 0} />

      <main id="contenido">
        {/* ---- Portada ---- */}
        <section className="ag-hero ag-hero--water">
          <div className="ag-wrap ag-hero__grid">
            <div className="ag-hero__copy">
              <h1 className="ag-hero__title">Estética y bienestar para tu piel y tu cuerpo.</h1>
              <p className="ag-hero__lead">
                {content?.hero_title || "Tratamientos faciales y corporales, aparatología, manicura y maquillaje"}
              </p>
              <div className="ag-actions">
                <TurnoButton whatsapp={wa} tone="light">Sacar turno</TurnoButton>
                <Link className="ag-hero__link" href="/#tratamientos">
                  Ver tratamientos
                </Link>
              </div>
              <a className="ag-gbadge" href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
                <span className="ag-stars" aria-hidden="true">
                  <span className="on">★</span><span className="on">★</span><span className="on">★</span><span className="on">★</span><span className="on">★</span>
                </span>
                <span>5 estrellas en Google Maps</span>
              </a>
            </div>
            <div className="ag-hero__logo">
              <Medallion priority size={420} />
            </div>
          </div>
          <svg className="ag-hero__wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30c260 55 520 55 760 22s460-45 680-6v44H0z" fill="rgba(79,159,207,0.28)" />
            <path d="M0 52c240 40 480 40 720 12s480-34 720 0v26H0z" fill="#eaf3fb" />
          </svg>
        </section>

        {/* ---- Tratamientos ---- */}
        <section className="ag-section ag-section--tiles" id="tratamientos" aria-labelledby="t-tratamientos">
          <div className="ag-wrap">
            <div className="ag-head ag-rise">
              <h2 className="ag-h2" id="t-tratamientos">
                Tratamientos
              </h2>
              <p className="ag-lead">Faciales, corporales, manos y estilo.</p>
            </div>
            {groups.map(([category, items]) => (
              <article className="ag-cat" key={category} id={slugify(category)}>
                <div className="ag-cat__head ag-rise">
                  <p className="ag-kicker">{category}</p>
                  <h3 className="ag-h3">{CATEGORY_HEADLINES[category] ?? category}</h3>
                </div>
                <div className="ag-tgrid">
                  {items.map((item) => (
                    <TreatmentCard key={item.id} item={item} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---- Promociones ---- */}
        {promos.length > 0 && (
          <section className="ag-section" id="promociones" aria-labelledby="t-promos">
            <div className="ag-wrap">
              <div className="ag-head ag-rise">
                <h2 className="ag-h2" id="t-promos">
                  Promociones
                </h2>
                <p className="ag-lead">Combos armados para resultados más completos.</p>
              </div>
              <div className="ag-promos">
                {promos.map((p) => (
                  <article className="ag-promo ag-rise" key={p.id}>
                    <h3>{p.title}</h3>
                    {p.description && <p className="ag-promo__desc">{p.description}</p>}
                    <p className="ag-promo__q">¿Qué incluye?</p>
                    <ul>
                      {p.items.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                    {p.price != null && <p className="ag-promo__price">${Number(p.price).toLocaleString("es-AR")}</p>}
                    {p.note && <p className="ag-promo__note">{p.note}</p>}
                    <TurnoButton whatsapp={wa} text={`Hola! Quiero consultar por el ${p.title}`}>
                      Quiero este combo
                    </TurnoButton>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <Advice whatsapp={wa} />

        {/* ---- Productos ---- */}
        {products.length > 0 && (
          <section className="ag-section ag-section--alt" id="productos" aria-labelledby="t-productos">
            <div className="ag-wrap">
              <div className="ag-head ag-rise">
                <h2 className="ag-h2" id="t-productos">
                  Tienda
                </h2>
                <p className="ag-lead">Para seguir en casa lo que trabajamos en el gabinete.</p>
              </div>
              <div className="ag-shop">
                {products.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} item={p} whatsapp={wa} />
                ))}
              </div>
              <div className="ag-center">
                <Link className="ag-more" href="/tienda">
                  Ver toda la tienda
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ---- Ingrid ---- */}
        <section className="ag-section ag-section--deep" id="ingrid" aria-labelledby="t-ingrid">
          <div className={`ag-wrap ag-meet ag-rise${content?.about_image_url ? "" : " ag-meet--solo"}`}>
            {content?.about_image_url && (
              <div className="ag-meet__photo">
                <Image src={content.about_image_url} alt={seoAlt(SITE.owner, "perfil")} width={560} height={700} sizes="(max-width: 800px) 90vw, 460px" quality={75} />
              </div>
            )}
            <div className="ag-meet__text">
              <p className="ag-kicker ag-kicker--light">Conocé a la profesional</p>
              <h2 className="ag-h2" id="t-ingrid">
                {SITE.owner}
              </h2>
              {content?.about_text && <p className="ag-lead">{content.about_text}</p>}
              <ul className="ag-creds">
                {CREDENTIALS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <TurnoButton whatsapp={wa} tone="light" text="Hola Ingrid! Quiero sacar un turno">
                Sacar turno con Ingrid
              </TurnoButton>
            </div>
          </div>
        </section>

        {/* ---- Dónde estamos ---- */}
        <section className="ag-section" id="donde" aria-labelledby="t-donde">
          <div className="ag-wrap ag-where">
            <div className="ag-rise">
              <h2 className="ag-h2" id="t-donde">
                Dónde estamos
              </h2>
              <dl>
                <div>
                  <dt>Dirección</dt>
                  <dd>
                    <address style={{ fontStyle: "normal" }}>{FULL_ADDRESS}</address>
                  </dd>
                </div>
                <div>
                  <dt>Atención</dt>
                  <dd>Con turno previo, por WhatsApp</dd>
                </div>
                <div>
                  <dt>WhatsApp</dt>
                  <dd>
                    <a href={waLink(wa)} target="_blank" rel="noopener noreferrer">
                      {phoneDisplay(wa)}
                    </a>
                  </dd>
                </div>
                {content?.instagram_url && (
                  <div>
                    <dt>Instagram</dt>
                    <dd>
                      <a href={content.instagram_url} target="_blank" rel="noopener noreferrer">
                        @aguamarinaesteticaybienestar
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              <a className="ag-btn" href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
                Cómo llegar
              </a>
            </div>
            <iframe
              className="ag-map"
              title={`Mapa de ${SITE.name}, ${FULL_ADDRESS}`}
              src={MAPS_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        {/* ---- Cómo sacar turno ---- */}
        <section className="ag-section" id="turnos" aria-labelledby="t-turnos">
          <div className="ag-wrap">
            <div className="ag-head ag-rise">
              <h2 className="ag-h2" id="t-turnos">
                Tu primera visita, paso a paso.
              </h2>
            </div>
            <ol className="ag-steps ag-steps--4">
              <li className="ag-rise">
                <h3>Escribinos</h3>
                <p>Contanos qué tratamiento te interesa o qué querés mejorar.</p>
              </li>
              <li className="ag-rise">
                <h3>Elegimos el horario</h3>
                <p>La atención es solo con turno previo: buscamos el momento que te quede cómodo.</p>
              </li>
              <li className="ag-rise">
                <h3>Primera consulta</h3>
                <p>Conocemos tu piel y tu caso, y te proponemos el tratamiento y la cantidad de sesiones.</p>
              </li>
              <li className="ag-rise">
                <h3>Sesión y cuidados</h3>
                <p>Te explicamos cómo cuidarte en casa para sostener el resultado.</p>
              </li>
            </ol>
            <div className="ag-center">
              <TurnoButton whatsapp={wa}>Sacar turno</TurnoButton>
            </div>
          </div>
        </section>

        {/* ---- Políticas ---- */}
        <section className="ag-section" id="politicas" aria-labelledby="t-politicas">
          <div className="ag-wrap">
            <div className="ag-head ag-rise">
              <h2 className="ag-h2" id="t-politicas">
                Cómo cuidamos tu turno.
              </h2>
              <p className="ag-lead">Estas son las condiciones del gabinete, para que todo sea claro desde el principio.</p>
            </div>
            <ul className="ag-policies">
              {POLICIES.map((p) => (
                <li className="ag-rise" key={p.title}>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- Preguntas frecuentes ---- */}
        <section className="ag-section ag-section--alt" id="preguntas" aria-labelledby="t-preguntas">
          <div className="ag-narrow">
            <div className="ag-head ag-rise">
              <h2 className="ag-h2" id="t-preguntas">
                Preguntas frecuentes
              </h2>
            </div>
            <div className="ag-faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

      </main>

      <SiteFooter content={content} />

      <JsonLd data={businessJsonLd(content, services)} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={faqJsonLd(FAQ)} />
    </div>
  );
}
