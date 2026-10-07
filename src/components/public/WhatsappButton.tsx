export function WhatsappButton({ phone }: { phone: string | null }) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/549${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-pill bg-[#25D366] text-white px-5 py-3 shadow-lg vonn-text-cuerpo font-medium"
      aria-label="Escribinos por WhatsApp"
    >
      WhatsApp
    </a>
  );
}
