"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/panel/actions/auth";

// Menú del panel, agrupado por lo que Ingrid quiere hacer (no por cómo está armado el sistema).
const GROUPS: { title?: string; links: { href: string; label: string; big?: boolean }[] }[] = [
  {
    links: [
      { href: "/panel", label: "Inicio" },
      { href: "/panel/agenda", label: "Agenda y cuentas", big: true },
    ],
  },
  {
    title: "Mi sitio",
    links: [
      { href: "/panel/contenido", label: "Textos y datos" },
      { href: "/panel/catalogo", label: "Tratamientos y productos" },
      { href: "/panel/promos", label: "Promociones" },
      { href: "/panel/opiniones", label: "Opiniones" },
    ],
  },
  {
    title: "Clientes",
    links: [
      { href: "/panel/pedidos", label: "Pedidos de la tienda" },
    ],
  },
  {
    title: "Más",
    links: [
      { href: "/panel/links", label: "Links para Instagram" },
      { href: "/panel/soporte", label: "Ayuda" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full sm:w-64 shrink-0 bg-white sm:border-r border-line flex flex-col sm:h-screen sm:sticky sm:top-0">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between sm:block">
        <Link href="/panel" aria-label="Inicio del panel">
          <Image src="/logo-aguamarina-oficial.png" alt="Aguamarina" width={120} height={42} sizes="120px" priority />
        </Link>
        <form action={logout} className="sm:hidden">
          <button className="text-sm text-ink-muted px-2">Salir</button>
        </form>
      </div>
      <nav className="ag-nav" aria-label="Panel del sitio">
        {GROUPS.map((g, i) => (
          <div key={i}>
            {g.title && <h3>{g.title}</h3>}
            {g.links.map((l) => (
              <Link key={l.href} href={l.href} className={l.big ? "big" : undefined} aria-current={pathname === l.href ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <form action={logout} className="p-3 hidden sm:block">
        <button className="w-full text-left rounded-sm px-4 py-2.5 text-sm text-ink-muted hover:bg-canvas-muted">Cerrar sesión</button>
      </form>
    </aside>
  );
}
