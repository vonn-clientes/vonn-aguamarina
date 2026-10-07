import { SofiChat } from "./SofiChat";
import Image from "next/image";
import Link from "next/link";
import { SITE, MAPS_LINK } from "@/lib/site";
import { waLink, phoneDisplay } from "@/lib/seo";
import type { SiteContent } from "@/lib/types";
import { MobileMenu, type NavItem } from "./menu";
import { CartLink } from "@/components/tienda/CartLink";

export function WhatsappIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M16 2C8.3 2 2 8.3 2 16c0 2.6.7 5.1 2 7.3L2 30l6.9-1.8c2.1 1.2 4.6 1.8 7.1 1.8 7.7 0 14-6.3 14-14S23.7 2 16 2zm0 25.5c-2.3 0-4.5-.6-6.4-1.8l-.5-.3-4.1 1.1 1.1-4-.3-.5C4.6 20.2 4 18.1 4 16 4 9.4 9.4 4 16 4s12 5.4 12 12-5.4 11.5-12 11.5zm6.6-8.7c-.4-.2-2.1-1-2.4-1.2-.3-.1-.6-.2-.8.2-.2.4-.9 1.2-1.1 1.4-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8.2-.2.4-.4.6-.7.2-.2.3-.4.4-.7.1-.3.1-.5 0-.7-.1-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.8 5.1.8.3 1.5.5 2 .7.8.3 1.6.2 2.1.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.3-.2-.7-.4z" />
    </svg>
  );
}

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
    </svg>
  );
}

// Pin de Google Maps (marca de Google) para el botón "Cómo llegar".
export function MapsIcon() {
  return (
    <svg viewBox="0 0 92.3 132.3" aria-hidden="true" focusable="false">
      <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z" />
      <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z" />
      <path fill="#4285f4" d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3" />
      <path fill="#fbbc04" d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3" />
      <path fill="#34a853" d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.3 14.5 6.7 23.1 12.7 23.1s3.4-8.7 12.9-23.2" />
    </svg>
  );
}

// Botón flotante de WhatsApp, siempre visible abajo a la derecha: para cualquier consulta.
export function WhatsappFloat({ whatsapp }: { whatsapp: string | null | undefined }) {
  return (
    <a
      className="ag-wafloat"
      href={waLink(whatsapp, "Hola! Quería hacerles una consulta")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
    >
      <WhatsappIcon />
    </a>
  );
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Se reemplaza "<" para que ningún texto cargado desde el panel pueda cerrar el <script>.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

// Botón principal de la web: siempre el mismo verbo y el mismo destino.
export function TurnoButton({
  whatsapp,
  text = "Hola! Quiero sacar un turno",
  children = "Sacar turno",
  size,
  tone,
}: {
  whatsapp: string | null | undefined;
  text?: string;
  children?: React.ReactNode;
  size?: "small";
  tone?: "light";
}) {
  const cls = ["ag-btn", size === "small" && "ag-btn--small", tone === "light" && "ag-btn--light"]
    .filter(Boolean)
    .join(" ");
  return (
    <a className={cls} href={waLink(whatsapp, text)} target="_blank" rel="noopener noreferrer">
      <WhatsappIcon />
      {children}
    </a>
  );
}

export function SiteHeader({
  whatsapp,
  showProducts = true,
}: {
  whatsapp: string | null;
  showProducts?: boolean;
}) {
  const nav: NavItem[] = [
    { href: "/#tratamientos", label: "Tratamientos" },
    ...(showProducts ? [{ href: "/tienda", label: "Tienda" }] : []),
    { href: "/#ingrid", label: "Conocé a Ingrid" },
    { href: "/#preguntas", label: "Preguntas" },
    { href: "/#donde", label: "Contacto" },
  ];
  return (
    <header className="ag-header">
      <div className="ag-header__in">
        <Link href="/" className="ag-brand" aria-label={`${SITE.name}, inicio`}>
          <Image src="/logo-aguamarina-oficial.png" alt={SITE.name} width={1200} height={421} sizes="140px" className="ag-brand__mark" priority />
        </Link>

        <nav className="ag-nav" aria-label="Principal">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ag-header__actions">
          {showProducts && <CartLink />}
          <MobileMenu items={nav} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ content }: { content: SiteContent | null }) {
  const wa = content?.whatsapp_number ?? null;
  return (
    <footer className="ag-footer">
      <div className="ag-wrap">
        <div className="ag-footer__top">
          <div>
            <p className="ag-footer__name">{SITE.name}</p>
            <p>{SITE.tagline}</p>
            <address style={{ fontStyle: "normal" }}>
              {SITE.street}, {SITE.city}, {SITE.region}
            </address>
            <p>Atención solo con turno previo.</p>
          </div>
          <div className="ag-footer__actions">
            <a className="ag-btn" href={waLink(wa, "Hola! Quiero sacar un turno")} target="_blank" rel="noopener noreferrer">
              <WhatsappIcon />
              {phoneDisplay(wa)}
            </a>
            {content?.instagram_url && (
              <a className="ag-btn ag-btn--ghost" href={content.instagram_url} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            <a className="ag-btn ag-btn--ghost" href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
              Cómo llegar
            </a>
          </div>
        </div>
        <div className="ag-footer__bottom">
          <p>© {new Date().getFullYear()} {SITE.name}</p>
          <a className="ag-made" href="https://www.vonn.com.ar" target="_blank" rel="noopener noreferrer" aria-label="Sitio creado por VONN. Ir a vonn.com.ar">
            <span>Creado por</span>
            <Image src="/logo/vonn-logo-light.svg" alt="VONN" width={110} height={32} />
          </a>
        </div>
      </div>
      <WhatsappFloat whatsapp={wa} />
      <SofiChat whatsapp={wa} />
    </footer>
  );
}

export function Medallion({ priority = false, size = 168 }: { priority?: boolean; size?: number }) {
  return (
    <Image
      className="ag-medallion"
      src="/logo-aguamarina-oficial.png"
      alt="Aguamarina, estética y bienestar"
      width={1200}
      height={421}
      priority={priority}
      sizes={`(max-width: 760px) 320px, ${Math.max(size, 320)}px`}
      style={{ width: size, height: "auto" }}
    />
  );
}

// Bloque de asesoramiento: para quien no sabe qué tratamiento o producto necesita.
export function Advice({ whatsapp, topic = "mi piel y mi cuerpo" }: { whatsapp: string | null | undefined; topic?: string }) {
  return (
    <section className="ag-section ag-advice" id="asesoramiento" aria-labelledby="t-asesoramiento">
      <div className="ag-wrap ag-rise">
        <div className="ag-advice__box">
          <h2 className="ag-h2" id="t-asesoramiento">
            ¿No sabés qué necesitás?
          </h2>
          <p className="ag-lead">
            Contanos qué te gustaría cambiar o cuidar y te asesoramos por WhatsApp: vemos qué necesita tu piel y tu
            cuerpo.
          </p>
          <TurnoButton whatsapp={whatsapp} text={`Hola! Quiero que me asesoren sobre ${topic}`}>
            Pedir asesoramiento
          </TurnoButton>
        </div>
      </div>
    </section>
  );
}
