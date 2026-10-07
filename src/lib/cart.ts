"use client";

import { useSyncExternalStore } from "react";

// Carrito guardado en el navegador de quien compra (no hace falta cuenta).
// Solo guarda qué producto y cuántas unidades: nombres y precios se vuelven a
// leer del servidor al pagar, así nadie puede alterar un precio desde acá.

export type CartLine = { id: string; qty: number };

const KEY = "aguamarina-carrito";
const EMPTY: CartLine[] = [];
let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    cache = Array.isArray(raw)
      ? raw.filter((l) => l && typeof l.id === "string" && Number.isInteger(l.qty) && l.qty > 0)
      : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: CartLine[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Sin almacenamiento (modo privado): el carrito vive solo mientras la página siga abierta.
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addToCart(id: string, qty = 1) {
  const cart = read();
  const found = cart.find((l) => l.id === id);
  write(found ? cart.map((l) => (l.id === id ? { ...l, qty: Math.min(l.qty + qty, 20) } : l)) : [...cart, { id, qty }]);
}

export function setQty(id: string, qty: number) {
  write(qty <= 0 ? read().filter((l) => l.id !== id) : read().map((l) => (l.id === id ? { ...l, qty: Math.min(qty, 20) } : l)));
}

export function clearCart() {
  write([]);
}
