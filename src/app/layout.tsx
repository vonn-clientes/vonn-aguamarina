import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
// Fuentes auto-hospedadas con @fontsource: no dependen de Google Fonts, así
// que no hay pedidos externos que frenen la carga (mejor velocidad = mejor SEO).
// Nunito la sigue usando el panel de gestión (/panel).
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "./globals.css";
import "./aguamarina.css";
import { SITE } from "@/lib/site";

// Tipografías del sitio público. Con next/font se precargan y se les calcula
// una fuente de respaldo del mismo tamaño, así el texto no "salta" al cargar
// (eso es lo que mide Google como estabilidad visual, CLS).
const sans = localFont({
  src: [
    { path: "../../node_modules/@fontsource/instrument-sans/files/instrument-sans-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/instrument-sans/files/instrument-sans-latin-500-normal.woff2", weight: "500" },
    { path: "../../node_modules/@fontsource/instrument-sans/files/instrument-sans-latin-600-normal.woff2", weight: "600" },
    { path: "../../node_modules/@fontsource/instrument-sans/files/instrument-sans-latin-700-normal.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-ag-sans",
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "sans-serif"],
});

const DESCRIPTION =
  "Gabinete de estética en Concepción del Uruguay: tratamientos faciales y corporales, aparatología, manicuría y maquillaje. Atención solo con turno previo.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Estética en Concepción del Uruguay | Aguamarina",
    template: "%s | Aguamarina",
  },
  description: DESCRIPTION,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE.name,
    title: "Estética en Concepción del Uruguay | Aguamarina",
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Estética en Concepción del Uruguay | Aguamarina",
    description: DESCRIPTION,
  },
  // Mientras sea una muestra, Google no la indexa (ver SITE.indexable).
  robots: SITE.indexable
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2C7384",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`h-full antialiased ${sans.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
