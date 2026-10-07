"use client";

import { useActionState } from "react";
import { sendContactMessage, type ContactFormState } from "@/app/actions/contact";

const initialState: ContactFormState = { ok: false, message: "" };

export function ContactForm({ tenantId }: { tenantId: string }) {
  const [state, formAction, pending] = useActionState(
    sendContactMessage.bind(null, tenantId),
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md w-full">
      <div className="flex flex-col gap-1">
        <label className="vonn-text-caption" htmlFor="name">Nombre</label>
        <input
          id="name"
          name="name"
          required
          className="rounded-sm border border-line bg-surface px-4 py-3 vonn-text-cuerpo outline-none focus:border-primary transition-colors"
          style={{ transitionDuration: "180ms" }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="vonn-text-caption" htmlFor="phone">Teléfono</label>
        <input
          id="phone"
          name="phone"
          className="rounded-sm border border-line bg-surface px-4 py-3 vonn-text-cuerpo outline-none focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="vonn-text-caption" htmlFor="message">Mensaje</label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="rounded-sm border border-line bg-surface px-4 py-3 vonn-text-cuerpo outline-none focus:border-primary resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-pill bg-primary text-white px-6 py-3 vonn-text-cuerpo font-medium disabled:opacity-60 transition-opacity"
      >
        {pending ? "Enviando..." : "Enviar mensaje"}
      </button>
      {state.message && (
        <p className={`vonn-text-caption ${state.ok ? "" : "text-accent"}`}>{state.message}</p>
      )}
    </form>
  );
}
