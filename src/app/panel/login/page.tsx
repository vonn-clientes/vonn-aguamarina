"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/panel/actions/auth";
import { VonnLogo } from "@/components/Logo";

const initialState: LoginState = { error: "" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="flex-1 flex items-center justify-center px-6 bg-canvas-muted">
      <div className="w-full max-w-sm flex flex-col gap-6 bg-surface border border-line rounded-lg p-8 shadow-md">
        <VonnLogo className="self-start" />
        <div>
          <h1 className="vonn-text-subtitulo">Entrar al panel</h1>
          <p className="vonn-text-caption text-ink-muted mt-1">
            Con el email y contraseña que te dio VONN.
          </p>
        </div>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="vonn-text-caption" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-sm border border-line bg-canvas px-4 py-3 vonn-text-cuerpo outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="vonn-text-caption" htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded-sm border border-line bg-canvas px-4 py-3 vonn-text-cuerpo outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-pill bg-primary text-white px-6 py-3 vonn-text-cuerpo font-medium disabled:opacity-60"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
          {state.error && <p className="vonn-text-caption text-accent">{state.error}</p>}
        </form>
      </div>
    </main>
  );
}
