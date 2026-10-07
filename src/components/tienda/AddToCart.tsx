"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

// Botón "Agregar al carrito" de cada producto. Cuando ya se agregó, avisa un instante.
export function AddToCart({ id, name }: { id: string; name: string }) {
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      className="ag-btn"
      onClick={() => {
        addToCart(id);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
      aria-label={`Agregar ${name} al carrito`}
    >
      {added ? "Agregado ✓" : "Agregar al carrito"}
    </button>
  );
}
