"use client";

import { useActionState } from "react";
import { inviteEmployee, type InviteState } from "@/app/panel/(dashboard)/empleados/actions";

const initialState: InviteState = { error: "", success: "" };

export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteEmployee, initialState);

  return (
    <form action={formAction} className="flex flex-col sm:flex-row gap-3 items-start">
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
    </form>
  );
}
