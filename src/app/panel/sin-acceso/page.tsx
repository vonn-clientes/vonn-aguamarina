import { logout } from "@/app/panel/actions/auth";

export default function SinAccesoPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 text-center">
      <div className="max-w-sm flex flex-col gap-4">
        <h1 className="vonn-text-subtitulo">Tu cuenta todavía no tiene acceso</h1>
        <p className="vonn-text-cuerpo text-ink-muted">
          Este usuario todavía no está vinculado al gabinete. Escribile a VONN para que lo active.
        </p>
        <form action={logout}>
          <button className="vonn-text-cuerpo text-primary underline">Cerrar sesión</button>
        </form>
      </div>
    </main>
  );
}
