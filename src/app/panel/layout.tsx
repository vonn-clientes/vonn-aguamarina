import type { Metadata } from "next";

// El panel de gestión es privado: nunca debe aparecer en Google.
export const metadata: Metadata = {
  title: "Panel de gestión",
  robots: { index: false, follow: false },
};

export default function PanelRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
