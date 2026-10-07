"use client";

import { useEffect, useState } from "react";
import type { ShowcaseReview } from "@/lib/reviews";
import { Stars } from "@/components/public/Reviews";

// Pasa una opinión cada 4 segundos. Se frena al pasar el mouse / tocar / enfocar, y respeta "reducir movimiento".
export function ReviewsCarousel({ reviews, rating, total, mapsUri }: { reviews: ShowcaseReview[]; rating: number | null; total: number | null; mapsUri: string | null }) {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [reduce, setReduce] = useState(false);
  const n = reviews.length;

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useEffect(() => {
    if (n < 2 || hold || reduce) return;
    const t = setInterval(() => setI((c) => (c + 1) % n), 4000);
    return () => clearInterval(t);
  }, [n, hold, reduce]);

  if (!n) return null;
  return (
    <div className="ag-rc" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)} onTouchStart={() => setHold(true)} onTouchEnd={() => setTimeout(() => setHold(false), 6000)}>
      {rating != null && (
        <p className="ag-rc__sum">
          <Stars value={rating} /> <strong>{rating.toFixed(1)}</strong>
          {total ? ` · ${total} opiniones en Google` : ""}
          {mapsUri && (
            <>
              {" · "}
              <a href={mapsUri} target="_blank" rel="noopener noreferrer">Ver en Google</a>
            </>
          )}
        </p>
      )}
      <div className="ag-rc__stage" aria-live="polite">
        {reviews.map((r, k) => (
          <figure key={r.id} className={`ag-rc__card${k === i ? " is-on" : ""}`} aria-hidden={k !== i}>
            <Stars value={r.rating} />
            <blockquote>“{r.comment.length > 260 ? `${r.comment.slice(0, 257).trimEnd()}…` : r.comment}”</blockquote>
            <figcaption>
              <strong>{r.author}</strong>
              <span>{r.source === "google" ? `Google${r.detail ? ` · ${r.detail}` : ""}` : r.detail ?? "Aguamarina"}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {n > 1 && (
        <div className="ag-rc__dots" role="tablist" aria-label="Elegir opinión">
          {reviews.map((r, k) => (
            <button key={r.id} role="tab" aria-selected={k === i} aria-label={`Opinión ${k + 1} de ${n}`} className={k === i ? "on" : ""} onClick={() => setI(k)} />
          ))}
        </div>
      )}
    </div>
  );
}
