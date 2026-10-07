"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

// Ícono del carrito en la barra superior, con la cantidad de productos.
export function CartLink() {
  const cart = useCart();
  const count = cart.reduce((n, l) => n + l.qty, 0);
  return (
    <Link href="/tienda/carrito" className="ag-cart" aria-label={count ? `Carrito, ${count} productos` : "Carrito vacío"}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      </svg>
      {count > 0 && <span className="ag-cart__n">{count}</span>}
    </Link>
  );
}
