import type { Metadata } from "next";
import Link from "next/link";
import { VonnLogo } from "@/components/Logo";
import { getInvite } from "@/lib/invites";
import { ActivationForm } from "./ActivationForm";

export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function ActivarPage({ searchParams }: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const invite = await getInvite(token);
  return (
    <main className="flex-1 flex items-center justify-center px-6 bg-canvas-muted">
      <div className="w-full max-w-sm flex flex-col gap-6 bg-surface border border-line rounded-lg p-8 shadow-md">
        <VonnLogo className="self-start" />
        <h1 className="vonn-text-subtitulo">Activar acceso</h1>
        {invite ? <ActivationForm token={token} hasAccount={Boolean(invite.password_hash)} /> : (
          <>
            <p className="vonn-text-caption text-accent">Este enlace venció, ya fue utilizado o el acceso fue revocado.</p>
            <Link href="/panel/login" className="vonn-text-caption text-primary">Entrar al panel</Link>
          </>
        )}
      </div>
    </main>
  );
}
