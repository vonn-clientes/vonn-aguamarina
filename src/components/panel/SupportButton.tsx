"use client";

import { useState, useActionState, useEffect } from "react";
import { createTicket, type TicketState } from "@/app/panel/(dashboard)/soporte/actions";

const categories = [
  "No carga una imagen o una foto",
  "Un texto o precio está mal",
  "El sitio no abre / da error",
  "No me llegan los mensajes o turnos",
  "Otra cosa",
];

const initialState: TicketState = { error: "", success: "" };

// Botón flotante de "reportar un error" — vive SOLO dentro del panel
// privado, nunca en la vista pública del sitio (Fase 3 del documento).
export function SupportButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createTicket, initialState);

  useEffect(() => {
    if (state.success) {
      const timeout = setTimeout(() => setOpen(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [state.success]);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <form
          action={formAction}
          className="w-80 rounded-lg border border-line bg-surface p-5 shadow-lg flex flex-col gap-3"
        >
          <p className="vonn-text-subtitulo" style={{ fontSize: 18, lineHeight: "24px" }}>
            ¿Qué problema encontraste?
          </p>
          <select
            name="category"
            className="rounded-sm border border-line bg-canvas px-3 py-2 vonn-text-caption outline-none focus:border-primary"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <textarea
            name="description"
            required
            rows={3}
            placeholder="Contanos con el mayor detalle posible..."
            className="rounded-sm border border-line bg-canvas px-3 py-2 vonn-text-caption outline-none focus:border-primary resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-pill bg-primary text-white px-4 py-2 vonn-text-caption font-medium disabled:opacity-60"
            >
              {pending ? "Enviando..." : "Enviar reporte"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="vonn-text-caption text-ink-muted px-2">
              Cerrar
            </button>
          </div>
          {state.error && <p className="vonn-text-caption text-accent">{state.error}</p>}
          {state.success && <p className="vonn-text-caption text-primary">{state.success}</p>}
        </form>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Reportar un problema"
        className="h-14 w-14 rounded-full bg-ink text-canvas shadow-lg flex items-center justify-center vonn-text-subtitulo"
      >
        ?
      </button>
    </div>
  );
}
