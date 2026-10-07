"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/panel/agenda", label: "Hoy", exact: true },
  { href: "/panel/agenda/semana", label: "Semana" },
  { href: "/panel/agenda/clientas", label: "Clientas" },
  { href: "/panel/agenda/caja", label: "Caja" },
];

export function AgendaNav() {
  const pathname = usePathname();
  const onForm = pathname.startsWith("/panel/agenda/turnos");
  return (
    <>
      <nav className="ag-g-nav" aria-label="Secciones de la agenda">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}>
              {l.label}
            </Link>
          );
        })}
      </nav>
      {!onForm && (
        <Link href="/panel/agenda/turnos/nuevo" className="ag-g-btn ag-g-btn--main ag-g-fab">
          + Nuevo turno
        </Link>
      )}
    </>
  );
}
