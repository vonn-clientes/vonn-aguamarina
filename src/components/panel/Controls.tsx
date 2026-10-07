"use client";

import { useState } from "react";

/** Interruptor estilo iPhone: deslizable, animado, accesible. */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="ag-switch"
      data-on={checked}
    >
      <span className="ag-switch__thumb" />
    </button>
  );
}

const svg = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export function PencilIcon() {
  return (
    <svg {...svg}>
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m14.5 7.5 3 3" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg {...svg}>
      <path d="M4 7h16" />
      <path d="M9 7V4.5h6V7" />
      <path d="M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function EditButton({ onClick, label = "Editar" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="ag-iconbtn" onClick={onClick} aria-label={label} title={label}>
      <PencilIcon />
    </button>
  );
}

/** Tacho de basura con confirmación en el mismo lugar (evita borrar por error). */
export function DeleteButton({ onConfirm, label = "Eliminar" }: { onConfirm: () => void; label?: string }) {
  const [asking, setAsking] = useState(false);
  if (asking) {
    return (
      <span className="ag-confirm" role="group" aria-label="Confirmar eliminación">
        <span>¿Eliminar?</span>
        <button type="button" className="ag-confirm__yes" onClick={() => { setAsking(false); onConfirm(); }}>Sí, eliminar</button>
        <button type="button" className="ag-confirm__no" onClick={() => setAsking(false)}>No</button>
      </span>
    );
  }
  return (
    <button type="button" className="ag-iconbtn ag-iconbtn--danger" onClick={() => setAsking(true)} aria-label={label} title={label}>
      <TrashIcon />
    </button>
  );
}

/** Fila "etiqueta + interruptor". */
export function SwitchRow({ text, checked, onChange, label, disabled }: { text: string; checked: boolean; onChange: (n: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <div className="ag-switchrow">
      <span>{text}</span>
      <Switch checked={checked} onChange={onChange} label={label} disabled={disabled} />
    </div>
  );
}
