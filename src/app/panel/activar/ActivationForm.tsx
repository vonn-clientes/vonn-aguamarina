"use client";

import { useActionState } from "react";
import { activateAccount } from "./actions";

export function ActivationForm({ token, hasAccount }: { token: string; hasAccount: boolean }) {
  const [state, action, pending] = useActionState(activateAccount.bind(null, token), { error: "" });
  return (
    <form action={action} className="flex flex-col gap-4">
      <p className="vonn-text-caption text-ink-muted">
        {hasAccount ? "Ya tenés una cuenta. Ingresá tu contraseña actual para aceptar la invitación." : "Elegí una contraseña de al menos 8 caracteres para entrar al panel."}
      </p>
      <label htmlFor="password" className="vonn-text-caption">Contraseña</label>
      <input id="password" name="password" type="password" required minLength={hasAccount ? undefined : 8}
        autoComplete={hasAccount ? "current-password" : "new-password"}
        className="rounded-sm border border-line bg-canvas px-4 py-3 vonn-text-cuerpo outline-none focus:border-primary" />
      <button type="submit" disabled={pending}
        className="rounded-pill bg-primary text-white px-6 py-3 vonn-text-cuerpo font-medium disabled:opacity-60">
        {pending ? "Activando..." : "Activar acceso"}
      </button>
      {state.error && <p role="alert" className="vonn-text-caption text-accent">{state.error}</p>}
    </form>
  );
}
