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
import { JsonLd, Medallion, SiteFooter, SiteHeader, TurnoButton } from "@/components/public/ag";

// La página se genera una vez y se refresca sola cada 60 segundos: rápida
// para quien visita, y los cambios que haga la dueña desde el panel se ven
// en menos de un minuto.
export const revalidate = 60;

const CATEGORY_HEADLINES: Record<string, string> = {
  Faciales: "Tu piel, bien cuidada.",
  Corporales: "Aparatología para tu cuerpo.",
  "Manos y estilo": "Manos, maquillaje y peinados.",
};

const CREDENTIALS = ["Cosmetología y cosmiatría", "Esteticista", "Maquilladora profesional", "Manicura", "Aparatología"];

export default async function Home() {
  const site = await getPublicSite();
  if (!site) notFound();
  const { content, services, products } = site;
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
        <section className="ag-hero">
          <div className="ag-wrap">
            <h1 className="ag-h1">{content?.hero_title || `Estética y bienestar en ${SITE.city}`}</h1>
            {content?.hero_subtitle && <p className="ag-lead">{content.hero_subtitle}</p>}
            <div className="ag-actions">
              <TurnoButton whatsapp={wa} />
              <Link className="ag-more" href="/#tratamientos">
                Ver tratamientos
              </Link>
            </div>
            <Medallion priority size={176} />
          </div>
        </section>

        <div className="ag-wrap">
          <div className="ag-facts">
            <p>
              <strong>Profesional matriculada</strong>
              {SITE.owner}
            </p>
            <p>
              <strong>Solo con turno previo</strong>
              Te esperamos con tiempo para vos
            </p>
            <p>
              <strong>{SITE.city}</strong>
              {SITE.street}
            </p>
          </div>
        </div>

        {/* ---- Tratamientos ---- */}
        <section className="ag-section ag-section--tiles" id="tratamientos" aria-labelledby="t-tratamientos" style={{ paddingTop: 0 }}>
          <div className="ag-wrap">
            <div className="ag-head ag-rise">
              <h2 className="ag-h2" id="t-tratamientos">
                Tratamientos
              </h2>
              <p className="ag-lead">Elegí una categoría y mirá cada tratamiento en detalle.</p>
            </div>
            <div className="ag-tiles">
              {groups.map(([category, items]) => (
                <article className="ag-tile ag-rise" key={category} id={slugify(category)}>
                  <p className="ag-kicker">{category}</p>
                  <h3 className="ag-h3">{CATEGORY_HEADLINES[category] ?? category}</h3>
                  <ul className="ag-minis">
                    {items.map((item) => (
                      <li key={item.id}>
                        <Link className="ag-mini" href={`/tratamientos/${slugify(item.name)}`}>
                          <span className="ag-mini__name">{item.name}</span>
                          {item.description && <span className="ag-mini__desc">{trimDescription(item.description, 90)}</span>}
                          <span className="ag-mini__go">Conocé más ›</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <a
                    className="ag-more"
                    href={waLink(wa, `Hola! Quiero consultar por tratamientos de ${category.toLowerCase()}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Consultar
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Productos ---- */}
        {products.length > 0 && (
          <section className="ag-section ag-section--alt" id="productos" aria-labelledby="t-productos">
            <div className="ag-wrap">
              <div className="ag-head ag-rise">
                <h2 className="ag-h2" id="t-productos">
                  Productos
                </h2>
                <p className="ag-lead">Para seguir en casa lo que trabajamos en el gabinete.</p>
              </div>
              <div className="ag-cards">
                {products.map((p) => (
                  <article className="ag-card ag-rise" key={p.id}>
                    <h3 className="ag-h3">{p.name}</h3>
                    {p.description && <p>{p.description}</p>}
                    <a
                      className="ag-more"
                      href={waLink(wa, `Hola! Quiero consultar por ${p.name}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Consultar
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---- Ingrid ---- */}
        <section className="ag-section ag-section--deep" id="ingrid" aria-labelledby="t-ingrid">
          <div className="ag-wrap ag-about ag-rise">
            <Medallion size={112} />
            <h2 className="ag-h2" id="t-ingrid">
              {SITE.owner}, profesional matriculada.
            </h2>
            {content?.about_text && <p className="ag-lead">{content.about_text}</p>}
            <ul className="ag-creds">
              {CREDENTIALS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
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
                  <dd>Solo con turno previo</dd>
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
      </main>

      <SiteFooter content={content} />

      <JsonLd data={businessJsonLd(content, services)} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={faqJsonLd(FAQ)} />
    </div>
  );
}
