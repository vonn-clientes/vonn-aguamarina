"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/opiniones/actions";

export function ReviewForm({ itemId, itemName, path }: { itemId: string; itemName: string; path: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [hp, setHp] = useState("");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (done)
    return (
      <p className="ag-rv-thanks" role="status">
        ¡Gracias por tu opinión!
      </p>
    );

  if (!open)
    return (
      <button type="button" className="ag-btn ag-btn--ghost" onClick={() => setOpen(true)}>
        ¿Te hiciste {itemName}? Dejá tu opinión
      </button>
    );

  return (
    <form
      className="ag-rv-form"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg("");
        start(async () => {
          const r = await submitReview({ itemId, author, rating, comment, website: hp, path });
          if (r.ok) setDone(true);
          else setMsg(r.error ?? "No pudimos guardar tu opinión.");
        });
      }}
    >
      <fieldset className="ag-stars-input">
        <legend>Tu puntaje</legend>
        <div onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
              aria-pressed={rating === n}
              className={(hover || rating) >= n ? "on" : ""}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <label>
        Tu nombre
        <input value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={60} required />
      </label>
      <label>
        Tu opinión
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={600} rows={3} required />
      </label>
      <input className="ag-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} />
      {msg && <p className="ag-cm-err" role="alert">{msg}</p>}
      <button className="ag-btn" type="submit" disabled={pending || rating === 0}>
        {pending ? "Enviando…" : "Publicar opinión"}
      </button>
    </form>
  );
}
