import { requireMembership } from "@/lib/auth";
import { query } from "@/lib/db";
import { PageHeader } from "@/components/panel/PageHeader";
import { MessageCard } from "@/components/panel/MessageCard";
import type { ContactMessage } from "@/lib/types";

export default async function MensajesPage() {
  const membership = await requireMembership();

  const messages = await query<ContactMessage>(
    "select * from contact_messages where tenant_id = $1 order by created_at desc",
    [membership.tenant.id],
  );

  return (
    <>
      <PageHeader title="Mensajes" description="Lo que te escriben desde el formulario de contacto de tu sitio." />
      <div className="p-6 sm:p-10 flex flex-col gap-4 max-w-2xl">
        {messages.length === 0 && <p className="vonn-text-cuerpo text-ink-muted">Todavía no llegó ningún mensaje.</p>}
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </div>
    </>
  );
}
