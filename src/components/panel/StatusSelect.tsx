"use client";

import { useTransition } from "react";

export function StatusSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void | Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => startTransition(() => onChange(e.target.value as T))}
      className="rounded-sm border border-line bg-canvas px-3 py-1.5 vonn-text-caption outline-none focus:border-primary disabled:opacity-50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
