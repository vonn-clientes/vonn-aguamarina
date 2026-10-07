"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VonnLogo } from "@/components/Logo";
import { logout } from "@/app/panel/actions/auth";
import type { BusinessMode } from "@/lib/types";

const baseLinks = [
  { href: "/panel", label: "Inicio" },
  { href: "/panel/contenido", label: "Editor del sitio" },
  { href: "/panel/catalogo", label: "Catálogo" },
  { href: "/panel/links", label: "Links para Instagram" },
  { href: "/panel/mensajes", label: "Mensajes" },
  { href: "/panel/empleados", label: "Empleados" },
  { href: "/panel/configuracion", label: "Configuración" },
  { href: "/panel/soporte", label: "Soporte" },
];

export function Sidebar({
  businessName,
  businessMode,
}: {
  businessName: string;
  businessMode: BusinessMode;
}) {
  const pathname = usePathname();

  const links = [...baseLinks];
  if (businessMode !== "ninguno") {
    links.splice(3, 0, {
      href: "/panel/actividad",
      label: businessMode === "turnos" ? "Turnos" : "Pedidos",
    });
  }

  return (
    <aside className="w-full sm:w-60 shrink-0 border-b sm:border-b-0 sm:border-r border-line bg-surface flex sm:flex-col sm:h-screen sm:sticky sm:top-0">
      <div className="p-6 hidden sm:flex sm:flex-col sm:gap-1">
        <VonnLogo />
        <p className="vonn-text-caption text-ink-muted">{businessName}</p>
      </div>
      <nav className="flex sm:flex-col gap-1 p-3 sm:p-3 overflow-x-auto sm:overflow-visible flex-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-sm px-4 py-2.5 vonn-text-cuerpo transition-colors ${
                active ? "bg-primary text-white" : "text-ink hover:bg-canvas-muted"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={logout} className="p-3">
        <button className="w-full text-left rounded-sm px-4 py-2.5 vonn-text-caption text-ink-muted hover:bg-canvas-muted whitespace-nowrap">
          Cerrar sesión
        </button>
      </form>
    </aside>
  );
}
