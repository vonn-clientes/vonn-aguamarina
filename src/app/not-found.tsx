import Link from "next/link";

export const metadata = {
  title: "No encontramos esa página",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="ag">
      <main className="ag-wrap ag-lost" id="contenido">
        <p className="ag-brand__name" style={{ fontFamily: "var(--ag-script)", fontSize: "2.4rem", color: "var(--ag-sea)" }}>
          Aguamarina
        </p>
        <h1 className="ag-display" style={{ fontSize: "clamp(2.2rem, 6vw, 3.6rem)" }}>
          No encontramos esa página
        </h1>
        <p className="ag-lead">Puede que el tratamiento ya no esté disponible o que el enlace tenga un error.</p>
        <Link className="ag-btn" href="/">
          Volver al inicio
        </Link>
      </main>
    </div>
  );
}
