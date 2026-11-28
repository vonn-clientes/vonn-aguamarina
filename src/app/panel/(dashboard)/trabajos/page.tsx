import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { PageHeader } from "@/components/panel/PageHeader";
import { AddAlbumForm, AlbumCard, type AlbumRowData } from "@/components/panel/AlbumEditor";
import { WORK_ALBUMS } from "@/lib/trabajos";
import { importStaticAlbums } from "./actions";

export default async function TrabajosPage() {
  const membership = await requireMembership();

  const albums = await query<AlbumRowData>(
    "select id, title, caption, photos, active from work_albums where tenant_id = $1 order by sort_order asc, created_at asc",
    [membership.tenant.id],
  );

  return (
    <>
      <PageHeader title="Trabajos realizados" description="Las carpetas de fotos que se ven en la página. Podés crear carpetas nuevas, subir fotos, cambiarles el orden, ocultarlas o borrarlas." />
      <div className="px-5 sm:px-10 pb-10 flex flex-col gap-5 max-w-4xl">
        <section className="ag-pcard">
          <h2>Mis carpetas</h2>
          {albums.length === 0 ? (
            <div className="flex flex-col gap-3">
              <p className="vonn-text-cuerpo text-ink-muted">
                Hoy la página muestra {WORK_ALBUMS.map((a) => `“${a.title}”`).join(", ")}. Para poder editarla, traela a tu panel.
              </p>
              <form action={importStaticAlbums}><button type="submit" className="ag-pbtn">Traer mis carpetas actuales al panel</button></form>
            </div>
          ) : (
            albums.map((a, i) => (
              <AlbumCard key={a.id} album={a} tenantId={membership.tenant.id} first={i === 0} last={i === albums.length - 1} />
            ))
          )}
        </section>
        <section className="ag-pcard">
          <h2>Crear una carpeta nueva</h2>
          <AddAlbumForm tenantId={membership.tenant.id} />
        </section>
      </div>
    </>
  );
}
