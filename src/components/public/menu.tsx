"use client";

import Link from "next/link";
import { useState } from "react";

export type NavItem = { href: string; label: string };

// Menú del celular: se abre desde la barra y se cierra solo al elegir una opción.
export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ag-menu">
      <button
        type="button"
        className="ag-menu__btn"
        aria-expanded={open}
        aria-controls="ag-menu-panel"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Cerrar" : "Menú"}
      </button>
      {open && (
        <nav id="ag-menu-panel" className="ag-menu__panel" aria-label="Menú">
          {items.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
