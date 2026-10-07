import { requireMembership } from "@/lib/auth";
import { getSiteContent } from "@/lib/queries";
import { PageHeader } from "@/components/panel/PageHeader";
import { saveSiteContent } from "./actions";
import { ImageUpload } from "@/components/panel/ImageUpload";

export default async function ContenidoPage() {
  const membership = await requireMembership();
  const content = await getSiteContent(membership.tenant.id);

  const field =
    "w-full rounded-sm border border-line bg-canvas px-4 py-3 vonn-text-cuerpo outline-none focus:border-primary";
  const label = "vonn-text-caption";

  const F = ({ id, text, hint, children }: { id: string; text: string; hint?: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
      <label className={label} htmlFor={id}>{text}</label>
      {children}
      {hint && <span className="vonn-text-caption text-ink-muted">{hint}</span>}
    </div>
  );

  return (
    <>
      <PageHeader title="Textos y datos" description="Lo que cambies acá se actualiza en tu página al instante." />
      <form action={saveSiteContent} className="px-5 sm:px-10 pb-28 max-w-2xl flex flex-col gap-5">
        <section className="ag-pcard">
          <h2>Portada</h2>
          <p className="hint">Es lo primero que ve la gente al entrar.</p>
          <F id="hero_title" text="Título principal"><input id="hero_title" name="hero_title" defaultValue={content?.hero_title ?? ""} className={field} /></F>
          <F id="hero_subtitle" text="Subtítulo"><input id="hero_subtitle" name="hero_subtitle" defaultValue={content?.hero_subtitle ?? ""} className={field} /></F>
        </section>

        <section className="ag-pcard">
          <h2>Conocé a la profesional</h2>
          <F id="about_text" text="Presentación"><textarea id="about_text" name="about_text" rows={4} defaultValue={content?.about_text ?? ""} className={field} /></F>
          <div className="flex flex-col gap-1">
            <span className={label}>Tu foto</span>
            <ImageUpload tenantId={membership.tenant.id} name="about_image_url" defaultUrl={content?.about_image_url} label="foto" seoHint="Ingrid Schultheis cosmetologa" />
          </div>
        </section>

        <section className="ag-pcard">
          <h2>Contacto</h2>
          <F id="whatsapp_number" text="WhatsApp" hint="Solo números, sin 0 ni 15. Ejemplo: 3442123456"><input id="whatsapp_number" name="whatsapp_number" inputMode="tel" defaultValue={content?.whatsapp_number ?? ""} className={field} placeholder="3442123456" /></F>
          <F id="instagram_url" text="Instagram" hint="Pegá el link de tu perfil"><input id="instagram_url" name="instagram_url" defaultValue={content?.instagram_url ?? ""} className={field} /></F>
          <F id="address" text="Dirección"><input id="address" name="address" defaultValue={content?.address ?? ""} className={field} /></F>
        </section>

        <section className="ag-pcard">
          <h2>Horarios de atención</h2>
          <p className="hint">Se muestran en la página tal cual los escribas. Ejemplo: “9 a 18 hs” o “Cerrado”.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <F id="schedule_lunes_a_viernes" text="Lunes a viernes"><input id="schedule_lunes_a_viernes" name="schedule_lunes_a_viernes" defaultValue={content?.schedule?.lunes_a_viernes ?? ""} className={field} /></F>
            <F id="schedule_sabado" text="Sábado"><input id="schedule_sabado" name="schedule_sabado" defaultValue={content?.schedule?.sabado ?? ""} className={field} /></F>
            <F id="schedule_domingo" text="Domingo"><input id="schedule_domingo" name="schedule_domingo" defaultValue={content?.schedule?.domingo ?? ""} className={field} /></F>
          </div>
        </section>

        <section className="ag-pcard">
          <h2>Cobros de la tienda</h2>
          <p className="hint">Cuando alguien compra, le mostramos estos datos para que te transfiera.</p>
          <F id="transfer_alias" text="Alias"><input id="transfer_alias" name="transfer_alias" defaultValue={content?.transfer_alias ?? ""} className={field} placeholder="mi.alias" /></F>
          <F id="transfer_holder" text="Nombre del titular (opcional)"><input id="transfer_holder" name="transfer_holder" defaultValue={content?.transfer_holder ?? ""} className={field} /></F>
        </section>

        <div className="fixed bottom-0 inset-x-0 sm:left-64 bg-white/90 backdrop-blur border-t border-line px-5 sm:px-10 py-3 z-30">
          <button type="submit" className="ag-pbtn">Guardar cambios</button>
        </div>
      </form>
    </>
  );
}
