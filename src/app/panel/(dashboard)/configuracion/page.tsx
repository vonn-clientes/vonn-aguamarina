import { requireMembership } from "@/lib/auth";
import { PageHeader } from "@/components/panel/PageHeader";
import { updateConfiguracion } from "./actions";
import type { HorarioAtencion } from "@/lib/types";

const DIAS: { key: keyof HorarioAtencion; label: string }[] = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

const DEFAULT_DIA = { abierto: false, desde: "09:00", hasta: "18:00" };

export default async function ConfiguracionPage() {
  const membership = await requireMembership();
  const tenant = membership.tenant;
  const horario = tenant.horario_atencion;

  const field =
    "rounded-sm border border-line bg-canvas px-2 py-1.5 vonn-text-caption outline-none focus:border-primary";

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Los parámetros de tu negocio. Cambiá lo que necesites, se aplica al toque, sin pedirle nada a nadie."
      />
      <div className="p-6 sm:p-10 max-w-2xl">
        <form action={updateConfiguracion} className="flex flex-col gap-8">
          {tenant.business_mode === "turnos" && (
            <>
              <section className="flex flex-col gap-4">
                <h2 className="vonn-text-subtitulo">Horario de atención</h2>
                <p className="vonn-text-caption text-ink-muted">
                  Tildá los días que abrís y poné el horario. Esto define cuándo tus clientes pueden sacar turno.
                </p>
                <div className="flex flex-col gap-2">
                  {DIAS.map(({ key, label }) => {
                    const dia = horario?.[key] ?? DEFAULT_DIA;
                    return (
                      <div key={key} className="grid grid-cols-[100px_auto_1fr_auto_1fr] items-center gap-3">
                        <label className="vonn-text-cuerpo flex items-center gap-2">
                          <input type="checkbox" name={`${key}_abierto`} defaultChecked={dia.abierto} />
                          {label}
                        </label>
                        <span className="vonn-text-caption text-ink-muted">de</span>
                        <input type="time" name={`${key}_desde`} defaultValue={dia.desde} className={field} />
                        <span className="vonn-text-caption text-ink-muted">a</span>
                        <input type="time" name={`${key}_hasta`} defaultValue={dia.hasta} className={field} />
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="vonn-text-subtitulo">Cupo simultáneo</h2>
                <p className="vonn-text-caption text-ink-muted">
                  Cuántos turnos podés atender al mismo tiempo en el mismo horario (ej. 1 si trabajás solo, más si tenés varios empleados).
                </p>
                <input
                  type="number"
                  name="cupo_simultaneo"
                  min={1}
                  defaultValue={tenant.cupo_simultaneo ?? 1}
                  className={`${field} w-32`}
                />
              </section>
            </>
          )}

          {tenant.business_mode !== "turnos" && (
            <p className="vonn-text-cuerpo text-ink-muted">
              Tu negocio no usa turnos, así que no hay horarios ni cupos que configurar acá. La duración y el precio de cada producto se editan desde Catálogo.
            </p>
          )}

          <button type="submit" className="self-start rounded-pill bg-primary text-white px-6 py-3 vonn-text-cuerpo font-medium">
            Guardar cambios
          </button>
        </form>
      </div>
    </>
  );
}
