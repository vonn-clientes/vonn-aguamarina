import { requireMembership } from "@/lib/auth";
import { ClientForm } from "@/components/agenda/ClientForm";
import { saveClient } from "../../actions";

export default async function NuevaClientaPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireMembership();
  const sp = await searchParams;
  return (
    <>
      <div className="ag-g-head">
        <div>
          <h1 className="ag-g-title">Nueva clienta</h1>
          <p className="ag-g-sub">Solo el nombre es obligatorio.</p>
        </div>
      </div>
      {sp.error && <p className="ag-g-err">Escribí el nombre de la clienta.</p>}
      <ClientForm action={saveClient.bind(null, null)} cancelHref="/panel/agenda/clientas" />
    </>
  );
}
