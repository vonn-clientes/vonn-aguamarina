import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/panel/PageHeader";
import { BookingsTable } from "./BookingsTable";
import { OrdersTable } from "./OrdersTable";
import { redirect } from "next/navigation";
import type { Booking, Order } from "@/lib/types";

export default async function ActividadPage() {
  const membership = await requireMembership();
  if (membership.tenant.business_mode === "ninguno") redirect("/panel");

  const supabase = await createClient();
  const isTurnos = membership.tenant.business_mode === "turnos";

  const { data } = isTurnos
    ? await supabase
        .from("bookings")
        .select("*")
        .eq("tenant_id", membership.tenant.id)
        .order("scheduled_at", { ascending: true })
    : await supabase
        .from("orders")
        .select("*")
        .eq("tenant_id", membership.tenant.id)
        .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title={isTurnos ? "Turnos" : "Pedidos"}
        description={
          isTurnos
            ? "Los turnos que van reservando tus clientes desde el sitio."
            : "Los pedidos que van llegando desde el sitio."
        }
      />
      <div className="p-6 sm:p-10 max-w-4xl">
        {isTurnos ? (
          <BookingsTable bookings={(data as Booking[]) ?? []} />
        ) : (
          <OrdersTable orders={(data as Order[]) ?? []} />
        )}
      </div>
    </>
  );
}
