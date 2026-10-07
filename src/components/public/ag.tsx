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
          <Image src="/logo-aguamarina.png" alt="" width={72} height={72} className="ag-brand__mark" priority />
          <span className="ag-brand__name">{SITE.shortName}</span>
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
          <TurnoButton whatsapp={whatsapp} size="small" />
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
          <a className="ag-made" href="https://www.vonn.com.ar" target="_blank" rel="noopener noreferrer" aria-label="Sitio creado con VONN. Ir a vonn.com.ar">
            <span>Creado con</span>
            <Image src="/logo/vonn-logo-light.svg" alt="VONN" width={110} height={32} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export function Medallion({ priority = false, size = 168 }: { priority?: boolean; size?: number }) {
  return (
    <Image
      className="ag-medallion"
      src="/logo-aguamarina.png"
      alt="Logo de Aguamarina Estética y Bienestar: una cinta de agua con una flor de loto"
      width={296}
      height={296}
      priority={priority}
      style={{ width: size, height: size }}
    />
  );
}

// Bloque de asesoramiento: para quien no sabe qué tratamiento o producto necesita.
export function Advice({ whatsapp, topic = "mi piel y mi cuerpo" }: { whatsapp: string | null | undefined; topic?: string }) {
  return (
    <section className="ag-section ag-advice" aria-labelledby="t-asesoramiento">
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
