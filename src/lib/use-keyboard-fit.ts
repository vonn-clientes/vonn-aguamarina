"use client";
import { useEffect } from "react";

// Mientras el chat está abierto en el celular: bloquea el scroll de la página y ajusta el chat al área
// realmente visible (arriba de teclado), así el encabezado de Sofi queda siempre a la vista.
export function useKeyboardFit(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("ag-chat-open");
    const vv = window.visualViewport;
    const apply = () => {
      root.style.setProperty("--ag-vvh", `${vv ? vv.height : window.innerHeight}px`);
      root.style.setProperty("--ag-vvt", `${vv ? vv.offsetTop : 0}px`);
    };
    apply();
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    return () => {
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      root.classList.remove("ag-chat-open");
      root.style.removeProperty("--ag-vvh");
      root.style.removeProperty("--ag-vvt");
    };
  }, [open]);
}
