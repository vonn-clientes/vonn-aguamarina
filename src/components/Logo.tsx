import Image from "next/image";

// Logo de VONN — se usa en el chrome del panel de gestión (no en el sitio
// público del cliente, que muestra el logo QUE EL CLIENTE subió). Cambia
// sola entre versión clara/oscura según el tema, gracias a las clases
// definidas en vonn-tokens.css.
export function VonnLogo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <Image
        src="/logo/vonn-logo-light.svg"
        alt="VONN"
        width={96}
        height={28}
        className="vonn-logo-auto-light"
        priority
      />
      <Image
        src="/logo/vonn-logo-dark.svg"
        alt="VONN"
        width={96}
        height={28}
        className="vonn-logo-auto-dark"
        priority
      />
    </span>
  );
}
