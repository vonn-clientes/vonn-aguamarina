"use client";

import { useActionState, useState } from "react";
import { inviteEmployee, type InviteState } from "@/app/panel/(dashboard)/empleados/actions";

const initialState: InviteState = { error: "", success: "" };

export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteEmployee, initialState);
  const [copyMessage, setCopyMessage] = useState("");

  return (
    <form action={formAction} className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-start">
      <input
        name="email"
        type="email"
        placeholder="email@empleado.com"
        required
        className="rounded-sm border border-line bg-canvas px-4 py-3 vonn-text-cuerpo outline-none focus:border-primary flex-1 w-full sm:w-auto"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-pill bg-primary text-white px-6 py-3 vonn-text-cuerpo font-medium disabled:opacity-60 whitespace-nowrap"
      >
        {pending ? "Invitando..." : "Invitar"}
      </button>
      {state.error && <p className="vonn-text-caption text-accent">{state.error}</p>}
      {state.success && <p className="vonn-text-caption text-primary">{state.success}</p>}
      {state.invitePath && (
        <div className="w-full flex flex-col gap-2">
          <label htmlFor="invite-link" className="vonn-text-caption">Enlace de activación (vence en 7 días)</label>
          <input id="invite-link" readOnly value={state.invitePath} onFocus={(event) => event.target.select()}
            className="w-full rounded-sm border border-line bg-canvas px-4 py-3 vonn-text-caption" />
          <button type="button" className="self-start vonn-text-caption text-primary" onClick={async () => {
            try {
              await navigator.clipboard.writeText(new URL(state.invitePath!, window.location.origin).href);
              setCopyMessage("Enlace copiado.");
            } catch {
              setCopyMessage("Seleccioná el enlace y copialo manualmente.");
            }
          }}>Copiar enlace</button>
          <p className="vonn-text-caption text-ink-muted">Compartilo con la persona invitada. No se envía por email.</p>
          <p role="status" className="vonn-text-caption">{copyMessage}</p>
        </div>
      )}
    </form>
  );
}
