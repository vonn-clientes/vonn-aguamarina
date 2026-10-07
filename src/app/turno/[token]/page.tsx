import "@/app/agenda.css";
import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { fmtDateTimeLong, STATUS_LABEL, type Status } from "@/lib/agenda";
import { waLink } from "@/lib/seo";
import { respondAppointment } from "./actions";

export const metadata: Metadata = { title: "Tu turno", robots: { index: false, follow: false } };

type Row = { service_name: string; starts_at: string; duration_min: number; status: Status; client_name: string; business_name: string; whatsapp_number: string | null };

export default async function TurnoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("ag_get_appointment", { p_token: token });
  const a = (Array.isArray(data) ? data[0] : data) as Row | undefined;

  return (
    <div className="ag ag-t">
      <div className="ag-t__card">
        <Image src="/logo-aguamarina-oficial.png" alt="Aguamarina" width={160} height={56} />
        {!a ? (
          <>
            <h1>No encontramos tu turno</h1>
            <p>Puede que el link esté incompleto. Escribinos por WhatsApp y lo resolvemos enseguida.</p>
          </>
        ) : (
          <>
            <h1>Hola {a.client_name.split(" ")[0]}!</h1>
            <p>Tu turno de {a.service_name}</p>
            <p className="ag-t__when">{fmtDateTimeLong(a.starts_at)} hs</p>

            {a.status === "pendiente" && (
              <div className="ag-t__actions">
                <form action={respondAppointment.bind(null, token, "confirmar")}>
                  <button className="ag-btn">Confirmo mi turno</button>
                </form>
                <form action={respondAppointment.bind(null, token, "cancelar")}>
                  <button className="ag-btn ag-btn--ghost">No voy a poder ir</button>
                </form>
              </div>
            )}
            {a.status === "confirmado" && (
              <>
                <p>¡Listo, tu turno está confirmado! Te esperamos.</p>
                <div className="ag-t__actions">
                  <form action={respondAppointment.bind(null, token, "cancelar")}>
                    <button className="ag-btn ag-btn--ghost">Necesito cancelarlo</button>
                  </form>
                </div>
              </>
            )}
            {a.status === "cancelado" && (
              <>
                <p>Tu turno quedó cancelado. Si querés reprogramarlo, escribinos.</p>
                {a.whatsapp_number && (
                  <div className="ag-t__actions">
                    <a className="ag-btn" href={waLink(a.whatsapp_number, "Hola! Quiero reprogramar mi turno")}>
                      Reprogramar por WhatsApp
                    </a>
                  </div>
                )}
              </>
            )}
            {(a.status === "realizado" || a.status === "ausente") && <p>Este turno figura como: {STATUS_LABEL[a.status].toLowerCase()}.</p>}
          </>
        )}
      </div>
    </div>
  );
}
