"use client";

import { useTransition } from "react";
import { deleteReview, setReviewVisible } from "@/app/panel/(dashboard)/opiniones/actions";
import type { Review } from "@/lib/types";

export function ReviewRow({ review, itemName }: { review: Review; itemName: string }) {
  const [pending, start] = useTransition();
  return (
    <div className={`rounded-sm border border-line bg-surface p-4 flex flex-col gap-2 ${pending ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="vonn-text-cuerpo font-bold">
            {review.author} <span className="font-normal text-ink-muted">sobre {itemName}</span>
          </p>
          <p aria-label={`${review.rating} estrellas`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
        </div>
        <span className={`vonn-text-caption rounded-pill px-3 py-1 ${review.visible ? "bg-primary text-white" : "bg-line text-ink-muted"}`}>
          {review.visible ? "Visible" : "Oculta"}
        </span>
      </div>
      <p className="vonn-text-cuerpo">{review.comment}</p>
      <div className="flex gap-4">
        <button className="vonn-text-caption text-primary" onClick={() => start(() => setReviewVisible(review.id, !review.visible))}>
          {review.visible ? "Ocultar" : "Mostrar"}
        </button>
        <button className="vonn-text-caption text-accent" onClick={() => start(() => deleteReview(review.id))}>Eliminar</button>
      </div>
    </div>
  );
}
