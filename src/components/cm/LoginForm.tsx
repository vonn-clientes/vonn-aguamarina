"use client";

import { useActionState } from "react";
import { loginCm } from "@/app/cm/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginCm, null);
  return (
    <form action={action} className="ag-cm-form">
      <label>
        Usuario
        <input name="user" autoComplete="username" autoCapitalize="none" required />
      </label>
      <label>
        Contraseña
        <input name="pass" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && <p role="alert" className="ag-cm-err">{state.error}</p>}
      <button className="ag-btn" type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
