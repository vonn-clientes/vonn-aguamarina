import type { Review } from "@/lib/types";
import { summarize } from "@/lib/reviews";
import { ReviewForm } from "./ReviewForm";

export function Stars({ value }: { value: number }) {
  return (
    <span className="ag-stars" role="img" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={value >= n - 0.25 ? "on" : ""} aria-hidden="true">★</span>
      ))}
    </span>
  );
}

const fmt = (d: string) => new Date(d).toLocaleDateString("es-AR", { month: "long", year: "numeric" });

// Opiniones de un tratamiento o producto: promedio, lista y formulario para opinar.
export function Reviews({ itemId, itemName, reviews, path }: { itemId: string; itemName: string; reviews: Review[]; path: string }) {
  const { count, avg } = summarize(reviews);
  return (
    <section className="ag-section ag-section--alt" id="opiniones" aria-labelledby="t-opiniones">
      <div className="ag-narrow">
        <div className="ag-head ag-rise">
          <h2 className="ag-h2" id="t-opiniones">Opiniones</h2>
          {count > 0 ? (
            <p className="ag-rv-sum">
              <Stars value={avg} /> <strong>{avg.toFixed(1)}</strong> · {count} {count === 1 ? "opinión" : "opiniones"}
            </p>
          ) : (
            <p className="ag-lead">Todavía no hay opiniones. ¡Sé la primera persona en contar tu experiencia!</p>
          )}
        </div>
        <ul className="ag-rv-list">
          {reviews.map((r) => (
            <li key={r.id} className="ag-rv">
              <div className="ag-rv__top">
                <strong>{r.author}</strong>
                <Stars value={r.rating} />
              </div>
              <p>{r.comment}</p>
              <time dateTime={r.created_at}>{fmt(r.created_at)}</time>
            </li>
          ))}
        </ul>
        <div className="ag-center">
          <ReviewForm itemId={itemId} itemName={itemName} path={path} />
        </div>
      </div>
    </section>
  );
}
