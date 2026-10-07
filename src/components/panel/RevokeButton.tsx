"use client";

import { useTransition } from "react";
import { revokeEmployee } from "@/app/panel/(dashboard)/empleados/actions";

export function RevokeButton({ memberId }: { memberId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="vonn-text-caption text-accent disabled:opacity-50"
      disabled={pending}
      onClick={() => startTransition(() => revokeEmployee(memberId))}
    >
      Quitar acceso
    </button>
  );
}
