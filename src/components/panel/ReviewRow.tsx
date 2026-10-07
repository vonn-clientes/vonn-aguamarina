"use client";

import { useTransition } from "react";
import { deleteReview, setReviewVisible } from "@/app/panel/(dashboard)/opiniones/actions";
import type { Review } from "@/lib/types";
import { DeleteButton, Switch } from "./Controls";

export function ReviewRow({ review, itemName }: { review: Review; itemName: string }) {
  const [pending, start] = useTransition();
  return (
    <div className={`ag-item ${pending ? "opacity-50" : ""}`} style={{ alignItems: "flex-start" }}>
      <div className="ag-item__main">
        <p className="ag-item__name">
          {review.author} <span style={{ fontWeight: 400, color: "#5b7287" }}>sobre {itemName}</span>
        </p>
        <p aria-label={`${review.rating} estrellas`} style={{ color: "#2f6fae", fontSize: "1.1rem" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
        <p style={{ fontSize: "1rem", color: "#1b2b3a", marginTop: ".25rem" }}>{review.comment}</p>
      </div>
      <div className="ag-item__ctrl">
        <div className="flex items-center gap-3">
          <span className="ag-item__state">{review.visible ? "Visible" : "Oculta"}</span>
          <Switch checked={review.visible} label="Mostrar opinión en el sitio" onChange={(v) => start(() => setReviewVisible(review.id, v))} />
        </div>
        <DeleteButton onConfirm={() => start(() => deleteReview(review.id))} label="Eliminar opinión" />
      </div>
    </div>
  );
}
