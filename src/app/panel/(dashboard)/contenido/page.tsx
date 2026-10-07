import { requireMembership } from "@/lib/auth";
import { getSiteContent } from "@/lib/queries";
import { PageHeader } from "@/components/panel/PageHeader";
import { saveSiteContent } from "./actions";

export default async function ContenidoPage() {
  const membership = await requireMembership();
  const content = await getSiteContent(membership.tenant.id);

  const field =
    "w-full rounded-sm border border-line bg-canvas px-4 py-3 vonn-text-cuerpo outline-none focus:border-primary";
  const label = "vonn-text-caption";

  return (
    <>
      <PageHeader
        title="Editor del sitio"
        description="Lo que cambies acá se actualiza directo en tu página pública."
      />
      <form action={saveSiteContent} className="p-6 sm:p-10 max-w-2xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className={label} htmlFor="hero_title">Título principal</label>
          <input id="hero_title" name="hero_title" defaultValue={content?.hero_title ?? ""} className={field} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={label} htmlFor="hero_subtitle">Subtítulo</label>
          <input id="hero_subtitle" name="hero_subtitle" defaultValue={content?.hero_subtitle ?? ""} className={field} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={label} htmlFor="about_text">Sobre el negocio</label>
          <textarea id="about_text" name="about_text" rows={4} defaultValue={content?.about_text ?? ""} className={field} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={label} htmlFor="address">Dirección</label>
          <input id="address" name="address" defaultValue={content?.address ?? ""} className={field} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={label} htmlFor="whatsapp_number">WhatsApp (solo número, sin 0 ni 15)</label>
          <input id="whatsapp_number" name="whatsapp_number" defaultValue={content?.whatsapp_number ?? ""} className={field} placeholder="3442123456" />
        </div>
        <div className="flex flex-col gap-1">
          <label className={label} htmlFor="instagram_url">Instagram (link completo)</label>
          <input id="instagram_url" name="instagram_url" defaultValue={content?.instagram_url ?? ""} className={field} />
        </div>

        <div className="flex flex-col gap-3">
          <span className={label}>Horarios</span>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="vonn-text-caption text-ink-muted" htmlFor="schedule_lunes_a_viernes">Lunes a viernes</label>
              <input id="schedule_lunes_a_viernes" name="schedule_lunes_a_viernes" defaultValue={content?.schedule?.lunes_a_viernes ?? ""} className={field} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="vonn-text-caption text-ink-muted" htmlFor="schedule_sabado">Sábado</label>
              <input id="schedule_sabado" name="schedule_sabado" defaultValue={content?.schedule?.sabado ?? ""} className={field} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="vonn-text-caption text-ink-muted" htmlFor="schedule_domingo">Domingo</label>
              <input id="schedule_domingo" name="schedule_domingo" defaultValue={content?.schedule?.domingo ?? ""} className={field} />
            </div>
          </div>
        </div>

        <button type="submit" className="self-start rounded-pill bg-primary text-white px-6 py-3 vonn-text-cuerpo font-medium">
          Guardar cambios
        </button>
      </form>
    </>
  );
}
