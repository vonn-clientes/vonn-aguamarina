"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Google Analytics 4 (propiedad "Aguamarina Estética" en la cuenta Vonn de Fausto).
// Solo en las páginas públicas: el panel, /cm, el formulario y los links de turno no se miden.
const GA_ID = "G-2WNCQPM7ZE";
const PRIVADAS = ["/panel", "/cm", "/formulario", "/turno"];

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { gtag?: Gtag; dataLayer?: unknown[] }
}

export function Analitica() {
  const path = usePathname() || "/";
  const publica = !PRIVADAS.some((p) => path === p || path.startsWith(p + "/"));

  useEffect(() => {
    if (!publica) return;
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("a,button");
      if (!el || !window.gtag) return;
      const ubicacion = el.dataset.ubicacion || el.closest("section[id]")?.id || (el.closest("header") ? "header" : el.closest("footer") ? "footer" : "otro");
      const evento = el.dataset.evento;
      if (evento) {
        window.gtag("event", evento, { ubicacion, item: el.dataset.item || undefined });
        return;
      }
      const href = el instanceof HTMLAnchorElement ? el.href : "";
      if (/wa\.me|api\.whatsapp\.com/.test(href)) {
        const nombre = location.pathname.startsWith("/tienda/carrito") ? "pedido_whatsapp" : "click_whatsapp";
        window.gtag("event", nombre, { ubicacion, pagina: location.pathname });
      } else if (/instagram\.com/.test(href)) {
        window.gtag("event", "click_instagram", { ubicacion });
      } else if (/google\.[^/]+\/maps|maps\.app\.goo\.gl/.test(href)) {
        window.gtag("event", "como_llegar", { ubicacion });
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [publica]);

  if (!publica) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
