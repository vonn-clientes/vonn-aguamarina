import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { waLink, phoneDisplay } from "@/lib/seo";
import type { SiteContent } from "@/lib/types";
import { MobileMenu, type NavItem } from "./menu";

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
    ...(showProducts ? [{ href: "/#productos", label: "Productos" }] : []),
    { href: "/#ingrid", label: "Ingrid" },
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
          <TurnoButton whatsapp={whatsapp} size="small" />
          <MobileMenu items={nav} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ content }: { content: SiteContent | null }) {
  return (
    <footer className="ag-footer">
      <div className="ag-wrap">
        <div className="ag-footer__grid">
          <div>
            <p className="ag-footer__name">{SITE.name}</p>
            <p>{SITE.tagline} en {SITE.city}.</p>
            <p>Atención solo con turno previo.</p>
          </div>
          <div>
            <h2>Contacto</h2>
            <ul>
              <li>
                <a href={waLink(content?.whatsapp_number)} target="_blank" rel="noopener noreferrer">
                  WhatsApp {phoneDisplay(content?.whatsapp_number)}
                </a>
              </li>
              {content?.instagram_url && (
                <li>
                  <a href={content.instagram_url} target="_blank" rel="noopener noreferrer">
                    Instagram @aguamarinaesteticaybienestar
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h2>Dónde estamos</h2>
            <address style={{ fontStyle: "normal" }}>
              {SITE.street}
              <br />
              {SITE.city}, {SITE.region}
            </address>
          </div>
        </div>
        <p className="ag-footer__legal">
          © {new Date().getFullYear()} {SITE.name}. Sitio creado y mantenido por{" "}
          <a href="https://www.vonn.com.ar" target="_blank" rel="noopener noreferrer">
            VONN
          </a>
          .
        </p>
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
