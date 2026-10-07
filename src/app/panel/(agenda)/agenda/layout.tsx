import "@/app/agenda.css";
import Image from "next/image";
import Link from "next/link";
import { requireMembership } from "@/lib/auth";
import { logout } from "@/app/panel/actions/auth";
import { AgendaNav } from "@/components/agenda/AgendaNav";

// Agenda privada de Ingrid: turnos, clientes y caja. Requiere sesión (requireMembership).
export default async function AgendaLayout({ children }: { children: React.ReactNode }) {
  await requireMembership();
  return (
    <div className="ag ag-g">
      <header className="ag-g-top">
        <div className="ag-g-wrap">
          <div className="ag-g-top__row">
            <Link href="/panel/agenda" className="ag-g-brand" aria-label="Agenda de Aguamarina">
              <Image src="/logo-aguamarina-oficial.png" alt="Aguamarina" width={97} height={34} sizes="100px" priority />
            </Link>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Link href="/panel" className="ag-g-out">
                Panel del sitio
              </Link>
              <form action={logout}>
                <button className="ag-g-out" style={{ background: "none", border: 0, cursor: "pointer", font: "inherit" }}>
                  Salir
                </button>
              </form>
            </div>
          </div>
          <AgendaNav />
        </div>
      </header>
      <main className="ag-g-wrap">{children}</main>
    </div>
  );
}
