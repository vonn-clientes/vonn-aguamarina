"use client";

import { useTransition } from "react";
import { markMessageRead } from "@/app/panel/(dashboard)/mensajes/actions";
import type { ContactMessage } from "@/lib/types";

export function MessageCard({ message }: { message: ContactMessage }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`rounded-md border border-line bg-surface p-5 flex flex-col gap-2 ${message.is_read ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        <p className="vonn-text-cuerpo font-medium">{message.name}</p>
        <span className="vonn-text-caption text-ink-muted">
          {new Date(message.created_at).toLocaleDateString("es-AR")}
        </span>
      </div>
      {(message.phone || message.email) && (
        <p className="vonn-text-caption text-ink-muted">
          {[message.phone, message.email].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="vonn-text-cuerpo">{message.message}</p>
      {!message.is_read && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => markMessageRead(message.id))}
          className="self-start vonn-text-caption text-primary disabled:opacity-50"
        >
          Marcar como leído
        </button>
      )}
    </div>
  );
}
